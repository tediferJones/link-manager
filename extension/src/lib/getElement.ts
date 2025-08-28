export default function getElement<
  T extends Element = Element
>(selector: string) {
  const element = document.querySelector<T>(selector);
  if (!element) throw Error(`could not find element: ${selector}`);
  return element;
}
