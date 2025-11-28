import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: ['**/*.integration.test.ts', '**/node_modules/**', '**/dist/**', '**/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'e2e/',
        '**/*.test.ts',
        '**/*.integration.test.ts',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.config.mjs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@types': resolve(__dirname, './src/types')
    }
  }
});
