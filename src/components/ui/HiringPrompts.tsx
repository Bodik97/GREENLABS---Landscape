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
 * Через скільки днів картка про набір повертається до того, хто її закрив.
 *
 * Спершу закриття памʼяталось назавжди. Для реклами це ввічливо, але тут інша
 * задача: людина, яка відмахнулась у травні, у серпні вже могла шукати роботу —
 * і ми б їй більше нічого не показали. Два тижні — достатньо довго, щоб не
 * дратувати, і достатньо коротко, щоб не втратити того, у кого змінились
 * обставини.
 */
const TOAST_SNOOZE_DAYS = 14

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

      <div className="flex gap-3.5">
        {/* Знак компанії, а не значок-емодзі: картка спливає сама, і людина має
            за півсекунди зрозуміти, від кого вона. Той самий файл, що в шапці, —
            він уже в кеші браузера, тож зайвого завантаження немає.
            alt порожній: назва компанії й так стоїть у тексті поруч, а
            повторення читач з екрана чув би двічі. */}
        <img
          src={`${import.meta.env.BASE_URL}logo/logo-v2-208.webp`}
          alt=""
          aria-hidden="true"
          width={251}
          height={208}
          className="w-11 h-9 shrink-0 object-contain"
        />
        <div className="min-w-0">{children}</div>
      </div>
    </aside>
  )
}

/**
 * Смужка «ми набираємо» на сторінках для клієнтів.
 *
 * Показується скрізь, крім самої сторінки вакансій (там своє нагадування) і
 * політики конфіденційності.
 *
 * Спершу вона стояла тільки на головній і в послугах — щоб не заважати тому,
 * хто читає ціни. Від цього відмовились свідомо: знайти фахівця з бронню зараз
 * майже неможливо, і кожен, хто відкрив сайт, — це можливий кандидат або той,
 * хто передасть знайомому. Ціна питання — одна картка, яку закривають одним
 * дотиком; вигода — люди, яких інакше не знайти.
 *
 * Закриття памʼятаємо на TOAST_SNOOZE_DAYS: нагадувати щосесії настирливо, а
 * замовкнути назавжди — марно втратити людину, у якої змінились обставини.
 */
export function HiringToast() {
  const { pathname } = useLocation()
  const [shown, setShown] = useState(false)

  const relevant = !pathname.startsWith('/robota') && !pathname.startsWith('/privacy')

  useEffect(() => {
    if (!relevant || isCrawler()) return

    // У ключі лежить час закриття. Стара мітка «1» не є числом — Number дає
    // NaN, будь-яке порівняння з ним хибне, і картка просто зʼявиться знову.
    // Саме те, що треба: у тих, хто закрив її до цієї зміни, відлік почнеться
    // заново, а не триватиме вічно.
    const закрито = Number(localStorage.getItem(TOAST_KEY))
    if (Date.now() - закрито < TOAST_SNOOZE_DAYS * 24 * 60 * 60 * 1000) return

    const timer = setTimeout(() => setShown(true), TOAST_DELAY_MS)
    return () => clearTimeout(timer)
  }, [relevant])

  if (!shown || !relevant) return null

  const dismiss = () => {
    localStorage.setItem(TOAST_KEY, String(Date.now()))
    setShown(false)
  }

  return (
    <PromptCard onClose={dismiss} label="GREENLABS шукає майстрів">
      {/* Текст написаний під фахівця, а не під випадкового перехожого: той, хто
          вміє класти бруківку чи вести полив, читає не «шукаємо працівників», а
          конкретику — які обʼєкти, яка зайнятість, чи платять вчасно. */}
      {/* Назва в тексті, а не значком: знак поруч і так видно, а от читач з
          екрана дізнається, хто саме шукає, лише звідси. */}
      <p className="font-display font-semibold text-ink text-[15px] leading-snug mb-1.5">
        GREENLABS шукає майстрів
      </p>
      <p className="text-stone text-[12px] font-sans leading-[1.6] mb-4">
        Мощення, полив, озеленення. Комерційні обʼєкти й приватні сади, зайнятість цілий рік, оплата вчасно.
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
