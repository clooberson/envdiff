# Validator Module

The `validator` module checks `.env` values against optional type/format rules defined in a schema.

## Usage

```js
const { validateEnv, getFailures, isValid } = require('./validator');

const envMap = { PORT: '3000', API_URL: 'https://api.example.com', DEBUG: 'true' };

const schema = {
  PORT: 'number',
  API_URL: ['url', 'nonempty'],
  DEBUG: 'boolean',
};

const results = validateEnv(envMap, schema);
console.log(isValid(results));     // true
console.log(getFailures(results)); // []
```

## Available Rules

| Rule          | Description                                      |
|---------------|--------------------------------------------------|
| `nonempty`    | Value must not be an empty string                |
| `number`      | Value must be parseable as a number              |
| `boolean`     | Value must be `true/false/1/0/yes/no`            |
| `url`         | Value must be a valid URL                        |
| `email`       | Value must match a basic email pattern           |
| `alphanumeric`| Value must contain only `[a-zA-Z0-9_-]`         |

## Schema Format

A schema is a plain object mapping key names to a rule name or array of rule names:

```js
{
  KEY: 'ruleName',
  OTHER_KEY: ['rule1', 'rule2'],
}
```

## Integration with Config

You can define a `validate` section in `.envdiffrc`:

```json
{
  "validate": {
    "PORT": "number",
    "API_URL": ["url", "nonempty"]
  }
}
```

The CLI will automatically run validation when a schema is present.
