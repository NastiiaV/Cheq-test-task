import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ITask } from './interfaces/task.interface';
import { TaskRepository } from './repo/task.repository';

export const MAX_TITLE_LENGTH = 200;

@Injectable()
export class TasksService {
  constructor(private readonly tasks: TaskRepository) {}

  async findAll(): Promise<ITask[]> {
    const tasks = await this.tasks.findAll();
    return [...tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async create(title: string): Promise<ITask> {
    if (title.length > MAX_TITLE_LENGTH) {
      throw new BadRequestException(
        `title must be at most ${MAX_TITLE_LENGTH} characters`,
      );
    }

    const task: ITask = {
      id: randomUUID(),
      title,
      createdAt: new Date().toISOString(),
    };
    return this.tasks.save(task);
  }
}
