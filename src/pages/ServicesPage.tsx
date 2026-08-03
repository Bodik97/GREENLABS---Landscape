import { Link } from 'react-router-dom'
import {
  PageBanner,
  LeadForm,
  Process,
  Seo,
  Reveal,
  Eyebrow,
  IcoArrow,
  IcoCheck,
  TrustFacts,
  FaqSection,
  ServiceCta,
  PriceCalculator,
  hasCalculator,
  SERVICES_FAQ,
} from '../shared'
import { SectionWave } from '../components/ui/SectionWave'
import { PriceTag } from '../components/ui/PriceTag'
import { useSanity, imageUrl, SERVICES_QUERY, type ServiceCard } from '../lib/sanity'

const CRUMBS = [
  { name: 'Головна', path: '/' },
  { name: 'Послуги', path: '/services' },
]

function ServiceTile({ service, index }: { service: ServiceCard; index: number }) {
  return (
    <Reveal delay={(index % 3) * 80}>
      <Link
        to={`/services/${service.slug}`}
        className="bg-cream rounded-2xl overflow-hidden h-full flex flex-col group hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all duration-300"
      >
        {service.image?.asset && (
          <div className="aspect-4/3 overflow-hidden">
            <img
              src={imageUrl(service.image, 720, 540)}
              alt={service.image.alt || service.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-display font-semibold text-ink text-[17px] leading-snug">{service.title}</h2>
            <PriceTag price={service.price} className="shrink-0 mt-0.5" />
          </div>

          {service.short && <p className="text-stone text-[13px] font-sans leading-[1.65] mb-4">{service.short}</p>}

          {service.items && service.items.length > 0 && (
            <ul className="flex flex-col gap-1.5 mb-5">
              {service.items.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2 text-ink text-[12px] font-sans leading-snug">
                  <IcoCheck className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
              {service.items.length > 4 && (
                <li className="text-stone text-[12px] font-sans pl-5.5">і ще {service.items.length - 4}…</li>
              )}
            </ul>
          )}

          <span className="mt-auto inline-flex items-center gap-2 text-terra font-display font-semibold text-[13px]">
            Що входить і скільки коштує
            <IcoArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </Link>
    </Reveal>
  )
}

export default function ServicesPage() {
  const { data: services, loading } = useSanity<ServiceCard[]>(SERVICES_QUERY)

  // Калькулятор ховається сам, поки ціни не заповнені — тоді хвиля нижче бере колір сітки
  const withCalculator = hasCalculator(services ?? [])

  return (
    <>
      <Seo
        title="Послуги — ландшафтний дизайн, озеленення, догляд | GREENLABS"
        description="Повний цикл ландшафтних робіт у Львові та в радіусі 50 км: проєктування, озеленення, газон, полив, освітлення, мощення та регулярний догляд. Ціни, терміни й гарантія по кожній послузі."
        breadcrumbs={CRUMBS}
      />
      <PageBanner
        eyebrow="Послуги"
        title="Оберіть послугу — покажемо ціну, терміни й що саме входить"
        desc="Проєктування, реалізація та догляд в одній команді. Кожен розділ відкривається окремою сторінкою з вилкою цін і прикладами робіт."
        img={`${import.meta.env.BASE_URL}img/banner-services.webp`}
        breadcrumbs={CRUMBS}
      />

      <TrustFacts />

      <section className="relative py-24 bg-cream">
        <SectionWave shape="calm" className="text-cream" above="text-green" />

        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-14 max-w-160">
            <Eyebrow className="mb-3">Карта послуг</Eyebrow>
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] mb-4">
              З чого складається робота над ділянкою
            </h2>
            <p className="text-stone text-[14px] font-sans leading-[1.72]">
              Замовляти можна і весь цикл, і одну послугу окремо. Якщо роботи впливають одна на одну — скажемо про це
              до старту, щоб потім не розкопувати готове.
            </p>
          </Reveal>

          {loading ? (
            <div className="min-h-125" aria-hidden="true" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services?.map((service, i) => <ServiceTile key={service._id} service={service} index={i} />)}
            </div>
          )}
        </div>
      </section>

      <PriceCalculator services={services ?? []} above="text-cream" />
      <ServiceCta
        title="Точну суму назве менеджер — це швидше, ніж рахувати самому"
        desc="Розкажіть площу й що хочете отримати. За 5 хвилин розмови отримаєте вилку саме під вашу ділянку і зрозумієте, з чого почати."
        above={withCalculator ? 'text-parchment' : 'text-cream'}
      />
      <Process above="text-green" />
      <FaqSection above="text-parchment" items={SERVICES_FAQ} title="Питання, які ставлять перед замовленням" />
      <LeadForm above="text-cream" />
    </>
  )
}
