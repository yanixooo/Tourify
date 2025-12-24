import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-namespace': 'off', // Allow for Express Request extension
      '@typescript-eslint/no-empty-object-type': 'off', // Allow empty interfaces extending base
      
      // General rules - relaxed for backend logging
      'no-console': 'off', // Backend apps use console for logging
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**', 'dev-data/**', '*.js'],
  }
);
