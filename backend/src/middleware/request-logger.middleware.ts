import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export interface RequestWithId extends Request {
  id?: string;
}

export const requestLogger = (req: RequestWithId, res: Response, next: NextFunction) => {
  if (req.url === '/health') {
    return next();
  }

  const reqId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = reqId;
  res.setHeader('x-request-id', reqId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logData = {
      requestId: reqId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      durationMs,
      remoteAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    const message = `${req.method} ${req.url} completed with status ${res.statusCode} (${durationMs}ms)`;

    if (res.statusCode >= 500) {
      logger.error(logData, message);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, message);
    } else {
      logger.info(logData, message);
    }
  });

  next();
};
