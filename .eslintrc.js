module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    es2022: true,
    worker: true,
    node: true,
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-inferrable-types': 'off',
    
    // 一般的なルール
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off', // TypeScriptルールを使用
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    
    // Prettier
    'prettier/prettier': 'error',
    
    // Import/Export
    'no-duplicate-imports': 'error',
    
    // エラーハンドリング
    'no-throw-literal': 'error',
    'prefer-promise-reject-errors': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '.wrangler/',
    '*.js',
  ],
};