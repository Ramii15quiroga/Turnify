import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export class UserService {
  static list() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  }

  static async update(id: string, actorId: string, data: { role?: Role; isActive?: boolean }) {
    if (id === actorId && (data.role === Role.CLIENT || data.isActive === false)) { const error: any = new Error('No puedes quitarte privilegios ni desactivar tu propia cuenta'); error.status = 400; throw error; }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { const error: any = new Error('Usuario no encontrado'); error.status = 404; throw error; }
    return prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  }
}
