import './style.css';
import HelloWorld from './tsxTest.tsx';

// document.querySelector('#app')!.innerHTML = `
//   <div class='bg-green-500'>This is the pop up</div>
// `
document.querySelector('#app')!.appendChild(HelloWorld());
