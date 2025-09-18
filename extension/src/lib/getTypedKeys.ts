// FIX ME delete if not used
export default function getSortedKeys<
  T extends { [key: string]: any }
>(obj: T) {
  return Object.keys(obj) as (keyof T)[];
}
