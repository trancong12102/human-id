# human-uuid

![NPM Version](https://img.shields.io/npm/v/human-uuid)

A small library to generate human-readable IDs based on UUID v7.

## Features

- **Human-readable format**: Generated IDs use a clear `prefix_encodedUUID` format (or just `encodedUUID` without prefix)
- **Optional prefix**: Generate IDs with or without a prefix for maximum flexibility
- **Time-based ordering**: Uses UUID v7 for chronological ordering of IDs
- **Compact encoding**: Base62 encoding produces shorter, URL-safe identifiers
- **High performance**: Can generate 1000+ IDs per second
- **TypeScript support**: Full TypeScript definitions included
- **Zero configuration**: Works out of the box with sensible defaults

## Installation

```bash
npm install human-uuid
```

```bash
yarn add human-uuid
```

```bash
pnpm add human-uuid
```

## Usage

### Basic Usage

```typescript
import { humanId } from 'human-uuid';

// Generate user IDs with prefix
const userId = humanId('user');
// Output: user_1BVXue8CnY6eSRFn2bDLFU

// Generate order IDs with prefix
const orderId = humanId('order');
// Output: order_1BVXue8D4K7gTRHp3eDMGV

// Generate API key IDs with prefix
const apiKeyId = humanId('api-key');
// Output: api-key_1BVXue8DfN8hUSIq4fENHW

// Generate IDs without prefix (no underscore)
const simpleId = humanId();
// Output: 1BVXue8CnY6eSRFn2bDLFU
```

### Different Prefix Examples

```typescript
// Various entity types
const productId = humanId('product'); // product_1BVXue8E2P9iVTJr5gFOIX
const sessionId = humanId('session'); // session_1BVXue8EaQ0jWUKs6hGPJY
const customerId = humanId('customer'); // customer_1BVXue8F1R1kXVLt7iHQKZ

// No prefix (no underscore)
const cleanId = humanId(); // 1BVXue8FcS2lYWMu8jIRLA

// Empty prefix (results in ID starting with underscore)
const underscoreId = humanId(''); // _1BVXue8FcS2lYWMu8jIRLA
```

### Working with Generated IDs

```typescript
// All IDs are unique, even with the same prefix
const id1 = humanId('user'); // user_1BVXue8G3T3mZXNv9kJSMB
const id2 = humanId('user'); // user_1BVXue8GdU4nAYOw0lKTNC
const id3 = humanId('user'); // user_1BVXue8H4V5oBZPx1mLUOD

console.log((id1 !== id2) !== id3); // true

// IDs without prefix are also unique
const noPrefix1 = humanId(); // 1BVXue8G3T3mZXNv9kJSMB
const noPrefix2 = humanId(); // 1BVXue8GdU4nAYOw0lKTNC

console.log(noPrefix1 !== noPrefix2); // true
```

### Time-based Ordering

Since human-uuid uses UUID v7, IDs generated later will be lexicographically greater than earlier ones:

```typescript
const firstId = humanId('task');
// Wait some time...
const secondId = humanId('task');

// The second ID will be lexicographically greater than the first
console.log(secondId > firstId); // true

// This also works for IDs without prefix
const firstNoPrefix = humanId();
// Wait some time...
const secondNoPrefix = humanId();

console.log(secondNoPrefix > firstNoPrefix); // true
```

## API Reference

### `humanId(prefix?: string): string`

Generates a unique human-readable ID.

**Parameters:**

- `prefix` (string, optional): The prefix to prepend to the generated ID. Can contain letters, numbers, and special characters. If not provided, no prefix or underscore will be used.

**Returns:**

- `string`: A unique ID in the format `{prefix}_{base62EncodedUUID}` if prefix is provided, or just `{base62EncodedUUID}` if no prefix is provided.

**Examples:**

```typescript
// With prefix
const id = humanId('user');
// Returns something like: "user_1BVXue8CnY6eSRFn2bDLFU"

// Without prefix
const id = humanId();
// Returns something like: "1BVXue8CnY6eSRFn2bDLFU"

// With empty string prefix (includes underscore)
const id = humanId('');
// Returns something like: "_1BVXue8CnY6eSRFn2bDLFU"
```

### ID Format

Generated IDs follow these patterns:

- **With prefix**: `{prefix}_{base62UUID}`
- **Without prefix**: `{base62UUID}`
- **Prefix**: Any string you provide (optional)
- **Separator**: Single underscore (`_`) - only present when prefix is provided
- **UUID Part**: Base62-encoded UUID v7 (contains only `0-9`, `a-z`, `A-Z`)

### Base62 Encoding

The library uses base62 encoding for the UUID portion, which:

- Uses characters: `0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`
- Produces shorter strings than hexadecimal UUIDs
- Is URL-safe (no special characters that need encoding)
- Maintains the time-ordering properties of UUID v7

## Development

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm/yarn

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd human-uuid
```

1. Install dependencies:

```bash
pnpm install
```

### Available Scripts

```bash
# Build the project
pnpm run build

# Type checking
pnpm run check-types

# Format code
pnpm run format

# Run tests
pnpm run test
```

### Project Structure

```text
human-uuid/
├── src/
│   ├── index.ts      # Main humanId function
│   └── base62.ts     # Base62 encoding utilities
├── test/
│   └── human-uuid.test.ts  # Comprehensive test suite
├── dist/             # Built JavaScript and type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Testing

The project includes comprehensive tests covering:

- **Basic functionality**: ID format and prefix inclusion
- **Uniqueness**: Ensuring all generated IDs are unique
- **UUID v7 properties**: Time-based ordering validation
- **Base62 encoding**: Encoding/decoding consistency
- **Edge cases**: Empty prefixes, special characters, long prefixes
- **Performance**: Benchmarking ID generation speed

Run the test suite:

```bash
pnpm run test
```

### Test Coverage

The test suite validates:

- ✅ Correct ID format with and without prefix
- ✅ Uniqueness across multiple generations
- ✅ Time-based chronological ordering
- ✅ Base62 encoding consistency
- ✅ Performance (1000+ IDs/second)
- ✅ Edge cases (no prefix, empty/special prefixes)

## Performance

human-uuid is designed for high performance:

- Can generate **1000+ unique IDs per second**
- Minimal memory footprint
- No external API calls or I/O operations
- Efficient base62 encoding implementation

## Use Cases

Perfect for generating:

- **User IDs**: `user_1BVXue8CnY6eSRFn2bDLFU`
- **Order IDs**: `order_1BVXue8D4K7gTRHp3eDMGV`
- **Product IDs**: `product_1BVXue8E2P9iVTJr5gFOIX`
- **Session IDs**: `session_1BVXue8EaQ0jWUKs6hGPJY`
- **API Keys**: `api-key_1BVXue8DfN8hUSIq4fENHW`
- **Transaction IDs**: `txn_1BVXue8F1R1kXVLt7iHQKZ`
- **Simple IDs**: `1BVXue8CnY6eSRFn2bDLFU` (without prefix)

## Dependencies

- [`uuid`](https://www.npmjs.com/package/uuid): For generating UUID v7
- [`base-x`](https://www.npmjs.com/package/base-x): For base62 encoding

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`pnpm run test`)
6. Format your code (`pnpm run format`)
7. Commit your changes (`git commit -m 'Add some amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Author

**Tran Cong** - [trancong12102@gmail.com](mailto:trancong12102@gmail.com)
