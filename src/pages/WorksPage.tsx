import { useMemo, useState } from 'react'
import { PageHeader, Reveal, Seo } from '../shared'
import { SectionWave } from '../components/ui/SectionWave'
import { WorkTile } from '../components/sections/WorkCards'
import { useSanity, WORKS_QUERY, type WorkCard } from '../lib/sanity'

const CRUMBS = [
  { name: 'Головна', path: '/' },
  { name: 'Портфоліо', path: '/works' },
]

const ALL = 'Усі роботи'

export default function WorksPage() {
  const { data: works, loading, error } = useSanity<WorkCard[]>(WORKS_QUERY)
  const [tag, setTag] = useState(ALL)

  const items = works ?? []

  // Теги беремо з самих робіт, а не з окремого списку — інакше у фільтрі
  // з'являлись би кнопки, які нічого не знаходять
  const tags = useMemo(() => {
    const seen = new Set<string>()
    for (const w of items) for (const t of w.tags ?? []) seen.add(t)
    return [...seen].sort((a, b) => a.localeCompare(b, 'uk'))
  }, [items])

  const shown = tag === ALL ? items : items.filter((w) => w.tags?.includes(tag))

  return (
    <>
      <Seo
        title="Портфоліо — наші роботи | GREENLABS"
        description="Реалізовані ландшафтні проєкти GREENLABS у Львові та області: приватні сади, комерційні території, озеленення, полив, мощення та освітлення."
        breadcrumbs={CRUMBS}
      />
      <PageHeader
        eyebrow="Портфоліо"
        title="Наші роботи"
        desc="Реалізовані проєкти у Львові та області. Оберіть тип робіт, щоб побачити схожі на ваш випадок."
        breadcrumbs={CRUMBS}
      />

      <section className="relative py-16 md:py-20 bg-cream">
        <SectionWave shape="calm" className="text-cream" above="text-green" />
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Заголовок лише для читача з екрана. Видимого тут немає — усе під
              банером і так очевидно оком, — але без нього після h1 одразу йшов
              підвал, і в переліку заголовків сторінки зяяла діра. */}
          <h2 className="sr-only">Реалізовані проєкти</h2>
          {loading && <p className="text-stone text-[14px] font-sans">Завантажуємо роботи…</p>}

          {error && (
            <p className="text-stone text-[14px] font-sans">
              Не вдалося завантажити роботи. Перевірте з'єднання і спробуйте оновити сторінку.
            </p>
          )}

          {!loading && !error && (
            <>
              {tags.length > 1 && (
                <Reveal className="flex flex-wrap gap-2 mb-12">
                  {[ALL, ...tags].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      aria-pressed={t === tag}
                      className={`text-[13px] font-display font-semibold rounded-full px-4 py-2 border transition-colors ${
                        t === tag
                          ? 'bg-green text-cream border-green'
                          : 'bg-transparent text-stone border-[#d9d6d0] hover:border-green hover:text-green'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </Reveal>
              )}

              <p className="text-stone text-[13px] font-sans mb-8" aria-live="polite">
                {shown.length === items.length
                  ? `Усього робіт: ${items.length}`
                  : `Знайдено: ${shown.length} з ${items.length}`}
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {shown.map((work, i) => (
                  <Reveal key={work._id} delay={(i % 3) * 90}>
                    <WorkTile work={work} />
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
