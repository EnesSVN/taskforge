import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, JwtUser } from '../auth/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RolesGuard } from '../auth/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  async list(@CurrentUser() user: JwtUser) {
    return this.tasks.listFor({ id: user.sub, role: user.role });
  }

  @Post()
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateTaskDto) {
    return this.tasks.createFor({ id: user.sub }, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.tasks.updateById(id, dto, { id: user.sub, role: user.role });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.tasks.deleteById(id, { id: user.sub, role: user.role });
  }
}
