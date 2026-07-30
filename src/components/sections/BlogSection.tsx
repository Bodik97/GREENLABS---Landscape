import { Link } from 'react-router-dom'
import { SectionGlow } from '../ui/SectionGlow'
import { Reveal } from '../ui/Reveal'
import { IcoArrow } from '../ui/Icons'
import { Eyebrow } from '../ui/Eyebrow'
import { useSanity, imageUrl, formatDate, POSTS_QUERY, type PostCard } from '../../lib/sanity'

/** Без `title` шапка не малюється — на сторінці блогу її роль виконує `PageHeader`. */
export function PostCards({ items, bg = 'bg-cream', id, eyebrow, title, more }: {
  items: PostCard[]
  bg?: string
  id?: string
  eyebrow?: string
  title?: string
  more?: { to: string; label: string }
}) {
  if (!items.length) return null

  return (
    <section id={id} className={`relative overflow-hidden py-24 ${bg}`}>
      <SectionGlow />

      <div className="relative max-w-7xl mx-auto px-6">
        {title && (
          <Reveal className="mb-14">
            {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">{title}</h2>
          </Reveal>
        )}

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((b, i) => (
            <Reveal key={b._id} delay={(i % 3) * 90}>
              <article>
                <Link to={`/blog/${b.slug}`} className="group block">
                  <div className="rounded-2xl overflow-hidden bg-green aspect-16/10 mb-5">
                    <img
                      src={imageUrl(b.image, 700, 438)}
                      alt={b.image?.alt || b.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-stone text-[11px] font-sans mb-2">
                    {[formatDate(b.publishedAt), b.readingTime ? `${b.readingTime} хв читання` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <h3 className="font-display font-semibold text-ink text-[17px] leading-snug mb-3 group-hover:text-green transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-stone text-[13px] font-sans leading-[1.65]">{b.excerpt}</p>
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        {more && (
          <Reveal className="mt-12 text-center">
            <Link
              to={more.to}
              className="inline-flex items-center gap-2 border border-[#d9d6d0] rounded-lg px-6 py-3 text-ink font-display font-semibold text-[14px] hover:border-green hover:text-green transition-colors"
            >
              {more.label}
              <IcoArrow className="w-4 h-4" />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export function BlogSection() {
  const { data: posts, loading } = useSanity<PostCard[]>(POSTS_QUERY)

  if (loading) return <section id="blog" className="py-24 min-h-150 bg-cream" aria-hidden="true" />

  return (
    <PostCards
      id="blog"
      eyebrow="Блог"
      title="Корисні матеріали"
      items={posts ?? []}
      bg="bg-cream"
      more={{ to: '/blog', label: 'Усі статті' }}
    />
  )
}
