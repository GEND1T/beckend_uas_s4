import { prisma } from '../config/db';
import { Customer, Prisma } from '@prisma/client';

export class CustomerRepository {
  async findAll(): Promise<Customer[]> {
    return prisma.customer.findMany({
      orderBy: { id: 'asc' }
    });
  }

  async findById(id: number): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return prisma.customer.findUnique({
      where: { email }
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({
      data
    });
  }

  async update(id: number, data: Prisma.CustomerUpdateInput): Promise<Customer> {
    return prisma.customer.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<Customer> {
    return prisma.customer.delete({
      where: { id }
    });
  }
}

export const customerRepository = new CustomerRepository();
