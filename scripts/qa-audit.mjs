/**
 * Структурний огляд усіх пререндерених сторінок.
 *
 * Запускати після `pnpm build`: `node scripts/qa-audit.mjs`
 *
 * Навіщо окремо від `pnpm test`: тести стережуть контракт коду й мають бути
 * швидкими, а тут потрібен браузер і готовий dist. Цей огляд дивиться на те,
 * що справді приїде людині, — розмітку кожної сторінки цілком.
 *
 * Нічого не ламає й нічого не виправляє: друкує список і виходить з нулем.
 * Це підказка людині, а не воротар збірки — інакше дрібниця на одній сторінці
 * зупиняла б викочування всього сайту.
 */
import { readFileSync } from 'node:fs'
import { glob } from 'node:fs/promises'
import { createServer } from 'node:http'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import puppeteer from 'puppeteer'

const сторінки = []
for await (const шлях of glob('dist/**/index.html')) сторінки.push(шлях)
сторінки.sort()

if (!сторінки.length) {
  console.error('qa-audit: немає dist — спершу pnpm build')
  process.exit(1)
}

/**
 * Сторінки відкриваються з сервера, а не через setContent.
 *
 * Різниця принципова: так React справді запускається, і видно те, що бачить
 * людина після гідратації. Саме на цьому попався подвійний JSON-LD — у html
 * лежав один блок, а після запуску React їх ставало два.
 */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
}
const оболонка = readFileSync('dist/index.html', 'utf8')
const server = createServer(async (req, res) => {
  const шлях = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  try {
    const тіло = readFileSync(join('dist', шлях))
    res.writeHead(200, { 'Content-Type': MIME[extname(шлях)] ?? 'application/octet-stream' })
    res.end(тіло)
  } catch {
    res.writeHead(200, { 'Content-Type': MIME['.html'] })
    res.end(оболонка)
  }
})
await new Promise((r) => server.listen(0, r))
const origin = `http://localhost:${server.address().port}`

// --disable-web-security з тієї ж причини, що й у пререндері: сторінки
// відкриваються з localhost, а в CORS Sanity дозволено лише бойовий домен.
// Без цього дані не приїжджають, сторінка лишається на заглушці — і огляд
// звітує про порожні заголовки там, де насправді все гаразд.
// Профіль свій на кожен запуск: зі сталим шляхом другий огляд падав із
// «browser is already running», а він цілком може йти паралельно зі збіркою.
const профіль = await mkdtemp(join(tmpdir(), 'greenlabs-qa-'))
const browser = await puppeteer.launch({
  args: ['--no-sandbox', '--disable-web-security', `--user-data-dir=${профіль}`],
})
const page = await browser.newPage()

/** Знахідки по всіх сторінках: текст проблеми → на яких адресах трапилась. */
const знахідки = new Map()
const додати = (проблема, адреса) => {
  if (!знахідки.has(проблема)) знахідки.set(проблема, new Set())
  знахідки.get(проблема).add(адреса)
}

for (const шлях of сторінки) {
  const адреса = '/' + шлях.replace(/^dist\/?/, '').replace(/index\.html$/, '')
  await page.goto(origin + адреса, { waitUntil: 'networkidle2' })

  const звіт = await page.evaluate(() => {
    const out = { проблеми: [] }

    const h = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((e) => +e.tagName[1])
    const h1 = document.querySelectorAll('h1').length
    if (h1 !== 1) out.проблеми.push(`заголовків h1: ${h1}, а має бути рівно один`)
    for (let i = 1; i < h.length; i++) {
      if (h[i] - h[i - 1] > 1) out.проблеми.push(`розрив у рівнях заголовків: h${h[i - 1]} одразу на h${h[i]}`)
    }

    for (const img of document.querySelectorAll('img')) {
      if (!img.hasAttribute('alt')) out.проблеми.push(`картинка без alt: ${img.getAttribute('src')}`)
      // Без розмірів браузер не резервує місце — сторінка стрибає при завантаженні.
      if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
        out.проблеми.push(`картинка без width/height: ${(img.getAttribute('src') || '').split('/').pop()?.slice(0, 30)}`)
      }
    }

    for (const f of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      if (f.getAttribute('aria-hidden') === 'true') continue
      const підписано =
        (f.id && document.querySelector(`label[for="${f.id}"]`)) || f.closest('label') || f.getAttribute('aria-label')
      if (!підписано) out.проблеми.push(`поле без підпису: ${f.tagName.toLowerCase()}${f.name ? `[${f.name}]` : ''}`)
    }

    const ids = [...document.querySelectorAll('[id]')].map((e) => e.id)
    for (const d of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) out.проблеми.push(`повторений id: ${d}`)

    for (const a of document.querySelectorAll('a[href="#"]')) {
      out.проблеми.push(`посилання в нікуди: «${a.textContent.trim().slice(0, 30) || a.getAttribute('aria-label') || '—'}»`)
    }

    // Назву посилання може давати і текст, і alt картинки всередині, і aria-label.
    for (const a of document.querySelectorAll('a')) {
      const назва = a.textContent.trim() || a.getAttribute('aria-label') || a.querySelector('img')?.alt
      if (!назва) out.проблеми.push(`посилання без назви: ${a.getAttribute('href')}`)
    }

    for (const b of document.querySelectorAll('button')) {
      if (!b.textContent.trim() && !b.getAttribute('aria-label')) out.проблеми.push('кнопка без назви')
    }

    /* Пререндер кладе розмітку в html, React може додати її ще раз — і краулер,
       який виконує JavaScript, порахує все двічі. */
    const схеми = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try {
        const d = JSON.parse(s.textContent)
        return `${d['@type']}|${s.textContent.length}`
      } catch {
        return 'непридатний до розбору'
      }
    })
    for (const дубль of new Set(схеми.filter((x, i) => схеми.indexOf(x) !== i))) {
      out.проблеми.push(`розмітка задвоєна: ${дубль.split('|')[0]}`)
    }
    if (схеми.includes('непридатний до розбору')) out.проблеми.push('JSON-LD не розбирається')

    if (!document.documentElement.lang) out.проблеми.push('немає lang у <html>')
    if (!document.querySelector('title')?.textContent.trim()) out.проблеми.push('порожній <title>')
    if (!document.querySelector('meta[name="description"]')?.content) out.проблеми.push('немає опису сторінки')

    return out
  })

  for (const п of new Set(звіт.проблеми)) додати(п, адреса)
}

await browser.close()
server.close()

console.log(`qa-audit: переглянуто ${сторінки.length} сторінок\n`)
if (!знахідки.size) {
  console.log('Зауважень немає.')
} else {
  const впорядковано = [...знахідки].sort((a, b) => b[1].size - a[1].size)
  for (const [проблема, адреси] of впорядковано) {
    const де = адреси.size > 3 ? `${адреси.size} сторінок` : [...адреси].join(', ')
    console.log(`• ${проблема}\n  ↳ ${де}`)
  }
  console.log(`\nУсього різних зауважень: ${знахідки.size}`)
}
