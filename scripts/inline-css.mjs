/**
 * Вбудовує таблицю стилів у dist/index.html замість посилання на неї.
 *
 * Навіщо: посилання на css блокує перший показ, і браузер дізнається про нього
 * лише розібравши html — виходить зайвий обмін із сервером саме тоді, коли
 * сторінка ще порожня. Стилів тут близько 11 KB у стисненому вигляді, тож
 * дешевше привезти їх разом із html, ніж окремим запитом.
 *
 * Запускати обовʼязково до prerender: той знімає готовий DOM, тож усі 57
 * сторінок успадкують вбудовані стилі самі собою.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = 'dist'
const html = await readFile(join(DIST, 'index.html'), 'utf8')

// Шлях без прив'язки до кореня: збірки Figma йдуть із префіксом у base
const link = html.match(/<link rel="stylesheet"[^>]*href="[^"]*\/assets\/([^"]+\.css)"[^>]*>/)
if (!link) {
  console.error('inline-css: посилання на стилі не знайдено — html змінився?')
  process.exit(1)
}

const css = await readFile(join(DIST, 'assets', link[1]), 'utf8')
await writeFile(join(DIST, 'index.html'), html.replace(link[0], `<style>${css}</style>`))

/* Пробували ще знижувати пріоритет самого застосунку через fetchpriority="low"
   на script і modulepreload: сторінки пререндерені, тож для першого показу js
   не потрібен. На вимірюванні це давало десяті частки секунди, але prerender
   почав валитися — 10 сторінок із 57, решта з «Connection closed», бо puppeteer
   чекає на домальований контент, а той тепер приходить надто пізно. Тобто ціна
   такої правки — порожні сторінки в пошуку. Не варте того. */

// Файл лишаємо на місці: на нього посилаються карти джерел, та й зайвий
// об'єкт у dist нікого не вантажить — після заміни його ніхто не просить.
const assets = await readdir(join(DIST, 'assets'))
console.log(`inline-css: ${link[1]} — ${(css.length / 1024).toFixed(0)} KB у html, ассетів ${assets.length}`)
