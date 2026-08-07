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

При зміні домену його треба поправити в трьох місцях —
`src/components/ui/JsonLd.tsx`, `scripts/sitemap.mjs`, `public/robots.txt` — і
додати новий origin у CORS Sanity (`cd studio && npx sanity cors add …`).

## Styling

This project uses **Tailwind CSS v4** for styling. Use Tailwind utility classes directly in JSX. Tailwind is loaded via the Vite plugin — no PostCSS config needed.