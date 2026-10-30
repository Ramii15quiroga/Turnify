import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

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
}

