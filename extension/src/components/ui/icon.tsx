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
  // FIX ME passing classes to this function does not actually apply the classes
  // wrap this thing in a div/span and pass classes to that element
  // while we're at it just allow any div/span prop to be passed to the wrapped tag
  // afterwards fix all occurrences of wrapped Icon tags
  //
  // FIXED IT, classes now work, delete wrapped Icon tags
  return createElement(name, { class: `flex-shrink-0 ${className || ''}` });
}
