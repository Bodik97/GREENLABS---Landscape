import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { NAV } from '../../data/data'
import { IcoClose, IcoMenu, IcoPin } from '../ui/Icons'
import { useConsultationModal } from '../ui/ConsultationModalContext'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { open: openConsultation } = useConsultationModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Поки меню відкрите, сторінка під ним не має прокручуватись: інакше палець
  // тягне фон, а не список, і закрити меню стає незручно.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const textCls = scrolled ? 'text-ink' : 'text-white'

  /**
   * Білий текст меню на напівпрозорій панелі.
   *
   * Обводки немає — вона роздувала літери. Замість неї мʼяка темна тінь: та
   * сама логіка, що вже працює в тексті на банері героя. Тінь не світиться,
   * лише підкладає темний ореол, тож напис тримається і на світлому кадрі.
   */
  const onGlass = {
    textShadow:
      '0 1px 2px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.8), 0 0 18px rgba(0,0,0,0.6)',
  } as const

  return (
    <>
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-100/80 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.07)]' : 'bg-black/15 backdrop-blur-sm'}`}>
      {/* Світла хвиля під логотипом. На фото героя темно-зелений знак зливався
          з листям і читався лише випадково. Плашка тримає його видимим завжди,
          а при скролі зникає — там шапка вже й так світла. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 h-full flex transition-opacity duration-300 ${
          scrolled ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {/* Рівна частина росте разом із бічним полем контейнера: на широких
            екранах max-w-7xl центрується, і логотип відʼїжджає від краю
            рівно на половину різниці. Без цього на 1920px він опинявся поза
            плашкою. Хвіст хвилі фіксований, щоб форма не розтягувалась. */}
        {/* Хвіст хвилі коротший на вузьких екранах: там навігація починається
            майже одразу за логотипом, і довга полога дуга налазила на «Головна».
            Повний розмах вмикається лише з lg, де місця вистачає. */}
        <div className="h-full bg-white/78 w-24 md:w-27 lg:w-30 xl:w-[calc((100vw-min(100vw,80rem))/2+130px)]" />
        <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="h-full w-13 lg:w-22.5 xl:w-42.5 shrink-0">
          <path d="M0 0 H200 C150 12 128 44 84 61 C56 72 32 76 0 80 Z" fill="#fff" fillOpacity="0.78" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={`${import.meta.env.BASE_URL}logo/logo-v2.webp`} alt="GREENLABS" className="h-10 md:h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
          {NAV.map((n) => (
            <NavLink
              key={n.label}
              to={n.href}
              end={n.href === '/'}
              className={({ isActive }) =>
                `relative text-[13px] font-medium font-sans tracking-wide transition-colors hover:opacity-60 ${textCls} ${
                  isActive ? 'after:absolute after:-bottom-1.5 after:inset-x-0 after:h-0.5 after:rounded-full after:bg-terra' : ''
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5 shrink-0 ml-auto">
          {/* На планшеті номер прибираємо: разом із пʼятьма пунктами меню він
              не вміщався, і «Про нас» ламалось на два рядки. Подзвонити звідти
              все одно можна — знизу закріплена кнопка «Зателефонувати». */}
          <a
            href="tel:+380976952473"
            className={`hidden lg:inline text-[13px] font-sans font-medium transition-colors hover:opacity-60 ${textCls}`}
          >
            +38 (097) 695-24-73
          </a>
          <button type="button" onClick={openConsultation} className="bg-terra text-white text-[13px] font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200">
            Консультація
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden ml-auto active:scale-90 transition-transform duration-150 ${textCls}`} aria-label="Меню">
          {open ? <IcoClose /> : <IcoMenu />}
        </button>
      </div>
    </header>

      {/* Панель лежить поза <header> навмисно: backdrop-blur на шапці створює
          контекст для position: fixed, і всередині неї панель прилипала б до
          шапки замість екрана. Висота — за вмістом, фон той самий, що в шапки:
          сторінка має проглядати, тому тримаємось на розмитті, а не на заливці.
          Читабельність дає біла обводка тексту, не фон.
          z-51 — щоб кнопка чату не лізла поверх меню. */}
      {open && (
        <div
          className="md:hidden fixed inset-x-0 top-16 z-51 px-6 py-6 bg-black/15 backdrop-blur-sm
                     flex flex-col animate-drawer-in overflow-y-auto overscroll-contain
                     max-h-[calc(100dvh-5rem)] rounded-b-2xl shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
        >
          {NAV.map((n, i) => (
            <NavLink
              key={n.label}
              to={n.href}
              end={n.href === '/'}
              onClick={() => setOpen(false)}
              // 48px висоти — мінімум під палець; пункти проявляються сходинкою.
              // Роздільників немає: на прозорому фоні вони читались як сміття,
              // а простору між рядками для розділення вистачає.
              style={{ animationDelay: `${60 + i * 45}ms`, ...onGlass }}
              // Набір той самий, що в меню на десктопі — font-sans, medium,
              // tracking-wide. Відрізняється лише кегль під палець.
              className={({ isActive }) =>
                `animate-fade-up flex items-center gap-2 min-h-12 text-[18px] leading-normal font-sans tracking-wide ${
                  isActive ? 'text-terra font-semibold' : 'text-white font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  {/* Шпилька біля поточного пункту: колір на прозорому фоні
                      читається не завжди, а мітка «ви тут» — завжди. */}
                  {isActive && <IcoPin className="w-4 h-4 shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
          <div
            className="animate-fade-up pt-4 mt-2 flex flex-col gap-3"
            style={{ animationDelay: `${60 + NAV.length * 45}ms` }}
          >
            {/* Номер лишаємо прямим: цифри в курсиві читаються гірше, а тут
                важлива саме швидкість розпізнавання. */}
            <a
              href="tel:+380976952473"
              style={onGlass}
              className="flex items-center min-h-12 text-white/90 text-[16px] leading-normal font-sans font-medium"
            >
              +38 (097) 695-24-73
            </a>
            <button
              type="button"
              onClick={() => { setOpen(false); openConsultation() }}
              className="bg-terra text-white text-center text-[16px] font-display font-semibold px-5 py-4 rounded-lg active:scale-95 transition-transform duration-150"
            >
              Отримати консультацію
            </button>
          </div>
        </div>
      )}
    </>
  )
}