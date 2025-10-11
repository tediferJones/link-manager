import getElement from '@/lib/utils/getElement';

export function showError(id: string, msg: string) {
  const container = getElement(`#error-${id}`);
  container.textContent = msg;
  container.classList.remove('hidden');
}

export function hideError(id: string) {
  const container = getElement(`#error-${id}`);
  container.classList.add('hidden');
  container.textContent = '';
}
