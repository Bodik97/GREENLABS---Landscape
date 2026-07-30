import { Reveal } from '../ui/Reveal'
import { SectionWave } from '../ui/SectionWave'
import { Eyebrow } from '../ui/Eyebrow'
import { useSanity, imageUrl, TEAM_QUERY, type Member } from '../../lib/sanity'

export function Team() {
  const { data: team } = useSanity<Member[]>(TEAM_QUERY)

  return (
    <section className="relative py-24 bg-parchment">
      <SectionWave shape="calm" className="text-parchment" />
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">Команда</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">Люди за вашим садом</h2>
        </Reveal>

        {/* Тримаємо висоту, поки дані вантажаться, щоб сторінка не стрибала */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 min-h-50">
          {team?.map((m, i) => (
            <Reveal key={m._id} delay={(i % 6) * 60}>
              <div className="text-center group">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mx-auto mb-4 bg-green ring-2 ring-[#d9d6d0] group-hover:ring-green transition-all duration-300">
                  {m.photo?.asset && (
                    <img
                      src={imageUrl(m.photo, 220, 220)}
                      alt={m.photo.alt || m.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
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
