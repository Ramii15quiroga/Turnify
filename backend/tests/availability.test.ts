import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signToken } from '../src/utils/jwt';

function nextWeekday(weekday: number): string {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  do { date.setDate(date.getDate() + 1); } while (date.getDay() !== weekday);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

describe('Task 4: Schedules & Availability Module (SCRUM-24, SCRUM-11)', () => {
  let adminToken: string;
  let clientToken: string;
  let serviceId: string;
  let clientUserId: string;

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@turnify.com' } });
    adminToken = signToken({ userId: admin!.id, email: admin!.email, role: admin!.role });

    const client = await prisma.user.findUnique({ where: { email: 'cliente@turnify.com' } });
    clientToken = signToken({ userId: client!.id, email: client!.email, role: client!.role });
    clientUserId = client!.id;

    const service = await prisma.service.findFirst({ where: { isActive: true } });
    serviceId = service!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('GET /api/admin/schedules - lists configured weekly schedules for admin', async () => {
    const res = await request(app)
      .get('/api/admin/schedules')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('PUT /api/admin/schedules - rejects invalid schedule range (endTime <= startTime)', async () => {
    const res = await request(app)
      .put('/api/admin/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        schedules: [
          { dayOfWeek: 1, startTime: '18:00', endTime: '09:00', slotDurationMinutes: 30, isActive: true },
        ],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/hora.*fin.*posterior|inicio.*menor/i);
  });

  test('GET /api/availability - rejects past dates', async () => {
    const res = await request(app)
      .get('/api/availability')
      .query({ serviceId, date: '2020-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/pasad[ao]/i);
  });

  test('GET /api/availability - returns available slots for a future working day', async () => {
    const futureDate = nextWeekday(3); // Next Wednesday, always in the future
    const res = await request(app)
      .get('/api/availability')
      .query({ serviceId, date: futureDate });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('availableSlots');
    expect(Array.isArray(res.body.availableSlots)).toBe(true);
    expect(res.body.availableSlots.length).toBeGreaterThan(0);
    expect(res.body.availableSlots).toContain('09:00');
  });

  test('GET /api/availability - excludes slots that already have an active appointment', async () => {
    const futureDate = nextWeekday(3);
    const bookedTime = '10:00';

    // Seed an appointment for 10:00
    const appt = await prisma.appointment.create({
      data: {
        userId: clientUserId,
        serviceId,
        date: futureDate,
        time: bookedTime,
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .get('/api/availability')
      .query({ serviceId, date: futureDate });

    expect(res.status).toBe(200);
    expect(res.body.availableSlots).not.toContain(bookedTime);

    // Clean up appointment
    await prisma.appointment.delete({ where: { id: appt.id } });
  });
});

