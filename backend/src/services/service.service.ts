import { prisma } from '../config/prisma';
import { CreateServiceInput, UpdateServiceInput } from '../schemas/service.schema';

export class ServiceService {
  static async getActiveServices() {
    return prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        durationMinutes: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getAllServices() {
    return prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getServiceById(id: string) {
    const service = await prisma.service.findUnique({
      where: { id },
    });
    if (!service) {
      const error: any = new Error('Servicio no encontrado');
      error.status = 404;
      throw error;
    }
    return service;
  }

  static async createService(data: CreateServiceInput) {
    const existing = await prisma.service.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      const error: any = new Error('Ya existe un servicio con ese nombre');
      error.status = 400;
      throw error;
    }

    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        durationMinutes: data.durationMinutes,
        isActive: true,
      },
    });
  }

  static async updateService(id: string, data: UpdateServiceInput) {
    const service = await this.getServiceById(id);

    if (data.name && data.name !== service.name) {
      const existing = await prisma.service.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        const error: any = new Error('Ya existe otro servicio con ese nombre');
        error.status = 400;
        throw error;
      }
    }

    return prisma.service.update({
      where: { id },
      data,
    });
  }

  static async deactivateService(id: string) {
    await this.getServiceById(id);
    return prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
