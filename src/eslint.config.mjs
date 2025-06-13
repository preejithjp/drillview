import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import * as vueParser from 'vue-eslint-parser';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default typescriptEslint.config(
  {
    ignores: ['*.d.ts', '**/coverage', '**/dist', '**/server/'],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
      eslintConfigPrettier,
      eslintPluginPrettier,
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parser: vueParser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-fallthrough': 'error',
      'vue/first-attribute-linebreak': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      'vue/require-prop-types': 'error',
      'vue/no-template-shadow': 'error',
      'vue/order-in-components': 'error',
      'vue/component-api-style': ['error', ['options']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: true }],
      'vue/match-component-file-name': ['error', { extensions: ['vue'], shouldMatchCase: false }],
      'vue/match-component-import-name': 'error',
      'vue/no-multiple-objects-in-class': 'error',
      'vue/no-unused-emit-declarations': 'error',
      'vue/no-unused-properties': 'error',
      'vue/no-unused-refs': 'error',
      'vue/require-typed-object-prop': 'error',
      // 'vue/max-attributes-per-line': ['error', { singleline: 3, multiline: 3 }],
      'prettier/prettier': [
        'error',
        {},
        {
          usePrettierrc: true,
        },
      ],
    },
  },
);
