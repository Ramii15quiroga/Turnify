import { prisma } from '../config/prisma';
import { UpdateSchedulesInput, AvailabilityQueryInput } from '../schemas/schedule.schema';

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

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

export class ScheduleService {
  static async getWeeklySchedules() {
    return prisma.businessSchedule.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  static async updateWeeklySchedules(data: UpdateSchedulesInput) {
    // Delete existing schedules and re-insert updated ones in a transaction
    return prisma.$transaction(async (tx) => {
      await tx.businessSchedule.deleteMany();
      const created = [];
      for (const item of data.schedules) {
        const sch = await tx.businessSchedule.create({
          data: {
            dayOfWeek: item.dayOfWeek,
            startTime: item.startTime,
            endTime: item.endTime,
            slotDurationMinutes: item.slotDurationMinutes,
            isActive: item.isActive,
          },
        });
        created.push(sch);
      }
      return created;
    });
  }

  static async getAvailability(query: AvailabilityQueryInput) {
    const { serviceId, date } = query;

    // 1. Verify service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.isActive) {
      const error: any = new Error('El servicio no existe o se encuentra inactivo');
      error.status = 400;
      throw error;
    }

    // 2. Validate date is not past
    const todayStr = getTodayString();
    if (date < todayStr) {
      const error: any = new Error('No se pueden consultar horarios para fechas pasadas');
      error.status = 400;
      throw error;
    }

    // 3. Compute day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const [y, m, d] = date.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayOfWeek = dateObj.getUTCDay();

    // 4. Find schedule for that day
    const schedule = await prisma.businessSchedule.findFirst({
      where: { dayOfWeek, isActive: true },
    });

    if (!schedule) {
      return {
        date,
        serviceId,
        availableSlots: [],
        message: 'No hay atención configurada para el día seleccionado',
      };
    }

    // 5. Generate all candidate slots
    const startMins = timeToMinutes(schedule.startTime);
    const endMins = timeToMinutes(schedule.endTime);
    const slotStep = schedule.slotDurationMinutes || service.durationMinutes || 30;

    const candidateSlots: string[] = [];
    let cur = startMins;
    while (cur + service.durationMinutes <= endMins) {
      candidateSlots.push(minutesToTime(cur));
      cur += slotStep;
    }

    // 6. Query existing non-cancelled appointments for this service and date
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        serviceId,
        date,
        status: { not: 'CANCELLED' },
      },
      select: { time: true },
    });

    const bookedSet = new Set(bookedAppointments.map((b) => b.time));

    // 7. Filter out booked slots
    let freeSlots = candidateSlots.filter((slot) => !bookedSet.has(slot));

    // 8. If today, filter out past hours
    if (date === todayStr) {
      const currentTime = getCurrentTimeString();
      freeSlots = freeSlots.filter((slot) => slot > currentTime);
    }

    return {
      date,
      serviceId,
      availableSlots: freeSlots,
      message: freeSlots.length === 0 ? 'No hay horarios disponibles para esta fecha' : undefined,
    };
  }
}

