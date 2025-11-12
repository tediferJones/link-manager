import { Encodings } from '@/app/types';

function getBuffer(data: string, encoding: Encodings) {
  if (encoding === 'utf8') {
    const encoder = new TextEncoder();
    return encoder.encode(data);
  } else if (encoding === 'base64') {
    const decodedString = atob(data);
    const bytes = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
      bytes[i] = decodedString.charCodeAt(i);
    }
    return bytes;
  } else {
    throw Error(`encoding "${encoding}" is not supported`);
  }
}

function getString(buffer: ArrayBuffer, encoding: Encodings) {
  const bytes = new Uint8Array(buffer);
  if (encoding === 'utf8') {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } else if (encoding === 'base64') {
    const binaryString = Array.from(bytes).map(
      byte => String.fromCharCode(byte)
    ).join('');
    return btoa(binaryString);
  } else {
    throw Error(`encoding "${encoding}" is not supported`);
  }
}

export async function getKey(password: string, salt: string) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: getBuffer(salt, 'base64'),
      // FIX ME
      // crank up the iterations
      // maybe change to SHA-512
      // also just do more research on encryption in general
      //  - do salt and iv need to be changed after every encryption
      //  - do we need to be sure that salt and/or iv does not match any other encrypted folder's salt/iv?
      iterations: 10,
      hash: 'SHA-256',
    },
    await crypto.subtle.importKey(
      'raw',
      getBuffer(password, 'utf8'),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    ),
    { name: 'AES-GCM', length: 256 },
    true,
    [ 'encrypt', 'decrypt' ],
  );
}

export async function encrypt(plainText: string, key: CryptoKey, iv: string) {
  return getString(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: getBuffer(iv, 'base64') },
      key,
      getBuffer(plainText, 'utf8'),
    ),
    'base64',
  );
}

export async function decrypt(cipherText: string, key: CryptoKey, iv: string) {
  return getString(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: getBuffer(iv, 'base64') },
      key,
      getBuffer(cipherText, 'base64'),
    ),
    'utf8',
  );
}

export function getRandomBase64(type: 'salt' | 'iv') {
  const length = {
    salt: 32,
    iv: 12,
  }[type];

  return getString(
    crypto.getRandomValues(new Uint8Array(length)).buffer,
    'base64',
  );
}
