# human-uuid

![NPM Version](https://img.shields.io/npm/v/human-uuid)

Generate human-readable IDs with a prefix using UUID v7 and base58 encoding.

## Installation

```bash
npm install human-uuid
# or
yarn add human-uuid
# or
pnpm add human-uuid
```

## Usage

```typescript
import { humanUUID } from 'human-uuid';

// Generate IDs with different prefixes
const userId = humanUUID('user'); // user_NE1Qs3yWoiD1Rb6CnLD1YLf12EHHQMboRU2CsmeztzdaCTv9K
const orderId = humanUUID('order'); // order_NE1Qs3yWoiD1Rb6CnhMiJqxGunkvx68Qu4YwzjUasDs4UqBn7
const apiKeyId = humanUUID('api-key'); // api-key_NE1Qs3yWoiD1Rb6CnhMiJqxGunkvx68Qu4jrtJBtPhBdDZP6y

// IDs are time-ordered (later IDs > earlier IDs)
const firstId = humanUUID('task');
const secondId = humanUUID('task');
console.log(secondId > firstId); // true
```

## API

Generates a unique ID in the format `{prefix}_{base58UUID}`.

- **prefix**: Required string prefix for the ID
- **Returns**: TypeScript-typed ID string with the prefix

## Features

- **Time-ordered**: Uses UUID v7 for chronological sorting
- **Compact**: Base58 encoding for shorter, URL-safe IDs
- **Type-safe**: Full TypeScript support with prefix typing
- **Fast**: 1000+ IDs per second generation

## Dependencies

- [`uuid`](https://www.npmjs.com/package/uuid) - UUID v7 generation
- [`@scure/base`](https://www.npmjs.com/package/@scure/base) - Base58 encoding

## License

MIT - **Tran Cong** <trancong12102@gmail.com>
