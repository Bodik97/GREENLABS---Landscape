import { Reveal } from '../ui/Reveal'
import { SectionGlow } from '../ui/SectionGlow'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoPhone, SvcDesign, IcoCheck, SvcPlant, IcoShield } from '../ui/Icons'
import { PROCESS } from '../../data/data'

const PROCESS_ICONS = [IcoPhone, SvcDesign, IcoCheck, SvcPlant, IcoShield]

export function Process() {
  return (
    <section className="section-curve overflow-hidden py-24 bg-parchment">
      <SectionGlow />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">Процес</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">
            Прозорий процес від ідеї до саду
          </h2>
        </Reveal>

        <div className="hidden md:block relative">
          <div className="absolute top-8 left-[8%] right-[8%] h-px bg-[#d9d6d0]" />
          <div className="grid grid-cols-5 gap-4">
            {PROCESS.map((s, i) => {
              const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length]
              return (
                <Reveal key={i} delay={i * 90}>
                  <div className="relative text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#d9d6d0] bg-parchment flex items-center justify-center z-10 mb-5 text-terra transition-transform duration-300 hover:scale-110 hover:border-terra">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-display font-semibold text-stone tracking-wider mb-1">{s.n}</span>
                    <h3 className="font-display font-semibold text-ink text-[15px] mb-1.5">{s.title}</h3>
                    <p className="text-stone text-[12px] font-sans leading-[1.55] mb-2">{s.desc}</p>
                    <span className="text-[11px] font-display font-semibold text-terra">{s.dur}</span>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>

        <div className="md:hidden flex flex-col">
          {PROCESS.map((s, i) => {
            const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length]
            return (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d9d6d0] bg-parchment flex items-center justify-center shrink-0 text-terra">
                    <Icon className="w-5 h-5" />
                  </div>
                  {i < PROCESS.length - 1 && <div className="w-px flex-1 bg-[#d9d6d0] my-1" />}
                </div>
                <div className="pb-8">
                  <span className="text-[10px] font-display font-semibold text-stone tracking-wider">{s.n}</span>
                  <h3 className="font-display font-semibold text-ink text-[15px] mb-1">{s.title}</h3>
                  <p className="text-stone text-[12px] font-sans leading-snug mb-1">{s.desc}</p>
                  <span className="text-[11px] font-display font-semibold text-terra">{s.dur}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}