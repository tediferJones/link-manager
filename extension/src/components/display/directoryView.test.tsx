import { describe, expect, test, vi } from 'vitest';
import { DirectoryView } from '@/components/display';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

const mockDecryptPromptId = 'mockDecryptPrompt';

vi.mock('@/components/forms', () => ({
  DecryptPrompt: vi.fn(() => <div id={mockDecryptPromptId}></div>),
}));

vi.mock('@/lib/app/userVault', () => ({
  default: { getViewPath: vi.fn(() => []) }
}));

describe('Directory view', () => {
  test('Display decrypt prompt if item is encrypted', () => {
    const item = {
      type: 'encryptedFolder',
      title: 'encryptedTest',
      data: '',
      iv: '',
      salt: '',
      date: Date.now(),
      pinned: false,
    } satisfies Content<'encryptedFolder'>

    document.body.appendChild(<DirectoryView item={item} />);
    // FIX ME check that this also displays the folder's title
    expect(UserVault.getViewPath).toHaveBeenCalled();
    expect(getElement(`#${mockDecryptPromptId}`)).toBeTruthy();
  });
});
