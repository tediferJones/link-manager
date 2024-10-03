function bufferFrom(data: string, encoding: 'utf8' | 'base64'): Uint8Array {
  if (encoding === 'utf8') {
    const encoder = new TextEncoder();
    return encoder.encode(data); // Return Uint8Array for UTF-8 encoded string
  } else if (encoding === 'base64') {
    const decodedString = atob(data); // Decode Base64 string to binary string
    const bytes = new Uint8Array(decodedString.length);
    for (let i = 0; i < decodedString.length; i++) {
      bytes[i] = decodedString.charCodeAt(i); // Convert each character to byte
    }
    return bytes; // Return Uint8Array for Base64 decoded string
  } else {
    throw new Error('Unsupported encoding type. Use "utf8" or "base64".');
  }
}

function bufferTo(buffer: ArrayBuffer, encoding: 'utf8' | 'base64'): string {
  const bytes = new Uint8Array(buffer);

  if (encoding === 'utf8') {
    // Use TextDecoder for UTF-8 decoding
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  } else if (encoding === 'base64') {
    // Convert bytes to a binary string
    const binaryString = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('');
    // Encode the binary string to Base64
    return btoa(binaryString);
  } else {
    throw new Error('Unsupported encoding type. Use "utf8" or "base64".');
  }
}

export async function getFullKey(password: string, salt: string) {
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: bufferFrom(salt, 'base64'),
      iterations: 1000000,
      hash: 'SHA-256',
    },
    await crypto.subtle.importKey(
      'raw',
      bufferFrom(password, 'utf8'),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    ),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

export async function encrypt(plainText: string, fullKey: CryptoKey, iv: string) {
  return bufferTo(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: bufferFrom(iv, 'base64') },
      fullKey,
      bufferFrom(plainText, 'utf8'),
    ),
    'base64'
  )
}

export async function decrypt(cipherText: string, fullKey: CryptoKey, iv: string) {
  return bufferTo(
    await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: bufferFrom(iv, 'base64') },
      fullKey,
      bufferFrom(cipherText, 'base64')
    ),
    'utf8'
  )
}

export function getRandBase64(type: 'salt' | 'iv') {
  const length = {
    salt: 32,
    iv: 12,
  }[type]

  return bufferTo(
    crypto.getRandomValues(new Uint8Array(length)).buffer as ArrayBuffer,
    'base64'
  )
}

export function isBase64(strings: string[]) {
  return strings.every(str => {
    return str.match(/^[-A-Za-z0-9+/]*={0,3}$/)
  })
}
