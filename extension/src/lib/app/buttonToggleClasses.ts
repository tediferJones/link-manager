// FIX ME replace these button classes with a Button component
// use 'disabled:opacity-50 disabled:cursor-not-allowed'
// instead of toggling these classes manually
// this way all we have to do is toggle button.disabled
// also delete default button classes from style.css
export const btnClassNames = {
  enabled: [ 'opacity-100' ],
  disabled: [ 'opacity-50', '!cursor-not-allowed' ],
  animate: [ 'transition-opacity', 'duration-300' ],
} as const

// FIX ME
// if we still end up defining a bunch a classes as arrays
// extend this function to take multiple keys
//  - concat all arrays together then join with spaces
export function inline(key: keyof typeof btnClassNames) {
  return btnClassNames[key].join(' ');
}
