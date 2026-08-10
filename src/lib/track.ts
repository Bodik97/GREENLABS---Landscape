/**
 * Записує кліки по номеру телефону в ту саму таблицю, що й заявки.
 *
 * Навіщо: половина людей не заповнює форму, а просто набирає номер. Без цього
 * такі звернення ніде не видно — виглядає, ніби сторінка не працює, хоча з неї
 * якраз і телефонують.
 *
 * Слухаємо один клік на весь документ, а не чіпляємось до кожної кнопки: їх
 * дев'ять у восьми файлах, і наступну легко забути.
 */
const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

export function trackPhoneClicks() {
  if (!endpoint) return () => {}

  const onClick = (e: MouseEvent) => {
    const link = (e.target as HTMLElement | null)?.closest?.('a[href^="tel:"]')
    if (!link) return

    const body = JSON.stringify({
      type: 'call',
      page: window.location.pathname,
      title: document.title,
    })

    // sendBeacon: браузер уже відкриває дзвонилку і може обірвати звичайний
    // запит на півдорозі. Тип text/plain — щоб не було передзапиту CORS,
    // якого sendBeacon не вміє; Worker однаково читає тіло як JSON.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }))
    } else {
      fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  }

  document.addEventListener('click', onClick)
  return () => document.removeEventListener('click', onClick)
}
