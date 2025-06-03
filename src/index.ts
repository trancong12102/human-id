import { v7 } from 'uuid';
import { base62 } from './base62.ts';

/**
 * Generate a human-readable ID using a prefix and a UUID v7.
 * @param prefix The prefix to use for the ID.
 * @returns A unique human-readable ID in the format "prefix_base62UUID".
 */
export const humanId = (prefix: string): string =>
  `${prefix}_${base62.encode(Buffer.from(v7()))}`;
