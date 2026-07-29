import { Link } from 'react-router-dom'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoArrow } from '../ui/Icons'
import { imageUrl, type WorkCard } from '../../lib/sanity'

/** Сітка карток робіт — портфоліо на головній і «інші об'єкти» на сторінках. */
export function WorkCards({
  eyebrow,
  title,
  items,
  bg = 'bg-cream',
  id,
}: {
  eyebrow: string
  title: string
  items: WorkCard[]
  bg?: string
  id?: string
}) {
  if (!items.length) return null

  return (
    <section id={id} className={`py-24 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">{title}</h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((p, i) => (
            <Reveal key={p._id} delay={(i % 3) * 90}>
              <Link to={`/works/${p.slug}`} className="group block">
                <div className="rounded-2xl overflow-hidden bg-green aspect-4/3 mb-4">
                  <img
                    src={imageUrl(p.image, 800, 600)}
                    alt={p.image?.alt || p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <p className="text-ink text-[14px] font-display font-semibold leading-snug group-hover:text-green transition-colors">
                      {p.title}
                    </p>
                    <p className="text-stone text-[12px] font-sans mt-0.5">
                      {[p.location, p.area].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <IcoArrow className="w-4 h-4 text-stone mt-0.5 shrink-0 group-hover:text-green transition-colors" />
                </div>
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[11px] font-sans text-stone border border-[#d9d6d0] rounded-full px-3 py-1">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
