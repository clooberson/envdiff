const { encryptValue, decryptValue, isEncrypted, encryptEnv, decryptEnv } = require('./encryptr');

const PASS = 'supersecret123';

describe('isEncrypted', () => {
  test('returns true for enc: prefix', () => {
    expect(isEncrypted('enc:abc123')).toBe(true);
  });
  test('returns false for plain value', () => {
    expect(isEncrypted('plaintext')).toBe(false);
  });
  test('returns false for non-string', () => {
    expect(isEncrypted(null)).toBe(false);
  });
});

describe('encryptValue / decryptValue', () => {
  test('round-trips a value', () => {
    const enc = encryptValue('hello', PASS);
    expect(isEncrypted(enc)).toBe(true);
    expect(decryptValue(enc, PASS)).toBe('hello');
  });

  test('produces different ciphertext each call', () => {
    const a = encryptValue('same', PASS);
    const b = encryptValue('same', PASS);
    expect(a).not.toBe(b);
  });

  test('throws on wrong passphrase', () => {
    const enc = encryptValue('secret', PASS);
    expect(() => decryptValue(enc, 'wrongpass')).toThrow();
  });

  test('throws when value lacks enc: prefix', () => {
    expect(() => decryptValue('notencrypted', PASS)).toThrow('Not an encrypted value');
  });
});

describe('encryptEnv', () => {
  const env = { DB_PASS: 'hunter2', APP_NAME: 'myapp' };

  test('encrypts all keys by default', () => {
    const result = encryptEnv(env, PASS);
    expect(isEncrypted(result.DB_PASS)).toBe(true);
    expect(isEncrypted(result.APP_NAME)).toBe(true);
  });

  test('encrypts only specified keys', () => {
    const result = encryptEnv(env, PASS, ['DB_PASS']);
    expect(isEncrypted(result.DB_PASS)).toBe(true);
    expect(result.APP_NAME).toBe('myapp');
  });

  test('does not double-encrypt already encrypted values', () => {
    const pre = encryptEnv(env, PASS);
    const again = encryptEnv(pre, PASS);
    expect(decryptEnv(again, PASS).DB_PASS).toBe('hunter2');
  });
});

describe('decryptEnv', () => {
  test('decrypts all encrypted values', () => {
    const enc = encryptEnv({ A: 'foo', B: 'bar' }, PASS);
    const dec = decryptEnv(enc, PASS);
    expect(dec).toEqual({ A: 'foo', B: 'bar' });
  });

  test('leaves plain values untouched', () => {
    const mixed = { X: 'plain', Y: encryptValue('secret', PASS) };
    const dec = decryptEnv(mixed, PASS);
    expect(dec.X).toBe('plain');
    expect(dec.Y).toBe('secret');
  });
});
