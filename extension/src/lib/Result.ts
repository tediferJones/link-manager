// FIX ME replace ResultObj with this class
// delete ResultObj type
// delete throwOnFail and returnOnFail functions
export default class Result<T> {
  private constructor(
    public readonly success: boolean,
    public readonly data: T | undefined,
    public readonly error: string | undefined,
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>(true, data, undefined);
  }

  static failure<T = never>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  next<K>(handler: (data: T) => Result<K>): Result<K> {
    if (this.success) {
      return handler(this.data as T);
    } else {
      return Result.failure(this.error!);
    }
  }

  check(): void {
    if (!this.success) throw Error(this.error);
  }

  extract(): T {
    return this.data!;
  }
}
