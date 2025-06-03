import { v7 } from 'uuid';
import { base62 } from './base62.ts';

/**
 * Generate a human-readable ID using an optional prefix and a UUID v7.
 * @param prefix The optional prefix to use for the ID. If not provided, no prefix or underscore will be used.
 * @returns A unique human-readable ID in the format "prefix_base62UUID" or just "base62UUID" if no prefix is provided.
 */
export const humanId = (prefix?: string): string => {
  const encodedId = base62.encode(Buffer.from(v7()));
  return typeof prefix !== 'undefined' ? `${prefix}_${encodedId}` : encodedId;
};
