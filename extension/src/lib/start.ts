import '@/style.css';
import App from '@/app';
import setTheme from '@/lib/setTheme';
import { enableHotKeys } from '@/lib/hotkeys';
import { SizeTypes } from '@/types';

export default function start(type: SizeTypes) {
  setTheme();
  enableHotKeys();
  document.querySelector('#app')!.appendChild(App({ type }));
}
