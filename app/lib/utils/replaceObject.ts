import getTypedKeys from '@/app/lib/utils/getTypedKeys';

export default function replaceObject<
  T extends object,
  R extends object,
>(target: T, source: R): R {
  getTypedKeys(target).forEach(key => delete target[key]);
  Object.assign(target, source);
  return source;
}
