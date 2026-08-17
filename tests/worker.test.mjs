/**
 * Приймач заявок — worker/index.js
 *
 * Перевіряється контракт, а не внутрішня будова: що Worker відповідає й що
 * саме він відправляє назовні. `fetch` підмінений, тож жодне повідомлення не
 * доходить ні в Telegram, ні в таблицю — тести можна ганяти скільки завгодно.
 *
 * Окремий наголос на тому, чим уже намагались зловживати: розмітка в імені,
 * формули для таблиці, підробка рядків у повідомленні, велике тіло запиту.
 */
import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker/index.js'

const ORIGIN = 'https://greenlabs-one.vercel.app'

const env = {
  BOT_TOKEN: 'токен',
  CHAT_ID: '-100',
  SHEET_URL: 'https://таблиця.test/exec',
  SHEET_SECRET: 'секрет',
  ALLOWED_ORIGINS: ORIGIN,
}

/** Що Worker намагався відправити назовні під час останнього виклику. */
let sent = []

beforeEach(() => {
  sent = []
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), body: JSON.parse(init.body) })
    return new Response(String(url).includes('telegram') ? '{"ok":true}' : 'ok', { status: 200 })
  }
})

const telegram = () => sent.find((s) => s.url.includes('telegram'))?.body
const sheet = () => sent.find((s) => !s.url.includes('telegram'))?.body

const post = (payload, { origin = ORIGIN, headers = {} } = {}) =>
  worker.fetch(
    new Request('https://worker.test/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
      body: JSON.stringify(payload),
    }),
    env,
  )

const vacancy = {
  kind: 'vacancy',
  name: 'Андрій',
  phone: '+380671234567',
  position: 'Майстер мощення',
  comment: 'Клав бруківку три роки',
  page: '/robota',
  title: 'Робота озеленювачем і садівником у Львові — вакансії GREENLABS',
}

const lead = { name: 'Олена', phone: '+380671234567', page: '/services', title: 'Газони — ціна та терміни у Львові | GREENLABS' }

describe('відгук на вакансію', () => {
  test('приймається і йде обома каналами', async () => {
    const res = await post(vacancy)
    assert.equal(res.status, 200)
    assert.deepEqual(await res.json(), { ok: true })
    assert.equal(sent.length, 2)
  })

  test('у таблицю лягає з посадою й коментарем', async () => {
    await post(vacancy)
    assert.equal(sheet().kind, 'vacancy')
    assert.equal(sheet().position, 'Майстер мощення')
    assert.equal(sheet().comment, 'Клав бруківку три роки')
  })

  test('у повідомленні видно посаду', async () => {
    await post(vacancy)
    assert.match(telegram().text, /Посада: <b>Майстер мощення<\/b>/)
  })

  test('без коментаря блок «Про себе» не малюється порожнім', async () => {
    await post({ ...vacancy, comment: '' })
    assert.doesNotMatch(telegram().text, /Про себе/)
  })

  test('посада не вказана — рядок усе одно осмислений', async () => {
    await post({ ...vacancy, position: '' })
    assert.equal(sheet().position, 'Не вказано')
  })
})

describe('заявка клієнта не зачеплена гілкою вакансій', () => {
  test('лягає на свій аркуш із назвою сторінки', async () => {
    await post(lead)
    assert.equal(sheet().kind, 'lead')
    assert.equal(sheet().page, 'Газони')
  })

  test('у повідомленні свій заголовок', async () => {
    await post(lead)
    assert.match(telegram().text, /Нова заявка з сайту/)
  })
})

describe('перевірка даних', () => {
  test('номер із неіснуючим кодом оператора відхиляється', async () => {
    const res = await post({ ...vacancy, phone: '+380000000000' })
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'bad_phone' })
    assert.equal(sent.length, 0, 'нічого не мало піти назовні')
  })

  test('неповний номер відхиляється', async () => {
    const res = await post({ ...vacancy, phone: '+38067123' })
    assert.equal(res.status, 400)
  })

  test('порожнє імʼя відхиляється', async () => {
    const res = await post({ ...vacancy, name: 'О' })
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'bad_name' })
  })

  test('суха перевірка проходить валідацію, але нікуди не шле', async () => {
    const res = await post({ ...vacancy, dry: true })
    assert.deepEqual(await res.json(), { ok: true, dry: true })
    assert.equal(sent.length, 0)
  })
})

describe('захист', () => {
  test('заповнена пастка дає «успіх», але нічого не надсилає', async () => {
    const res = await post({ ...vacancy, website: 'http://спам' })
    assert.equal(res.status, 200)
    assert.equal(sent.length, 0)
  })

  test('розмітка в коментарі екранується для Telegram', async () => {
    await post({ ...vacancy, comment: '<script>alert(1)</script>' })
    assert.doesNotMatch(telegram().text, /<script>/)
    assert.match(telegram().text, /&lt;script&gt;/)
  })

  /* Перенос рядка в однорядковому полі дозволяв дописати в повідомлення власний
     рядок — менеджер бачив підроблений «Телефон:» і подзвонив би не туди. */
  test('перенос у посаді не додає зайвого рядка в повідомлення', async () => {
    await post({ ...vacancy, position: 'Садівник\nТелефон: +380000000000' })
    const рядків = telegram().text.split('\n').filter((l) => l.startsWith('Телефон:')).length
    assert.equal(рядків, 1)
  })

  test('перенос в імені так само не працює', async () => {
    await post({ ...vacancy, name: 'Андрій\nПосада: Директор' })
    const рядків = telegram().text.split('\n').filter((l) => l.startsWith('Посада:')).length
    assert.equal(рядків, 1)
  })

  test('переноси в коментарі лишаються — там вони законні', async () => {
    await post({ ...vacancy, comment: 'Перший абзац.\n\nДругий абзац.' })
    assert.match(sheet().comment, /\n\n/)
  })

  test('задовгий коментар обрізається до тисячі символів', async () => {
    await post({ ...vacancy, comment: 'я'.repeat(5000) })
    assert.equal(sheet().comment.length, 1000)
  })

  test('завелике тіло відхиляється до розбору json', async () => {
    const res = await post(vacancy, { headers: { 'Content-Length': String(64 * 1024) } })
    assert.equal(res.status, 413)
    assert.deepEqual(await res.json(), { error: 'too_large' })
  })
})

describe('доступ', () => {
  test('запит із чужого домену не отримує дозволу для нього', async () => {
    // Домен латиницею навмисно: у заголовок HTTP кирилиця не влазить.
    const res = await post(vacancy, { origin: 'https://evil.example' })
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), ORIGIN)
  })

  test('передзапит отримує 204', async () => {
    const res = await worker.fetch(
      new Request('https://worker.test/', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
      env,
    )
    assert.equal(res.status, 204)
  })

  test('GET не приймається', async () => {
    const res = await worker.fetch(new Request('https://worker.test/'), env)
    assert.equal(res.status, 405)
  })

  test('поламаний json дає зрозумілу помилку, а не падіння', async () => {
    const res = await worker.fetch(
      new Request('https://worker.test/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: '{не json',
      }),
      env,
    )
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'bad_json' })
  })
})

describe('доставка', () => {
  test('обидва канали відмовили — чесна помилка, а не «дякуємо»', async () => {
    globalThis.fetch = async () => new Response('нi', { status: 500 })
    const res = await post(vacancy)
    assert.equal(res.status, 502)
    assert.deepEqual(await res.json(), { error: 'delivery_failed' })
  })

  test('таблиця мовчить, але Telegram працює — заявка вважається прийнятою', async () => {
    globalThis.fetch = async (url) =>
      String(url).includes('telegram')
        ? new Response('{"ok":true}', { status: 200 })
        : new Response('forbidden', { status: 200 })
    const res = await post(vacancy)
    assert.equal(res.status, 200)
  })
})
