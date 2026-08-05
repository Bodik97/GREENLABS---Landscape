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

/** Скільки заявок з однієї адреси пропускаємо за годину. */
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

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

    // Приховане поле: людина його не бачить і не заповнює, бот заповнює майже
    // завжди. Відповідаємо успіхом, щоб бот не шукав обхід.
    if (data.website) return new Response(JSON.stringify({ ok: true }), { headers: cors })

    if (name.length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: 'bad_name' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9 || digits.length > 15) {
      return new Response(JSON.stringify({ error: 'bad_phone' }), {
        status: 400,
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
    const text =
      `<b>Нова заявка з сайту</b>\n\n` +
      `<b>Ім'я:</b> ${escapeHtml(name)}\n` +
      `<b>Телефон:</b> ${escapeHtml(phone)}\n` +
      (page ? `<b>Сторінка:</b> ${escapeHtml(page)}\n` : '') +
      `<b>Час:</b> ${time}`

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

    if (!response.ok) {
      // Не показуємо клієнту «дякуємо», якщо повідомлення не пішло: краще
      // чесна помилка з телефоном, ніж втрачена заявка.
      console.error('telegram', response.status, await response.text())
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
