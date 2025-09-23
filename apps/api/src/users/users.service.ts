import { Injectable } from '@nestjs/common';
import { Prisma, User, Role, AuthProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type SafeUser = Omit<User, 'password'>;

export interface CreateLocalUserInput {
  email: string;
  name?: string;
  passwordHash: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });
  }

  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async createLocalUser(input: CreateLocalUserInput): Promise<SafeUser> {
    const data: Prisma.UserCreateInput = {
      email: input.email,
      name: input.name,
      password: input.passwordHash,
      role: input.role ?? Role.USER,
      provider: AuthProvider.LOCAL,
    };

    return this.prisma.user.create({
      data,
      select: safeUserSelect,
    });
  }
}

// Tekrarsız/select şablonu
const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  provider: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;
