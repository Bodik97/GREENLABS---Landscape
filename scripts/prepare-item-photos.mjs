/**
 * Готує фото видів робіт: ріже вихідні знімки з photo-source під 4:3 і
 * складає webp у public/img/services/items.
 *
 *   node scripts/prepare-item-photos.mjs
 *
 * Навіщо окремий крок: photo-source лежить поза гітом, а сідер має працювати
 * на будь-якій машині. Тому у репозиторій потрапляє вже підготовлений webp.
 *
 * Ріжемо браузером, бо sharp чи ImageMagick у проєкті немає, а puppeteer уже
 * стоїть заради пререндеру.
 *
 * У мапі свідомо немає: знімків iStock із водяним знаком, кадру Edem Resort
 * (погоджений лише для портфоліо) і загальних видів саду, які не пояснюють
 * конкретну роботу. Порожнє фото краще за фото ні про що.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { join, resolve } from 'node:path'
import puppeteer from 'puppeteer'

const SRC = resolve('photo-source')
const OUT = resolve('public/img/services/items')
const [W, H] = [1200, 900]

/** slug виду робіт → файл у photo-source. */
const PHOTOS = {
  // Полив
  'avtomatychnyi-polyv-hazonu': 'tilak-teja-S-LAOuZV6vA-unsplash.jpg',
  // Газон
  'pidhotovka-hruntu': 'egor-myznik-ovfUdXye0Uw-unsplash.jpg',
  'rulonnyi-hazon': 'fraem-gmbh-5xML_2EClnA-unsplash.jpg',
  'mulcha-i-bordiury': 'james-lewis-JttEP3_JZXw-unsplash.jpg',
  // Мощення
  brukivka: 'tile-merchant-ireland-L525hiR2XeI-unsplash.jpg',
  'derevianyi-nastyl': 'tile-merchant-ireland-lCmZqcHM-OY-unsplash.jpg',
  'pidpirni-stinky-ta-skhody': 'point3d-commercial-imaging-ltd-QelV3RY8UVY-unsplash.jpg',
  // Озеленення
  'pidbir-roslyn': 'stepan-konev-VEEAPb6rD8o-unsplash.jpg',
  'vysadka-roslyn': 'bennie-bates-JS91tCAAfn0-unsplash.jpg',
  zhyvoplit: 'haberdoedas-ii-G0H2TJW3wm0-unsplash.jpg',
  'mulchuvannia-prystovbournykh-kil': 'ben-kupke-ZxVWpyegfLs-unsplash.jpg',
  // Освітлення
  'osvitlennia-dorizhok': 'cee-R_c77Rx9UzM-unsplash.jpg',
  'led-arkhitekturne-pidsvichuvannia': 'debora-silva-mTgfBsDObuk-unsplash.jpg',
  'pidsvichuvannia-sadu': 'stefan-hiienurm-tfNRLxMuoW8-unsplash.jpg',
  // Водойми
  'fontany-ta-vodospady': 'tadeusz-zachwieja-tIaEjrN3sqY-unsplash.jpg',
  // Сезонне
  'abonementnyi-dohliad': 'fraem-gmbh-LVJnIiIeyO0-unsplash.jpg',
  'pokis-hazonu': 'andres-siimon-zfwyrIA6bFw-unsplash.jpg',
  'stryzhka-kushchiv': 'fraem-gmbh-rBY5Ek86oOI-unsplash.jpg',
  // Кадр саме про обрізку: ножиці в роботі, а не готовий кущ. Із вільних
  // знімків це єдиний, що показує саму дію, а не результат.
  'obrizka-derev': 'peter-beukema-JB-QHEehcwI-unsplash.jpg',
  'pidzhyvlennia-roslyn': 'ries-bosch-3pACJiVZxe8-unsplash.jpg',
  // Проєктування
  'kontseptsiia-ta-planuvannia-zon': 'kayla-duhon-zsqF_j9ZHXw-unsplash.jpg',
  '3d-vizualizatsiia-sadu': 'point3d-commercial-imaging-ltd-Le3RO3-fFdQ-unsplash.jpg',
  'landshaftnyi-proekt-z-koshtorysom': 'lucas-kepner-Yn8D5B8C-eY-unsplash.jpg',
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

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.setViewport({ width: W, height: H })

for (const [slug, file] of Object.entries(PHOTOS)) {
  await readFile(join(SRC, file)) // впадемо одразу і зрозуміло, якщо назва не збігається
  await page.setContent(
    `<style>html,body{margin:0;height:100%}img{width:${W}px;height:${H}px;object-fit:cover;display:block}</style>` +
      `<img src="${origin}/${encodeURIComponent(file)}">`,
  )
  await page.waitForFunction(() => {
    const img = document.querySelector('img')
    return img?.complete && img.naturalWidth > 0
  })
  const buffer = await page.screenshot({ type: 'webp', quality: 82 })
  await writeFile(join(OUT, `${slug}.webp`), buffer)
}

await browser.close()
server.close()
console.log(`${Object.keys(PHOTOS).length} фото → public/img/services/items`)
