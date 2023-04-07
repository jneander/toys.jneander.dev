module.exports = {
  env: {
    browser: true,
    es6: true
  },

  extends: [
    'eslint:recommended',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:react/recommended'
  ],

  globals: {},
  ignorePatterns: ['**/dist'],

  overrides: [
    {
      env: {
        node: true
      },

      files: ['./config/**/*.js']
    }
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },

    ecmaVersion: 2018,
    sourceType: 'module'
  },

  plugins: [
    'import',
    'prettier',
    'promise',
    'simple-import-sort',
    'jsx-a11y',
    'react',
    'react-hooks'
  ],

  root: true,

  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
    '@typescript-eslint/no-var-requires': 'off',
    'arrow-body-style': 'off',
    'eslint-comments/no-unused-disable': 'error',
    'import/extensions': [
      'error',
      'ignorePackages',
      {js: 'never', ts: 'never', tsx: 'never'}
    ],
    'import/no-extraneous-dependencies': ['error', {devDependencies: true}],
    'no-empty': ['error', {allowEmptyCatch: true}],
    'no-unused-vars': 'off',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'off',
    'prettier/prettier': 'error',
    'promise/always-return': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-filename-extension': ['error', {extensions: ['.ts', '.tsx']}],
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',

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
          ['\\.svg$']
        ]
      }
    ],

    'simple-import-sort/exports': 'error'
  },

  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },

    'import/resolver': {
      typescript: {}
    },

    react: {
      version: 'detect'
    }
  }
}
