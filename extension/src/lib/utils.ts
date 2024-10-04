export function clearChildren(id: string) {
  const parent = document.querySelector(`#${id}`);
  if (!parent) throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  return parent;
}
