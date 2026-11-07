import { INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Task API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs the request and serves health and tasks', async () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    const health = await request(app.getHttpServer()).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.status).toBe('ok');

    const empty = await request(app.getHttpServer()).get('/tasks');
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual([]);

    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Write the README', extra: 'ignored' });
    expect(created.status).toBe(201);
    expect(created.body.title).toBe('Write the README');

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
