/**
 * Приймає заявку з форми і пересилає її в Telegram.
 *
 * Навіщо окремий Worker: сайт статичний, усе в його бандлі публічне. Токен
 * бота в клієнтському коді означав би, що будь-хто зможе слати повідомлення
 * від імені вашого бота. Тут токен лежить у секретах Cloudflare і назовні
 * не потрапляє.
 *
 * Розгортання — див. worker/README.md
 */

/**
 * Скільки заявок з однієї адреси пропускаємо за годину.
 *
 * Було п'ять, і це відсікало живих людей: за одним IP сидить офіс, готель або
 * ціла родина, і другий клієнт отримував відмову. Втратити заявку дорожче, ніж
 * отримати кілька зайвих, тож поріг тепер такий, якого людина не досягає, —
 * він лишається запобіжником проти напливу, а не фільтром.
 */
const RATE_LIMIT = 30
/** Дій без заявки з однієї адреси за годину — свій, вищий ліміт. */
const EVENT_LIMIT = 20

/**
 * Звернення, які не є заявкою: людина подзвонила або відкрила форму.
 *
 * Назви вирішуються тут, а не в таблиці: Worker — єдине місце, яке знає про
 * обидва канали, і слово має бути одне й те саме скрізь.
 */
const EVENT_LABELS = {
  call: 'Дзвінок',
  form: 'Консультація',
}
const RATE_WINDOW_MS = 60 * 60 * 1000

/**
 * Коди мобільних операторів України.
 *
 * Дублює список із форми навмисно: перевірка в браузері зручна людині, але
 * запит сюди можна надіслати й повз форму, і тоді єдиний захист — оцей.
 */
const OPERATOR_CODES = [
  '050', '066', '095', '099', // Vodafone
  '067', '068', '096', '097', '098', // Київстар
  '063', '073', '093', // lifecell
  '089', '091', '092', '094', // менші оператори
]

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/** Дозволяємо запити лише з наших доменів, щоб форму не смикали з чужих сайтів. */
function corsHeaders(request, env) {
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const origin = request.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Людська назва сторінки, з якої прийшла заявка.
 *
 * Заголовок написаний під пошук — «Газони — ціна та терміни у Львові |
 * GREENLABS». Менеджеру потрібен тільки початок, решта то хвіст для Google.
 * Якщо заголовка нема (старий бандл у когось у кеші), лишається шлях: гірше
 * читається, але краще, ніж порожньо.
 */
function pageLabel(page, title) {
  if (page === '/') return 'Головна'
  const head = title.split(/[—|]/)[0].trim()
  // «Озеленення та посадка у Львові» → «Озеленення та посадка». Місто в
  // заголовку стоїть заради пошуку й однакове скрізь; у таблиці воно лише
  // подовжує назву, а рахувати треба вид робіт, як він зветься в каталозі.
  return head.replace(/\s+у\s+Львові$/i, '').trim() || page || '—'
}

/** @returns чи дійшло. Помилку не кидає — рішення приймає виклик вище. */
async function sendToTelegram(env, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
    })
    if (!response.ok) console.error('telegram', response.status, await response.text())
    return response.ok
  } catch (error) {
    console.error('telegram', error)
    return false
  }
}

/** Те саме для таблиці. Без SHEET_URL просто нічого не робить. */
async function sendToSheet(env, lead) {
  if (!env.SHEET_URL) return false
  try {
    const response = await fetch(env.SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Секретом скрипт відрізняє нас від будь-кого, хто дізнався адресу /exec.
      body: JSON.stringify({ ...lead, secret: env.SHEET_SECRET }),
    })
    // Код відповіді тут ні про що не каже: Apps Script віддає 200 навіть на
    // відмову. Успіх — лише те слово, яке скрипт друкує, дописавши рядок.
    const body = (await response.text()).trim()
    if (!response.ok || body !== 'ok') {
      console.error('sheet', response.status, body)
      return false
    }
    return true
  } catch (error) {
    console.error('sheet', error)
    return false
  }
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' })

    let data
    try {
      data = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'bad_json' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const name = String(data.name ?? '').trim()
    const phone = String(data.phone ?? '').trim()
    const page = String(data.page ?? '').trim()
    const label = pageLabel(page, String(data.title ?? '').trim())

    // Приховане поле: людина його не бачить і не заповнює, бот заповнює майже
    // завжди. Відповідаємо успіхом, щоб бот не шукав обхід.
    if (data.website) return new Response(JSON.stringify({ ok: true }), { headers: cors })

    // Дзвінок або відкриття форми. Ні імені, ні номера тут немає й бути не
    // може — тому й перевіряти нічого. Кладемо лише в таблицю: у групу такі
    // події сипались би десятками на день і топили б справжні заявки.
    const eventLabel = EVENT_LABELS[data.type]
    if (eventLabel) {
      if (env.LEADS_KV) {
        const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
        const key = `evt:${ip}`
        const count = Number((await env.LEADS_KV.get(key)) ?? 0)
        // Ліміт свій і вищий за заявочний: людина може натиснути номер
        // кілька разів поспіль, і це не має з'їдати квоту на заявки.
        if (count >= EVENT_LIMIT) return new Response(JSON.stringify({ ok: true }), { headers: cors })
        await env.LEADS_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_MS / 1000 })
      }

      await sendToSheet(env, {
        kind: 'event',
        event: eventLabel,
        from: String(data.from ?? '').trim() || '—',
        page: label,
      })
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (name.length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: 'bad_name' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Зводимо до десяти цифр після коду країни: 380XX…, 0XX…, XX… — усе те саме.
    const digits = phone.replace(/\D/g, '').replace(/^380?/, '0')
    if (digits.length !== 10 || !OPERATOR_CODES.includes(digits.slice(0, 3))) {
      return new Response(JSON.stringify({ error: 'bad_phone' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Перевірка без доставки. Валідація вже позаду, тож відповідь така сама, як
    // у справжньої заявки, — але нікуди не йде. Інакше кожен прогін перевірок
    // засипає менеджеру групу десятками вигаданих клієнтів; так уже сталось.
    if (data.dry) {
      return new Response(JSON.stringify({ ok: true, dry: true }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // Обмеження частоти. KV необовʼязковий: без нього Worker працює, просто
    // без захисту від напливу з однієї адреси.
    if (env.LEADS_KV) {
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
      const key = `rate:${ip}`
      const count = Number((await env.LEADS_KV.get(key)) ?? 0)
      if (count >= RATE_LIMIT) {
        return new Response(JSON.stringify({ error: 'rate_limited' }), {
          status: 429,
          headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }
      await env.LEADS_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW_MS / 1000 })
    }

    const time = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' })
    // Жирним саме значення, а не підпис: менеджер вихоплює очима ім'я й номер,
    // а не слово «Телефон», яке в кожному повідомленні те саме.
    const text =
      `🌿 <b>Нова заявка з сайту</b>\n\n` +
      `Ім'я: <b>${escapeHtml(name)}</b>\n` +
      `Телефон: <b>${escapeHtml(phone)}</b>\n` +
      `Сторінка: <b>${escapeHtml(label)}</b>\n\n` +
      `Час: ${time}`

    // Обидва канали смикаємо одночасно й незалежно: заявка не має губитись
    // через те, що один із них саме зараз недоступний.
    const [telegram, sheet] = await Promise.all([
      sendToTelegram(env, text),
      // `from` каже, котра саме форма — спливне вікно чи та, що в секції.
      // Без цього обидві давали однаковий рядок, і власник не бачив, який
      // заклик спрацював.
      sendToSheet(env, {
        kind: 'lead',
        event: String(data.from ?? '').trim() || 'Форма на сторінці',
        name,
        phone,
        page: label,
      }),
    ])

    // «Дякуємо» показуємо, лише якщо заявка десь осіла. Якщо ніде — краще
    // чесна помилка з телефоном, ніж втрачений клієнт.
    if (!telegram && !sheet) {
      return new Response(JSON.stringify({ error: 'delivery_failed' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  },
}
