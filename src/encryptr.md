# encryptr

AES-256-GCM encryption and decryption for sensitive `.env` values.

## Functions

### `encryptValue(value, passphrase) → string`
Encrypts a single string value using AES-256-GCM. The output is prefixed with `enc:` and base64-encoded. Each call produces a unique ciphertext due to a random salt and IV.

### `decryptValue(encoded, passphrase) → string`
Decrypts an `enc:`-prefixed value. Throws if the prefix is missing or if authentication fails (wrong passphrase or tampered data).

### `isEncrypted(value) → boolean`
Returns `true` if the value starts with the `enc:` prefix.

### `encryptEnv(env, passphrase, keys?) → object`
Encrypts values in an env object. If `keys` is provided, only those keys are encrypted. Already-encrypted values are skipped.

### `decryptEnv(env, passphrase) → object`
Decrypts all `enc:`-prefixed values in an env object. Plain values are passed through unchanged.

## Security notes

- Key derivation uses PBKDF2-SHA256 with 100,000 iterations and a random 16-byte salt.
- Each encryption call generates a fresh IV, so identical plaintexts produce different ciphertexts.
- GCM authentication tags prevent silent tampering; decryption will throw on any mismatch.

## Example

```js
const { encryptEnv, decryptEnv } = require('./encryptr');

const plain = { DB_PASSWORD: 'hunter2', APP_NAME: 'myapp' };
const encrypted = encryptEnv(plain, 'mypassphrase', ['DB_PASSWORD']);
// { DB_PASSWORD: 'enc:...', APP_NAME: 'myapp' }

const restored = decryptEnv(encrypted, 'mypassphrase');
// { DB_PASSWORD: 'hunter2', APP_NAME: 'myapp' }
```
