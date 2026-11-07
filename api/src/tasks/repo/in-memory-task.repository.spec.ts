import { InMemoryTaskRepository } from './in-memory-task.repository';
import { ITask } from '../interfaces/task.interface';

describe('InMemoryTaskRepository', () => {
  it('returns saved tasks in insertion order', async () => {
    const repository = new InMemoryTaskRepository();
    const first: ITask = {
      id: '1',
      title: 'First',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    const second: ITask = {
      id: '2',
      title: 'Second',
      createdAt: '2026-01-02T00:00:00.000Z',
    };

    await expect(repository.findAll()).resolves.toEqual([]);
    await expect(repository.save(first)).resolves.toEqual(first);
    await repository.save(second);

    await expect(repository.findAll()).resolves.toEqual([first, second]);
  });
});
