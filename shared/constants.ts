export const authHeaderPrefix = 'Bearer ';

const isProd = process.env.NODE_ENV === 'production';

export const apiUrl = (
  isProd
    ? 'https://api-production-61f1.up.railway.app/'
    : 'http://localhost:8000'
);
export const pwaUrl = (
  isProd
    ? 'https://linkman.theodrz.me/'
    : 'http://localhost:3000'
);
export const wssUrl = (
  isProd
    ? 'wss://wss-production-09fd.up.railway.app/'
    : 'ws://localhost:9000'
);
export const extUrl = (
  isProd
    ? ''
    : 'chrome-extension://gipjajgmccbbmhinpdcdabhcdeoohpkh'
);

console.log({ apiUrl, pwaUrl, wssUrl, extUrl })
