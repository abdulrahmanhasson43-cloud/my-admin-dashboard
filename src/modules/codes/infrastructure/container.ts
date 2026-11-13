import { LocalStorageCodeRepository } from './localStorageRepository';

export const codeRepository = new LocalStorageCodeRepository();

/** SHA-256 عبر Web Crypto. (في الإنتاج يتم هذا على الخادم مع «ملح» سرّي.) */
export const sha256Hex = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
};

export const randomBytes = (n: number): Uint8Array => crypto.getRandomValues(new Uint8Array(n));
