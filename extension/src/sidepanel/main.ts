import App from '@/app';
import setTheme from '@/lib/setTheme';
import '@/style.css';

document.querySelector('#app')!.appendChild(App());
setTheme();
