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

