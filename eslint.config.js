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
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  /**
   * ────────────────────────────────────────────────────────────────────────
   *  حاجز المعمارية النظيفة — Clean Architecture guardrail
   * ────────────────────────────────────────────────────────────────────────
   *  قاعدة الـ Dependency Rule (Clean Architecture, ch. 22) تنص على أن
   *  اعتماديات الشيفرة تشير للداخل: الواجهة (pages/components/context/hooks)
   *  يجب ألا تعرف شيئًا عن تفاصيل مصدر البيانات (services/mock).
   *
   *  هذه القاعدة تمنع أي ملف في طبقة الواجهة من الاستيراد المباشر من
   *  `@/services/mock` أو أي مسار فرعي منه. الوصول للبيانات يجب أن يمر
   *  حصرًا عبر طبقة الخدمات النظيفة (services/<entity>) وعبر الـ hooks.
   *
   *  الاستثناءات الوحيدة المسموح لها بلمس mock هي:
   *    - src/services/**            (طبقة الخدمات نفسها = الـ Adapter)
   *    - ملفات التكوين/الاختبار
   * ────────────────────────────────────────────────────────────────────────
   */
  {
    files: ['src/pages/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/context/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/services/mock', '@/services/mock/*', '**/services/mock', '**/services/mock/*'],
              message:
                'ممنوع الاستيراد المباشر من طبقة البيانات الوهمية (services/mock). استخدم طبقة الخدمات النظيفة بدلًا منها: services/<entity> عبر الـ hook المناسب (مثال: useClients / useSuppliers / useCategories). راجع docs/ARCHITECTURE.md — قاعدة الاعتمادية (Dependency Rule).',
            },
          ],
        },
      ],
    },
  },
])
