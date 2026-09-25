import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // The content index is the one handle on content. Raw content is exported for tests to spread and
    // edit, and must not become a second handle in application code.
    files: ['**/*.{ts,tsx}'],
    ignores: ['src/data/index.ts', 'src/test/**', '**/*.test.{ts,tsx}', 'e2e/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          regex: '^(\\.{1,2}/)+(src/)?data(/index(\\.ts)?)?$',
          importNames: ['content'],
          message: 'Reach content through `contentIndex`; raw `content` is exported only for tests.',
        }],
      }],
    },
  },
])
