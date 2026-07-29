import { useEffect, useState } from 'react'
import { createClient } from '@sanity/client'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

export const client = createClient({
  projectId: 'v6s9ym4d',
  dataset: 'production',
  apiVersion: '2026-07-29',
  useCdn: true,
})

const builder = createImageUrlBuilder(client)

export const imageUrl = (source: SanityImageSource, w: number, h: number) =>
  builder.image(source).width(w).height(h).fit('crop').auto('format').url()

export type SanityImage = {
  asset?: { _ref: string }
  alt?: string
  caption?: string
  _key?: string
}

export type Member = {
  _id: string
  name: string
  role?: string
  bio?: string
  photo?: SanityImage
}

// ── Блоки, спільні для робіт і статей ──

export type VideoItem = {
  _key?: string
  source?: 'link' | 'file'
  url?: string
  fileUrl?: string
  poster?: SanityImage
  title?: string
}

export type Block =
  | { _type: 'textBlock'; _key: string; heading?: string; subheading?: string; body?: PortableTextBlock[] }
  | { _type: 'sliderBlock'; _key: string; heading?: string; images?: SanityImage[] }
  | {
      _type: 'beforeAfterBlock'
      _key: string
      heading?: string
      before?: SanityImage
      beforeLabel?: string
      after?: SanityImage
      afterLabel?: string
      caption?: string
    }
  | { _type: 'videoBlock'; _key: string; heading?: string; videos?: VideoItem[] }
  | { _type: 'checklistBlock'; _key: string; heading?: string; items?: string[] }
  | { _type: 'quoteBlock'; _key: string; quote?: string; author?: string; authorRole?: string }
  | { _type: 'statsBlock'; _key: string; heading?: string; items?: { _key: string; value?: string; label?: string }[] }
  | { _type: 'wideImageBlock'; _key: string; image?: SanityImage }

export type Seo = { title?: string; description?: string; image?: SanityImage }

// ── Роботи ──

export type WorkCard = {
  _id: string
  title: string
  subtitle?: string
  slug: string
  location?: string
  area?: string
  tags?: string[]
  image: SanityImage
}

export type Work = WorkCard & {
  summary?: string
  startDate?: string
  endDate?: string
  duration?: string
  services?: string[]
  tools?: string[]
  materials?: { _key: string; name?: string; amount?: string }[]
  team?: { _key: string; roleOnProject?: string; member?: Member }[]
  blocks?: Block[]
  seo?: Seo
}

// ── Статті ──

export type PostCard = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  image: SanityImage
  publishedAt?: string
  category?: string
  readingTime?: number
}

export type Post = PostCard & {
  subtitle?: string
  tags?: string[]
  author?: Member
  blocks?: Block[]
  relatedProjects?: WorkCard[]
  seo?: Seo
}

// ── Запити ──

const LIVE = 'hidden != true'
const MEMBER = '{ _id, name, role, bio, photo }'
const BLOCKS = `blocks[]{
  ...,
  videos[]{ _key, source, url, title, poster, "fileUrl": file.asset->url }
}`
const WORK_CARD = '_id, title, subtitle, "slug": slug.current, location, area, tags, image'
const POST_CARD = '_id, title, "slug": slug.current, excerpt, image, publishedAt, category, readingTime'

export const WORKS_QUERY = `*[_type == "project" && ${LIVE} && defined(slug.current)] | order(order asc){ ${WORK_CARD} }`

export const WORK_QUERY = `{
  "work": *[_type == "project" && ${LIVE} && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    team[]{ _key, roleOnProject, member->${MEMBER} },
    ${BLOCKS}
  },
  "others": *[_type == "project" && ${LIVE} && defined(slug.current) && slug.current != $slug] | order(order asc)[0...3]{ ${WORK_CARD} }
}`

export const POSTS_QUERY = `*[_type == "post" && ${LIVE} && defined(slug.current)] | order(publishedAt desc)[0...3]{ ${POST_CARD} }`

export const POST_QUERY = `{
  "post": *[_type == "post" && ${LIVE} && slug.current == $slug][0]{
    ...,
    "slug": slug.current,
    author->${MEMBER},
    relatedProjects[]->{ ${WORK_CARD} },
    ${BLOCKS}
  },
  "others": *[_type == "post" && ${LIVE} && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3]{ ${POST_CARD} }
}`

export const TEAM_QUERY = `*[_type == "teamMember"] | order(order asc){ _id, name, role, photo }`

/** Дані вантажаться в браузері — тому в стані завжди є `loading` і можлива помилка мережі. */
export function useSanity<T>(query: string, params?: Record<string, string>) {
  const key = JSON.stringify(params ?? {})
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setData(null)
    setError(false)
    client
      .fetch<T>(query, params ?? {})
      .then((res) => active && setData(res))
      .catch(() => active && setError(true))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, key])

  return { data, error, loading: !data && !error }
}

const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']

export function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** «8 квітня — 13 травня 2024». Рік у першій даті не дублюємо, якщо він той самий. */
export function formatPeriod(start?: string, end?: string) {
  if (!start) return formatDate(end)
  if (!end) return formatDate(start)
  const s = new Date(start)
  const e = new Date(end)
  const from = s.getFullYear() === e.getFullYear() ? `${s.getDate()} ${MONTHS[s.getMonth()]}` : formatDate(start)
  return `${from} — ${formatDate(end)}`
}
