import { PrismaClient, Role, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Admin & Client users
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@turnify.com' },
    update: {},
    create: {
      name: 'Administrador Turnify',
      email: 'admin@turnify.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const clientPassword = await bcrypt.hash('Cliente123!', 10);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@turnify.com' },
    update: {},
    create: {
      name: 'Juan Perez',
      email: 'cliente@turnify.com',
      password: clientPassword,
      role: Role.CLIENT,
    },
  });

  console.log('👤 Users created:', { admin: admin.email, client: client.email });

  // 2. Create Services
  const servicesData = [
    {
      name: 'Corte de Cabello Clásico',
      description: 'Corte tradicional con tijera y máquina, lavado y peinado final.',
      durationMinutes: 30,
      isActive: true,
    },
    {
      name: 'Perfilado y Corte de Barba',
      description: 'Tratamiento completo de barba con toalla caliente y aceites esenciales.',
      durationMinutes: 30,
      isActive: true,
    },
    {
      name: 'Servicio Completo (Pelo + Barba)',
      description: 'Corte completo de cabello y diseño de barba con acabado premium.',
      durationMinutes: 60,
      isActive: true,
    },
    {
      name: 'Tratamiento Capilar Anticaída (Inactivo)',
      description: 'Servicio discontinuado temporalmente para pruebas de catálogo.',
      durationMinutes: 45,
      isActive: false,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: { description: s.description, durationMinutes: s.durationMinutes, isActive: s.isActive },
      create: s,
    });
  }

  console.log('✂️ Services created/updated.');

  // 3. Create Weekly Schedules (Monday to Friday: 09:00 to 18:00, Saturday: 09:00 to 13:00)
  // DayOfWeek: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  await prisma.businessSchedule.deleteMany(); // Reset schedules for clean seed

  const scheduleConfigs = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, isActive: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, isActive: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, isActive: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, isActive: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', slotDurationMinutes: 30, isActive: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, isActive: true },
  ];

  for (const sch of scheduleConfigs) {
    await prisma.businessSchedule.create({
      data: sch,
    });
  }

  console.log('📅 Weekly business schedules created.');
  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

