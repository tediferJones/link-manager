import { NextFunction, Request, Response } from 'express';

type Bucket = {
  [key: string]: {
    updatedAt: number,
    attemptsLeft: number,
    strikes: number,
    unblockAt: number,
  }
}

const rate = 5;
const maxAttempts = 100;
const oneHour = 1000 * 60 * 60;
const backOff = 1000 * 60 * 2;
const bucket: Bucket = {};

setInterval(() => {
  const now = Date.now();
  Object.entries(bucket).forEach(([key, client]) => {
    if (now < client.unblockAt) return;
    if (now - client.updatedAt < oneHour) return;
    delete bucket[key];
  });
}, 1000 * 60 * 5);

export function useRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cacheKey = req.ip || 'noIp';

  const now = Date.now();
  if (!bucket[cacheKey]) {
    bucket[cacheKey] = {
      updatedAt: now,
      attemptsLeft: maxAttempts,
      strikes: 0,
      unblockAt: now,
    }
  } else if (now > bucket[cacheKey].unblockAt) {
    const elapsed = Math.floor((now - bucket[cacheKey].updatedAt) / 1000);
    bucket[cacheKey].attemptsLeft = Math.min(
      maxAttempts,
      bucket[cacheKey].attemptsLeft + elapsed * rate
    );
    bucket[cacheKey].updatedAt = now;
  }

  if (bucket[cacheKey].attemptsLeft <= 0) {
    if (now > bucket[cacheKey].unblockAt) {
      bucket[cacheKey].unblockAt = (
        now + backOff * 2 ** bucket[cacheKey].strikes
      );
      bucket[cacheKey].strikes++;
    }
    return res.sendStatus(429);
  }

  bucket[cacheKey].attemptsLeft--;
  return next();
}
