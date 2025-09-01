import { IconNode, createElement } from 'lucide';

export default function Icon(
  {
    name,
    className,
  }: {
    name: IconNode,
    className?: string,
  }
) {
  return createElement(name, { className: className || '' });
}
