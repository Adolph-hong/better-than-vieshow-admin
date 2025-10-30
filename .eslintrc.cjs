// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:prettier/recommended', // 讓 ESLint 跟 Prettier 共存
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
    // ✅ 加上這段讓 import 自動辨識 .ts / .tsx
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // --- prettier ---
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],

    // --- react 基礎 ---
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要 import React
    'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
    'react/prop-types': 'off',
    'react/button-has-type': 'off',

    // --- typescript & import ---
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',

    // --- 其他細項可選 ---
    'react/function-component-definition': 'off', // 允許箭頭函式元件
  },
}
