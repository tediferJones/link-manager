export async function roll() {
  return new Promise((fulfil, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new Error('Request failed'));
        return;
      }

      fulfil(Math.floor(Math.random() * 6) + 1);
    }, 1000);
  });
}
