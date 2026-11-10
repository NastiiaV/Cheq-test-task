import { ITask } from '../interfaces/task.interface';

export abstract class TaskRepository {
  abstract findAll(): Promise<ITask[]>;
  abstract save(task: ITask): Promise<ITask>;
  abstract delete(id: string): Promise<boolean>;
}
