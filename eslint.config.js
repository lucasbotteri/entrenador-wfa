import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  { ignores: ['dist', 'src/shared/content/generated', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, import: importPlugin, 'unused-imports': unusedImports },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'unused-imports/no-unused-imports': 'error',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
    },
  },
  {
    // Pure shared layers must not depend on feature modules. The composition
    // root (src/shared/app) is exempt — it wires modules into the router.
    files: [
      'src/shared/content/**/*.{ts,tsx}',
      'src/shared/domain/**/*.{ts,tsx}',
      'src/shared/ui/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/modules/*', '@/modules/**'], message: 'shared/{content,domain,ui} must not import from modules/' },
          ],
        },
      ],
    },
  },
)
