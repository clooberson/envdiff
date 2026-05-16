// encryptr.js — encrypt/decrypt sensitive env values using a passphrase

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;
const TAG_LEN = 16;
const ITERATIONS = 100_000;
const DIGEST = 'sha256';
const PREFIX = 'enc:';

function deriveKey(passphrase, salt) {
  return crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LEN, DIGEST);
}

function encryptValue(value, passphrase) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(IV_LEN);
  const key = deriveKey(passphrase, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([salt, iv, tag, encrypted]);
  return PREFIX + payload.toString('base64');
}

function decryptValue(encoded, passphrase) {
  if (!encoded.startsWith(PREFIX)) throw new Error('Not an encrypted value');
  const payload = Buffer.from(encoded.slice(PREFIX.length), 'base64');
  const salt = payload.slice(0, SALT_LEN);
  const iv = payload.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = payload.slice(SALT_LEN + IV_LEN, SALT_LEN + IV_LEN + TAG_LEN);
  const encrypted = payload.slice(SALT_LEN + IV_LEN + TAG_LEN);
  const key = deriveKey(passphrase, salt);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

function isEncrypted(value) {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

function encryptEnv(env, passphrase, keys = null) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    const shouldEncrypt = keys ? keys.includes(k) : true;
    result[k] = shouldEncrypt && !isEncrypted(v) ? encryptValue(v, passphrase) : v;
  }
  return result;
}

function decryptEnv(env, passphrase) {
  const result = {};
  for (const [k, v] of Object.entries(env)) {
    result[k] = isEncrypted(v) ? decryptValue(v, passphrase) : v;
  }
  return result;
}

module.exports = { encryptValue, decryptValue, isEncrypted, encryptEnv, decryptEnv };
