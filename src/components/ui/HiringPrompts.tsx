import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IcoClose } from './Icons'

/**
 * Ненавʼязливі нагадування про набір команди.
 *
 * Два різні: `HiringToast` ловить людину на сторінках для клієнтів і веде на
 * /robota; `CareersNudge` працює вже на самій /robota й нагадує дописати відгук.
 *
 * Спільні правила для обох: зʼявляються не одразу, закриваються одним дотиком,
 * після закриття не вертаються, і на мобільному не лізуть ні на смугу
 * «Зателефонувати» знизу, ні на кнопку звʼязку праворуч — тому вони ліворуч і
 * підняті над смугою.
 */

const TOAST_KEY = 'greenlabs-hiring-toast'
const NUDGE_KEY = 'greenlabs-careers-nudge'

/** Скільки людина має побути на сторінці, перш ніж її чіпати. */
const TOAST_DELAY_MS = 12_000
const NUDGE_DELAY_MS = 45_000

/**
 * Чи це збірковий краулер, а не людина.
 *
 * Пререндер (scripts/prerender.mjs) тримає сторінку відкритою десятки секунд і
 * зберігає DOM як є — без цієї перевірки спливне вікно потрапило б у html і
 * показувалось усім одразу при завантаженні, ще до запуску React.
 */
const isCrawler = () => typeof navigator !== 'undefined' && navigator.webdriver

/** Спільна оболонка: картка ліворуч унизу, кнопка закриття в куті. */
function PromptCard({
  onClose,
  label,
  children,
}: {
  onClose: () => void
  label: string
  children: ReactNode
}) {
  return (
    <aside
      aria-label={label}
      className="animate-fade-up fixed z-50 left-4 right-20 bottom-23 md:right-auto md:left-6 md:bottom-8 md:w-88
                 bg-cream rounded-2xl border border-[#d9d6d0] shadow-[0_18px_40px_rgba(0,0,0,0.18)] p-5 pr-10"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Закрити"
        className="absolute top-2.5 right-2.5 w-9 h-9 flex items-center justify-center rounded-full text-stone hover:text-ink hover:bg-black/[0.04] active:scale-90 transition-all duration-150"
      >
        <IcoClose className="w-4 h-4" />
      </button>
      {children}
    </aside>
  )
}

/**
 * Смужка «ми набираємо» на сторінках для клієнтів.
 *
 * Тільки головна й послуги: на портфоліо та в блозі людина читає, і зачіпати її
 * там — це заважати. Закриття памʼятаємо в localStorage, тобто назавжди для
 * цього браузера: нагадувати про набір щосесії — це вже настирливо.
 */
export function HiringToast() {
  const { pathname } = useLocation()
  const [shown, setShown] = useState(false)

  const relevant = pathname === '/' || pathname.startsWith('/services')

  useEffect(() => {
    if (!relevant || isCrawler()) return
    if (localStorage.getItem(TOAST_KEY)) return

    const timer = setTimeout(() => setShown(true), TOAST_DELAY_MS)
    return () => clearTimeout(timer)
  }, [relevant])

  if (!shown || !relevant) return null

  const dismiss = () => {
    localStorage.setItem(TOAST_KEY, '1')
    setShown(false)
  }

  return (
    <PromptCard onClose={dismiss} label="GREENLABS набирає команду">
      <p className="font-display font-semibold text-ink text-[15px] leading-snug mb-1.5">
        🌿 GREENLABS набирає команду
      </p>
      <p className="text-stone text-[12px] font-sans leading-[1.6] mb-4">
        Садівники, озеленювачі, майстри мощення. Оплата вчасно, робота цілий рік.
      </p>
      <Link
        to="/robota"
        onClick={dismiss}
        className="inline-flex items-center gap-1.5 text-terra font-display font-semibold text-[13px] hover:text-[#b35c34] transition-colors"
      >
        Дивитись вакансії →
      </Link>
    </PromptCard>
  )
}

/**
 * Нагадування на самій сторінці вакансій.
 *
 * Спрацьовує на тому, що людина зібралась піти: курсор пішов за верхній край
 * вікна. На дотикових екранах такого сигналу немає, тож там просто за часом.
 * Памʼятаємо в sessionStorage, а не назавжди: людина може вернутись за тиждень,
 * уже наважившись, — і тоді підштовхнути її доречно.
 */
export function CareersNudge({ onApply }: { onApply: () => void }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (isCrawler() || sessionStorage.getItem(NUDGE_KEY)) return

    const show = () => {
      sessionStorage.setItem(NUDGE_KEY, '1')
      setShown(true)
    }

    // clientY <= 0 — курсор вийшов саме вгору, до вкладок і адресного рядка.
    // Вихід убік чи вниз — це другий монітор або панель завдань, не намір піти.
    // relatedTarget порожній лише тоді, коли курсор пішов із вікна зовсім: без
    // цієї умови подія ловилась би й на переході між сусідніми елементами в
    // самому верхньому рядку пікселів.
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !e.relatedTarget) show()
    }

    const timer = setTimeout(show, NUDGE_DELAY_MS)
    document.addEventListener('mouseout', onLeave)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseout', onLeave)
    }
  }, [])

  if (!shown) return null

  return (
    <PromptCard onClose={() => setShown(false)} label="Нагадування про відгук">
      <p className="font-display font-semibold text-ink text-[15px] leading-snug mb-1.5">
        Лишились сумніви?
      </p>
      <p className="text-stone text-[12px] font-sans leading-[1.6] mb-4">
        Відгук — це три поля й одна хвилина. Ні до чого не зобовʼязує: спершу просто поговоримо.
      </p>
      <button
        type="button"
        onClick={() => {
          setShown(false)
          onApply()
        }}
        className="bg-terra text-white font-display font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-[#b35c34] active:scale-95 transition-all duration-200"
      >
        Залишити відгук
      </button>
    </PromptCard>
  )
}
