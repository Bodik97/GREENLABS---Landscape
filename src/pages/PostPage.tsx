import { useParams } from 'react-router-dom'
import { PageBanner, LeadForm, Seo, Reveal } from '../shared'
import { Blocks, blocksTrailingColor } from '../components/blocks/Blocks'
import { SectionWave } from '../components/ui/SectionWave'
import { PostCards } from '../components/sections/BlogSection'
import { WorkCards } from '../components/sections/WorkCards'
import { Placeholder } from '../components/ui/Placeholder'
import { useSanity, imageUrl, formatDate, POST_QUERY, type Post, type PostCard } from '../lib/sanity'
import { sanityBanner } from '../lib/banner'

const CATEGORY_TITLES: Record<string, string> = {
  porady: 'Поради садівникам',
  roslyny: 'Рослини',
  trendy: 'Тренди та ідеї',
  sezon: 'Сезонні роботи',
  proekty: 'Наші проєкти',
}

function Meta({ post }: { post: Post }) {
  const line = [formatDate(post.publishedAt), post.readingTime ? `${post.readingTime} хв читання` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <section className="relative py-12 bg-parchment">
      <SectionWave shape="calm" className="text-parchment" />
      <div className="relative max-w-7xl mx-auto px-6 flex flex-wrap items-center gap-x-10 gap-y-6">
        {post.author && (
          <Reveal className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-green shrink-0 ring-1 ring-[#d9d6d0]">
              {post.author.photo?.asset && (
                <img
                  src={imageUrl(post.author.photo, 120, 120)} width={120} height={120}
                  alt={post.author.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div>
              <p className="text-ink text-[13px] font-display font-semibold">{post.author.name}</p>
              <p className="text-stone text-[12px] font-sans">{post.author.role}</p>
            </div>
          </Reveal>
        )}

        {line && <Reveal className="text-stone text-[13px] font-sans">{line}</Reveal>}

        {post.tags && post.tags.length > 0 && (
          <Reveal className="flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="text-[11px] font-sans text-stone border border-[#d9d6d0] rounded-full px-3 py-1">
                {t}
              </span>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}

function AuthorBio({ post }: { post: Post }) {
  if (!post.author?.bio) return null

  return (
    <section className="relative py-16 bg-parchment">
      <SectionWave shape="mirror" className="text-parchment" />
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="flex items-start gap-5 max-w-175">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-green shrink-0 ring-1 ring-[#d9d6d0]">
            {post.author.photo?.asset && (
              <img
                src={imageUrl(post.author.photo, 160, 160)} width={160} height={160}
                alt={post.author.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
          </div>
          <div>
            <p className="text-ink text-[15px] font-display font-semibold">{post.author.name}</p>
            <p className="text-stone text-[12px] font-sans mb-2.5">{post.author.role}</p>
            <p className="text-ink text-[14px] font-sans leading-[1.65]">{post.author.bio}</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function PostPage() {
  const { slug = '' } = useParams()
  const { data, error } = useSanity<{ post: Post | null; others: PostCard[] }>(POST_QUERY, { slug })

  if (error) return <Placeholder note="Не вдалося завантажити статтю. Перевірте з'єднання і спробуйте оновити сторінку." />
  if (!data) return <Placeholder note="Завантажуємо статтю…" />

  const post = data.post
  if (!post) return <Placeholder note="Такої статті не знайшлося. Можливо, посилання застаріло — подивіться всі матеріали в блозі." />

  const crumbs = [
    { name: 'Головна', path: '/' },
    { name: 'Блог', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]

  const desc = post.seo?.description || post.excerpt || post.subtitle || post.title

  return (
    <>
      <Seo
        title={`${post.seo?.title || post.title} | GREENLABS`}
        description={desc}
        image={imageUrl(post.seo?.image || post.image, 1200, 630)}
        breadcrumbs={crumbs}
      />
      <PageBanner
        eyebrow={(post.category && CATEGORY_TITLES[post.category]) || 'Блог'}
        title={post.title}
        desc={post.subtitle || post.excerpt || ''}
        {...sanityBanner(post.image)}
        breadcrumbs={crumbs}
      />
      <Meta post={post} />
      <Blocks blocks={post.blocks} fallbackAlt={post.title} />
      <AuthorBio post={post} />
      {post.relatedProjects && post.relatedProjects.length > 0 && (
        <WorkCards eyebrow="Згадані роботи" title="Про це ми писали на прикладі" items={post.relatedProjects} bg="bg-cream" />
      )}
      <PostCards eyebrow="Ще почитати" title="Інші матеріали" items={data.others ?? []} bg="bg-parchment" />
      {/* Форма на фото, тож колір сусіда їй потрібен точний — а секції вище умовні */}
      <LeadForm
        above={
          data.others?.length
            ? 'text-parchment'
            : post.relatedProjects?.length
              ? 'text-cream'
              : post.author
                ? 'text-parchment'
                : blocksTrailingColor(post.blocks?.length ?? 0)
        }
      />
    </>
  )
}
