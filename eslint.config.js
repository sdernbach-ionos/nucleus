import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // jQuery
        jQuery: 'readonly',
        $: 'readonly',
        // Custom
        F: 'readonly',
        // Legacy module system (for older files)
        module: 'readonly',
        require: 'readonly',
        define: 'readonly',
      }
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    }
  }
];
