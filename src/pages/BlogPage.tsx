import { PageHeader, Seo } from '../shared'
import { SectionWave } from '../components/ui/SectionWave'
import { PostCards } from '../components/sections/BlogSection'
import { useSanity, ALL_POSTS_QUERY, type PostCard } from '../lib/sanity'

const CRUMBS = [
  { name: 'Головна', path: '/' },
  { name: 'Блог', path: '/blog' },
]

export default function BlogPage() {
  const { data: posts, loading, error } = useSanity<PostCard[]>(ALL_POSTS_QUERY)

  return (
    <>
      <Seo
        title="Блог про ландшафтний дизайн | GREENLABS"
        description="Статті студії GREENLABS: як обрати стиль саду, які рослини витримують клімат Львівщини, коли висаджувати й скільки коштує догляд."
        breadcrumbs={CRUMBS}
      />
      <PageHeader
        eyebrow="Блог"
        title="Корисні матеріали"
        desc="Розбираємо питання, які найчастіше чуємо на консультаціях — від вибору рослин до догляду за готовим садом."
        breadcrumbs={CRUMBS}
      />

      {(loading || error) && (
        <section className="relative py-20 bg-cream">
          <SectionWave shape="calm" className="text-cream" above="text-green" />
          <div className="relative max-w-7xl mx-auto px-6">
            <p className="text-stone text-[14px] font-sans">
              {loading
                ? 'Завантажуємо статті…'
                : "Не вдалося завантажити статті. Перевірте з'єднання і спробуйте оновити сторінку."}
            </p>
          </div>
        </section>
      )}

      {!loading && !error && (
        <PostCards items={posts ?? []} bg="bg-cream" above="text-green" />
      )}
    </>
  )
}
