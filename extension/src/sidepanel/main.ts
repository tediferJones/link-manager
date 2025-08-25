import { setupCounter } from './counter.ts'
import './style.css'

// to get tailwind styles working
// sidepanel/styles.css should match popup/styles.css
// or we could extract styles.css to a shared file
document.querySelector('#app')!.innerHTML = `
  <div class='bg-red-500'>This is the side panel</div>
`

setupCounter(document.querySelector('#counter')!)
