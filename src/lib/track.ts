/**
 * Записує в таблицю звернення, які не є заявками: кліки по номеру й відкриття
 * форми консультації.
 *
 * Навіщо: половина людей не заповнює форму, а телефонує або відкриває вікно й
 * закриває. Без цього такі звернення ніде не видно — виглядає, ніби сторінка
 * не працює, хоча з неї якраз і телефонують.
 */
const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

/**
 * Шле подію й нічого не чекає.
 *
 * sendBeacon: браузер може будь-якої миті піти в дзвонилку й обірвати звичайний
 * запит. Тип text/plain — щоб не було передзапиту CORS, якого sendBeacon не
 * вміє; Worker однаково читає тіло як JSON.
 */
function send(type: 'call' | 'form', from: string) {
  if (!endpoint) return
  const body = JSON.stringify({ type, from, page: window.location.pathname, title: document.title })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
  } else {
    fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {})
  }
}

/** Людина сама відкрила форму консультації — кнопкою, а не за таймером. */
export const trackFormOpen = (from: string) => send('form', from)

/**
 * Звідки натиснули номер.
 *
 * Читаємо з розмітки, а не з мітки на кожному посиланні: шапку й підвал видно
 * по самих тегах, а двом плаваючим кнопкам достатньо одного data-from на
 * корені. Так наступне телефонне посилання, де б його не поставили,
 * потрапить у звіт саме як «Сторінка», а не зникне.
 */
function phonePlace(link: Element) {
  const marked = link.closest('[data-from]')
  if (marked) return marked.getAttribute('data-from') || 'Сторінка'
  if (link.closest('header')) return 'Шапка'
  if (link.closest('footer')) return 'Підвал'
  return 'Сторінка'
}

/**
 * Кліки по будь-якому номеру телефону.
 *
 * Слухаємо один клік на весь документ, а не чіпляємось до кожної кнопки: їх
 * дев'ять у восьми файлах, і наступну легко забути.
 */
export function trackPhoneClicks() {
  if (!endpoint) return () => {}

  const onClick = (e: MouseEvent) => {
    const link = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]')
    if (link) send('call', phonePlace(link))
  }

  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
