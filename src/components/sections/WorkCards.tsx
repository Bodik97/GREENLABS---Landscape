import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoArrow, IcoEye } from '../ui/Icons'
import { imageUrl, type WorkCard } from '../../lib/sanity'

function Card({ work }: { work: WorkCard }) {
  return (
    <Link to={`/works/${work.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden bg-green aspect-4/3 mb-4">
        <img
          src={imageUrl(work.image, 800, 600)}
          alt={work.image?.alt || work.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Знак клікабельності — видимий завжди, бо на сенсорних екранах ховера немає.
            Око, а не стрілка: стрілка тут читалась як «гортати далі», бо такі самі
            кружечки гортають слайдер. */}
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-terra text-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition-all duration-200 group-hover:bg-[#b35c34] group-hover:scale-110"
        >
          <IcoEye className="w-5 h-5" />
        </span>
      </div>

      <p className="text-ink text-[14px] font-display font-semibold leading-snug group-hover:text-green transition-colors">
        {work.title}
      </p>
      <p className="text-stone text-[12px] font-sans mt-0.5 mb-2.5">
        {[work.location, work.area].filter(Boolean).join(' · ')}
      </p>

      {work.tags && work.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {work.tags.map((t) => (
            <span key={t} className="text-[11px] font-sans text-stone border border-[#d9d6d0] rounded-full px-3 py-1">
              {t}
            </span>
          ))}
        </div>
      )}

      <span className="inline-flex items-center gap-1.5 text-terra text-[12px] font-display font-semibold mt-3 group-hover:gap-2.5 transition-all">
        Переглянути проєкт
        <IcoArrow className="w-3.5 h-3.5" />
      </span>
    </Link>
  )
}

function NavButton({
  dir,
  onClick,
  disabled,
  top,
}: {
  dir: 'prev' | 'next'
  onClick: () => void
  disabled: boolean
  top: number | null
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Попередні роботи' : 'Наступні роботи'}
      style={top === null ? undefined : { top }}
      className={`absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-terra text-white shadow-[0_4px_16px_rgba(0,0,0,0.28)] flex items-center justify-center transition-all duration-200 enabled:hover:bg-[#b35c34] enabled:hover:scale-105 enabled:active:scale-95 disabled:bg-terra/35 disabled:shadow-none ${
        dir === 'prev' ? 'left-3 md:left-4' : 'right-3 md:right-4'
      }`}
    >
      <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d={dir === 'prev' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/** Один ряд карток, що гортається стрілками, колесом або пальцем. */
function CardsTrack({ items }: { items: WorkCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false, scrollable: false })
  // Стрілки центруємо по фото, а не по всій картці: інакше на телефоні, де картка
  // одна на весь екран, стрілка «далі» лягає рівно на кружечок-око під фото
  const [arrowTop, setArrowTop] = useState<number | null>(null)

  const sync = () => {
    const el = trackRef.current
    if (!el) return
    const img = el.querySelector('img')
    setArrowTop(img ? img.clientHeight / 2 : null)
    setEdges({
      start: el.scrollLeft < 8,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8,
      // Скільки карток у кадрі — залежить від брейкпоінта, тож наявність
      // стрілок рахуємо з фактичного переповнення, а не з кількості робіт
      scrollable: el.scrollWidth > el.clientWidth + 8,
    })
  }

  // Кількість карток у кадрі залежить від ширини екрана, тож межі
  // перераховуємо і після ресайзу, і після приходу даних
  useEffect(sync, [items.length])
  useEffect(() => {
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  // scroll-snap-type: mandatory глушить `behavior: 'smooth'` — миттєва
  // зміна scrollLeft працює, тож анімуємо її самі
  const step = (dir: 1 | -1) => {
    const el = trackRef.current
    const card = el?.firstElementChild as HTMLElement | null
    if (!el || !card) return

    const from = el.scrollLeft
    const to = Math.max(0, Math.min(from + dir * (card.clientWidth + 24), el.scrollWidth - el.clientWidth))

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.scrollLeft = to
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 380)
      el.scrollLeft = from + (to - from) * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="group"
        aria-label="Список робіт, гортається вбік"
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
      >
        {items.map((work) => (
          <div key={work._id} className="shrink-0 snap-start w-full md:w-[calc((100%-1.5rem)/2)]">
            <Card work={work} />
          </div>
        ))}
      </div>

      {edges.scrollable && (
        <>
          <NavButton dir="prev" onClick={() => step(-1)} disabled={edges.start} top={arrowTop} />
          <NavButton dir="next" onClick={() => step(1)} disabled={edges.end} top={arrowTop} />
        </>
      )}
    </div>
  )
}

/** Картки робіт: сіткою або одним рядом-слайдером, якщо їх багато. */
export function WorkCards({
  eyebrow,
  title,
  items,
  bg = 'bg-cream',
  id,
  slider = false,
}: {
  eyebrow: string
  title: string
  items: WorkCard[]
  bg?: string
  id?: string
  slider?: boolean
}) {
  if (!items.length) return null

  return (
    <section id={id} className={`py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">{title}</h2>
        </Reveal>

        {slider ? (
          <CardsTrack items={items} />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map((work, i) => (
              <Reveal key={work._id} delay={(i % 3) * 90}>
                <Card work={work} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
