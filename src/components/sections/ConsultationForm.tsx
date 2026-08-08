import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eyebrow } from '../ui/Eyebrow'
import { useConsultationModal } from '../ui/ConsultationModalContext'

const NAME_MAX = 60
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

export function ConsultationForm({ dark = false }: { dark?: boolean } = {}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [hint, setHint] = useState('')
  const [website, setWebsite] = useState('') // пастка для ботів, людина її не бачить
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const { close } = useConsultationModal()

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

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
      <div className="flex flex-col gap-4 items-center text-center animate-fade-up">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl animate-pop-in ${dark ? 'bg-white/15 text-cream' : 'bg-green/10 text-green'}`}>✓</div>
        <h3 className={`font-display font-bold text-[24px] ${heading}`}>Дякуємо!</h3>
        <p className={`text-[14px] font-sans leading-[1.65] max-w-105 ${desc}`}>Вашу заявку прийнято. Менеджер зв'яжеться з вами протягом 30 хвилин у робочий час.</p>
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
            <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+38 (0XX) XXX-XX-XX" required inputMode="numeric"
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
