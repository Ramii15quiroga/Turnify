import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/prisma';

describe('Task 2: Backend Authentication Module (SCRUM-5, SCRUM-6)', () => {
  const testUser = {
    name: 'Carlos Test',
    email: 'carlos.test@example.com',
    password: 'Password123!',
  };

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, 'another@example.com'] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, 'another@example.com'] } },
    });
    await prisma.$disconnect();
  });

  test('POST /api/auth/register - registers new user with valid fields and encrypted password', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: 'CLIENT',
    });
    expect(res.body.user.password).toBeUndefined();

    // Verify stored password in DB is encrypted
    const stored = await prisma.user.findUnique({ where: { email: testUser.email } });
    expect(stored?.password).not.toBe(testUser.password);
    expect(stored?.password.startsWith('$2')).toBe(true);
  });

  test('POST /api/auth/register - rejects duplicate email with clear message', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/correo|email/i);
  });

  test('POST /api/auth/register - rejects password shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Pass',
      email: 'another@example.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login - authenticates correctly and returns JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      name: testUser.name,
      email: testUser.email,
      role: 'CLIENT',
    });
  });

  test('POST /api/auth/login - rejects invalid credentials with generic error without revealing which field failed', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword!',
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales incorrectas/i);
  });

  test('GET /api/auth/me - requires valid token (401 when missing)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me - returns authenticated user details with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email);
  });
});
