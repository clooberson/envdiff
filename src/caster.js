// caster.js — cast env string values to typed JS values

/**
 * Attempt to cast a string value to boolean, number, or null.
 * Returns the original string if no cast applies.
 */
function castValue(value) {
  if (value === '' || value === undefined || value === null) return value;
  const lower = value.trim().toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (lower === 'null') return null;
  if (lower === 'undefined') return undefined;
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;
  return value;
}

/**
 * Cast all values in an env object.
 * Returns a new object with typed values.
 */
function castEnv(env) {
  const result = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = castValue(value);
  }
  return result;
}

/**
 * Return a map of key -> { original, casted, changed } for keys whose type changed.
 */
function castDiff(env) {
  const diff = {};
  for (const [key, value] of Object.entries(env)) {
    const casted = castValue(value);
    if (casted !== value) {
      diff[key] = { original: value, casted, changed: true };
    }
  }
  return diff;
}

/**
 * Build a summary of how many values were cast per type.
 */
function buildCastSummary(env) {
  const summary = { boolean: 0, number: 0, null: 0, undefined: 0, unchanged: 0 };
  for (const value of Object.values(env)) {
    const casted = castValue(value);
    if (typeof casted === 'boolean') summary.boolean++;
    else if (typeof casted === 'number') summary.number++;
    else if (casted === null) summary.null++;
    else if (casted === undefined) summary.undefined++;
    else summary.unchanged++;
  }
  return summary;
}

module.exports = { castValue, castEnv, castDiff, buildCastSummary };
