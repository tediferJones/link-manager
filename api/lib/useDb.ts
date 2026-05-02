import type { Response } from 'express';

export async function useDb(res: Response, func: Function) {
  try {
    return await func()
  } catch {
    return res.status(500).json(
      'Failed to process requests, database error'
    );
  }
}
