import { Link, useParams } from 'react-router-dom'
import {
  PageBanner,
  LeadForm,
  Seo,
  Reveal,
  Eyebrow,
  IcoArrow,
  IcoCheck,
  Placeholder,
  FaqSection,
  WorkCards,
  ServiceCta,
  JsonLd,
  serviceSchema,
  siteUrl,
} from '../shared'
import { SectionWave } from '../components/ui/SectionWave'
import { PriceBox, PriceTag } from '../components/ui/PriceTag'
import { useSanity, imageUrl, SERVICE_QUERY, type Service, type ServiceItemCard } from '../lib/sanity'

/** Вид робіт із власною сторінкою — картка-посилання, решта — просто картка. */
function ItemCard({
  item,
  serviceSlug,
  index,
  onCream,
}: {
  item: ServiceItemCard
  serviceSlug: string
  index: number
  onCream: boolean
}) {
  const inner = (
    <>
      {/* Медіа-зона є завжди: без неї картки без фото ламали б рівність рядка.
          Замість вигаданого знімка — спокійна плашка з номером роботи. */}
      <div className="aspect-4/3 overflow-hidden bg-green/8 flex items-center justify-center">
        {item.image?.asset ? (
          <img
            src={imageUrl(item.image, 640, 480)}
            alt={item.image.alt || item.title}
            width={640}
            height={480}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="font-display font-bold text-green/25 text-[44px] leading-none">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-semibold text-ink text-[15px] leading-snug">{item.title}</h3>
          <PriceTag price={item.price} className="shrink-0 mt-0.5" />
        </div>
        {item.short && <p className="text-stone text-[12px] font-sans leading-[1.65]">{item.short}</p>}
        {item.duration && <p className="text-stone text-[12px] font-sans mt-2">Термін: {item.duration}</p>}

        {item.ownPage && item.slug && (
          <span className="mt-4 inline-flex items-center gap-2 text-terra font-display font-semibold text-[12px]">
            Детально про цю роботу
            <IcoArrow className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        )}
      </div>
    </>
  )

  // Тонка рамка тримає картку відокремленою від фону, а лінія кольору кнопки
  // добігає по верхньому краю при наведенні — акцент без зайвого руху.
  const shell =
    `${onCream ? 'bg-parchment' : 'bg-cream'} relative rounded-2xl overflow-hidden h-full flex flex-col ` +
    'border border-ink/8 transition-all duration-300'

  return (
    <Reveal delay={(index % 3) * 70}>
      {item.ownPage && item.slug ? (
        <Link
          to={`/services/${serviceSlug}/${item.slug}`}
          className={`${shell} group hover:border-terra/35 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)]`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-terra origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-10"
          />
          {inner}
        </Link>
      ) : (
        <div className={shell}>{inner}</div>
      )}
    </Reveal>
  )
}

export default function ServicePage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: service, loading } = useSanity<Service>(SERVICE_QUERY, { slug: slug ?? '' })

  if (loading) return <Placeholder note="Завантажуємо послугу…" />
  if (!service) return <Placeholder note="Такої послуги не знайшли. Перевірте адресу або оберіть послугу в розділі «Послуги»." />

  const crumbs = [
    { name: 'Головна', path: '/' },
    { name: 'Послуги', path: '/services' },
    { name: service.title, path: `/services/${service.slug}` },
  ]

  const items = service.items ?? []
  const benefits = service.benefits ?? []
  const works = service.works ?? []
  const faq = service.faq ?? []

  // Поки умови не заповнені, блок праворуч не малюється — тоді вступ іде на всю ширину
  const hasTerms = Boolean(service.price?.from || service.duration || service.guarantee || service.season)

  // Види робіт лягають на протилежне тло від того, що над ними, щоб стик було видно
  const itemsOnCream = benefits.length > 0

  // Секції нижче можуть не відрендеритись, тому колір над хвилею рахуємо по ланцюжку
  const afterItems = items.length
    ? itemsOnCream
      ? 'text-cream'
      : 'text-parchment'
    : benefits.length
      ? 'text-parchment'
      : 'text-cream'
  const afterCta = works.length ? 'text-parchment' : 'text-green'
  const afterFaq = faq.length ? 'text-cream' : afterCta

  return (
    <>
      <Seo
        title={service.seo?.title || `${service.title} у Львові — ціни та терміни | GREENLABS`}
        description={service.seo?.description || service.short || ''}
        image={service.image?.asset ? imageUrl(service.image, 1200, 630) : undefined}
        breadcrumbs={crumbs}
      />
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: service.intro || service.short || '',
          url: siteUrl(`/services/${service.slug}`),
        })}
      />
      <PageBanner
        eyebrow="Послуга"
        title={service.title}
        desc={service.short || ''}
        img={service.image?.asset ? imageUrl(service.image, 1600, 1000) : `${import.meta.env.BASE_URL}img/banner-services.webp`}
        breadcrumbs={crumbs}
      />

      {/* Вступ і умови поруч: перше, що шукають очима — ціна й термін */}
      <section className="relative py-20 md:py-24 bg-cream">
        <SectionWave shape="calm" className="text-cream" />
        <div className={`relative max-w-7xl mx-auto px-6 gap-10 md:gap-14 items-start ${hasTerms ? 'grid md:grid-cols-2' : ''}`}>
          <Reveal>
            <Eyebrow className="mb-3">Про послугу</Eyebrow>
            <p className={`text-ink text-[15px] md:text-[16px] font-sans leading-[1.72] ${hasTerms ? '' : 'max-w-170'}`}>
              {service.intro || service.short}
            </p>
          </Reveal>
          {hasTerms && (
            <Reveal delay={100}>
              <PriceBox
                price={service.price}
                duration={service.duration}
                guarantee={service.guarantee}
                season={service.season}
              />
            </Reveal>
          )}
        </div>
      </section>

      {benefits.length > 0 && (
        <section className="relative py-24 bg-parchment">
          <SectionWave shape="double" className="text-parchment" above="text-cream" />

          <div className="relative max-w-7xl mx-auto px-6">
            <Reveal className="mb-14 max-w-150">
              <Eyebrow className="mb-3">Навіщо це потрібно</Eyebrow>
              <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.1]">
                Що ви отримуєте, крім самої роботи
              </h2>
            </Reveal>

            {/* Переваг завжди чотири — у три колонки остання лишалась би сиротою */}
            <div className="grid sm:grid-cols-2 gap-5">
              {benefits.map((benefit, i) => (
                <Reveal key={benefit._key} delay={(i % 3) * 70}>
                  <div className="bg-cream rounded-2xl p-6 h-full">
                    <span className="text-green mb-4 inline-flex"><IcoCheck className="w-5 h-5" /></span>
                    <h3 className="font-display font-semibold text-ink text-[15px] mb-2">{benefit.title}</h3>
                    {benefit.desc && <p className="text-stone text-[12px] font-sans leading-[1.65]">{benefit.desc}</p>}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {items.length > 0 && (
        <section className={`relative py-24 ${itemsOnCream ? 'bg-cream' : 'bg-parchment'}`}>
          <SectionWave
            shape="calm"
            className={itemsOnCream ? 'text-cream' : 'text-parchment'}
            above={itemsOnCream ? 'text-parchment' : 'text-cream'}
          />

          <div className="relative max-w-7xl mx-auto px-6">
            <Reveal className="mb-14 max-w-150">
              <Eyebrow className="mb-3">Види робіт</Eyebrow>
              <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.1] mb-4">
                Що входить у {service.title.toLowerCase()}
              </h2>
              <p className="text-stone text-[14px] font-sans leading-[1.72]">
                Кожен пункт замовляють і окремо. Там, де є перехід, ми розписали докладно: що це, навіщо і скільки коштує.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => (
                <ItemCard key={item._id} item={item} serviceSlug={service.slug} index={i} onCream={itemsOnCream} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ServiceCta above={afterItems} />

      <WorkCards
        eyebrow="Наші роботи"
        title="Як це виглядає на реальних обʼєктах"
        items={works}
        bg="bg-parchment"
        above="text-green"
      />

      <FaqSection above={afterCta} items={faq} title={`Питання про ${service.title.toLowerCase()}`} />
      <LeadForm above={afterFaq} />
    </>
  )
}
