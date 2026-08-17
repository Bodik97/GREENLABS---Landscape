// Збирає dist/sitemap.xml після білду. Адреси робіт і статей тягне з Sanity —
// якщо CMS недоступна, збірка падає.
import { writeFile } from 'node:fs/promises'

const ORIGIN = 'https://greenlabs-one.vercel.app'
const BASE = (process.env.FIGMA_PUBLIC_URL ?? '').replace(/\/$/, '')
const SITE = ORIGIN + BASE

const STATIC = ['/', '/services', '/works', '/blog', '/private', '/commercial', '/about', '/robota', '/privacy']

const QUERY = `{
  "works": *[_type == "project" && hidden != true && defined(slug.current)].slug.current,
  "posts": *[_type == "post" && hidden != true && defined(slug.current)].slug.current,
  "services": *[_type == "service" && hidden != true && defined(slug.current)].slug.current,
  "serviceItems": *[_type == "serviceItem" && hidden != true && ownPage == true && defined(slug.current)]{
    "path": parent->slug.current + "/" + slug.current
  }.path
}`

async function fetchSlugs() {
  // api, а не apicdn: CDN віддає кеш, і сторінки, додані щойно перед білдом,
  // не потрапляли б ні в sitemap, ні в пререндер.
  const url = `https://v6s9ym4d.api.sanity.io/v2026-07-29/data/query/production?query=${encodeURIComponent(QUERY)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity відповіла ${res.status}`)
  const { result } = await res.json()
  return [
    ...result.works.map((s) => `/works/${s}`),
    ...result.posts.map((s) => `/blog/${s}`),
    ...result.services.map((s) => `/services/${s}`),
    ...result.serviceItems.map((s) => `/services/${s}`),
  ]
}

let dynamic
try {
  dynamic = await fetchSlugs()
} catch (err) {
  // Раніше тут лишались самі статичні сторінки, і збірка йшла далі зеленою:
  // sitemap на 8 адрес замість 57, а решта — ще й без пререндеру, бо він бере
  // адреси звідси. Тобто сайт мовчки втрачав для пошуку майже все, що має.
  console.error(`sitemap: не вдалось отримати адреси з Sanity — ${err.message}`)
  process.exit(1)
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
