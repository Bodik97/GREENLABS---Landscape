import React, { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoClock } from '../ui/Icons'
import { useConsultationModal } from '../ui/ConsultationModalContext'

const NAME_MAX = 25
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

/** Символи, яких в імені не буває, — по них вирішуємо, чи скаржитись. */
const NAME_FORBIDDEN = /[^\p{L}\s'’-]/u
/** Те саме для телефону: цифри й розділювачі маски пропускаємо, решту ні. */
const PHONE_FORBIDDEN = /[^\d\s+()-]/

/**
 * Тексти підказок.
 *
 * Кожна каже дві речі: що не так і як правильно. «Неправильний формат» змушує
 * людину вгадувати, а вона в цю мить уже наполовину пішла.
 */
const MSG = {
  nameEmpty: "Напишіть ім'я — менеджер звертатиметься на ім'я",
  nameChars: "В імені лише літери. Наприклад: Олена Петрівна",
  nameLong: `Задовге ім'я — не більше ${NAME_MAX} символів`,
  phoneChars: 'У номері лише цифри. Наприклад: 067 123 45 67',
  phoneOperator:
    'Потрібен код українського оператора: 050, 063, 066, 067, 068, 073, 093, 095, 096, 097, 098, 099',
  phoneShort: 'Номер неповний — після +38 має бути 10 цифр. Наприклад: 067 123 45 67',
  rateLimited: 'З цієї адреси вже надійшло кілька заявок. Спробуйте за годину або зателефонуйте:',
  failed: 'Не вдалося надіслати заявку. Зателефонуйте, будь ласка:',
}

/**
 * Коди мобільних операторів України.
 *
 * Номер поза цим списком — не номер: до нього ніхто не додзвониться, а заявка
 * виглядає справжньою. Саме так у заявки потрапляло «+38 (000) 000-00-00».
 */
const OPERATOR_CODES = [
  '050', '066', '095', '099', // Vodafone
  '067', '068', '096', '097', '098', // Київстар
  '063', '073', '093', // lifecell
  '089', '091', '092', '094', // менші оператори
]

/** Чи може цей набір цифр іще стати справжнім кодом оператора. */
function isOperatorPrefix(digits: string) {
  if (!digits) return true
  const head = digits.slice(0, 3)
  return digits.length >= 3
    ? OPERATOR_CODES.includes(head)
    : OPERATOR_CODES.some((code) => code.startsWith(head))
}

/** Скільки цифр людина справді набрала, без коду країни. */
function phoneDigits(value: string) {
  const digits = value.replace(/^\+?38/, '').replace(/\D/g, '')
  // Набрали «67…» замість «067…» — дописуємо нуль. Інакше перша ж цифра
  // відхиляється як неправильний код, і людина втикається в глухий кут.
  if (digits && digits[0] !== '0' && isOperatorPrefix('0' + digits.slice(0, 2))) return '0' + digits
  return digits
}

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
  if (!formatted) return 0
  // Жодної цифри ліворуч — курсор стоїть перед першою, тобто одразу за «+38 (».
  // Кидати його в кінець тут не можна: саме так ламалось редагування коду
  // оператора, коли зі стертих трьох цифр не лишалось жодної.
  if (count <= 0) return Math.min(5, formatted.length)
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

/** Червоний рядок під полем. На темному тлі terra не читається — беремо світлий. */
function FieldHint({ id, dark, children }: { id: string; dark: boolean; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className={`text-[12px] font-sans leading-[1.5] mt-1.5 ${dark ? 'text-[#F0A882]' : 'text-terra'}`}>
      {children}
    </p>
  )
}

export function ConsultationForm({ dark = false, from = 'Форма на сторінці' }: { dark?: boolean; from?: string } = {}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  // Підказка окремо під кожним полем: спільна не показує, котре з двох
  // виправляти, а людина в цю мить дивиться саме на поле, а не на форму.
  const [nameHint, setNameHint] = useState('')
  const [phoneHint, setPhoneHint] = useState('')
  const phoneRef = useRef<HTMLInputElement>(null)
  /** Куди повернути курсор після того, як маска перемалює поле. */
  const caret = useRef<number | null>(null)
  const [website, setWebsite] = useState('') // пастка для ботів, людина її не бачить
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  /** Перше речення в помилці — далі йде телефон, він потрібен у будь-якому разі. */
  const [errorLead, setErrorLead] = useState(MSG.failed)
  const { close } = useConsultationModal()

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT

  // Повертаємо курсор після перемальовування — саме тут, а не в обробнику:
  // на момент обробника поле ще показує старе значення.
  useLayoutEffect(() => {
    if (caret.current === null || !phoneRef.current) return
    phoneRef.current.setSelectionRange(caret.current, caret.current)
    caret.current = null
  }, [phone])

  /** Людина взялась виправляти — стара помилка про надсилання вже неправда. */
  const clearSendError = () => state === 'error' && setState('idle')

  const changeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearSendError()
    const raw = e.target.value
    // Скаржимось на те, що прибрали, а не на те, що лишилось: інакше людина
    // бачить, як символ зникає, і не розуміє, чи поле взагалі працює.
    if (NAME_FORBIDDEN.test(raw)) setNameHint(MSG.nameChars)
    else if (raw.length > NAME_MAX) setNameHint(MSG.nameLong)
    else setNameHint('')
    setName(cleanName(raw))
  }

  /**
   * Backspace, коли перед курсором роздільник маски.
   *
   * Інакше стирався б сам роздільник, цифри лишались би ті самі, маска малювала
   * б той самий рядок — і клавіша просто нічого не робила. Тому перестрибуємо
   * дужки й дефіси і прибираємо найближчу цифру ліворуч.
   */
  const keyDownPhone = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    // Виділення браузер обробить сам, і він має рацію.
    if (e.key !== 'Backspace' || el.selectionStart !== el.selectionEnd) return

    const start = el.selectionStart ?? 0
    let i = start - 1
    while (i >= 0 && !/\d/.test(el.value[i])) i--
    // Перші три символи — «+38»: код країни дописуємо ми, стирати його нічого.
    if (i < 3) return
    if (i === start - 1) return // перед курсором і так цифра — хай працює як завжди

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

    // Набрати неправильний код із чистого поля не можна: відхиляємо натискання
    // одразу, на другій же цифрі. Але тільки поки цифр не більше трьох — далі
    // людина редагує вже набраний номер, і кожен проміжний стан там законно
    // неправильний. Стерши «097» у «+38 (097) 111-22-33», отримуємо код «111»
    // з решти цифр, і жорстка заборона не давала б набрати новий узагалі.
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

    // Маска не дає ввести зайвого, але дозволяє зупинитись на пів номера.
    const badName = name.trim().length < 2 ? MSG.nameEmpty : ''
    const digits = phoneDigits(phone)
    const badPhone = !isOperatorPrefix(digits)
      ? MSG.phoneOperator
      : digits.length < PHONE_DIGITS
        ? MSG.phoneShort
        : ''
    setNameHint(badName)
    setPhoneHint(badPhone)
    // Обидва поля перевіряємо разом: інакше людина виправляє ім'я, тисне
    // «надіслати» — і аж тоді дізнається, що з номером теж негаразд.
    if (badName || badPhone) return

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
        body: JSON.stringify({ name, phone, website, from, page: window.location.pathname, title: document.title }),
      })
      if (res.ok) {
        setState('done')
        return
      }

      // Worker знає, що саме не так, — раніше ця відповідь викидалась, і людина
      // бачила безадресне «не вдалося надіслати» замість причини.
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

  const heading = dark ? 'text-cream' : 'text-ink'
  const desc = dark ? 'text-cream/75' : 'text-stone'
  const label = dark ? 'text-cream/70' : 'text-stone'

  if (state === 'done') {
    return (
      <div className="flex flex-col items-center text-center">
        {/* Галочка промальовується, а не зʼявляється: це та мить, коли людина
            щойно віддала свій номер і чекає підтвердження, що її почули.
            Далі решта збирається по черзі — звідси затримки. */}
        <div className="relative mb-6">
          <div
            className={`absolute inset-[-14px] rounded-full blur-xl animate-done-glow ${dark ? 'bg-cream/20' : 'bg-green/15'}`}
            aria-hidden="true"
          />
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center animate-done-glow ${dark ? 'bg-cream/15' : 'bg-green/10'}`}>
            <svg viewBox="0 0 52 52" className={`w-14 h-14 ${dark ? 'text-cream' : 'text-green'}`} aria-hidden="true">
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
          className={`font-display font-bold text-[28px] md:text-[34px] leading-tight mb-2 animate-done-in ${heading}`}
          style={{ animationDelay: '550ms' }}
        >
          Дякуємо, {name.split(' ')[0]}!
        </h3>

        {/* Показуємо номер, який людина ввела: якщо в ньому одруківка, це
            єдина мить, коли її ще можна помітити й надіслати заново. */}
        <p
          className={`text-[15px] font-sans leading-[1.6] mb-6 animate-done-in ${desc}`}
          style={{ animationDelay: '650ms' }}
        >
          Заявку прийнято. Зателефонуємо на{' '}
          <span className={`font-semibold whitespace-nowrap ${heading}`}>{phone}</span>
        </p>

        <div
          className={`flex items-start gap-3 rounded-xl px-4 py-3.5 mb-5 w-full max-w-100 animate-done-in ${dark ? 'bg-white/10' : 'bg-parchment border border-[#e3ded4]'}`}
          style={{ animationDelay: '750ms' }}
        >
          <IcoClock className={`w-4 h-4 shrink-0 mt-0.5 ${dark ? 'text-cream/70' : 'text-green'}`} />
          <p className={`text-[13px] font-sans leading-[1.55] text-left ${desc}`}>
            Менеджер зв'яжеться <span className={`font-semibold ${heading}`}>протягом 30 хвилин</span> у робочий час
            <br />
            Пн–Пт 9:00–18:00 · Сб 10:00–15:00
          </p>
        </div>

        <p
          className={`text-[13px] font-sans animate-done-in ${desc}`}
          style={{ animationDelay: '850ms' }}
        >
          Не хочете чекати?{' '}
          <a
            href="tel:+380976952473"
            className={`font-semibold underline underline-offset-2 whitespace-nowrap transition-colors ${dark ? 'text-cream hover:text-white' : 'text-terra hover:text-[#b35c34]'}`}
          >
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

      {/* noValidate: інакше на порожньому полі браузер показує власну підказку
          своєю мовою і поверх усього, а наша — під полем і українською. */}
      <form onSubmit={submit} noValidate className="relative flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-4">
          <div>
            <label className={`text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 ${label}`}>Ваше ім'я</label>
            <input type="text" value={name} onChange={changeName} placeholder="Олена Петрівна" required maxLength={NAME_MAX}
              aria-invalid={!!nameHint} aria-describedby={nameHint ? 'name-hint' : undefined}
              className={`w-full bg-parchment border rounded-lg px-4 py-3 text-[14px] font-sans text-ink placeholder:text-stone/60 focus:outline-none focus:ring-2 transition-colors ${nameHint ? 'border-terra focus:border-terra focus:ring-terra/30' : 'border-[#d9d6d0] focus:border-green focus:ring-green/30'}`} />
            {nameHint && <FieldHint id="name-hint" dark={dark}>{nameHint}</FieldHint>}
          </div>
          <div>
            <label className={`text-[11px] font-display font-semibold uppercase tracking-wider block mb-1.5 ${label}`}>Телефон</label>
            {/* Без maxLength: повний номер має рівно стільки символів, скільки
                дозволяв би ліміт, і браузер переставав пускати ввід усередину
                готового номера. Довжину й так тримає маска — десять цифр. */}
            <input ref={phoneRef} type="tel" value={phone} onChange={changePhone} onKeyDown={keyDownPhone} placeholder="+38 (0XX) XXX-XX-XX" required inputMode="numeric"
              aria-invalid={!!phoneHint} aria-describedby={phoneHint ? 'phone-hint' : undefined}
              className={`w-full bg-parchment border rounded-lg px-4 py-3 text-[14px] font-sans text-ink placeholder:text-stone/60 focus:outline-none focus:ring-2 transition-colors ${phoneHint ? 'border-terra focus:border-terra focus:ring-terra/30' : 'border-[#d9d6d0] focus:border-green focus:ring-green/30'}`} />
            {phoneHint && <FieldHint id="phone-hint" dark={dark}>{phoneHint}</FieldHint>}
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
          <p role="alert" className={`text-[13px] font-sans leading-[1.6] ${dark ? 'text-cream' : 'text-terra'}`}>
            {errorLead}{' '}
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
