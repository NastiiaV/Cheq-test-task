import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskRepository } from './repo/task.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<TaskRepository>;

  beforeEach(async () => {
    repository = {
      findAll: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: repository },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('findAll', () => {
    it('returns tasks newest first', async () => {
      repository.findAll.mockResolvedValue([
        {
          id: 'old',
          title: 'Write the README',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'new',
          title: 'Ship the API',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
      ]);

      await expect(service.findAll()).resolves.toEqual([
        {
          id: 'new',
          title: 'Ship the API',
          createdAt: '2026-06-01T00:00:00.000Z',
        },
        {
          id: 'old',
          title: 'Write the README',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    });
  });

  describe('create', () => {
    it('returns the created task', async () => {
      repository.save.mockImplementation((task) => Promise.resolve(task));

      const created = await service.create('Write the README');

      expect(created.title).toBe('Write the README');
      expect(created.id).toEqual(expect.any(String));
      expect(created.id.length).toBeGreaterThan(0);
      expect(created.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(repository.save).toHaveBeenCalledWith(created);
    });

    it('rejects a title longer than 200 characters', async () => {
      await expect(service.create('a'.repeat(201))).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
