import { Link } from 'react-router-dom'
import { SectionGlow } from '../ui/SectionGlow'
import { Reveal, IcoArrow } from '../../shared'

export function Segmentation() {
  const cards = [
    {
      to: '/private',
      img: `${import.meta.env.BASE_URL}img/segment-private.webp`,
      title: 'Приватна ділянка',
      desc: 'Сад вашої мрії біля заміського будинку або міської садиби. Від 3 до 100 соток.',
    },
    {
      to: '/commercial',
      img: `${import.meta.env.BASE_URL}img/segment-commercial.webp`,
      title: "Комерційний об'єкт",
      desc: 'Готелі, ресторани, офіси, ЖК-комплекси. Представницька зелень для вашого бізнесу.',
    },
  ]

  return (
    <section className="relative overflow-hidden py-24 bg-cream">
      <SectionGlow />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <Link
                to={c.to}
                className="group relative rounded-2xl overflow-hidden bg-green aspect-4/3 block transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={c.img}
                  alt={c.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/18 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10 flex items-end justify-between">
                  <div>
                    <h2 className="font-display font-bold text-white text-[22px] md:text-[32px] mb-2 leading-tight">
                      {c.title}
                    </h2>
                    <p className="text-white/72 text-[13px] md:text-[14px] font-sans leading-snug max-w-75">
                      {c.desc}
                    </p>
                  </div>
                  <div className="w-10 h-10 border border-white/45 rounded-full flex items-center justify-center shrink-0 ml-4 group-hover:bg-white/15 transition-colors">
                    <IcoArrow className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}