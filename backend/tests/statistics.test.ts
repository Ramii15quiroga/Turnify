import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signToken } from '../src/utils/jwt';

/** SCRUM-38 / HU-16: aceptación de cifras reales y autorización, con fixture aislado. */
describe('SCRUM-38: estadísticas de turnos y reservas', () => {
  let adminToken: string;
  let clientToken: string;
  let testUserId: string;
  let adminId: string;
  let serviceAId: string;
  let serviceBId: string;
  let serviceAName: string;
  let serviceBName: string;

  beforeAll(async () => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const admin = await prisma.user.create({
      data: { name: 'Admin SCRUM-38', email: `stats-admin-${suffix}@example.invalid`, password: 'test', role: 'ADMIN' },
    });
    const client = await prisma.user.create({
      data: { name: 'Cliente SCRUM-38', email: `stats-client-${suffix}@example.invalid`, password: 'test', role: 'CLIENT' },
    });
    adminId = admin.id;
    testUserId = client.id;
    adminToken = signToken({ userId: admin.id, email: admin.email, role: admin.role });
    clientToken = signToken({ userId: client.id, email: client.email, role: client.role });
    serviceAName = `Corte SCRUM-38 ${suffix}`;
    serviceBName = `Manicura SCRUM-38 ${suffix}`;
    const serviceA = await prisma.service.create({ data: { name: serviceAName, description: 'Prueba', durationMinutes: 30 } });
    const serviceB = await prisma.service.create({ data: { name: serviceBName, description: 'Prueba', durationMinutes: 30 } });
    serviceAId = serviceA.id;
    serviceBId = serviceB.id;
    await prisma.appointment.createMany({ data: [
      { userId: testUserId, serviceId: serviceAId, date: '2099-02-27', time: '10:00', status: 'CONFIRMED' },
      { userId: testUserId, serviceId: serviceAId, date: '2099-03-02', time: '10:00', status: 'CONFIRMED' },
      { userId: testUserId, serviceId: serviceAId, date: '2099-03-02', time: '11:00', status: 'CANCELLED' },
      { userId: testUserId, serviceId: serviceBId, date: '2099-03-03', time: '10:00', status: 'COMPLETED' },
      { userId: testUserId, serviceId: serviceBId, date: '2099-03-04', time: '10:00', status: 'NO_SHOW' },
      { userId: testUserId, serviceId: serviceBId, date: '2099-03-09', time: '10:00', status: 'PENDING' },
      { userId: testUserId, serviceId: serviceAId, date: '2099-03-31', time: '10:00', status: 'CONFIRMED' },
      { userId: testUserId, serviceId: serviceAId, date: '2099-04-01', time: '10:00', status: 'COMPLETED' },
    ] });
  });

  afterAll(async () => {
    if (testUserId) await prisma.appointment.deleteMany({ where: { userId: testUserId } });
    if (serviceAId && serviceBId) await prisma.service.deleteMany({ where: { id: { in: [serviceAId, serviceBId] } } });
    if (adminId && testUserId) await prisma.user.deleteMany({ where: { id: { in: [adminId, testUserId] } } });
    await prisma.$disconnect();
  });

  const endpoint = '/api/admin/appointments/statistics';

  test('sin autenticar devuelve 401', async () => {
    expect((await request(app).get(endpoint)).status).toBe(401);
  });
  test('un CLIENT no puede acceder (403)', async () => {
    expect((await request(app).get(endpoint).set('Authorization', `Bearer ${clientToken}`)).status).toBe(403);
  });
  test('por día: cuenta canceladas y confirmadas, excluye los otros días', async () => {
    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${adminToken}`)
      .query({ period: 'day', date: '2099-03-02' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ period: 'day', from: '2099-03-02', to: '2099-03-03', total: 2 });
    expect(res.body.byStatus.CONFIRMED).toBe(1);
    expect(res.body.byStatus.CANCELLED).toBe(1);
    expect(res.body.byService[serviceAName]).toBe(2);
  });
  test('por semana: lunes incluido, lunes siguiente excluido', async () => {
    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${adminToken}`)
      .query({ period: 'week', date: '2099-03-07' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ period: 'week', from: '2099-03-02', to: '2099-03-09', total: 4 });
    expect(res.body.byService).toEqual({ [serviceAName]: 2, [serviceBName]: 2 });
  });
  test('por mes: totales reales por estado y servicio, límites excluyentes', async () => {
    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${adminToken}`)
      .query({ period: 'month', date: '2099-03-25' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ period: 'month', from: '2099-03-01', to: '2099-04-01', total: 6 });
    expect(res.body.byStatus).toEqual({ PENDING: 1, CONFIRMED: 2, CANCELLED: 1, COMPLETED: 1, NO_SHOW: 1 });
    expect(res.body.byService).toEqual({ [serviceAName]: 3, [serviceBName]: 3 });
    expect(Object.values(res.body.byStatus).reduce((sum: number, v) => sum + Number(v), 0)).toBe(6);
    expect(Object.values(res.body.byService).reduce((sum: number, v) => sum + Number(v), 0)).toBe(6);
  });
  test('período sin reservas: HTTP 200 con total cero y agrupación vacía', async () => {
    const res = await request(app).get(endpoint).set('Authorization', `Bearer ${adminToken}`)
      .query({ period: 'month', date: '2099-05-01' });
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.byService).toEqual({});
    expect(Object.values(res.body.byStatus).every(value => value === 0)).toBe(true);
  });
  test('fechas inválidas y período inválido devuelven 400, nunca error 500', async () => {
    for (const params of [
      { period: 'year', date: '2099-03-02' },
      { period: 'day', date: '2099-02-30' },
      { period: 'week', date: 'mal' },
    ]) {
      const res = await request(app).get(endpoint).set('Authorization', `Bearer ${adminToken}`).query(params);
      expect(res.status).toBe(400);
      expect(res.body.error).toBeTruthy();
    }
  });
});
