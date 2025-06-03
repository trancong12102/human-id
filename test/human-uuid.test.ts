import assert from 'node:assert';
import { describe, it } from 'node:test';
import { v7 as uuidV7, validate, version } from 'uuid';
import { base62 } from '../src/base62.ts';
import { humanUUID } from '../src/index.ts';

describe('humanUUID', () => {
  describe('basic functionality', () => {
    it('should generate an ID with the correct format when prefix is provided', () => {
      const id = humanUUID('user');
      assert.match(id, /^user_[0-9a-zA-Z]+$/);
    });

    it('should generate an ID without underscore when no prefix is provided', () => {
      const id = humanUUID();
      assert.match(id, /^[0-9a-zA-Z]+$/);
      assert.ok(!id.includes('_'));
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
        assert.match(id, new RegExp(`^${prefix}_[0-9a-zA-Z]+$`));
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

    it('should generate unique IDs without prefix', () => {
      const ids = new Set();
      const numTests = 100;

      for (let i = 0; i < numTests; i++) {
        const id = humanUUID();
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

      // Extract the base62 parts and decode them back to UUIDs
      const uuidParts = ids.map((id) => {
        const base62Part = id.split('_')[1];
        const buffer = base62.decode(base62Part);
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

    it('should use UUID v7 internally (time-based ordering) without prefix', async () => {
      const ids: string[] = [];

      // Generate multiple IDs with small delays
      for (let i = 0; i < 5; i++) {
        ids.push(humanUUID());
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Extract the base62 parts and decode them back to UUIDs
      const uuidParts = ids.map((id) => {
        const buffer = base62.decode(id);
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

      // Extract base62 parts
      const base62Part1 = id1.split('_')[1];
      const base62Part2 = id2.split('_')[1];

      // Decode to get the raw UUID bytes
      const buffer1 = Buffer.from(base62.decode(base62Part1));
      const buffer2 = Buffer.from(base62.decode(base62Part2));

      // For UUID v7, the first 6 bytes represent the timestamp
      // The first ID should have a smaller or equal timestamp
      const timestamp1 = buffer1.subarray(0, 6);
      const timestamp2 = buffer2.subarray(0, 6);

      assert.ok(Buffer.compare(timestamp1, timestamp2) <= 0);
    });

    it('should generate IDs that maintain chronological order without prefix', async () => {
      const id1 = humanUUID();

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      const id2 = humanUUID();

      // Decode to get the raw UUID bytes
      const buffer1 = Buffer.from(base62.decode(id1));
      const buffer2 = Buffer.from(base62.decode(id2));

      // For UUID v7, the first 6 bytes represent the timestamp
      // The first ID should have a smaller or equal timestamp
      const timestamp1 = buffer1.subarray(0, 6);
      const timestamp2 = buffer2.subarray(0, 6);

      assert.ok(Buffer.compare(timestamp1, timestamp2) <= 0);
    });
  });

  describe('base62 encoding', () => {
    it('should use base62 encoding for the UUID part with prefix', () => {
      const id = humanUUID('test');
      const base62Part = id.split('_')[1];

      // Base62 should only contain alphanumeric characters
      assert.match(base62Part, /^[0-9a-zA-Z]+$/);

      // Should be able to decode it back
      assert.doesNotThrow(() => base62.decode(base62Part));
    });

    it('should use base62 encoding for the UUID part without prefix', () => {
      const id = humanUUID();

      // Base62 should only contain alphanumeric characters
      assert.match(id, /^[0-9a-zA-Z]+$/);

      // Should be able to decode it back
      assert.doesNotThrow(() => base62.decode(id));
    });

    it('should produce consistent encoding/decoding', () => {
      // Test with a known UUID
      const testUuid = uuidV7();
      const buffer = Buffer.from(testUuid);
      const encoded = base62.encode(buffer);
      const decoded = base62.decode(encoded);

      assert.equal(
        Buffer.from(decoded).toString('hex'),
        buffer.toString('hex'),
      );
    });
  });

  describe('edge cases', () => {
    it('should handle undefined prefix (no prefix provided)', () => {
      const id = humanUUID();
      assert.match(id, /^[0-9a-zA-Z]+$/);
      assert.ok(!id.includes('_'));
    });

    it('should handle empty string prefix', () => {
      const id = humanUUID('');
      assert.match(id, /^_[0-9a-zA-Z]+$/);
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

    it('should generate IDs quickly without prefix', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        humanUUID();
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
        assert.match(id, /^integration_[0-9a-zA-Z]+$/);
      });

      // All should be unique
      const uniqueResults = new Set(results);
      assert.strictEqual(uniqueResults.size, results.length);
    });

    it('should work consistently across multiple calls without prefix', () => {
      const results = Array.from({ length: 50 }, () => humanUUID());

      // All should have correct format
      results.forEach((id) => {
        assert.match(id, /^[0-9a-zA-Z]+$/);
        assert.ok(!id.includes('_'));
      });

      // All should be unique
      const uniqueResults = new Set(results);
      assert.strictEqual(uniqueResults.size, results.length);
    });
  });
});
