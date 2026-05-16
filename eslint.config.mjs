import js from '@eslint/js';

const ignores = { ignores: ['.vite/**', 'coverage/**', 'dist/**', 'node_modules/**'] };
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';

const sharedRules = {
  // ── Sorting ────────────────────────────────────────────────────────────
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      pathGroups: [
        { pattern: '@/**', group: 'internal' },
        { pattern: '**/*.css', group: 'index', position: 'after' },
      ],
      pathGroupsExcludedImportTypes: ['builtin'],
      alphabetize: { order: 'asc', caseInsensitive: true },
      'newlines-between': 'always',
    },
  ],
  'sort-imports': ['error', { ignoreDeclarationSort: true }],

  // ── Style / formatting ─────────────────────────────────────────────────
  curly: ['error', 'all'],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],

  // ── Catching bugs / dead code ──────────────────────────────────────────
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  'no-unused-expressions': 'error',
  'no-unreachable': 'error',
  'no-template-curly-in-string': 'error',
  'no-self-compare': 'error',
  'no-self-assign': 'error',
  'getter-return': 'error',
  'use-isnan': 'error',
  'valid-typeof': ['error', { requireStringLiterals: true }],
  'array-callback-return': 'error',
  eqeqeq: ['error', 'always'],

  // ── Import hygiene ─────────────────────────────────────────────────────
  'import/no-duplicates': 'error',
  'import/first': 'error',

  // ── Dangerous patterns ─────────────────────────────────────────────────
  'no-eval': 'error',
  'no-implied-eval': 'error',
  'no-new-func': 'error',
  'no-extend-native': 'error',
  'no-loop-func': 'error',
  'no-caller': 'error',
  'no-restricted-globals': [
    'error',
    { name: 'event', message: 'Use the local event parameter instead.' },
    { name: 'name', message: 'Use a local variable instead of the implicit global.' },
    { name: 'status', message: 'Use a local variable instead of window.status.' },
    { name: 'isNaN', message: 'Use Number.isNaN() instead.' },
    { name: 'isFinite', message: 'Use Number.isFinite() instead.' },
  ],

  // ── Useless code ───────────────────────────────────────────────────────
  'no-useless-concat': 'error',
  'no-useless-constructor': 'error',
  'no-useless-escape': 'error',
  'no-useless-rename': 'error',
};

export default [
  ignores,
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        __APP_VERSION__: 'readonly',
      },
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: sharedRules,
  },
  {
    files: ['**/*.vue'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        __APP_VERSION__: 'readonly',
      },
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: sharedRules,
  },
  prettierConfig,
];
