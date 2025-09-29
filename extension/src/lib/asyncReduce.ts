export default async function asyncReduce<T, V>(
  arr: T[],
  func: (accumulator: V, item: T, i: number, arr: T[]) => V | Promise<V>,
  accumulator: V,
  i = 0,
) {
  if (i >= arr.length) return accumulator;
  return asyncReduce(
    arr,
    func,
    await func(accumulator, arr[i], i, arr),
    i + 1,
  );
}
