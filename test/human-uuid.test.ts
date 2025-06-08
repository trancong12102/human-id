import assert from 'node:assert';
import { describe, it } from 'node:test';
import { base58 } from '@scure/base';
import { v7 as uuidV7, validate, version } from 'uuid';
import { humanUUID } from '../src/index.ts';

// TypeScript type tests - these will cause compilation errors if types are wrong
type TestUserType = ReturnType<typeof humanUUID<'user'>>;
type ExpectedUserType = `user_${string}`;
// This line will cause a TypeScript error if the types don't match
const _userTypeTest: TestUserType = '' as ExpectedUserType;
const _userTypeTest2: ExpectedUserType = '' as TestUserType;

type TestOrderType = ReturnType<typeof humanUUID<'order'>>;
type ExpectedOrderType = `order_${string}`;
const _orderTypeTest: TestOrderType = '' as ExpectedOrderType;
const _orderTypeTest2: ExpectedOrderType = '' as TestOrderType;

describe('humanUUID', () => {
  describe('TypeScript types', () => {
    it('should return correct TypeScript type for generic prefix', () => {
      const userID = humanUUID('user');
      const orderID = humanUUID('order');
      const apiKeyID = humanUUID('api-key');

      // These assertions verify runtime behavior
      assert.ok(userID.startsWith('user_'));
      assert.ok(orderID.startsWith('order_'));
      assert.ok(apiKeyID.startsWith('api-key_'));

      // TypeScript should infer these as the correct template literal types
      // userID should be of type `user_${string}`
      // orderID should be of type `order_${string}`
      // apiKeyID should be of type `api-key_${string}`

      // Test that the type system recognizes the prefix correctly
      const userPrefix: 'user' = userID.split('_')[0] as 'user';
      const orderPrefix: 'order' = orderID.split('_')[0] as 'order';
      const apiKeyPrefix: 'api-key' = apiKeyID.split('_')[0] as 'api-key';

      assert.strictEqual(userPrefix, 'user');
      assert.strictEqual(orderPrefix, 'order');
      assert.strictEqual(apiKeyPrefix, 'api-key');
    });

    it('should maintain type safety with const assertions', () => {
      // Test with const assertions to ensure literal types are preserved
      const PREFIX = 'user' as const;
      const id = humanUUID(PREFIX);

      // This should be typed as `user_${string}`
      assert.ok(id.startsWith('user_'));

      // Type should be narrowed to the specific template literal
      const prefix: 'user' = id.split('_')[0] as 'user';
      assert.strictEqual(prefix, 'user');
    });

    it('should work with union types', () => {
      type ValidPrefix = 'user' | 'order' | 'product';

      const generateID = (prefix: ValidPrefix) => {
        return humanUUID(prefix);
      };

      const userID = generateID('user');
      const orderID = generateID('order');
      const productID = generateID('product');

      // Runtime checks
      assert.ok(userID.startsWith('user_'));
      assert.ok(orderID.startsWith('order_'));
      assert.ok(productID.startsWith('product_'));

      // Type should be `user_${string} | order_${string} | product_${string}`
      // but each specific call should narrow to the correct type
    });
  });

  describe('basic functionality', () => {
    it('should generate an ID with the correct format when prefix is provided', () => {
      const id = humanUUID('user');
      assert.match(
        id,
        /^user_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/,
      );
    });

    it('should include the prefix in the generated ID when provided', () => {
      const prefix = 'test';
      const id = humanUUID(prefix);
      assert.ok(id.startsWith(`${prefix}_`));
    });

    it('should work with different prefixes', () => {
      const prefixes = ['user', 'order', 'product', 'session', 'api-key'];

      prefixes.forEach((prefix) => {
        const id = humanUUID(prefix);
        assert.ok(id.startsWith(`${prefix}_`));
        assert.match(
          id,
          new RegExp(
            `^${prefix}_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$`,
          ),
        );
      });
    });
  });

  describe('uniqueness', () => {
    it('should generate unique IDs for the same prefix', () => {
      const ids = new Set();
      const numTests = 100;

      for (let i = 0; i < numTests; i++) {
        const id = humanUUID('test');
        assert.ok(!ids.has(id), 'ID should be unique');
        ids.add(id);
      }

      assert.strictEqual(ids.size, numTests);
    });

    it('should generate different IDs when called multiple times', () => {
      const id1 = humanUUID('user');
      const id2 = humanUUID('user');
      const id3 = humanUUID('user');

      assert.notStrictEqual(id1, id2);
      assert.notStrictEqual(id2, id3);
      assert.notStrictEqual(id1, id3);
    });
  });

  describe('UUID v7 properties', () => {
    it('should use UUID v7 internally (time-based ordering) with prefix', async () => {
      const ids: string[] = [];

      // Generate multiple IDs with small delays
      for (let i = 0; i < 5; i++) {
        ids.push(humanUUID('test'));
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Extract the base58 parts and decode them back to UUIDs
      const uuidParts = ids.map((id) => {
        const base58Part = id.split('_')[1];
        const buffer = base58.decode(base58Part);
        const uuidStr = Buffer.from(buffer).toString();
        return uuidStr;
      });

      // Verify they are valid UUID v7s (version 7)
      uuidParts.forEach((uuid) => {
        assert.equal(
          validate(uuid) && version(uuid) === 7,
          true,
          `Invalid UUID: ${uuid}`,
        );
      });
    });

    it('should generate IDs that maintain chronological order with prefix', async () => {
      const id1 = humanUUID('test');

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      const id2 = humanUUID('test');

      // Extract base58 parts
      const base58Part1 = id1.split('_')[1];
      const base58Part2 = id2.split('_')[1];

      // Decode to get the raw UUID bytes
      const buffer1 = Buffer.from(base58.decode(base58Part1));
      const buffer2 = Buffer.from(base58.decode(base58Part2));

      // For UUID v7, the first 6 bytes represent the timestamp
      // The first ID should have a smaller or equal timestamp
      const timestamp1 = buffer1.subarray(0, 6);
      const timestamp2 = buffer2.subarray(0, 6);

      assert.ok(Buffer.compare(timestamp1, timestamp2) <= 0);
    });
  });

  describe('base58 encoding', () => {
    it('should use base58 encoding for the UUID part with prefix', () => {
      const id = humanUUID('test');
      const base58Part = id.split('_')[1];

      // Base58 should only contain alphanumeric characters (excluding 0, O, I, l)
      assert.match(
        base58Part,
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/,
      );

      // Should be able to decode it back
      assert.doesNotThrow(() => base58.decode(base58Part));
    });

    it('should produce consistent encoding/decoding', () => {
      // Test with a known UUID
      const testUuid = uuidV7();
      const buffer = Buffer.from(testUuid);
      const encoded = base58.encode(buffer);
      const decoded = base58.decode(encoded);

      assert.equal(
        Buffer.from(decoded).toString('hex'),
        buffer.toString('hex'),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty string prefix', () => {
      const id = humanUUID('');
      assert.match(
        id,
        /^_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/,
      );
    });

    it('should handle prefixes with special characters', () => {
      const specialPrefixes = ['user-123', 'api_key', 'test.env', 'my@prefix'];

      specialPrefixes.forEach((prefix) => {
        const id = humanUUID(prefix);
        assert.ok(id.startsWith(`${prefix}_`));
        assert.ok(id.split('_').length >= 2);
      });
    });

    it('should handle long prefixes', () => {
      const longPrefix = 'a'.repeat(100);
      const id = humanUUID(longPrefix);
      assert.ok(id.startsWith(`${longPrefix}_`));
    });

    it('should handle numeric prefixes', () => {
      const numericPrefix = '12345';
      const id = humanUUID(numericPrefix);
      assert.ok(id.startsWith(`${numericPrefix}_`));
    });
  });

  describe('performance', () => {
    it('should generate IDs quickly with prefix', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        humanUUID('perf-test');
      }

      const duration = performance.now() - start;

      // Should be able to generate 1000 IDs in under 100ms
      assert.ok(duration < 100, `Expected duration < 100ms, got ${duration}ms`);
    });
  });

  describe('integration', () => {
    it('should work consistently across multiple calls with prefix', () => {
      const results = Array.from({ length: 50 }, () =>
        humanUUID('integration'),
      );

      // All should have correct format
      results.forEach((id) => {
        assert.match(
          id,
          /^integration_[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/,
        );
      });

      // All should be unique
      const uniqueResults = new Set(results);
      assert.strictEqual(uniqueResults.size, results.length);
    });
  });
});
