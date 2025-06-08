import { base58 } from '@scure/base';
import { v7 } from 'uuid';

/**
 * Generate a human-readable ID using a prefix and a UUID v7.
 * @param prefix The prefix to use for the ID.
 * @returns A unique human-readable ID in the format "prefix_base58UUID".
 */
export const humanUUID = <Prefix extends string>(
  prefix: Prefix,
): HumanUUID<Prefix> => {
  const encodedId = base58.encode(Buffer.from(v7()));
  return `${prefix}_${encodedId}`;
};

/**
 * Type representing a human-readable UUID with a specific prefix.
 * @template Prefix The prefix to use for the ID.
 * @example
 * // Example usage:
 * type MyHumanUUID = HumanUUID<'user'>; // 'user_<base58UUID>'
 */
export type HumanUUID<Prefix extends string> = `${Prefix}_${string}`;
