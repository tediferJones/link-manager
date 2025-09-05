export const btnClassNames = {
  enabled: [ 'opacity-100' ],
  disabled: [ 'opacity-50', '!cursor-not-allowed' ],
  animate: [ 'transition-opacity', 'duration-300' ],
} as const

export function inline(key: keyof typeof btnClassNames) {
  return btnClassNames[key].join(' ');
}
