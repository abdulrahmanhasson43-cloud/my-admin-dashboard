# Language layer (Arabic · English)

- `ar.ts` — Arabic copy, Egyptian spoken register. **It defines the key set.**
- `en.ts` — English copy, typed `Record<MessageKey, string>`: a missing line fails `pnpm typecheck`.
- `index.tsx` — `t(key, params)`, `<I18nProvider>`, `useI18n()`, `pick()`, `localized()`, `contentDir()`.
- `domain.ts` — localised view of `shared/domain.ts` (grades, stages, payment methods, `egp()`, `shortDate()`).
- `errors.ts` — `errorText(error)`: turns any API/network failure into a readable line in the active language.

## Add a string
1. Add `"area.name": "النص"` to `ar.ts`, and the English line to `en.ts`.
2. Use `t("area.name")`. Placeholders: `{n}`; English plurals: `{n} {n:lesson|lessons}`.
3. Module-level data (arrays outside components) must hold **keys**, and call `t(key)` at render time.

## Add a server error message
Add the exact server text to `KNOWN` in `errors.ts` and a `srv.*` key in both files.

`pnpm test` checks key parity, matching placeholders, no Arabic in English, and error mapping.
Switching language remounts the tree under `<I18nProvider>`, so `t()` needs no hook.
Owner-editable text can have a `<key>_en` twin (see `localized()`); course titles/descriptions come from the database and are not translated automatically.
