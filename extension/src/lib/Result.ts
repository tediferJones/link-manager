import { ResultObj } from '@/types';

// delete throwOnFail and returnOnFail functions

export default class Result<T> {
  private constructor(
    public readonly inner: ResultObj<T>
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>({ success: true, data });
  }

  static failure<T = never>(error: string): Result<T> {
    return new Result<T>({ success: false, error });
  }

  async next<K>(
    handler: (data: T) => Result<K> | Promise<Result<K>>
  ): Promise<Result<K>> {
    if (this.inner.success) {
      return await handler(this.inner.data);
    } else {
      return Result.failure(this.inner.error);
    }
  }

  throw(): Result<T> {
    if (!this.inner.success) throw Error(this.inner.error);
    return this;
  }

  data(): T {
    if (!this.inner.success) throw Error('no data to extract');
    return this.inner.data;
  }

  error(): string {
    if (this.inner.success) throw Error('no error to extract');
    return this.inner.error;
  }

  success() {
    return this.inner.success;
  }
}
