import React, { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IcoClock } from '../ui/Icons'
import { FieldHint } from '../ui/FieldHint'
import { CAREERS_CONTACTS } from '../../data/careers'
import type { Vacancy } from '../../lib/sanity'
import {
  NAME_MAX,
  PHONE_DIGITS,
  MSG,
  NAME_FORBIDDEN,
  PHONE_FORBIDDEN,
  cleanName,
  isOperatorPrefix,
  phoneDigits,
  formatPhone,
  caretAfterDigits,
} from '../../lib/phone'

/** Скільки символів приймаємо в розповіді про себе. Довше — то вже резюме. */
const COMMENT_MAX = 500

/** Значення для тих, хто не знайшов себе в списку. */
export const OTHER_POSITION = 'other'

/** Людська назва посади — іде в телеграм і в таблицю. */
export const positionLabel = (vacancies: Vacancy[], slug: string) =>
  vacancies.find((v) => v.slug === slug)?.title ?? 'Інша посада'

/**
 * Форма відгуку на вакансію.
 *
 * Три поля обовʼязкові, четверте — ні. Це навмисно: людина в робочому одязі
 * заповнює її з телефона, і кожне зайве поле тут коштує відгуку. Усе інше
 * запитає менеджер, коли передзвонить.
 *
 * Посадою керує сторінка, а не форма: кнопки «Відгукнутись» біля кожної
 * вакансії підставляють її сюди й прокручують екран до форми.
 */
export function VacancyForm({
  vacancies,
  position,
  onPositionChange,
}: {
  vacancies: Vacancy[]
  position: string
  onPositionChange: (value: string) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [nameHint, setNameHint] = useState('')
  const [phoneHint, setPhoneHint] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  /** Куди повернути курсор після того, як маска перемалює поле. */
  const caret = useRef<number | null>(null)
  const [website, setWebsite] = useState('') // пастка для ботів, людина її не бачить
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [errorLead, setErrorLead] = useState(MSG.failed)

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

  // Повертаємо курсор після перемальовування — саме тут, а не в обробнику:
  // на момент обробника поле ще показує старе значення.
  useLayoutEffect(() => {
    if (caret.current === null || !phoneRef.current) return
    phoneRef.current.setSelectionRange(caret.current, caret.current)
    caret.current = null
  }, [phone])

  const clearSendError = () => state === 'error' && setState('idle')

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearSendError()
    const raw = e.target.value
    if (NAME_FORBIDDEN.test(raw)) setNameHint(MSG.nameChars)
    else if (raw.length > NAME_MAX) setNameHint(MSG.nameLong)
    else setNameHint('')
    setName(cleanName(raw))
  }

  /** Backspace, коли перед курсором роздільник маски, — див. lib/phone.ts. */
  const keyDownPhone = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    if (e.key !== 'Backspace' || el.selectionStart !== el.selectionEnd) return

    const start = el.selectionStart ?? 0
    let i = start - 1
    while (i >= 0 && !/\d/.test(el.value[i])) i--
    if (i < 3) return
    if (i === start - 1) return

    e.preventDefault()
    const digitsBefore = phoneDigits(el.value.slice(0, i)).length
    const next = formatPhone(el.value.slice(0, i) + el.value.slice(i + 1))
    caret.current = caretAfterDigits(next, digitsBefore)
    setPhone(next)
  }

  const changePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearSendError()
    const raw = e.target.value
    const digits = phoneDigits(raw)

    const typedForward = digits.length > phoneDigits(phone).length
    if (typedForward && digits.length <= 3 && !isOperatorPrefix(digits)) {
      setPhoneHint(MSG.phoneOperator)
      caret.current = phone.length
      setPhone(phone)
      return
    }

    if (PHONE_FORBIDDEN.test(raw)) setPhoneHint(MSG.phoneChars)
    else if (!isOperatorPrefix(digits)) setPhoneHint(MSG.phoneOperator)
    else setPhoneHint('')

    const before = phoneDigits(raw.slice(0, e.target.selectionStart ?? raw.length)).length
    const next = formatPhone(raw)
    caret.current = caretAfterDigits(next, before)
    setPhone(next)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state === 'sending') return

    const badName = name.trim().length < 2 ? MSG.nameEmpty : ''
    const digits = phoneDigits(phone)
    const badPhone = !isOperatorPrefix(digits)
      ? MSG.phoneOperator
      : digits.length < PHONE_DIGITS
        ? MSG.phoneShort
        : ''
    setNameHint(badName)
    setPhoneHint(badPhone)
    // Курсор у перше поле з помилкою. На телефоні підказка часто лишається за
    // краєм екрана, і людина бачить лише те, що кнопка «не працює».
    if (badName || badPhone) {
      ;(badName ? nameRef : phoneRef).current?.focus()
      return
    }

    if (!endpoint) {
      setState('error')
      return
    }

    setState('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'vacancy',
          name,
          phone,
          position: positionLabel(vacancies, position),
          comment,
          website,
          page: window.location.pathname,
          title: document.title,
        }),
      })
      if (res.ok) {
        setState('done')
        return
      }

      const { error } = await res.json().catch(() => ({ error: '' }))
      if (error === 'bad_phone') {
        setPhoneHint(MSG.phoneOperator)
        setState('idle')
        return
      }
      if (error === 'bad_name') {
        setNameHint(MSG.nameChars)
        setState('idle')
        return
      }
      setErrorLead(error === 'rate_limited' ? MSG.rateLimited : MSG.failed)
      setState('error')
    } catch {
      setErrorLead(MSG.failed)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute inset-[-14px] rounded-full blur-xl animate-done-glow bg-green/15" aria-hidden="true" />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center animate-done-glow bg-green/10">
            <svg viewBox="0 0 52 52" className="w-14 h-14 text-green" aria-hidden="true">
              <circle
                cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2"
                opacity="0.35" className="animate-ring-draw"
              />
              <path
                d="M15 26.5 L22.5 34 L37 18.5" fill="none" stroke="currentColor"
                strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw"
              />
            </svg>
          </div>
        </div>

        <h3
          className="font-display font-bold text-[28px] md:text-[34px] leading-tight mb-2 text-ink animate-done-in"
          style={{ animationDelay: '550ms' }}
        >
          Дякуємо, {name.split(' ')[0]}!
        </h3>

        <p
          className="text-[15px] font-sans leading-[1.6] mb-6 text-stone animate-done-in"
          style={{ animationDelay: '650ms' }}
        >
          Відгук на посаду «<span className="font-semibold text-ink">{positionLabel(vacancies, position)}</span>» прийнято.
          <br />
          Зателефонуємо на <span className="font-semibold text-ink whitespace-nowrap">{phone}</span>
        </p>

        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 w-full max-w-100 bg-parchment border border-[#e3ded4] animate-done-in"
          style={{ animationDelay: '750ms' }}
        >
          <IcoClock className="w-4 h-4 shrink-0 mt-0.5 text-green" />
          <p className="text-[13px] font-sans leading-[1.55] text-left text-stone">
            Відповідаємо <span className="font-semibold text-ink">протягом одного робочого дня</span>. Якщо не
            підійдете — теж скажемо, мовчки заявки не залишаємо.
          </p>
        </div>

        <p className="text-[13px] font-sans text-stone animate-done-in" style={{ animationDelay: '850ms' }}>
          Не хочете чекати?{' '}
          <a
            href={CAREERS_CONTACTS.phoneHref}
            className="font-semibold underline underline-offset-2 whitespace-nowrap text-terra hover:text-[#b35c34] transition-colors"
          >
            {CAREERS_CONTACTS.phone}
          </a>
        </p>
      </div>
    )
  }

  const fieldBase =
    'w-full bg-parchment border rounded-lg px-4 py-3 text-[14px] font-sans text-ink placeholder:text-stone/60 focus:outline-none focus:ring-2 transition-colors'
  const fieldOk = 'border-[#d9d6d0] focus:border-green focus:ring-green/30'
  const fieldBad = 'border-terra focus:border-terra focus:ring-terra/30'

  return (
    <form onSubmit={submit} noValidate className="relative flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="vacancy-name" className="text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 text-stone">
            Ваше ім'я
          </label>
          <input
            ref={nameRef} id="vacancy-name" type="text" value={name} onChange={changeName} placeholder="Андрій"
            required maxLength={NAME_MAX} autoComplete="name"
            aria-invalid={!!nameHint} aria-describedby={nameHint ? 'vacancy-name-hint' : undefined}
            className={`${fieldBase} ${nameHint ? fieldBad : fieldOk}`}
          />
          {nameHint && <FieldHint id="vacancy-name-hint">{nameHint}</FieldHint>}
        </div>

        <div>
          <label htmlFor="vacancy-phone" className="text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 text-stone">
            Телефон
          </label>
          <input
            ref={phoneRef} id="vacancy-phone" type="tel" value={phone} onChange={changePhone} onKeyDown={keyDownPhone}
            placeholder="+38 (0XX) XXX-XX-XX" required inputMode="numeric" autoComplete="tel"
            aria-invalid={!!phoneHint} aria-describedby={phoneHint ? 'vacancy-phone-hint' : undefined}
            className={`${fieldBase} ${phoneHint ? fieldBad : fieldOk}`}
          />
          {phoneHint && <FieldHint id="vacancy-phone-hint">{phoneHint}</FieldHint>}
        </div>

        <div>
          <label htmlFor="vacancy-position" className="text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 text-stone">
            Бажана посада
          </label>
          {/* appearance-none + власна стрілка: рідна стрілка Safari на iOS
              малюється поверх рамки й ламає вигляд поля. */}
          <div className="relative">
            <select
              id="vacancy-position"
              value={position}
              onChange={(e) => onPositionChange(e.target.value)}
              className={`${fieldBase} ${fieldOk} appearance-none pr-10 cursor-pointer`}
            >
              {vacancies.map((v) => (
                <option key={v.slug} value={v.slug}>{v.title}</option>
              ))}
              <option value={OTHER_POSITION}>Інша посада</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone" aria-hidden="true">
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none">
                <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="vacancy-comment" className="text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 text-stone">
            Досвід або коментар <span className="normal-case tracking-normal font-normal text-stone/70">— за бажанням</span>
          </label>
          <textarea
            id="vacancy-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
            rows={3}
            maxLength={COMMENT_MAX}
            placeholder="Де працювали раніше, що вмієте, коли готові почати"
            className={`${fieldBase} ${fieldOk} resize-y min-h-24`}
          />
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

      {state === 'error' && (
        <p role="alert" className="text-[13px] font-sans leading-[1.6] text-terra">
          {errorLead}{' '}
          <a href={CAREERS_CONTACTS.phoneHref} className="underline font-semibold">{CAREERS_CONTACTS.phone}</a>
        </p>
      )}

      {/* Найчастіше заперечення робітника — «навіщо вам мій номер». Відповідь
          має стояти там, де воно виникає: просто над кнопкою. */}
      <p className="text-stone text-[12px] font-sans leading-[1.55] -mb-2">
        Номер потрібен лише щоб передзвонити. Нікуди не передаємо й у розсилки не додаємо.
      </p>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="bg-terra text-white font-display font-semibold text-[14px] px-8 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
      >
        {state === 'sending' ? 'Надсилаємо…' : 'Надіслати відгук'}
      </button>

      <p className="text-[13px] font-sans text-stone text-center -mt-2">
        Не любите форми?{' '}
        <a
          href={CAREERS_CONTACTS.phoneHref}
          className="font-semibold text-terra underline underline-offset-2 whitespace-nowrap hover:text-[#b35c34] transition-colors"
        >
          Зателефонуйте: {CAREERS_CONTACTS.phone}
        </a>
      </p>

      <p className="text-[11px] font-sans text-stone">
        Натискаючи кнопку, ви погоджуєтесь із нашою{' '}
        <Link to="/privacy" className="underline hover:text-ink transition-colors">політикою конфіденційності</Link>
      </p>
    </form>
  )
}
