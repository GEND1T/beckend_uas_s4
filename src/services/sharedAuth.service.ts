import { userRepository } from '../repositories/user.repository';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export class SharedAuthService {
  async login(email: string, passwordPlain: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    // Role will be 'superadmin' or 'admin' (or whatever role is stored in User DB)
    const token = jwt.sign(
      { id: user.id, role: user.role, storeId: user.storeId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }
}

export const sharedAuthService = new SharedAuthService();
