import { Reveal } from '../ui/Reveal'
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider'
import { IcoArrow } from '../ui/Icons'
import { Eyebrow } from '../ui/Eyebrow'

export function ExamplesSection({ eyebrow, title, note, items }: { eyebrow: string; title: string; note: string; items: { img: string; label: string }[] }) {
  return (
    <section className="py-24 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-4">
          <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-125">{title}</h2>
        </Reveal>
        <Reveal className="text-stone text-[13px] font-sans leading-[1.65] max-w-150 mb-12">{note}</Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i * 90}>
              <BeforeAfterSlider img={it.img} label={it.label} />
              <p className="text-ink text-[13px] font-display font-semibold mt-3">{it.label}</p>
              <p className="text-stone text-[11px] font-sans mt-0.5">Потягніть повзунок, щоб побачити ефект «до/після»</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <a href={`${import.meta.env.BASE_URL}#portfolio`} className="inline-flex items-center gap-2 text-terra font-display font-semibold text-[14px] hover:text-[#b35c34] transition-colors">
            Переглянути реальне портфоліо <IcoArrow className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}