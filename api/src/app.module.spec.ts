import { INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves health and tasks and logs each request', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const health = await request(app.getHttpServer()).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');

    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '  Write the README  ', extra: 'dropped' });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe('Write the README');

    const listed = await request(app.getHttpServer()).get('/tasks');
    expect(listed.status).toBe(200);
    expect(listed.body).toEqual([created.body]);

    const invalid = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: '' });
    expect(invalid.status).toBe(400);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/health 200 \d+ms$/),
    );
    log.mockRestore();
  });
});
