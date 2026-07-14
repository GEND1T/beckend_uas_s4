import { customerRepository } from '../repositories/customer.repository';
import { Customer, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'spk_laptop_very_secure_secret_key_123!';

export class CustomerAuthService {
  async register(data: Prisma.CustomerCreateInput): Promise<{ customer: Omit<Customer, 'password'>; token: string }> {
    const existing = await customerRepository.findByEmail(data.email);
    if (existing) {
      throw new Error(`Customer with email '${data.email}' already registered.`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const customer = await customerRepository.create({
      ...data,
      password: hashedPassword
    });

    const token = this.generateToken(customer.id, 'customer');

    const { password, ...customerWithoutPassword } = customer;
    return {
      customer: customerWithoutPassword,
      token
    };
  }

  async login(email: string, passwordPlain: string): Promise<{ customer: Omit<Customer, 'password'>; token: string }> {
    const customer = await customerRepository.findByEmail(email);
    if (!customer) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(passwordPlain, customer.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = this.generateToken(customer.id, 'customer');

    const { password, ...customerWithoutPassword } = customer;
    return {
      customer: customerWithoutPassword,
      token
    };
  }

  async getProfile(id: number): Promise<Omit<Customer, 'password'>> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found.');
    }
    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  async updateProfile(id: number, data: Prisma.CustomerUpdateInput): Promise<Omit<Customer, 'password'>> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    if (data.email && typeof data.email === 'string') {
      const existing = await customerRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new Error('Email is already taken by another account.');
      }
    }

    const updateData = { ...data };
    if (data.password && typeof data.password === 'string') {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await customerRepository.update(id, updateData);
    const { password, ...customerWithoutPassword } = updated;
    return customerWithoutPassword;
  }

  private generateToken(id: number, role: string): string {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
  }
}

export const customerAuthService = new CustomerAuthService();
