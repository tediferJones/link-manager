import { describe, expect, test, vi } from 'vitest';
import { Breadcrumbs } from '@/components/display';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';

vi.mock('@/lib/app/userVault', () => ({
  default: { setDir: vi.fn() }
}));
vi.useFakeTimers();

describe('Breadcrumbs', () => {
  const testPath = [ 'seg1', 'seg2', 'seg3' ];

  test('Displays path', () => {
    document.body.appendChild(<Breadcrumbs path={testPath} />);
    const buttons = document.querySelectorAll('#breadcrumbs button');
    const [ homeBtn, ...pathBtns ] = buttons;
    expect(homeBtn).toBeTruthy();
    pathBtns.forEach((btn, i) => expect(btn.textContent).toBe(testPath[i]));
  });

  test('Home button sets dir to root when navigation is enabled', () => {
    document.body.appendChild(<Breadcrumbs path={testPath} navigate />);
    const homeBtn = getElement<HTMLButtonElement>('#breadcrumbs button');
    homeBtn.click();
    expect(UserVault.setDir).toHaveBeenCalledOnce();
    expect(UserVault.setDir).toHaveBeenCalledWith([]);
  });

  test('Path button sets dir to correct path when navigation is enabled',
    () => {
      const pathIndex = 2;
      document.body.appendChild(<Breadcrumbs path={testPath} navigate />);
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        '#breadcrumbs button'
      );
      const pathButton = buttons[pathIndex];
      pathButton.click();
      expect(UserVault.setDir).toHaveBeenCalledOnce();
      const expectedPath = testPath.slice(0, pathIndex);
      expect(UserVault.setDir).toHaveBeenCalledWith(expectedPath);
    }
  );

  test('Ignore click when navigation disabled', () => {
    document.body.appendChild(<Breadcrumbs path={testPath} />);
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      '#breadcrumbs button'
    );
    const [ homeBtn, ...pathBtns ] = buttons;
    homeBtn.click();
    pathBtns[0].click();
    expect(UserVault.setDir).not.toHaveBeenCalled();
  });

  test('Scrolls horizontally on wheel', () => {
    const scrollAmount = 20;
    const element = <Breadcrumbs path={testPath} />;
    document.body.appendChild(element);
    const event = new WheelEvent('wheel', {
      deltaY: scrollAmount,
      cancelable: true
    });
    element.dispatchEvent(event);
    expect(element.scrollLeft).toBe(scrollAmount);
  });

  test('Scrolled all the way to the right on initial render', () => {
    const element = <Breadcrumbs path={testPath} />;
    document.body.appendChild(element);
    Object.defineProperty(element, 'scrollWidth', { value: 200 });
    Object.defineProperty(element, 'clientWidth', { value: 50 });
    vi.runAllTimers();
    expect(element.scrollLeft).toBe(element.scrollWidth);
  });
});
