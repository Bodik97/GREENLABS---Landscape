# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **always running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Key Files

- `src/App.tsx` - Main application component
- `src/main.tsx` - React entry point
- `src/index.css` - Global styles and Tailwind CSS import
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration
- `.mise.toml` - Toolchain versions (Node.js, pnpm)

## Викочування

Сайт живе на Vercel (проєкт `greenlabs`, бойова адреса
`https://greenlabs-one.vercel.app`), викочується з гілки `main`. Налаштування —
у `vercel.json`.

Команда збірки там довша за звичайну через пререндер. Образ збірки Vercel не
має системних бібліотек, потрібних Chrome: без `dnf install` браузер падає з
`libnspr4.so: cannot open shared object file`, а `scripts/prerender.mjs` це
переживає мовчки — білд зелений, але сторінки віддаються порожніми. Крок
`puppeteer browsers install chrome` теж обовʼязковий: Vercel кешує
`node_modules` між збірками, тож postinstall самого puppeteer виконується лише
першого разу.

Ознака, що все ціле, — рядок `prerender: 57 з 57 сторінок` у логах збірки.
Швидка перевірка ззовні: `curl -s https://greenlabs-one.vercel.app/services`
має віддати десятки кілобайт, а не порожній `<div id="root">`.

При зміні домену його треба поправити в пʼяти місцях:

- `src/components/ui/JsonLd.tsx`
- `scripts/sitemap.mjs`
- `public/robots.txt`
- `.figma/make/site.json` — і `openGraph.image`, і адреса всередині JSON-LD у
  `customScripts.headEnd`. Цей файл легко проґавити: він не в `src`, а вміст
  `headEnd` лежить одним рядком-текстом, тож пошук по коду його не показує.
- `worker/wrangler.toml`, змінна `ALLOWED_ORIGINS` — Worker відсіює запити з
  чужих доменів, тож без цього форма мовчки перестане приймати заявки.

Плюс додати новий origin у CORS Sanity (`cd studio && npx sanity cors add …`).

## Секрети

Репозиторій публічний. Усе, що потрапило в коміт і поїхало на GitHub, вважайте
скомпрометованим — форки, клони й кеш GitHub бачать історію навіть після
`git rm` чи перезапису історії. Тому спершу ротація, і тільки потім прибирання.

Перед комітом працює `.githooks/pre-commit`: проганяє gitleaks по застейдженому
й не пускає коміт, якщо знайшов секрет. На новій машині вмикається один раз:

```bash
brew install gitleaks
git config core.hooksPath .githooks
```

Правила — у `.gitleaks.toml`. Типовий набір gitleaks доповнено двома: токен
Telegram-бота і адреса `/exec` Apps Script (перевірено на 8.30 — обох у наборі
немає, а це два найцінніші секрети проєкту). Разова перевірка всієї історії:
`gitleaks git --redact`.

Хибне спрацювання знімається коментарем `gitleaks:allow` у тому ж рядку.

Де що лежить: секрети приймача заявок — у Cloudflare (`wrangler secret`),
`SHEET_SECRET` дублюється у Властивостях скрипта Apps Script,
`VITE_LEAD_ENDPOINT` — у змінних Vercel. Ротація описана в `worker/README.md`.
`projectId` Sanity публічний за задумом, це не секрет.

## Styling

This project uses **Tailwind CSS v4** for styling. Use Tailwind utility classes directly in JSX. Tailwind is loaded via the Vite plugin — no PostCSS config needed.