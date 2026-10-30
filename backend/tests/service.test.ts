import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';
import { signToken } from '../src/utils/jwt';

describe('Task 3: Backend Services Module (SCRUM-8, SCRUM-10)', () => {
  let adminToken: string;
  let clientToken: string;
  let testServiceId: string;

  beforeAll(async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@turnify.com' } });
    adminToken = signToken({ userId: admin!.id, email: admin!.email, role: admin!.role });

    const client = await prisma.user.findUnique({ where: { email: 'cliente@turnify.com' } });
    clientToken = signToken({ userId: client!.id, email: client!.email, role: client!.role });
  });

  afterAll(async () => {
    if (testServiceId) {
      await prisma.service.deleteMany({ where: { id: testServiceId } });
    }
    await prisma.$disconnect();
  });

  test('GET /api/services - lists ONLY active services for clients', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    for (const service of res.body) {
      expect(service.isActive).toBe(true);
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('description');
      expect(service).toHaveProperty('durationMinutes');
    }
    const inactiveFound = res.body.some((s: any) => s.isActive === false);
    expect(inactiveFound).toBe(false);
  });

  test('GET /api/admin/services - rejects client user with 403', async () => {
    const res = await request(app)
      .get('/api/admin/services')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });

  test('GET /api/admin/services - allows admin to see all services (including inactive)', async () => {
    const res = await request(app)
      .get('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const hasInactive = res.body.some((s: any) => s.isActive === false);
    expect(hasInactive).toBe(true);
  });

  test('POST /api/admin/services - creates new service when admin', async () => {
    const newService = {
      name: 'Masaje Descontracturante Test',
      description: 'Sesión de relajación profunda de 45 minutos.',
      durationMinutes: 45,
    };

    const res = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newService);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newService);
    expect(res.body.isActive).toBe(true);
    testServiceId = res.body.id;
  });

  test('POST /api/admin/services - rejects duplicate service name with 400', async () => {
    const duplicateService = {
      name: 'Masaje Descontracturante Test',
      description: 'Otro servicio con mismo nombre',
      durationMinutes: 30,
    };

    const res = await request(app)
      .post('/api/admin/services')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(duplicateService);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nombre.*existe|ya existe/i);
  });

  test('PUT /api/admin/services/:id - updates service fields', async () => {
    const res = await request(app)
      .put(`/api/admin/services/${testServiceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Masaje Descontracturante Actualizado',
        description: 'Descripción renovada.',
        durationMinutes: 50,
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Masaje Descontracturante Actualizado');
    expect(res.body.durationMinutes).toBe(50);
  });

  test('PATCH /api/admin/services/:id/deactivate - deactivates service (isActive = false)', async () => {
    const res = await request(app)
      .patch(`/api/admin/services/${testServiceId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);

    // Verify it disappears from public client list
    const publicList = await request(app).get('/api/services');
    const found = publicList.body.some((s: any) => s.id === testServiceId);
    expect(found).toBe(false);
  });
});

