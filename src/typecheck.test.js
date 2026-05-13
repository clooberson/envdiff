const { checkType, typecheckEnv, isTypesValid, formatTypeFailures } = require('./typecheck');

describe('checkType', () => {
  test('valid int passes', () => expect(checkType('PORT', '3000', 'int')).toBeNull());
  test('invalid int fails', () => expect(checkType('PORT', 'abc', 'int')).toMatch(/not a valid int/));
  test('negative int passes', () => expect(checkType('OFFSET', '-5', 'int')).toBeNull());

  test('valid float passes', () => expect(checkType('RATIO', '3.14', 'float')).toBeNull());
  test('invalid float fails', () => expect(checkType('RATIO', '3.1.4', 'float')).toMatch(/not a valid float/));

  test('valid bool true passes', () => expect(checkType('FLAG', 'true', 'bool')).toBeNull());
  test('valid bool yes passes', () => expect(checkType('FLAG', 'yes', 'bool')).toBeNull());
  test('invalid bool fails', () => expect(checkType('FLAG', 'maybe', 'bool')).toMatch(/not a valid bool/));

  test('valid url passes', () => expect(checkType('API_URL', 'https://example.com', 'url')).toBeNull());
  test('invalid url fails', () => expect(checkType('API_URL', 'ftp://x', 'url')).toMatch(/not a valid url/));

  test('valid email passes', () => expect(checkType('EMAIL', 'user@example.com', 'email')).toBeNull());
  test('invalid email fails', () => expect(checkType('EMAIL', 'notanemail', 'email')).toMatch(/not a valid email/));

  test('valid port passes', () => expect(checkType('PORT', '8080', 'port')).toBeNull());
  test('port out of range fails', () => expect(checkType('PORT', '99999', 'port')).toMatch(/out of range/));
  test('port zero fails', () => expect(checkType('PORT', '0', 'port')).toMatch(/out of range/));

  test('empty value skipped', () => expect(checkType('KEY', '', 'int')).toBeNull());
  test('unknown type returns error', () => expect(checkType('K', 'v', 'hex')).toMatch(/unknown type/));
});

describe('typecheckEnv', () => {
  const schema = { PORT: 'port', DEBUG: 'bool', API_URL: 'url' };

  test('all valid returns empty array', () => {
    const env = { PORT: '3000', DEBUG: 'true', API_URL: 'https://api.example.com' };
    expect(typecheckEnv(env, schema)).toHaveLength(0);
  });

  test('collects multiple failures', () => {
    const env = { PORT: 'bad', DEBUG: 'maybe', API_URL: 'https://ok.com' };
    const failures = typecheckEnv(env, schema);
    expect(failures).toHaveLength(2);
    expect(failures.map(f => f.key)).toEqual(expect.arrayContaining(['PORT', 'DEBUG']));
  });

  test('missing key in env is skipped', () => {
    const env = { PORT: '80' };
    expect(typecheckEnv(env, schema)).toHaveLength(0);
  });
});

describe('isTypesValid', () => {
  test('returns true when all pass', () => {
    expect(isTypesValid({ PORT: '443' }, { PORT: 'port' })).toBe(true);
  });
  test('returns false when any fail', () => {
    expect(isTypesValid({ PORT: 'nope' }, { PORT: 'port' })).toBe(false);
  });
});

describe('formatTypeFailures', () => {
  test('no failures message', () => {
    expect(formatTypeFailures([])).toBe('All type checks passed.');
  });
  test('formats failures with count', () => {
    const failures = [{ key: 'PORT', value: 'x', type: 'port', error: 'PORT="x" is not a valid port' }];
    const out = formatTypeFailures(failures);
    expect(out).toMatch(/Type check failures \(1\)/);
    expect(out).toMatch(/\[port\]/);
  });
});
