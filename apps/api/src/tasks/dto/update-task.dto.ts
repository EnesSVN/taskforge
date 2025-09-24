import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatusDto } from './create-task.dto';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatusDto)
  status?: TaskStatusDto;
}
