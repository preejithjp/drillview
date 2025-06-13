import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default tseslint.config(

  {
    ignores: ['node_modules', 'dist', 'src', 'vite.config.mts'],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strict,
      eslintConfigPrettier,
      eslintPluginPrettier,
    ],
    files: ['**/*.{js,ts}'],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
        },
      ],
    }
  }
);
