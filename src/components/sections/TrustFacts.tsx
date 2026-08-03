import { Reveal } from '../ui/Reveal'
import { SectionWave } from '../ui/SectionWave'
import { CountUp } from '../ui/CountUp'
import { TRUST_FACTS } from '../../data/data'

/** Смуга фактів одразу під банером: відповідає на «а хто ви такі» до того, як почнеться продаж. */
export function TrustFacts() {
  return (
    <section className="relative bg-green py-10 md:py-12">
      <SectionWave shape="crest" className="text-green" />
      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {TRUST_FACTS.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 70} className="text-center lg:text-left">
            <p className="font-display font-bold text-cream text-[26px] md:text-[34px] leading-none mb-2">
              <CountUp value={fact.value} />
            </p>
            <p className="text-cream/60 text-[12px] md:text-[13px] font-sans leading-snug">{fact.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
