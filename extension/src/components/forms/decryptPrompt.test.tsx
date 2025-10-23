import { describe, expect, test, vi } from 'vitest';
import { DecryptPrompt } from '@/components/forms';
import { passwordId, errorId } from '@/components/forms/decryptPrompt';
import { hideError, showError } from '@/effects';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';

vi.mock('@/effects', () => ({
  showError: vi.fn(),
  hideError: vi.fn(),
}));

vi.useFakeTimers();

describe('Decrypt prompt', () => {
  const testPath = [ 'seg1', 'seg2', 'seg3' ];
  const testPassword = 'password';

  test('Input focused on initial render', () => {
    document.body.appendChild(<DecryptPrompt path={testPath} />);
    vi.runAllTimers();
    const passwordInput = getElement(`#${passwordId}`);
    expect(document.activeElement).toBe(passwordInput);
  });

  test('Submit triggers decrypt with given password', async () => {
    const decryptMock = vi.fn(async () => ({ success: () => true }));
    UserVault.decrypt = decryptMock as any;

    document.body.appendChild(<DecryptPrompt path={testPath} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = testPassword;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    await Promise.resolve();
    expect(hideError).toHaveBeenCalledWith(errorId);
    expect(decryptMock).toHaveBeenCalledWith(testPath, testPassword);
    expect(showError).not.toHaveBeenCalled();
  });

  test('Show error if decrypt fails', async () => {
    const errorMsg = 'Error message';
    const decryptMock = vi.fn(async () => ({
      success: () => false,
      error: () => errorMsg,
    }));
    UserVault.decrypt = decryptMock as any;

    document.body.appendChild(<DecryptPrompt path={testPath} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = testPassword;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    await Promise.resolve();
    expect(hideError).toHaveBeenCalledWith(errorId);
    expect(decryptMock).toHaveBeenCalledWith(testPath, testPassword);
    expect(showError).toHaveBeenCalled();
  });
});
