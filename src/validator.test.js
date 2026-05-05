const { validateField, validateEnv, getFailures, isValid } = require('./validator');

describe('validateField', () => {
  test('nonempty passes for non-blank value', () => {
    expect(validateField('KEY', 'hello', 'nonempty').valid).toBe(true);
  });

  test('nonempty fails for empty string', () => {
    expect(validateField('KEY', '', 'nonempty').valid).toBe(false);
  });

  test('number passes for numeric string', () => {
    expect(validateField('PORT', '3000', 'number').valid).toBe(true);
  });

  test('number fails for non-numeric', () => {
    expect(validateField('PORT', 'abc', 'number').valid).toBe(false);
  });

  test('boolean passes for true/false variants', () => {
    expect(validateField('FLAG', 'yes', 'boolean').valid).toBe(true);
    expect(validateField('FLAG', '0', 'boolean').valid).toBe(true);
  });

  test('url passes for valid URL', () => {
    expect(validateField('API', 'https://example.com', 'url').valid).toBe(true);
  });

  test('url fails for invalid URL', () => {
    expect(validateField('API', 'not-a-url', 'url').valid).toBe(false);
  });

  test('email passes for valid email', () => {
    expect(validateField('MAIL', 'user@example.com', 'email').valid).toBe(true);
  });

  test('throws on unknown rule', () => {
    expect(() => validateField('K', 'v', 'unknown')).toThrow('Unknown validation rule');
  });
});

describe('validateEnv', () => {
  const envMap = { PORT: '8080', EMAIL: 'bad-email', FLAG: 'true' };
  const schema = { PORT: 'number', EMAIL: 'email', FLAG: 'boolean' };

  test('returns results for each key', () => {
    const results = validateEnv(envMap, schema);
    expect(results).toHaveLength(3);
  });

  test('supports multiple rules per key', () => {
    const results = validateEnv({ PORT: '8080' }, { PORT: ['number', 'nonempty'] });
    expect(results).toHaveLength(2);
  });

  test('missing key treated as empty string', () => {
    const results = validateEnv({}, { REQUIRED: 'nonempty' });
    expect(results[0].valid).toBe(false);
  });
});

describe('getFailures / isValid', () => {
  test('getFailures returns only invalid results', () => {
    const results = validateEnv({ PORT: 'abc', HOST: 'localhost' }, { PORT: 'number', HOST: 'nonempty' });
    expect(getFailures(results)).toHaveLength(1);
  });

  test('isValid returns true when all pass', () => {
    const results = validateEnv({ PORT: '3000' }, { PORT: 'number' });
    expect(isValid(results)).toBe(true);
  });

  test('isValid returns false when any fail', () => {
    const results = validateEnv({ PORT: 'bad' }, { PORT: 'number' });
    expect(isValid(results)).toBe(false);
  });
});
