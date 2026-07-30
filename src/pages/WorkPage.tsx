import { Link, useParams } from 'react-router-dom'
import { PageBanner, LeadForm, Seo, Reveal, Eyebrow } from '../shared'
import { Blocks } from '../components/blocks/Blocks'
import { WorkCards } from '../components/sections/WorkCards'
import { Placeholder } from '../components/ui/Placeholder'
import {
  useSanity,
  imageUrl,
  formatPeriod,
  WORK_QUERY,
  type Work,
  type WorkCard,
} from '../lib/sanity'

const SERVICE_TITLES: Record<string, string> = {
  proektuvannya: 'Проєктування та візуалізація',
  ozelenennya: 'Озеленення та посадка',
  gazon: 'Газон та покриття',
  polyv: 'Системи поливу',
  osvitlennya: 'Освітлення саду',
  vodoymy: 'Водойми та фонтани',
  sezonne: 'Сезонне обслуговування',
  moshchennya: 'Мощення та тераси',
}

function Facts({ work }: { work: Work }) {
  const facts = [
    { label: 'Локація', value: work.location },
    { label: 'Площа', value: work.area },
    { label: 'Період робіт', value: formatPeriod(work.startDate, work.endDate) },
    { label: 'Тривалість', value: work.duration },
  ].filter((f) => f.value)

  const hasChips = Boolean(work.services?.length || work.tags?.length)
  if (!facts.length && !hasChips) return null

  return (
    <section className="section-curve py-14 bg-parchment">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-14 gap-y-8 items-start">
        {facts.map((f) => (
          <Reveal key={f.label}>
            <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-1.5">{f.label}</p>
            <p className="text-ink text-[18px] font-display font-bold">{f.value}</p>
          </Reveal>
        ))}

        {hasChips && (
          <Reveal className="w-full lg:w-auto">
            <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-2">Види робіт</p>
            <div className="flex flex-wrap gap-1.5">
              {work.services?.map((s) => (
                <Link
                  key={s}
                  to={`/services#${s}`}
                  className="text-[11px] font-sans text-ink bg-cream border border-[#d9d6d0] rounded-full px-3 py-1 hover:border-green hover:text-green transition-colors"
                >
                  {SERVICE_TITLES[s] ?? s}
                </Link>
              ))}
              {work.tags?.map((t) => (
                <span key={t} className="text-[11px] font-sans text-stone border border-[#d9d6d0] rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

function Team({ work }: { work: Work }) {
  const members = work.team?.filter((t) => t.member) ?? []
  if (!members.length) return null

  return (
    <div>
      <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-5">Хто працював</p>
      <div className="flex flex-col gap-4">
        {members.map((t) => (
          <div key={t._key} className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-green shrink-0 ring-1 ring-[#d9d6d0]">
              {t.member?.photo?.asset && (
                <img
                  src={imageUrl(t.member.photo, 120, 120)}
                  alt={t.member.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div>
              <p className="text-ink text-[13px] font-display font-semibold">{t.member?.name}</p>
              <p className="text-stone text-[12px] font-sans leading-snug">{t.roleOnProject || t.member?.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Details({ work }: { work: Work }) {
  const tools = work.tools ?? []
  const materials = work.materials?.filter((m) => m.name) ?? []
  const hasTeam = Boolean(work.team?.length)
  if (!tools.length && !materials.length && !hasTeam) return null

  return (
    <section className="section-curve py-20 bg-parchment">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-12">
          <Eyebrow className="mb-3">Деталі</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.1]">Як це було зроблено</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-10">
          {tools.length > 0 && (
            <Reveal>
              <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-5">
                Інструменти та техніка
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool) => (
                  <span key={tool} className="text-[12px] font-sans text-ink bg-cream rounded-full px-3.5 py-1.5">
                    {tool}
                  </span>
                ))}
              </div>
            </Reveal>
          )}

          {materials.length > 0 && (
            <Reveal delay={80}>
              <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-5">
                Матеріали та рослини
              </p>
              <dl className="flex flex-col gap-2.5">
                {materials.map((m) => (
                  <div key={m._key} className="flex justify-between gap-4 border-b border-[#d9d6d0] pb-2.5">
                    <dt className="text-ink text-[13px] font-sans">{m.name}</dt>
                    <dd className="text-stone text-[13px] font-sans shrink-0">{m.amount}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}

          <Reveal delay={160}>
            <Team work={work} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default function WorkPage() {
  const { slug = '' } = useParams()
  const { data, error } = useSanity<{ work: Work | null; others: WorkCard[] }>(WORK_QUERY, { slug })

  if (error) return <Placeholder note="Не вдалося завантажити цю роботу. Перевірте з'єднання і спробуйте оновити сторінку." />
  if (!data) return <Placeholder note="Завантажуємо роботу…" />

  const work = data.work
  if (!work) return <Placeholder note="Такої роботи не знайшлося. Можливо, посилання застаріло — подивіться всі роботи в портфоліо." />

  const crumbs = [
    { name: 'Головна', path: '/' },
    { name: 'Портфоліо', path: '/works' },
    { name: work.title, path: `/works/${work.slug}` },
  ]

  const desc =
    work.seo?.description ||
    work.summary ||
    `Ландшафтний проєкт GREENLABS${work.location ? `: ${work.location}` : ''}${work.area ? `, ${work.area}` : ''}.`

  return (
    <>
      <Seo
        title={`${work.seo?.title || work.title} — наша робота | GREENLABS`}
        description={desc}
        image={imageUrl(work.seo?.image || work.image, 1200, 630)}
        breadcrumbs={crumbs}
      />
      <PageBanner
        eyebrow={work.location || 'Наша робота'}
        title={work.title}
        desc={work.subtitle || work.summary || ''}
        img={imageUrl(work.image, 1600, 1000)}
        breadcrumbs={crumbs}
      />
      <Facts work={work} />
      <Blocks blocks={work.blocks} fallbackAlt={work.title} />
      <Details work={work} />
      <WorkCards eyebrow="Ще роботи" title="Інші наші об'єкти" items={data.others ?? []} bg="bg-cream" />
      <LeadForm />
    </>
  )
}
