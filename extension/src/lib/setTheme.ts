export default function setTheme() {
  const systemTheme = (
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light'
  );

  const savedTheme = localStorage.getItem('theme');
  if (!savedTheme) {
    document.documentElement.className = systemTheme;
  } else {
    document.documentElement.className = savedTheme;
  }

  localStorage.setItem('theme', document.documentElement.className);
}
