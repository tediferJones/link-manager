export const authHeaderPrefix = 'Bearer ';

export const isProd = process.env.NODE_ENV === 'production';

export const apiUrl = (
  isProd
    ? 'https://api.linkman.theodrz.me'
    : 'http://localhost:8000'
);
export const pwaUrl = (
  isProd
    ? 'https://linkman.theodrz.me'
    : 'http://localhost:3000'
);
export const wssUrl = (
  isProd
    ? 'wss://wss.linkman.theodrz.me'
    : 'ws://localhost:9000'
);
export const extUrl = (
  isProd
    ? ''
    : 'chrome-extension://gipjajgmccbbmhinpdcdabhcdeoohpkh'
);

console.log({ apiUrl, pwaUrl, wssUrl, extUrl })
