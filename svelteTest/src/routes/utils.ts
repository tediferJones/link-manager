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

export function scale(domain, range) {
	const m = (range[1] - range[0]) / (domain[1] - domain[0]);
	return (value) => range[0] + m * (value - domain[0]);
}

export function getTicks(min, max) {
	const ticks = [];
	let n = 10 * Math.ceil(min / 10);

	while (n < max) {
		ticks.push(n);
		n += 10;
	}

	return ticks;
}
