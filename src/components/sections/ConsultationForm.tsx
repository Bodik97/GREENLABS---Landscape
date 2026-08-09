import React, { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoClock } from '../ui/Icons'
import { useConsultationModal } from '../ui/ConsultationModalContext'

const NAME_MAX = 25
/** Довжина повністю набраного «+38 (0XX) XXX-XX-XX». */
const PHONE_MAX = 19
/** Скільки цифр іде після коду країни: 0XX XXX XX XX. */
const PHONE_DIGITS = 10

/**
 * Лишає в імені літери, пробіл, апостроф і дефіс.
 *
 * Не «тільки літери»: половина справжніх імен тоді не введеться — «Олена
 * Петрівна», «Анна-Марія», «Дмитро О'Коннор». Відсікаємо саме те, чого в імені
 * не буває: цифри, розмітку, службові символи.
 */
const cleanName = (value: string) => value.replace(/[^\p{L}\s'’-]/gu, '').slice(0, NAME_MAX)

/** Скільки цифр людина справді набрала, без коду країни. */
const phoneDigits = (value: string) => value.replace(/^\+?38/, '').replace(/\D/g, '')

/**
 * Малює +38 (0XX) XXX-XX-XX з того, що ввели.
 *
 * Код країни дописується сам, тож лишається набрати десять цифр. Розділювачі
 * теж наші, тому вставлений з месенджера «+38 (067) 123-45-67» і надрукований
 * підряд «0671234567» дають однаковий результат.
 */
function formatPhone(value: string) {
  // Код країни зрізаємо до пошуку цифр — інакше «38» із власного ж префікса
  // потрапило б у номер, і затирання назад ламало б поле.
  const digits = phoneDigits(value).slice(0, PHONE_DIGITS)
  if (!digits) return ''

  let out = `+38 (${digits.slice(0, 3)}`
  if (digits.length >= 3) out += ')'
  if (digits.length > 3) out += ` ${digits.slice(3, 6)}`
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`
  if (digits.length > 8) out += `-${digits.slice(8, 10)}`
  return out
}

/**
 * Куди поставити курсор, щоб ліворуч від нього лишилось `count` цифр номера.
 *
 * Потрібно, бо маска перемальовує поле цілком, а браузер після заміни значення
 * кидає курсор у кінець — і виправити цифру посеред номера ставало неможливо.
 * Рахуємо не позицію в рядку, а саме цифри: розділювачі ж наші, вони зсуваються.
 */
function caretAfterDigits(formatted: string, count: number) {
  if (count <= 0) return formatted.length
  let seen = 0
  // Перші три символи — «+38», його цифри до номера не належать.
  for (let i = 3; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++
      if (seen === count) return i + 1
    }
  }
  return formatted.length
}

export function ConsultationForm({ dark = false }: { dark?: boolean } = {}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hint, setHint] = useState('')
  const phoneRef = useRef<HTMLInputElement>(null)
  /** Куди повернути курсор після того, як маска перемалює поле. */
  const caret = useRef<number | null>(null)
  const [website, setWebsite] = useState('') // пастка для ботів, людина її не бачить
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const { close } = useConsultationModal()

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

  // Повертаємо курсор після перемальовування — саме тут, а не в обробнику:
  // на момент обробника поле ще показує старе значення.
  useLayoutEffect(() => {
    if (caret.current === null || !phoneRef.current) return
    phoneRef.current.setSelectionRange(caret.current, caret.current)
    caret.current = null
  }, [phone])

  const changePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const before = phoneDigits(raw.slice(0, e.target.selectionStart ?? raw.length)).length
    const next = formatPhone(raw)
    caret.current = caretAfterDigits(next, before)
    setPhone(next)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === 'sending') return

    // Маска не дає ввести зайвого, але дозволяє зупинитись на пів номера.
    if (name.trim().length < 2) return setHint("Напишіть, будь ласка, ім'я")
    if (phoneDigits(phone).length < PHONE_DIGITS) return setHint('Номер неповний — потрібно 10 цифр після +38')
    setHint('')

    // Без налаштованого приймача заявку нікуди слати. Показуємо помилку з
    // телефоном, а не «дякуємо»: хибне підтвердження коштує втраченого клієнта.
    if (!endpoint) {
      setState('error')
      return
    }

    setState('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // title — щоб у заявці стояла назва сторінки, а не шлях: менеджер читає
        // «Газони», а не «/services/ozelenennia/gazon».
        body: JSON.stringify({ name, phone, website, page: window.location.pathname, title: document.title }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  const heading = dark ? 'text-cream' : 'text-ink'
  const desc = dark ? 'text-cream/75' : 'text-stone'
  const label = dark ? 'text-cream/70' : 'text-stone'

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center text-center animate-fade-up">
        {/* Галочка промальовується, а не зʼявляється: це та мить, коли людина
            щойно віддала свій номер і чекає підтвердження, що її почули. */}
        <svg viewBox="0 0 52 52" className={`w-16 h-16 mb-5 ${dark ? 'text-cream' : 'text-green'}`} aria-hidden="true">
          <circle
            cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2"
            opacity="0.3" className="animate-ring-draw"
          />
          <path
            d="M15 26.5 L22.5 34 L37 18.5" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw"
          />
        </svg>

        <h3 className={`font-display font-bold text-[26px] md:text-[30px] mb-2 ${heading}`}>Дякуємо!</h3>

        {/* Показуємо номер, який людина ввела: якщо в ньому одруківка, це
            єдина мить, коли її ще можна помітити й надіслати заново. */}
        <p className={`text-[15px] font-sans leading-[1.6] mb-6 ${desc}`}>
          Заявку прийнято. Зателефонуємо на{' '}
          <span className={`font-semibold whitespace-nowrap ${heading}`}>{phone}</span>
        </p>

        <div className={`flex items-start gap-2.5 rounded-lg px-4 py-3 mb-6 w-full max-w-100 ${dark ? 'bg-white/10' : 'bg-parchment'}`}>
          <IcoClock className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-cream/70' : 'text-stone'}`} />
          <p className={`text-[13px] font-sans leading-[1.55] text-left ${desc}`}>
            Менеджер зв'яжеться протягом 30 хвилин у робочий час: Пн–Пт 9:00–18:00, Сб 10:00–15:00
          </p>
        </div>

        <p className={`text-[13px] font-sans ${desc}`}>
          Не хочете чекати?{' '}
          <a href="tel:+380976952473" className={`font-semibold underline whitespace-nowrap ${heading}`}>
            +38 (097) 695-24-73
          </a>
        </p>
      </div>
    )
  }

  return (
    <>
      <Eyebrow dark={dark} center className="mb-3">Зв'язатись</Eyebrow>
      <h3 className={`font-display font-bold text-[24px] md:text-[32px] leading-tight mb-2 text-center ${heading}`}>
        Залиште заявку
      </h3>
      <p className={`text-[13px] font-sans mb-8 text-center ${desc}`}>Менеджер зв'яжеться з вами протягом 30 хвилин у робочий час.</p>

      <form onSubmit={submit} className="relative flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          <div>
            <label className={`text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 ${label}`}>Ваше ім'я</label>
            <input type="text" value={name} onChange={(e) => setName(cleanName(e.target.value))} placeholder="Олена Петрівна" required maxLength={NAME_MAX}
              className="w-full bg-parchment border border-[#d9d6d0] rounded-lg px-4 py-3 text-[14px] font-sans text-ink placeholder:text-stone/60 focus:outline-none focus:border-green focus:ring-2 focus:ring-green/30 transition-colors" />
          </div>
          <div>
            <label className={`text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 ${label}`}>Телефон</label>
            <input ref={phoneRef} type="tel" value={phone} onChange={changePhone} placeholder="+38 (0XX) XXX-XX-XX" required inputMode="numeric" maxLength={PHONE_MAX}
              className="w-full bg-parchment border border-[#d9d6d0] rounded-lg px-4 py-3 text-[14px] font-sans text-ink placeholder:text-stone/60 focus:outline-none focus:border-green focus:ring-2 focus:ring-green/30 transition-colors" />
          </div>
        </div>

        {/* Поле-пастка: приховане від людини, боти заповнюють майже завжди */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="absolute left-[-9999px] w-px h-px opacity-0"
        />

        {hint && state !== 'error' && (
          <p role="alert" className={`text-[13px] font-sans leading-[1.6] ${dark ? 'text-cream' : 'text-terra'}`}>
            {hint}
          </p>
        )}

        {state === 'error' && (
          <p role="alert" className={`text-[13px] font-sans leading-[1.6] ${dark ? 'text-cream' : 'text-terra'}`}>
            Не вдалося надіслати заявку. Зателефонуйте, будь ласка:{' '}
            <a href="tel:+380976952473" className="underline font-semibold">+38 (097) 695-24-73</a>
          </p>
        )}

        <button
          type="submit"
          disabled={state === 'sending'}
          className="bg-terra text-white font-display font-semibold text-[14px] px-8 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
        >
          {state === 'sending' ? 'Надсилаємо…' : 'Надіслати заявку'}
        </button>
        <p className={`text-[11px] font-sans ${dark ? 'text-cream/70' : 'text-stone'}`}>
          Натискаючи кнопку, ви погоджуєтесь із нашою{' '}
          <Link to="/privacy" onClick={close} className={`underline transition-colors ${dark ? 'hover:text-cream' : 'hover:text-ink'}`}>політикою конфіденційності</Link>
        </p>
      </form>
    </>
  )
}
