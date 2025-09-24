/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, AuthProvider } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createLocalUser(input: {
    email: string;
    name?: string;
    passwordHash: string;
    role?: Role;
  }) {
    return this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: input.passwordHash,
        role: input.role ?? 'USER',
        provider: AuthProvider.LOCAL,
      },
    });
  }
}
