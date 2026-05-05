const { formatReport } = require('./reporter');

const cleanDiff = { missingInB: [], missingInA: [], mismatched: [], matching: ['KEY'] };
const dirtyDiff = {
  missingInB: ['SECRET'],
  missingInA: ['API_KEY'],
  mismatched: [{ key: 'DB_HOST', valueA: 'localhost', valueB: 'prod.db' }],
  matching: [],
};

describe('formatReport', () => {
  test('reports clean diff with success message', () => {
    const output = formatReport(cleanDiff, { color: false });
    expect(output).toContain('No differences found');
  });

  test('reports missing keys in B', () => {
    const output = formatReport(dirtyDiff, { color: false, labelB: 'prod' });
    expect(output).toContain('Missing in prod');
    expect(output).toContain('SECRET');
  });

  test('reports missing keys in A', () => {
    const output = formatReport(dirtyDiff, { color: false, labelA: 'local' });
    expect(output).toContain('Missing in local');
    expect(output).toContain('API_KEY');
  });

  test('reports mismatched values with both sides', () => {
    const output = formatReport(dirtyDiff, { color: false, labelA: 'local', labelB: 'prod' });
    expect(output).toContain('DB_HOST');
    expect(output).toContain('localhost');
    expect(output).toContain('prod.db');
  });

  test('reports total issue count', () => {
    const output = formatReport(dirtyDiff, { color: false });
    expect(output).toContain('3 issue(s) found');
  });

  test('does not include ANSI codes when color is false', () => {
    const output = formatReport(dirtyDiff, { color: false });
    expect(output).not.toContain('\x1b[');
  });

  test('includes ANSI codes when color is true', () => {
    const output = formatReport(dirtyDiff, { color: true });
    expect(output).toContain('\x1b[');
  });
});
