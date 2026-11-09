import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { createHash, randomBytes } from 'crypto';

export class AuthService {
  static async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      const error: any = new Error('El correo electrónico ya se encuentra registrado');
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'CLIENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
      user,
    };
  }

  static async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // If user does not exist or password mismatch, fail with generic error
    if (!user) {
      const error: any = new Error('Credenciales incorrectas');
      error.status = 401;
      throw error;
    }

    if (!user.isActive) { const error: any = new Error('Credenciales incorrectas'); error.status = 401; throw error; }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Credenciales incorrectas');
      error.status = 401;
      throw error;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');
      await prisma.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
      await prisma.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
      const url = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
      if (process.env.NODE_ENV !== 'production') console.info(`Password reset link for ${email}: ${url}`);
      // Production deployments must deliver this URL through their configured mail provider.
    }
    return { message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' };
  }

  static async resetPassword(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const reset = await prisma.passwordReset.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date() || !reset.user.isActive) { const error: any = new Error('El enlace no es válido o venció'); error.status = 400; throw error; }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { password: hashedPassword } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null, id: { not: reset.id } }, data: { usedAt: new Date() } }),
    ]);
    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
  }
}

