import { ITask } from '../interfaces/task.interface';

// not sure its needed!
export abstract class TaskRepository {
  abstract findAll(): Promise<ITask[]>;
  abstract save(task: ITask): Promise<ITask>;
}
