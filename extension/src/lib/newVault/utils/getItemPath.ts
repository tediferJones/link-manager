import { Content } from '@/types';

export function getItemPath(path: string[], item: Content): string[] {
  return path.concat(item.title);
}
