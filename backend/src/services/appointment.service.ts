import { prisma } from '../config/prisma';
import { CreateAppointmentInput, CancelAppointmentInput } from '../schemas/appointment.schema';
import { AppointmentStatus } from '@prisma/client';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getCurrentTimeString(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export class AppointmentService {
  static async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) { const error: any = new Error('Reserva no encontrada'); error.status = 404; throw error; }
    const allowed: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
      CONFIRMED: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW],
      COMPLETED: [], CANCELLED: [], NO_SHOW: [],
    };
    if (!allowed[appointment.status].includes(status)) { const error: any = new Error(`Transición inválida: ${appointment.status} → ${status}`); error.status = 400; throw error; }
    return prisma.appointment.update({ where: { id }, data: { status }, include: { service: true, user: { select: { id: true, name: true, email: true } } } });
  }

  static async reschedule(id: string, userId: string, date: string, time: string) {
    const original = await prisma.appointment.findUnique({ where: { id } });
    if (!original) { const error: any = new Error('Reserva no encontrada'); error.status = 404; throw error; }
    if (original.userId !== userId) { const error: any = new Error('No tiene permisos para reprogramar esta reserva'); error.status = 403; throw error; }
    if (original.status !== AppointmentStatus.PENDING && original.status !== AppointmentStatus.CONFIRMED) { const error: any = new Error('Solo se pueden reprogramar turnos vigentes'); error.status = 400; throw error; }
    if (date < getTodayString() || (date === getTodayString() && time <= getCurrentTimeString())) { const error: any = new Error('El nuevo horario debe ser futuro'); error.status = 400; throw error; }
    return prisma.$transaction(async tx => {
      const taken = await tx.appointment.findFirst({ where: { serviceId: original.serviceId, date, time, status: { not: AppointmentStatus.CANCELLED }, id: { not: id } } });
      if (taken) { const error: any = new Error('El horario seleccionado ya está ocupado'); error.status = 409; throw error; }
      return tx.appointment.update({ where: { id }, data: { date, time }, include: { service: true } });
    });
  }

  static async statistics(period: 'day' | 'week' | 'month', date = getTodayString()) {
    const start = new Date(`${date}T00:00:00`);
    if (period === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    if (period === 'month') start.setDate(1);
    const end = new Date(start);
    if (period === 'day') end.setDate(end.getDate() + 1);
    if (period === 'week') end.setDate(end.getDate() + 7);
    if (period === 'month') end.setMonth(end.getMonth() + 1);
    const from = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`;
    const to = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
    const rows = await prisma.appointment.findMany({ where: { date: { gte: from, lt: to } }, include: { service: { select: { id: true, name: true } } } });
    const byStatus: Record<string, number> = {}, byService: Record<string, number> = {};
    for (const row of rows) { byStatus[row.status] = (byStatus[row.status] || 0) + 1; byService[row.service.name] = (byService[row.service.name] || 0) + 1; }
    return { period, from, to, total: rows.length, byStatus, byService };
  }

  static async createAppointment(userId: string, data: CreateAppointmentInput) {
    const { serviceId, date, time } = data;

    // 1. Verify service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      const error: any = new Error('El servicio seleccionado no está disponible');
      error.status = 400;
      throw error;
    }

    // 2. Verify date is not in the past
    const todayStr = getTodayString();
    if (date < todayStr) {
      const error: any = new Error('No se pueden reservar turnos para fechas pasadas');
      error.status = 400;
      throw error;
    }

    if (date === todayStr && time <= getCurrentTimeString()) {
      const error: any = new Error('No se pueden reservar turnos para horarios que ya han pasado');
      error.status = 400;
      throw error;
    }

    // 3. Concurrency-safe atomic transaction
    return prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findFirst({
        where: {
          serviceId,
          date,
          time,
          status: { not: AppointmentStatus.CANCELLED },
        },
      });

      if (existing) {
        const error: any = new Error(
          'El horario seleccionado ya fue ocupado mientras realizaba la reserva. Por favor, elija otro horario.'
        );
        error.status = 409; // HTTP 409 Conflict (SCRUM-14)
        throw error;
      }

      return tx.appointment.create({
        data: {
          userId,
          serviceId,
          date,
          time,
          status: AppointmentStatus.CONFIRMED,
        },
        include: {
          service: {
            select: { id: true, name: true, description: true, durationMinutes: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });
  }

  static async getMyAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId },
      include: {
        service: {
          select: { id: true, name: true, description: true, durationMinutes: true },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  static async cancelAppointment(appointmentId: string, userId: string, userRole: string, data: CancelAppointmentInput) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      const error: any = new Error('Reserva no encontrada');
      error.status = 404;
      throw error;
    }

    // Only owner or admin can cancel
    if (userRole !== 'ADMIN' && appointment.userId !== userId) {
      const error: any = new Error('No tiene permisos para cancelar esta reserva');
      error.status = 403;
      throw error;
    }

    if (appointment.status === AppointmentStatus.CANCELLED) {
      const error: any = new Error('La reserva ya se encuentra cancelada');
      error.status = 400;
      throw error;
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      const error: any = new Error('No se puede cancelar una reserva que ya ha sido completada');
      error.status = 400;
      throw error;
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: data.reason || 'Cancelado a solicitud del cliente',
      },
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  static async getAdminAppointments(filters: { date?: string; serviceId?: string; status?: string }) {
    const where: any = {};

    if (filters.date) {
      where.date = filters.date;
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status as AppointmentStatus;
    }

    return prisma.appointment.findMany({
      where,
      include: {
        service: { select: { id: true, name: true, durationMinutes: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
  }

  static async getAdminAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!appointment) {
      const error: any = new Error('Reserva no encontrada');
      error.status = 404;
      throw error;
    }

    return appointment;
  }
}

