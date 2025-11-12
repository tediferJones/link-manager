import { describe, expect, test, vi } from 'vitest';
import { DecryptPrompt } from '@/app/components/forms';
import { passwordId, errorId } from '@/app/components/forms/decryptPrompt';
import { hideError, showError } from '@/app/effects';
import { decryptFolder } from '@/app/lib/newVault/encryption';
import { newUserVault } from '@/app/lib/app/userVault';
import getElement from '@/app/lib/utils/getElement';
import { Result } from '@/app/types';

vi.mock('@/app/effects', () => ({ showError: vi.fn(), hideError: vi.fn() }));
vi.mock('@/app/lib/newVault/encryption', () => ({ decryptFolder: vi.fn() }));

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
    if (!vi.isMockFunction(decryptFolder)) {
      throw Error('decryptFolder is not mocked');
    }
    decryptFolder.mockResolvedValueOnce({
      success: true,
      data: {},
    } as Result<any>);

    document.body.appendChild(<DecryptPrompt path={testPath} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = testPassword;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    await Promise.resolve();
    expect(hideError).toHaveBeenCalledWith(errorId);
    expect(decryptFolder).toHaveBeenCalledWith(
      newUserVault.root,
      testPath,
      testPassword
    );
    expect(showError).not.toHaveBeenCalled();
  });

  test('Show error if decrypt fails', async () => {
    const errorMsg = 'Error message';
    if (!vi.isMockFunction(decryptFolder)) {
      throw Error('decryptFolder is not mocked');
    }
    decryptFolder.mockResolvedValueOnce({
      success: false,
      error: errorMsg
    } as Result<any>);

    document.body.appendChild(<DecryptPrompt path={testPath} />);
    const passwordInput = getElement<HTMLInputElement>(`#${passwordId}`);
    passwordInput.value = testPassword;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    passwordInput.dispatchEvent(event);
    await Promise.resolve();
    expect(hideError).toHaveBeenCalledWith(errorId);
    expect(decryptFolder).toHaveBeenCalledWith(
      newUserVault.root,
      testPath,
      testPassword
    );
    expect(showError).toHaveBeenCalled();
  });

  test('Displays item title', () => {
    const element = <DecryptPrompt path={testPath} />;
    expect(element.textContent).contains(testPath[testPath.length - 1]);
  });
});
