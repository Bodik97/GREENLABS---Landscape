import { Link } from 'react-router-dom'
import { SectionWave } from '../ui/SectionWave'
import {
  Reveal,
  IcoArrow,
  Eyebrow,
  SvcDesign,
  SvcPlant,
  SvcLawn,
  SvcWater,
  SvcLight,
  SvcPond,
  SvcCare,
  SvcPave,
} from '../../shared'
import { PriceTag } from '../ui/PriceTag'
import { useSanity, imageUrl, SERVICES_QUERY, type ServiceCard } from '../../lib/sanity'

/**
 * Іконка привʼязана до адреси послуги, а не до її позиції в списку.
 *
 * Раніше бралась за індексом — і варто було переставити порядок у студії,
 * як освітлення отримувало фонтан, а водойми ножиці.
 */
const SERVICE_ICONS: Record<string, typeof SvcDesign> = {
  proektuvannya: SvcDesign,
  ozelenennya: SvcPlant,
  gazon: SvcLawn,
  polyv: SvcWater,
  moshchennya: SvcPave,
  osvitlennya: SvcLight,
  vodoymy: SvcPond,
  sezonne: SvcCare,
}

/** Картки тягнемо з Sanity, щоб назви й описи не розходились із розділом «Послуги». */
export function Services({ above }: { above?: string } = {}) {
  const { data: services } = useSanity<ServiceCard[]>(SERVICES_QUERY)

  return (
    <section id="services" className="relative py-24 bg-green">
      <SectionWave shape="crest" className="text-green" above={above} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow dark className="mb-3">Послуги</Eyebrow>
          <h2 className="font-display font-bold text-cream text-[32px] md:text-[48px] leading-[1.08] max-w-110">
            Повний цикл ландшафтних робіт
          </h2>
        </Reveal>

        {/* Поки дані вантажаться — тримаємо висоту, щоб сторінка не стрибала */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 min-h-100">
          {services?.map((s, i) => {
            const Icon = SERVICE_ICONS[s.slug] ?? SvcDesign
            return (
              <Reveal key={s._id} delay={(i % 4) * 70} className="h-full">
                <Link
                  to={`/services/${s.slug}`}
                  className="bg-cream rounded-2xl overflow-hidden group hover:shadow-[0_4px_28px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="aspect-video overflow-hidden relative">
                    {s.image?.asset && (
                      <img
                        src={imageUrl(s.image, 640, 360)}
                        alt={s.image.alt || s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute bottom-3 left-3 w-11 h-11 rounded-full bg-cream/95 backdrop-blur-sm flex items-center justify-center text-green shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-ink text-[15px] leading-snug mb-2">{s.title}</h3>
                    <p className="text-stone text-[12px] font-sans leading-[1.65] mb-3">{s.short}</p>
                    <PriceTag price={s.price} className="mb-4" />
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 border-2 border-terra text-terra rounded-full px-4 py-2 text-[12px] font-display font-semibold group-hover:bg-terra group-hover:text-white group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_20px_rgba(196,106,63,0.35)] transition-all duration-300">
                        Детальніше
                        <IcoArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10 text-center">
          <Link to="/services" className="inline-flex items-center gap-2 text-[#E8A87C] font-display font-semibold text-[14px] hover:text-cream transition-colors">
            Всі послуги та карта робіт <IcoArrow className="w-4 h-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}