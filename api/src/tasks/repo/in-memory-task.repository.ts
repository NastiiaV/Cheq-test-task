import { Injectable } from '@nestjs/common';
import { ITask } from '../interfaces/task.interface';
import { TaskRepository } from './task.repository';

@Injectable()
export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks: ITask[] = [];

  findAll(): Promise<ITask[]> {
    return Promise.resolve([...this.tasks]);
  }

  save(task: ITask): Promise<ITask> {
    this.tasks.push(task);
    return Promise.resolve(task);
  }
}
