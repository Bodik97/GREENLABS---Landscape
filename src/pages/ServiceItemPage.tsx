import { Link, useParams } from 'react-router-dom'
import {
  PageBanner,
  LeadForm,
  Seo,
  Reveal,
  Eyebrow,
  IcoArrow,
  Placeholder,
  FaqSection,
  WorkCards,
  ServiceCta,
  JsonLd,
  serviceSchema,
  howToSchema,
  siteUrl,
} from '../shared'
import { Blocks } from '../components/blocks/Blocks'
import { SectionWave } from '../components/ui/SectionWave'
import { PriceBox } from '../components/ui/PriceTag'
import { useSanity, imageUrl, SERVICE_ITEM_QUERY, type ServiceItem } from '../lib/sanity'

export default function ServiceItemPage() {
  const { slug, item } = useParams<{ slug: string; item: string }>()
  const { data, loading } = useSanity<ServiceItem>(SERVICE_ITEM_QUERY, { slug: slug ?? '', item: item ?? '' })

  if (loading) return <Placeholder note="Завантажуємо опис роботи…" />
  if (!data) return <Placeholder note="Такої роботи не знайшли. Подивіться перелік у розділі «Послуги»." />

  const parentSlug = data.parent?.slug ?? slug ?? ''
  const crumbs = [
    { name: 'Головна', path: '/' },
    { name: 'Послуги', path: '/services' },
    ...(data.parent ? [{ name: data.parent.title, path: `/services/${parentSlug}` }] : []),
    { name: data.title, path: `/services/${parentSlug}/${data.slug}` },
  ]

  const works = data.works ?? []
  const faq = data.faq ?? []
  const blocks = data.blocks ?? []
  const related = data.related ?? []

  // Blocks чергують cream/parchment починаючи з cream — звідси колір під наступною хвилею
  const afterBlocks = blocks.length ? (blocks.length % 2 === 1 ? 'text-cream' : 'text-parchment') : 'text-cream'
  const afterCta = works.length ? 'text-parchment' : 'text-green'
  const afterRelated = related.length ? 'text-cream' : afterCta
  const afterFaq = faq.length ? 'text-cream' : afterRelated

  // «Як ми це робимо» — єдиний чекліст, який описує саме послідовність дій.
  const steps = blocks.find(
    (b): b is Extract<typeof b, { _type: 'checklistBlock' }> =>
      b._type === 'checklistBlock' && (b.heading ?? '').startsWith('Як ми це робимо'),
  )?.items

  const facts = [
    ['Що це', data.what],
    ['Навіщо це потрібно', data.why],
    ['Коли це роблять', data.when],
  ].filter(([, value]) => Boolean(value)) as [string, string][]

  return (
    <>
      <Seo
        title={data.seo?.title || `${data.title} — ціна та терміни у Львові | GREENLABS`}
        description={data.seo?.description || data.short || ''}
        image={data.image?.asset ? imageUrl(data.image, 1200, 630) : undefined}
        breadcrumbs={crumbs}
      />
      <JsonLd
        data={serviceSchema({
          name: data.title,
          description: data.what || data.short || '',
          url: siteUrl(`/services/${parentSlug}/${data.slug}`),
        })}
      />
      <JsonLd data={howToSchema(data.title, steps)} />
      <PageBanner
        eyebrow={data.parent?.title || 'Вид робіт'}
        title={data.title}
        desc={data.short || ''}
        img={data.image?.asset ? imageUrl(data.image, 1600, 1000) : `${import.meta.env.BASE_URL}img/banner-services.webp`}
        breadcrumbs={crumbs}
      />

      <section className="relative py-20 md:py-24 bg-cream">
        <SectionWave shape="calm" className="text-cream" />
        <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div className="flex flex-col gap-8">
            {facts.map(([label, value], i) => (
              <Reveal key={label} delay={i * 80}>
                <Eyebrow className="mb-3">{label}</Eyebrow>
                <p className="text-ink text-[15px] md:text-[16px] font-sans leading-[1.72]">{value}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100} className="flex flex-col gap-6 md:sticky md:top-28">
            {data.image?.asset && (
              <img
                src={imageUrl(data.image, 960, 720)}
                alt={data.image.alt || data.title}
                width={960}
                height={720}
                className="w-full aspect-4/3 object-cover rounded-2xl"
                loading="lazy"
                decoding="async"
              />
            )}
            <PriceBox price={data.price} duration={data.duration} />
            {data.parent && (
              <Link
                to={`/services/${parentSlug}`}
                className="inline-flex items-center gap-2 text-terra font-display font-semibold text-[13px] hover:text-[#b35c34] transition-colors"
              >
                Усі роботи в розділі «{data.parent.title}»
                <IcoArrow className="w-4 h-4" />
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      <Blocks blocks={data.blocks} fallbackAlt={data.title} above="text-cream" />

      <ServiceCta
        title={`Порахуємо, скільки коштуватиме ${data.title.toLowerCase()} у вас`}
        above={afterBlocks}
      />

      <WorkCards
        eyebrow="Наші роботи"
        title="Де ми це вже робили"
        items={works}
        bg="bg-parchment"
        above="text-green"
      />

      {related.length > 0 && (
        <section className="relative py-16 md:py-20 bg-cream">
          <SectionWave shape="mirror" className="text-cream" above={afterCta} />
          <div className="relative max-w-7xl mx-auto px-6">
            <Eyebrow className="mb-3">Разом із цим</Eyebrow>
            <h2 className="font-display font-semibold text-ink text-[22px] md:text-[28px] leading-snug mb-8 max-w-160">
              Що зазвичай роблять поруч
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item, i) => (
                <Reveal key={item._id} delay={i * 70}>
                  <Link
                    to={`/services/${item.parentSlug}/${item.slug}`}
                    className="group h-full flex flex-col p-6 rounded-lg bg-parchment border border-ink/8 hover:border-terra/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <h3 className="font-display font-semibold text-ink text-[15px] leading-snug mb-2">{item.title}</h3>
                    {item.short && (
                      <p className="text-stone text-[14px] font-sans leading-[1.65] mb-4">{item.short}</p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-2 text-terra font-display font-semibold text-[13px]">
                      Детальніше
                      <IcoArrow className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection above={afterRelated} items={faq} title="Часті питання про цю роботу" />
      <LeadForm above={afterFaq} />
    </>
  )
}
