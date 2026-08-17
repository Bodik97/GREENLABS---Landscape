import { useEffect, useState } from 'react'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

const PROJECT = 'v6s9ym4d'
const DATASET = 'production'
const API_VERSION = '2026-07-29'

/**
 * Запит до Sanity звичайним fetch — без офіційного клієнта.
 *
 * Клієнт тягне за собою rxjs і власний http-шар: разом близько 170 KB коду,
 * які лежали в тому ж чанку, що й перший екран, заради єдиного GET-запиту.
 * Сайт пререндериться, тож увесь контент уже є в HTML, а ці дані лише
 * оновлюють його після показу — платити за них швидкістю першого кадру
 * не було за що.
 *
 * `apicdn` замість `api` — це кешований вузол, той самий, що вмикав `useCdn`.
 * Параметри йдуть як `$name` зі значенням у JSON, як того вимагає GROQ.
 */
function queryUrl(query: string, params: Record<string, string>) {
  const url = new URL(`https://${PROJECT}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}`)
  url.searchParams.set('query', query)
  // Інакше відповідь везе назад копію запиту, а він у нас до півкілобайта
  url.searchParams.set('returnQuery', 'false')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value))
  }
  return url.toString()
}

async function sanityFetch<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sanity відповів ${res.status}`)
  return (await res.json()).result as T
}

/**
 * Відповіді, що приїхали разом зі сторінкою.
 *
 * Їх кладе scripts/prerender.mjs. Без них виходило безглуздо: у html лежить
 * готовий контент, але перший рендер у браузері віддає порожньо (даних ще
 * немає), React цей контент прибирає — і повертає аж коли той самий запит
 * відпрацює вдруге. Підвал через це стискався й за мить розтягувався назад
 * на висоту екрана.
 *
 * Читаємо один раз: розмітка після завантаження вже не змінюється.
 */
let embedded: Record<string, unknown> | undefined

function fromPage(url: string) {
  if (embedded === undefined) {
    const el = typeof document === 'undefined' ? null : document.getElementById('sanity-data')
    try {
      embedded = el?.textContent ? JSON.parse(el.textContent) : {}
    } catch {
      embedded = {}
    }
  }
  return embedded?.[url]
}

const builder = createImageUrlBuilder({ projectId: PROJECT, dataset: DATASET })

/** quality: за замовчуванням Sanity віддає 75, а на фото саду різниці з 70 не
    видно — зате на сторінці послуг це десятки кілобайт на восьми картках. */
export const imageUrl = (source: SanityImageSource, w: number, h: number) =>
  builder.image(source).width(w).height(h).fit('crop').auto('format').quality(70).url()

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

// ── Послуги ──

/** Порожня вилка нічого не малює — блок ціни показуємо лише коли є `from` і `unit`. */
export type Price = {
  from?: number
  to?: number
  unit?: string
  note?: string
  /** Чим множити в калькуляторі. `none` — послуги в калькуляторі не буде. */
  basis?: 'none' | 'm2' | 'sotka' | 'fixed'
}

export type Qa = { _key: string; q: string; a: string }

export type ServiceItemCard = {
  _id: string
  title: string
  /** Є лише коли `ownPage` — тоді вид робіт має власну сторінку. */
  slug?: string
  ownPage?: boolean
  short?: string
  image?: SanityImage
  price?: Price
  duration?: string
}

export type ServiceCard = {
  _id: string
  title: string
  slug: string
  short?: string
  image: SanityImage
  price?: Price
  /** Назви видів робіт — щоб на картці показати, що входить. */
  items?: string[]
}

export type Service = Omit<ServiceCard, 'items'> & {
  intro?: string
  duration?: string
  guarantee?: string
  season?: string
  benefits?: { _key: string; title: string; desc?: string }[]
  faq?: Qa[]
  items?: ServiceItemCard[]
  works?: WorkCard[]
  seo?: Seo
}

export type ServiceItem = ServiceItemCard & {
  parent?: { title: string; slug: string }
  what?: string
  why?: string
  when?: string
  blocks?: Block[]
  faq?: Qa[]
  works?: WorkCard[]
  related?: RelatedItem[]
  seo?: Seo
}

/** Суміжна робота з іншого розділу — тільки те, що треба для картки-посилання. */
export type RelatedItem = {
  _id: string
  title: string
  short?: string
  slug: string
  parentSlug: string
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

/** Головна показує три останні статті, сторінка блогу — всі. */
export const POSTS_QUERY = `*[_type == "post" && ${LIVE} && defined(slug.current)] | order(publishedAt desc)[0...3]{ ${POST_CARD} }`

export const ALL_POSTS_QUERY = `*[_type == "post" && ${LIVE} && defined(slug.current)] | order(publishedAt desc){ ${POST_CARD} }`

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

// ── Вакансії ──

export type Vacancy = {
  _id: string
  /** Технічна позначка посади. Іде в заявку кандидата, тому стала. */
  slug: string
  title: string
  summary: string
  /** Порожня — на сторінці буде «за домовленістю». */
  salaryFrom?: number
  salaryTo?: number
  schedule: string
  requirements?: string[]
  icon?: string
}

export const VACANCIES_QUERY = `*[_type == "vacancy" && ${LIVE} && defined(slug.current)] | order(order asc){
  _id, title, "slug": slug.current, summary, salaryFrom, salaryTo, schedule, requirements, icon
}`

/**
 * Найбільша зарплата серед відкритих вакансій — одне число.
 *
 * Потрібне картці про набір, яка спливає на всіх сторінках. Тому запит
 * навмисно куций: рахує Sanity, назад їде число, а не пʼять документів.
 */
export const TOP_SALARY_QUERY = `math::max(*[_type == "vacancy" && ${LIVE}].salaryTo)`

/**
 * Разовий запит поза хуком.
 *
 * Потрібен там, де дані стають потрібні не одразу, а за подією: картка про
 * набір питає стелю зарплат аж тоді, коли збирається зʼявитись. Через useSanity
 * це означало б запит на кожній сторінці — заради рядка, який здебільшого ніхто
 * не побачить.
 */
export const sanityOnce = <T,>(query: string) => sanityFetch<T>(queryUrl(query, {}))

// ── Послуги ──

const PRICE = 'price{ from, to, unit, note, basis }'
const SERVICE_ITEM_CARD = `_id, title, "slug": slug.current, ownPage, short, image, duration, ${PRICE}`

/** Список послуг: картка + назви видів робіт, щоб одразу показати, що входить. */
export const SERVICES_QUERY = `*[_type == "service" && ${LIVE} && defined(slug.current)] | order(order asc){
  _id, title, "slug": slug.current, short, image, ${PRICE},
  "items": *[_type == "serviceItem" && ${LIVE} && parent._ref == ^._id] | order(order asc).title
}`

/** Роботи прив'язані до послуги через список `services` у проєкті. */
const SERVICE_WORKS = `"works": *[_type == "project" && ${LIVE} && defined(slug.current) && $slug in services] | order(order asc)[0...3]{ ${WORK_CARD} }`

export const SERVICE_QUERY = `*[_type == "service" && ${LIVE} && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "items": *[_type == "serviceItem" && ${LIVE} && parent._ref == ^._id] | order(order asc){ ${SERVICE_ITEM_CARD} },
  ${SERVICE_WORKS}
}`

export const SERVICE_ITEM_QUERY = `*[_type == "serviceItem" && ${LIVE} && ownPage == true && slug.current == $item && parent->slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  parent->{ title, "slug": slug.current },
  ${BLOCKS},
  ${SERVICE_WORKS},
  related[]->{ _id, title, short, "slug": slug.current, "parentSlug": parent->slug.current }
}`

/**
 * Дані вантажаться в браузері — тому в стані є `loading` і можлива помилка мережі.
 *
 * Виняток — те, з чим сторінка приїхала: такі відповіді вже лежать у ній, тож
 * беремо їх одразу першим рендером і нікуди не йдемо. Саме це прибирає зсув
 * макета: намальоване в html і намальоване React збігаються з першої ж спроби.
 */
export function useSanity<T>(query: string, params?: Record<string, string>) {
  const url = queryUrl(query, params ?? {})
  const [data, setData] = useState<T | null>(() => (fromPage(url) as T | undefined) ?? null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const ready = fromPage(url)
    if (ready !== undefined) {
      setData(ready as T)
      setError(false)
      return
    }

    let active = true
    setData(null)
    setError(false)
    sanityFetch<T>(url)
      .then((res) => active && setData(res))
      .catch(() => active && setError(true))
    return () => {
      active = false
    }
  }, [url])

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
