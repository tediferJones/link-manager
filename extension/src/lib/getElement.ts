// FIX ME, instead just do document.querySelector<T>()
export default function getElement<
  T extends Element
>(selector: string): T | null{
  return document.querySelector(selector);
}
