/**
 * Результат збірки — те, що справді побачать пошуковики й люди.
 *
 * Сайт віддає готовий html із пререндеру, і саме він тут перевіряється. Це не
 * дублювання логів збірки: `prerender: 58 з 58` каже, що файли записались, але
 * не каже, що всередині них є вміст. Порожній знімок теж «записався».
 *
 * Без dist тести пропускаються — щоб `pnpm test` не вимагав повної збірки
 * перед кожним запуском. Перед викочуванням треба ганяти після `pnpm build`.
 */
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const DIST = new URL('../dist/', import.meta.url)
const є = (шлях) => existsSync(new URL(шлях, DIST))
const читати = (шлях) => readFileSync(new URL(шлях, DIST), 'utf8')

const зібрано = є('sitemap.xml') && є('robota/index.html')
const якщоЗібрано = { skip: зібрано ? false : 'немає dist — спершу pnpm build' }

describe('мапа сайту', якщоЗібрано, () => {
  test('містить сторінку вакансій', () => {
    assert.match(читати('sitemap.xml'), /<loc>[^<]*\/robota<\/loc>/)
  })

  test('усі адреси абсолютні й на бойовому домені', () => {
    const адреси = [...читати('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, u]) => u)
    assert.ok(адреси.length > 50, `адрес лише ${адреси.length}`)
    for (const u of адреси) assert.match(u, /^https:\/\/greenlabs-one\.vercel\.app\//)
  })
})

describe('сторінка вакансій у пререндері', якщоЗібрано, () => {
  const html = () => читати('robota/index.html')

  test('віддає вміст, а не порожній контейнер', () => {
    assert.ok(html().length > 50_000, 'знімок підозріло малий — схоже, пререндер не спрацював')
    assert.match(html(), /Кого шукаємо просто зараз/)
  })

  test('усі вакансії потрапили в html', () => {
    for (const посада of ['Садівник', 'Озеленювач', 'Майстер мощення', 'Монтажник систем поливу', 'Різноробочий']) {
      assert.match(html(), new RegExp(посада), `${посада} не видно краулеру`)
    }
  })

  test('заголовок і опис на місці', () => {
    assert.match(html(), /<title>Робота озеленювачем[^<]*<\/title>/)
    assert.match(html(), /<meta name="description" content="[^"]{80,}"/)
  })

  test('канонічна адреса вказує на бойову сторінку', () => {
    assert.match(html(), /<link rel="canonical" href="https:\/\/greenlabs-one\.vercel\.app\/robota"/)
  })

  test('спливні вікна не запечені в html', () => {
    // Інакше вони показувались би всім одразу при завантаженні, ще до React.
    assert.doesNotMatch(html(), /Лишились сумніви/)
    assert.doesNotMatch(html(), /Дивитись вакансії/)
  })
})

describe('структуровані дані вакансій', якщоЗібрано, () => {
  const блоки = () =>
    [...читати('robota/index.html').matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map(([, json]) => {
        try {
          return JSON.parse(json)
        } catch {
          return null
        }
      })

  test('увесь JSON-LD на сторінці розбирається', () => {
    assert.equal(блоки().filter((b) => b === null).length, 0, 'є непридатний до розбору блок')
  })

  /* Кількість вакансій тепер задається в адмінці, тож жорстке число тут стало б
     хибним провалом щоразу, коли власник закриє чи відкриє набір. Перевіряємо
     те, що справді має бути правдою: розмітка є, і її стільки ж, скільки карток
     на сторінці. */
  test('кожна вакансія на сторінці має власну розмітку JobPosting', () => {
    const вакансії = блоки().filter((b) => b?.['@type'] === 'JobPosting')
    const карток = (читати('robota/index.html').match(/Відгукнутись/g) || []).length
    assert.ok(вакансії.length > 0, 'на сторінці немає жодної вакансії')
    assert.equal(вакансії.length, карток)
  })

  test('у розмітці є все, чого Google вимагає обовʼязково', () => {
    for (const в of блоки().filter((b) => b?.['@type'] === 'JobPosting')) {
      for (const поле of ['title', 'description', 'datePosted', 'validThrough', 'hiringOrganization', 'jobLocation']) {
        assert.ok(в[поле], `${в.title}: немає ${поле}`)
      }
      assert.equal(в.jobLocation.address.addressLocality, 'Львів')
    }
  })

  /* Поки цифри не звірені з власником, вилка не має потрапляти в структуровані
     дані: Google показує її як заяву роботодавця, а не як текст на сайті. */
  test('вигадана вилка не потрапляє в Google Jobs', () => {
    // Прапорець читаємо з тексту файлу: Node роздягає типи в .ts, але .tsx із
    // розміткою не розбирає, а тягнути сюди складач заради одного значення дурно.
    const джерело = readFileSync(new URL('../src/data/careers.tsx', import.meta.url), 'utf8')
    const підтверджено = /SALARY_CONFIRMED = true/.test(джерело)
    const зСумою = блоки().filter((b) => b?.['@type'] === 'JobPosting' && b.baseSalary).length
    if (!підтверджено) assert.equal(зСумою, 0, 'непідтверджена вилка поїхала в структуровані дані')
    else assert.ok(зСумою > 0, 'цифри підтверджені, а в розмітці їх немає')
  })
})
