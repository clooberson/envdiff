const { exportJson, exportCsv, exportMarkdown, exportReport } = require('./exporter');

const sampleReport = {
  DB_HOST: { status: 'ok', presentIn: ['dev', 'prod'] },
  API_KEY: { status: 'missing', presentIn: ['dev'] },
  SECRET: { status: 'missing', presentIn: ['prod'] },
};

describe('exportJson', () => {
  it('returns valid JSON string', () => {
    const result = exportJson(sampleReport);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('round-trips the report object', () => {
    const result = JSON.parse(exportJson(sampleReport));
    expect(result).toEqual(sampleReport);
  });
});

describe('exportCsv', () => {
  it('includes a header row', () => {
    const result = exportCsv(sampleReport);
    expect(result.startsWith('key,status,files')).toBe(true);
  });

  it('has one row per key plus header', () => {
    const lines = exportCsv(sampleReport).split('\n');
    expect(lines).toHaveLength(Object.keys(sampleReport).length + 1);
  });

  it('quotes keys that contain commas', () => {
    const report = { 'KEY,WITH,COMMA': { status: 'ok', presentIn: ['dev'] } };
    const result = exportCsv(report);
    expect(result).toContain('"KEY,WITH,COMMA"');
  });
});

describe('exportMarkdown', () => {
  it('includes markdown table header', () => {
    const result = exportMarkdown(sampleReport);
    expect(result).toContain('| Key | Status | Present In |');
  });

  it('contains each key as a row', () => {
    const result = exportMarkdown(sampleReport);
    expect(result).toContain('| DB_HOST |');
    expect(result).toContain('| API_KEY |');
    expect(result).toContain('| SECRET |');
  });
});

describe('exportReport', () => {
  it('dispatches to json', () => {
    const result = exportReport(sampleReport, 'json');
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('dispatches to csv', () => {
    expect(exportReport(sampleReport, 'csv')).toContain('key,status,files');
  });

  it('dispatches to markdown', () => {
    expect(exportReport(sampleReport, 'markdown')).toContain('|-----|');
  });

  it('throws on unknown format', () => {
    expect(() => exportReport(sampleReport, 'xml')).toThrow('Unsupported export format');
  });
});
