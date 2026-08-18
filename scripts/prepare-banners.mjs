/**
 * Готує банери сторінок: ріже вихідний знімок під потрібні ширини й окремий
 * вертикальний кадр, складає webp у public/img.
 *
 *   node scripts/prepare-banners.mjs
 *
 * Навіщо: банери доти робились руками, і кожен новий коштував півгодини в
 * редакторі. Тепер додати сторінці фото — це рядок у мапі нижче.
 *
 * Розміри взяті з коду, який їх запитує: lib/banner.ts просить 640/960/1280/1600
 * і портрет, герой на головній — ще й 1920. Портрет потрібен, бо на телефоні
 * широкий кадр майже весь іде під обрізку.
 *
 * Ріжемо браузером — так само, як prepare-item-photos.mjs: sharp у проєкті
 * немає, а puppeteer уже стоїть заради пререндеру.
 */
import { readFile, writeFile, mkdir, mkdtemp } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const SRC = resolve('photo-source')
const OUT = resolve('public/img')

/** Ширини для банерів сторінок і окремо для героя — він показується ширшим. */
const WIDTHS = [640, 960, 1280, 1600]
const HERO_WIDTHS = [640, 960, 1280, 1920]
/** Вертикальний кадр: 3:4, під телефон. */
const PORTRAIT = [810, 1080]

/**
 * назва файлу на виході → вихідний знімок, набір ширин і, за потреби,
 * зсув кадрування (`position`, як в object-position).
 *
 * Імена нові там, де фото змінюється: /img віддається з кешем на місяць, і
 * підміна вмісту під тим самим іменем до тих, хто вже був на сайті, не дійде.
 */
const BANNERS = {
  // Головна. Був парк із топіарієм — читався як міський ботанічний сад, а не
  // як приватна ділянка, яку замовляють.
  // position: центр по горизонталі, нижче середини по вертикалі — інакше
  // кадр забирає фасад, а газон і висадки, заради яких фото й обране,
  // лишаються за краєм.
  'hero-v2': { file: 'jonathan-majam-saPNhx2vljA-unsplash.jpg', widths: HERO_WIDTHS, ratio: 16 / 9, position: 'center 78%' },
  // Портфоліо: доглянутий сад із доріжкою — результат, а не процес.
  'banner-works': { file: 'roger-starnes-sr-8Kk5C2FLCV0-unsplash.jpg', widths: WIDTHS, ratio: 16 / 10 },
  // Блог: бригада в роботі — статті саме про догляд.
  'banner-blog': { file: 'michael-smith-bsld7GjQwjI-unsplash.jpg', widths: WIDTHS, ratio: 16 / 10 },
}

const server = createServer(async (req, res) => {
  try {
    res.writeHead(200, { 'Content-Type': 'image/jpeg' })
    res.end(await readFile(join(SRC, decodeURIComponent(req.url.slice(1)))))
  } catch {
    res.writeHead(404).end()
  }
})
await new Promise((r) => server.listen(0, r))
const origin = `http://localhost:${server.address().port}`

await mkdir(OUT, { recursive: true })

const browser = await puppeteer.launch({
  args: [`--user-data-dir=${await mkdtemp(join(tmpdir(), 'greenlabs-banners-'))}`],
})
const page = await browser.newPage()

/** Один кадр заданого розміру. */
async function зняти(file, w, h, ім_я, position = 'center') {
  await page.setViewport({ width: w, height: h })
  await page.setContent(
    `<style>html,body{margin:0;height:100%}img{width:${w}px;height:${h}px;object-fit:cover;object-position:${position};display:block}</style>` +
      `<img src="${origin}/${encodeURIComponent(file)}">`,
  )
  await page.waitForFunction(() => {
    const img = document.querySelector('img')
    return img?.complete && img.naturalWidth > 0
  })
  await writeFile(join(OUT, `${ім_я}.webp`), await page.screenshot({ type: 'webp', quality: 82 }))
}

let усього = 0
for (const [ім_я, { file, widths, ratio, position }] of Object.entries(BANNERS)) {
  await readFile(join(SRC, file)) // впадемо одразу й зрозуміло, якщо назва не збігається
  for (const w of widths) {
    await зняти(file, w, Math.round(w / ratio), `${ім_я}-${w}`, position)
    усього++
  }
  await зняти(file, PORTRAIT[0], PORTRAIT[1], `${ім_я}-portrait`, position)
  усього++
}

await browser.close()
server.close()
console.log(`${усього} файлів → public/img`)
