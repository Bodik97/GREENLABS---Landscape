/**
 * Зберігає готовий HTML для кожної адреси з dist/sitemap.xml.
 *
 * Навіщо: сайт — client-side React, у dist/index.html лежить порожній <div id="root">.
 * Пошукові й AI-краулери (GPTBot, PerplexityBot, ClaudeBot) не виконують JavaScript,
 * тож без цього кроку вони бачать порожню сторінку замість тексту послуг.
 *
 * Як: піднімаємо dist статичним сервером, проходимо по ньому браузером, чекаємо,
 * поки React домалює контент із Sanity, і кладемо знімок у dist/шлях/index.html.
 * Хостинг віддає такий файл напряму, а React далі перемальовує сторінку як завжди.
 *
 * Якщо браузер не піднявся — валимо білд. Раніше цей крок мовчки пропускався,
 * і збірка лишалась зеленою, віддаючи краулерам порожні сторінки. Помітити це
 * можна було тільки вручну, тож краще не викотитись зовсім, ніж викотитись без
 * половини сенсу.
 */
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import puppeteer from 'puppeteer'

const BASE = (process.env.FIGMA_PUBLIC_URL ?? '').replace(/\/$/, '')
const DIST = 'dist'
/** Скільки чекати на дані з Sanity, перш ніж зберегти сторінку як є. */
const CONTENT_TIMEOUT = 15_000

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

const shell = await readFile(join(DIST, 'index.html'), 'utf8')

/** Адреси беремо з sitemap.xml — він уже зібраний і вже знає про Sanity. */
const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8')
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(([, loc]) => new URL(loc).pathname.slice(BASE.length) || '/')

/** Статичний сервер над dist із SPA-фолбеком — той самий, що й на GitHub Pages. */
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  const file = path.startsWith(BASE) ? path.slice(BASE.length) : path
  try {
    const body = await readFile(join(DIST, file))
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(200, { 'Content-Type': MIME['.html'] })
    res.end(shell)
  }
})

await new Promise((resolve) => server.listen(0, resolve))
const origin = `http://localhost:${server.address().port}`

let browser
try {
  // --disable-web-security: сторінку відкриваємо з localhost, а в CORS Sanity дозволено
  // тільки бойовий домен. Це разовий білд-краулер, не браузер користувача.
  // Профіль свій на кожен запуск. Зі сталим шляхом обірваний білд лишав по
  // собі замок, і кожна наступна збірка падала з «browser is already running» —
  // на своїй машині це виглядало як зламаний пререндер, хоча ламався лише
  // Chrome. Тека потрібна саме тому, що без неї не діє --disable-web-security.
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-web-security', `--user-data-dir=${await mkdtemp(join(tmpdir(), 'greenlabs-prerender-'))}`],
    // Сторінка не має займати більше хвилини; далі краще впасти в повтор,
    // ніж чекати три хвилини дефолтного таймауту протоколу.
    protocolTimeout: 60_000,
  })
} catch (err) {
  server.close()
  console.error(`prerender: браузер не запустився — ${err.message}`)
  process.exit(1)
}

/**
 * Відповіді Sanity, спіймані під час знімка поточної сторінки.
 *
 * Навіщо: без них сторінка приїжджає з готовим контентом у html, але браузер
 * при гідратації бачить, що компонент поки віддає порожньо, і цей контент
 * викидає — аж доки не приїде той самий запит удруге. Підвал через це стискався
 * і за мить розтягувався назад на висоту екрана: найбільший зсув макета на
 * сайті. Тож кладемо відповіді просто в сторінку, і перший же рендер у браузері
 * збігається з тим, що вже намальовано.
 *
 * Ключ — адреса запиту: її будує той самий код, що потім шукатиме тут відповідь.
 */
let answers = new Map()

function watchSanity(p) {
  p.on('response', async (res) => {
    const url = res.url()
    if (!url.includes('.sanity.io/') || !url.includes('/data/query/')) return
    try {
      const body = await res.json()
      if (body && 'result' in body) answers.set(url, body.result)
    } catch {
      // Не json або відповідь уже відкинуто — тоді сторінка просто дозапитає сама
    }
  })
}

let page = await browser.newPage()
watchSanity(page)
let saved = 0
const stuck = []
const failed = []

/** Знімає одну сторінку. Кидає — значить, спроба не вдалась. */
async function capture(path) {
    answers = new Map()
    await page.goto(`${origin}${BASE}${path}`, { waitUntil: 'networkidle2', timeout: CONTENT_TIMEOUT })
    // Поки дані не приїхали, сторінка показує Placeholder — його зберігати немає сенсу.
    await page
      .waitForFunction(() => !document.querySelector('[data-placeholder]'), { timeout: CONTENT_TIMEOUT })
      .catch(() => stuck.push(path))

    // Прокручуємо сторінку до низу: блоки в Reveal стартують з opacity 0 і
    // проявляються при появі в екрані. Без прокрутки знімок фіксує їх
    // прихованими, і до запуску React відвідувач бачить порожні секції.
    await page.evaluate(async () => {
      // Крок рахуємо від фіксованої стелі, а не від scrollHeight у межі циклу:
      // сторінка росте під час самої прокрутки (картинки, Reveal), тож умова
      // `y < document.body.scrollHeight` тікала вперед і крутилась хвилинами.
      const step = window.innerHeight / 2
      for (let i = 0; i < 80; i++) {
        const y = i * step
        if (y > document.body.scrollHeight) break
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 100))
      }
      window.scrollTo(0, 0)
      await new Promise((r) => setTimeout(r, 700))
    })

  // `<` екрануємо: інакше рядок «</script>» усередині тексту з Sanity закрив би
  // тег раніше часу і поламав сторінку.
  const payload = JSON.stringify(Object.fromEntries(answers)).replace(/</g, '\\u003c')
  await page.evaluate((json) => {
    const el = document.createElement('script')
    el.type = 'application/json'
    el.id = 'sanity-data'
    el.textContent = json
    document.head.appendChild(el)
  }, payload)

  const html = await page.content()
  const dir = join(DIST, path)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'index.html'), html)
}

for (const path of paths) {
  // Друга спроба з чистою вкладкою: зрідка Chrome відвʼязує фрейм посеред
  // прокрутки, і сторінка мовчки випадала б зі збірки.
  try {
    await capture(path)
    saved++
  } catch (first) {
    try {
      await page.close()
      page = await browser.newPage()
      watchSanity(page)
      await capture(path)
      saved++
      console.warn(`prerender: ${path} — з другої спроби (${first.message})`)
    } catch (err) {
      failed.push(`${path}: ${err.message}`)
    }
  }
}

await browser.close()
server.close()

// 404.html лишається порожньою оболонкою: він відповідає на невідомі адреси,
// і показувати там знімок головної було б неправильно.
await writeFile(join(DIST, '404.html'), shell)

console.log(`prerender: ${saved} з ${paths.length} сторінок`)
if (stuck.length) {
  console.warn(`prerender: дані не встигли приїхати — ${stuck.join(', ')}`)
}
// Сторінка без знімка лишається порожньою для краулерів — це варто помітити,
// а не проґавити в кінці зеленого логу.
if (failed.length) {
  console.error(`prerender: не вдалось зняти ${failed.length} — ${failed.join('; ')}`)
  process.exitCode = 1
}
