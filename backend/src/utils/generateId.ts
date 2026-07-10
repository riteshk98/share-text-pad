import { randomBytes } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export const generateId = (length = 4): string => {
  const bytes = randomBytes(length * 2);
  let id = '';

  for (const byte of bytes) {
    id += ALPHABET[byte % ALPHABET.length];
    if (id.length >= length) {
      break;
    }
  }

  return id;
};
