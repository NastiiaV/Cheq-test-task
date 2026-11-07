import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestLoggerMiddleware } from './request-logger';

describe('RequestLoggerMiddleware', () => {
  it('logs method, path, status code, and duration after the response finishes', () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const middleware = new RequestLoggerMiddleware();
    const req = { method: 'POST', originalUrl: '/tasks' } as Request;
    let onFinish: () => void = () => undefined;
    const res = {
      statusCode: 201,
      on: (event: string, listener: () => void) => {
        if (event === 'finish') {
          onFinish = listener;
        }
      },
    } as Response;
    const next = jest.fn();

    middleware.use(req, res, next);
    onFinish();

    expect(next).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/tasks 201 \d+ms$/),
    );
    log.mockRestore();
  });
});
