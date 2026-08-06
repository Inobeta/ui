// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

const asWarnings = (...configs) => Object.fromEntries(
  configs
    .flat()
    .flatMap((config) => Object.entries(config.rules ?? {}))
    .map(([name, value]) => [
      name,
      value === 'off' || value === 0
        ? 'off'
        : Array.isArray(value) ? ['warn', ...value.slice(1)] : 'warn',
    ]),
);

module.exports = defineConfig([
  {
    ignores: ['coverage/**', 'src/coverage/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: asWarnings(
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ),
  },
  {
    files: ['**/*.html'],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: asWarnings(
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ),
  },
]);
