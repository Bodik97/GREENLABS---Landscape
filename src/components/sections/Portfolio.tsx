import { useRef } from 'react'
import { Reveal, IcoArrow, Eyebrow, PORTFOLIO } from '../../shared'

export function Portfolio({ bg = 'bg-cream' }: { bg?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section id="portfolio" className={`py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">Портфоліо</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">Наші роботи</h2>
        </Reveal>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {PORTFOLIO.map((p, i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <div className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden bg-green aspect-4/3 mb-4">
                  <img
                    src={p.img}
                    alt={p.loc}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <p className="text-ink text-[13px] font-display font-semibold">{p.loc}</p>
                    <p className="text-stone text-[12px] font-sans">{p.area}</p>
                  </div>
                  <IcoArrow className="w-4 h-4 text-stone mt-0.5 shrink-0 group-hover:text-green transition-colors" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-sans text-stone border border-[#d9d6d0] rounded-full px-3 py-1"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile scroll */}
        <div ref={scrollRef} className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {PORTFOLIO.map((p, i) => (
            <div key={i} className="shrink-0 w-68 snap-start">
              <div className="rounded-[14px] overflow-hidden bg-green aspect-4/3 mb-3">
                <img src={p.img} alt={p.loc} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <p className="text-ink text-[13px] font-display font-semibold mb-0.5">{p.loc}</p>
              <p className="text-stone text-[12px] font-sans mb-2">{p.area}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="text-[11px] text-stone border border-[#d9d6d0] rounded-full px-2.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}