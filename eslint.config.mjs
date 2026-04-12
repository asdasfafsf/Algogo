import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'eslint.config.mjs'],
  },

  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Prettier (must come after other configs to override conflicting rules)
  eslintConfigPrettier,
  eslintPluginPrettier,

  // Project-specific config
  {
    files: ['{src,apps,libs,test}/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unsafe-function-type': 'error',
    },
  },
);
