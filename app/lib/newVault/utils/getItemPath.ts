import { Content } from '@/app/types';

export function getItemPath(path: string[], item: Content): string[] {
  return path.concat(item.title);
}
