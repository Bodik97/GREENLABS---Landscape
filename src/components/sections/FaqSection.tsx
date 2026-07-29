import { useState } from 'react'
import { Reveal, IcoChevron, Eyebrow, FAQ, FaqSchema } from '../../shared'

export function FaqSection() {
  const [open, setOpen] = useState<number>(0)

  return (
    <section className="py-24 bg-cream">
      <FaqSchema items={FAQ} />
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14 mx-auto text-center">
          <Eyebrow center className="mb-3">FAQ</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-105 mx-auto">
            Часті запитання
          </h2>
        </Reveal>

        <Reveal className="max-w-200 mx-auto">
          {FAQ.map((item, i) => (
            <div key={i} className={`border-b border-[#d9d6d0] ${i === 0 ? 'border-t' : ''}`}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                className="w-full flex items-center justify-between gap-4 py-5 text-left group"
              >
                <span
                  className={`font-display font-semibold text-[14px] md:text-[15px] leading-snug transition-colors ${
                    open === i ? 'text-green' : 'text-ink group-hover:text-green'
                  }`}
                >
                  {item.q}
                </span>
                <span className={`shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}>
                  <IcoChevron className="w-5 h-5 text-stone" />
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${open === i ? 'max-h-64 pb-6' : 'max-h-0'}`}>
                <p className="text-stone text-[13px] font-sans leading-[1.72]">{item.a}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}