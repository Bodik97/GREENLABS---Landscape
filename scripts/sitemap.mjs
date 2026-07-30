// Збирає dist/sitemap.xml після білду. Адреси робіт і статей тягне з Sanity —
// якщо CMS недоступна, лишаються тільки статичні сторінки, білд не падає.
import { writeFile } from 'node:fs/promises'

const ORIGIN = 'https://bodik97.github.io'
const BASE = (process.env.FIGMA_PUBLIC_URL ?? '').replace(/\/$/, '')
const SITE = ORIGIN + BASE

const STATIC = ['/', '/services', '/private', '/commercial', '/about']

const QUERY = `{
  "works": *[_type == "project" && hidden != true && defined(slug.current)].slug.current,
  "posts": *[_type == "post" && hidden != true && defined(slug.current)].slug.current
}`

async function fetchSlugs() {
  const url = `https://v6s9ym4d.apicdn.sanity.io/v2026-07-29/data/query/production?query=${encodeURIComponent(QUERY)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity відповіла ${res.status}`)
  const { result } = await res.json()
  return [
    ...result.works.map((s) => `/works/${s}`),
    ...result.posts.map((s) => `/blog/${s}`),
  ]
}

let dynamic = []
try {
  dynamic = await fetchSlugs()
} catch (err) {
  console.warn(`sitemap: не вдалось отримати адреси з Sanity (${err.message}) — лишаю статичні сторінки`)
}

const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...STATIC, ...dynamic]
  .map((path) => `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n')}
</urlset>
`

await writeFile('dist/sitemap.xml', xml)
console.log(`sitemap: ${STATIC.length + dynamic.length} адрес`)
