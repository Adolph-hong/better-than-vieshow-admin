// .eslintrc.cjs
module.exports = {
    root: true,
    env: { browser: true, es2021: true, node: true },
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
    },
    plugins: ['react', '@typescript-eslint', 'prettier'],
    settings: {
        react: { version: 'detect' },
    },
    rules: {
        'prettier/prettier': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'react/prop-types': 'off',
        'react/button-has-type': 'off',
        'no-shadow': 'off',
    },
};
