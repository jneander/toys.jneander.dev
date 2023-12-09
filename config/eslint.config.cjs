module.exports = {
  env: {
    browser: true,
    es6: true,
  },

  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],

  globals: {},
  ignorePatterns: ['**/dist', '*.d.ts', 'TODO'],

  overrides: [
    {
      env: {
        node: true,
      },

      files: ['./config/**/*.*'],
    },
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  plugins: ['import', 'prettier', 'promise', 'simple-import-sort', 'unused-imports', 'jsx-a11y'],
  root: true,

  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    '@typescript-eslint/no-var-requires': 'off',
    'arrow-body-style': 'off',
    curly: 'error',
    'eslint-comments/disable-enable-pair': 'off',
    'eslint-comments/no-unlimited-disable': 'off',
    'eslint-comments/no-unused-disable': 'error',
    'import/extensions': ['error', 'ignorePackages', {js: 'never', ts: 'never', tsx: 'never'}],
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}],

    'lines-between-class-members': [
      'error',
      'always',
      {
        exceptAfterSingleLine: true,
      },
    ],

    'no-cond-assign': ['error', 'always'],
    'no-empty': ['error', {allowEmptyCatch: true}],
    'no-fallthrough': 'off',
    'no-sequences': ['error', {allowInParentheses: false}],
    'no-unused-vars': 'off',
    'object-shorthand': 'error',
    'one-var': ['error', 'never'],

    'padding-line-between-statements': [
      'error',
      {blankLine: 'always', prev: '*', next: 'continue'},
      {blankLine: 'always', prev: '*', next: 'return'},
      {blankLine: 'always', prev: '*', next: 'multiline-block-like'},
      {blankLine: 'always', prev: 'multiline-block-like', next: '*'},
      {blankLine: 'always', prev: 'multiline-expression', next: '*'},
      {blankLine: 'always', prev: '*', next: 'multiline-expression'},
      {blankLine: 'always', prev: 'multiline-const', next: '*'},
      {blankLine: 'always', prev: 'multiline-let', next: '*'},
      {blankLine: 'always', prev: 'multiline-var', next: '*'},
      {blankLine: 'always', prev: '*', next: 'function'},
      {blankLine: 'always', prev: 'function', next: '*'},
      {blankLine: 'always', prev: ['case', 'default'], next: '*'},
    ],

    'prefer-arrow-callback': 'off',
    'prettier/prettier': 'error',
    'promise/always-return': 'off',

    'simple-import-sort/imports': [
      'warn',

      {
        groups: [
          // Side effect imports.
          ['^\\u0000'],

          // Node.js builtins prefixed with `node:`.
          ['^node:'],

          // Packages.
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ['^@?\\w'],

          // Relative imports.
          // Anything that starts with a dot.
          ['^\\.'],

          // Docs files.
          ['\\.(md|mdx)$'],

          // Styles.
          ['\\.(scss|css)$'],

          // Assets.
          ['\\.svg$'],
        ],
      },
    ],

    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },

    'import/resolver': {
      typescript: {},
    },
  },
}
