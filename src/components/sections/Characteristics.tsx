import { Reveal } from '../ui/Reveal'
import { IcoCheck } from '../ui/Icons'
import { Eyebrow } from '../ui/Eyebrow'

export function Characteristics({ eyebrow = 'Характеристики', title, items }: { eyebrow?: string; title: string; items: string[] }) {
  return (
    <section className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-125">{title}</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((item, i) => (
            <Reveal key={item} delay={(i % 6) * 60}>
              <div className="flex items-start gap-3.5 bg-parchment rounded-2xl p-5">
                <span className="text-green mt-0.5 shrink-0"><IcoCheck className="w-5 h-5" /></span>
                <span className="text-ink text-[14px] font-sans leading-[1.55]">{item}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}