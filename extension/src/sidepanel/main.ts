import App from '@/app';
import setTheme from '@/lib/setTheme';
import { enableHotKeys } from '@/lib/hotkeys';
import '@/style.css';

setTheme();
enableHotKeys();
document.querySelector('#app')!.appendChild(App());
