import { Result as ResultObj } from '@/types';

class ResultChain<T> implements PromiseLike<Result<T>> {
  constructor(private promise: Promise<Result<T>>) {}

  next<K>(handler: (data: T) => Result<K> | Promise<Result<K>>): ResultChain<K> {
    const p = this.promise
      .then(res => {
        if (!res.success()) return Result.failure<K>(res.error());
        return Promise.resolve(handler(res.data()));
      })
      .then(r => r);
    return new ResultChain<K>(p);
  }

  then<TResult1 = Result<T>, TResult2 = never>(
    onfulfilled?: (value: Result<T>) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled as any, onrejected as any);
  }
}

export default class Result<T> {
  private constructor(public readonly inner: ResultObj<T>) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>({ success: true, data });
  }

  static failure<T = never>(error: string): Result<T> {
    return new Result<T>({ success: false, error });
  }

  next<K>(
    handler: (data: T) => Result<K> | Promise<Result<K>>
  ): ResultChain<K> {
    const p = this.inner.success
      ? Promise.resolve(handler(this.inner.data))
      : Promise.resolve(Result.failure<K>(this.inner.error));
    return new ResultChain<K>(p);
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
