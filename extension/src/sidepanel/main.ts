import App from '@/app';
import setTheme from '@/lib/setTheme';
import '@/style.css';

setTheme();
document.querySelector('#app')!.appendChild(App());
