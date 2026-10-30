import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signToken } from '../src/utils/jwt';

describe('Task 5: Appointments & Concurrency Module (SCRUM-13, 14, 19, 20, 21, 26)', () => {
  let adminToken: string;
  let client1Token: string;
  let client2Token: string;
  let client1Id: string;
  let client2Id: string;
  let testServiceId: string;

  const bookingDate = '2026-11-05'; // Thursday
  const bookingTime = '11:00';

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@turnify.com' } });
    adminToken = signToken({ userId: admin!.id, email: admin!.email, role: admin!.role });

    const client1 = await prisma.user.findUnique({ where: { email: 'cliente@turnify.com' } });
    client1Id = client1!.id;
    client1Token = signToken({ userId: client1!.id, email: client1!.email, role: client1!.role });

    // Create a second client user for concurrency and isolation testing
    const client2 = await prisma.user.upsert({
      where: { email: 'cliente2@turnify.com' },
      update: {},
      create: {
        name: 'Maria Gomez',
        email: 'cliente2@turnify.com',
        password: '$2a$10$hashedpasswordplaceholder',
        role: 'CLIENT',
      },
    });
    client2Id = client2.id;
    client2Token = signToken({ userId: client2.id, email: client2.email, role: client2.role });

    const service = await prisma.service.findFirst({ where: { isActive: true } });
    testServiceId = service!.id;

    // Clean any prior appointments for this date/time
    await prisma.appointment.deleteMany({
      where: { serviceId: testServiceId, date: bookingDate },
    });
  });

  afterAll(async () => {
    await prisma.appointment.deleteMany({
      where: { serviceId: testServiceId, date: bookingDate },
    });
    await prisma.$disconnect();
  });

  test('POST /api/appointments - requires authentication (401 when unauthenticated)', async () => {
    const res = await request(app).post('/api/appointments').send({
      serviceId: testServiceId,
      date: bookingDate,
      time: bookingTime,
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/appointments - creates appointment for authenticated client', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({
        serviceId: testServiceId,
        date: bookingDate,
        time: bookingTime,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.date).toBe(bookingDate);
    expect(res.body.time).toBe(bookingTime);
    expect(res.body.status).toBe('CONFIRMED');
    expect(res.body.service).toHaveProperty('name');
    expect(res.body.user).toHaveProperty('name');
  });

  test('POST /api/appointments - prevents duplicate reservation on same slot (SCRUM-14 returns 409)', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${client2Token}`)
      .send({
        serviceId: testServiceId,
        date: bookingDate,
        time: bookingTime,
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ocupado|duplicad[ao]|conflicto/i);
  });

  test('Concurrent duplicate booking simulation - exactly one succeeds (201) and one fails (409)', async () => {
    const testSlot = '14:00';
    // Run two simultaneous requests for the exact same slot
    const [resA, resB] = await Promise.all([
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${client1Token}`)
        .send({ serviceId: testServiceId, date: bookingDate, time: testSlot }),
      request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${client2Token}`)
        .send({ serviceId: testServiceId, date: bookingDate, time: testSlot }),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);
  });

  test('GET /api/appointments/my - returns only the appointments of the authenticated client', async () => {
    const res = await request(app)
      .get('/api/appointments/my')
      .set('Authorization', `Bearer ${client1Token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const appt of res.body) {
      expect(appt.userId).toBe(client1Id);
    }
  });

  test('PATCH /api/appointments/:id/cancel - cancels own appointment and frees the slot', async () => {
    // Find client1's appointment for bookingTime
    const appt = await prisma.appointment.findFirst({
      where: { userId: client1Id, date: bookingDate, time: bookingTime },
    });
    expect(appt).not.toBeNull();

    const cancelRes = await request(app)
      .patch(`/api/appointments/${appt!.id}/cancel`)
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ reason: 'Imprevisto laboral' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELLED');

    // Verify slot is liberated: client2 can now book this exact slot!
    const rebookRes = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${client2Token}`)
      .send({
        serviceId: testServiceId,
        date: bookingDate,
        time: bookingTime,
      });

    expect(rebookRes.status).toBe(201);
  });

  test('GET /api/admin/appointments - allows admin to view all appointments and filter', async () => {
    const res = await request(app)
      .get('/api/admin/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ date: bookingDate });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
