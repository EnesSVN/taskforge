/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

type Role = 'USER' | 'ADMIN';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async listFor(user: { id: string; role: Role }) {
    if (user.role === 'ADMIN') {
      return this.prisma.task.findMany({
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, email: true } } },
      });
    }
    return this.prisma.task.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFor(user: { id: string }, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status as any,
        ownerId: user.id,
      },
    });
  }

  async updateById(
    id: string,
    dto: UpdateTaskDto,
    user: { id: string; role: Role },
  ) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    if (user.role !== 'ADMIN' && task.ownerId !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title ?? task.title,
        description: dto.description ?? task.description,
        status: (dto.status as any) ?? task.status,
      },
    });
  }

  async deleteById(id: string, user: { id: string; role: Role }) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    if (user.role !== 'ADMIN' && task.ownerId !== user.id) {
      throw new ForbiddenException('Not allowed');
    }

    await this.prisma.task.delete({ where: { id } });
    return { ok: true };
  }
}
