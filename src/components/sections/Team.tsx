import { Reveal, Eyebrow, TEAM } from '../../shared'

export function Team() {
  return (
    <section className="py-24 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">Команда</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">Люди за вашим садом</h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {TEAM.map((m, i) => (
            <Reveal key={i} delay={(i % 6) * 60}>
              <div className="text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-4 bg-green ring-2 ring-[#d9d6d0] group-hover:ring-green transition-all duration-300">
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="font-display font-semibold text-ink text-[13px] mb-0.5">{m.name}</p>
                <p className="text-stone text-[11px] font-sans leading-snug">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}