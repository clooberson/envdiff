const { auditEmptyValues, auditSensitiveDefaults, auditKeyFormat, auditEnv, buildAuditSummary } = require('./auditor');

describe('auditEmptyValues', () => {
  test('flags empty string values', () => {
    const issues = auditEmptyValues({ FOO: '', BAR: 'ok' });
    expect(issues).toHaveLength(1);
    expect(issues[0].key).toBe('FOO');
    expect(issues[0].code).toBe('EMPTY_VALUE');
    expect(issues[0].severity).toBe('warn');
  });

  test('returns empty array when all values present', () => {
    expect(auditEmptyValues({ A: '1', B: '2' })).toHaveLength(0);
  });
});

describe('auditSensitiveDefaults', () => {
  test('flags weak secret values', () => {
    const issues = auditSensitiveDefaults({ SECRET_KEY: 'secret', API_KEY: 'realkey123' });
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe('WEAK_SECRET');
    expect(issues[0].severity).toBe('error');
  });

  test('case-insensitive weak value check', () => {
    const issues = auditSensitiveDefaults({ DB_PASSWORD: 'PASSWORD' });
    expect(issues).toHaveLength(1);
  });

  test('ignores non-sensitive keys', () => {
    const issues = auditSensitiveDefaults({ APP_NAME: 'test' });
    expect(issues).toHaveLength(0);
  });
});

describe('auditKeyFormat', () => {
  test('flags keys with bad format', () => {
    const issues = auditKeyFormat({ 'bad-key': 'val', GOOD_KEY: 'val' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].code).toBe('BAD_KEY_FORMAT');
  });
});

describe('auditEnv', () => {
  test('aggregates all issue types', () => {
    const env = { SECRET: 'changeme', EMPTY: '', 'bad-key': 'x', NORMAL: 'value' };
    const issues = auditEnv(env);
    const codes = issues.map(i => i.code);
    expect(codes).toContain('WEAK_SECRET');
    expect(codes).toContain('EMPTY_VALUE');
  });

  test('sorts by severity descending', () => {
    const env = { SECRET: 'secret', EMPTY: '' };
    const issues = auditEnv(env);
    expect(issues[0].severity).toBe('error');
  });
});

describe('buildAuditSummary', () => {
  test('counts by severity', () => {
    const issues = [
      { severity: 'error' }, { severity: 'warn' }, { severity: 'warn' }, { severity: 'info' }
    ];
    const summary = buildAuditSummary(issues);
    expect(summary.counts.error).toBe(1);
    expect(summary.counts.warn).toBe(2);
    expect(summary.counts.info).toBe(1);
    expect(summary.total).toBe(4);
    expect(summary.clean).toBe(false);
  });

  test('marks clean when no issues', () => {
    expect(buildAuditSummary([]).clean).toBe(true);
  });
});
