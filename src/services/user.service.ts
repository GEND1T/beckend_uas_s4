import { userRepository } from '../repositories/user.repository';
import { storeRepository } from '../repositories/store.repository';
import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return userRepository.findAll();
  }

  async getUserById(id: number): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found.`);
    }
    return user;
  }

  async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error(`User with email '${data.email}' already exists.`);
    }

    // Verify store exists
    const store = await storeRepository.findById(data.storeId);
    if (!store) {
      throw new Error(`Store with ID ${data.storeId} not found.`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return userRepository.create({
      ...data,
      password: hashedPassword
    });
  }

  async updateUser(id: number, data: Prisma.UserUncheckedUpdateInput): Promise<User> {
    await this.getUserById(id);

    if (data.email && typeof data.email === 'string') {
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error(`User with email '${data.email}' already exists.`);
      }
    }

    if (data.storeId && typeof data.storeId === 'number') {
      const store = await storeRepository.findById(data.storeId);
      if (!store) {
        throw new Error(`Store with ID ${data.storeId} not found.`);
      }
    }

    const updateData = { ...data };
    if (data.password && typeof data.password === 'string') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return userRepository.update(id, updateData);
  }

  async deleteUser(id: number): Promise<User> {
    await this.getUserById(id);
    return userRepository.delete(id);
  }
}

export const userService = new UserService();
