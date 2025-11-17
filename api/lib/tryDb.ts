import type { Response } from 'express';

export async function tryDb(res: Response, func: Function) {
  try {
    return await func()
  } catch {
    return res.sendStatus(500).json(
      'Failed to process requests, database error'
    );
  }
}
