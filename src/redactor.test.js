const { isSensitiveKey, redactEnv, redactDiff, MASK } = require('./redactor');

describe('isSensitiveKey', () => {
  test('matches password variants', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  test('matches token and secret', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
  });

  test('matches api key variants', () => {
    expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true);
    expect(isSensitiveKey('APIKEY')).toBe(true);
  });

  test('does not match safe keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });

  test('uses custom patterns when provided', () => {
    expect(isSensitiveKey('MY_CUSTOM', [/custom/i])).toBe(true);
    expect(isSensitiveKey('PASSWORD', [/custom/i])).toBe(false);
  });
});

describe('redactEnv', () => {
  const env = {
    PORT: '3000',
    DB_PASSWORD: 'supersecret',
    ACCESS_TOKEN: 'abc123',
    APP_NAME: 'envdiff',
  };

  test('masks sensitive values', () => {
    const result = redactEnv(env);
    expect(result.DB_PASSWORD).toBe(MASK);
    expect(result.ACCESS_TOKEN).toBe(MASK);
  });

  test('preserves non-sensitive values', () => {
    const result = redactEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.APP_NAME).toBe('envdiff');
  });

  test('returns a new object, does not mutate', () => {
    const result = redactEnv(env);
    expect(result).not.toBe(env);
    expect(env.DB_PASSWORD).toBe('supersecret');
  });
});

describe('redactDiff', () => {
  const entries = [
    { key: 'PORT', status: 'match', values: { '.env': '3000', '.env.prod': '3000' } },
    { key: 'DB_PASSWORD', status: 'mismatch', values: { '.env': 'devpass', '.env.prod': 'prodpass' } },
    { key: 'APP_NAME', status: 'missing', values: { '.env': 'envdiff', '.env.prod': undefined } },
  ];

  test('redacts sensitive diff entries', () => {
    const result = redactDiff(entries);
    expect(result[1].values['.env']).toBe(MASK);
    expect(result[1].values['.env.prod']).toBe(MASK);
    expect(result[1].redacted).toBe(true);
  });

  test('leaves non-sensitive entries unchanged', () => {
    const result = redactDiff(entries);
    expect(result[0].values['.env']).toBe('3000');
    expect(result[0].redacted).toBeUndefined();
    expect(result[2].values['.env']).toBe('envdiff');
  });

  test('does not mutate original entries', () => {
    redactDiff(entries);
    expect(entries[1].values['.env']).toBe('devpass');
  });
});
