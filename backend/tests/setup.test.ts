import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

describe('Task 1: Setup & Database Model in 3NF (SCRUM-9)', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('admin and client users exist from seed', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@turnify.com' } });
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe(Role.ADMIN);

    const client = await prisma.user.findUnique({ where: { email: 'cliente@turnify.com' } });
    expect(client).not.toBeNull();
    expect(client?.role).toBe(Role.CLIENT);
  });

  test('services are correctly seeded with active and inactive flags', async () => {
    const activeServices = await prisma.service.findMany({ where: { isActive: true } });
    expect(activeServices.length).toBeGreaterThanOrEqual(3);

    const inactiveService = await prisma.service.findFirst({ where: { isActive: false } });
    expect(inactiveService).not.toBeNull();
    expect(inactiveService?.name).toContain('(Inactivo)');
  });

  test('weekly business schedules exist and have valid time ranges', async () => {
    const schedules = await prisma.businessSchedule.findMany({ where: { isActive: true } });
    expect(schedules.length).toBeGreaterThanOrEqual(5); // At least standard Mon-Fri active business days
    for (const sch of schedules) {
      expect(sch.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(sch.endTime).toMatch(/^\d{2}:\d{2}$/);
      expect(sch.startTime < sch.endTime).toBe(true);
      expect(sch.slotDurationMinutes).toBeGreaterThan(0);
    }
  });

  test('enforces unique constraint on service name', async () => {
    const firstService = await prisma.service.findFirst();
    expect(firstService).not.toBeNull();

    await expect(
      prisma.service.create({
        data: {
          name: firstService!.name,
          description: 'Duplicado',
          durationMinutes: 30,
        },
      })
    ).rejects.toThrow();
  });
});

