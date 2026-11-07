import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { ITask } from './interfaces/task.interface';
import { TaskRepository } from './repo/task.repository';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let app: INestApplication<App>;
  let repository: jest.Mocked<TaskRepository>;
  const stored: ITask[] = [];

  beforeEach(async () => {
    stored.length = 0;
    repository = {
      findAll: jest.fn(() => Promise.resolve([...stored])),
      save: jest.fn((task: ITask) => {
        stored.push(task);
        return Promise.resolve(task);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: repository },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists tasks', async () => {
    stored.push({
      id: 'a1b2c3',
      title: 'Write the README',
      createdAt: '2026-11-02T09:30:00.000Z',
    });

    const response = await request(app.getHttpServer()).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'a1b2c3',
        title: 'Write the README',
        createdAt: '2026-11-02T09:30:00.000Z',
      },
    ]);
  });

  it('returns an empty array when there are no tasks', async () => {
    const response = await request(app.getHttpServer()).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('creates a task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write the README' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ title: 'Write the README' });
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        createdAt: expect.any(String),
      }),
    );
  });

  it('rejects a missing title', async () => {
    const response = await request(app.getHttpServer()).post('/tasks').send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('title')]),
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects an empty title', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects a non-string title', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 12 });

    expect(response.status).toBe(400);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
