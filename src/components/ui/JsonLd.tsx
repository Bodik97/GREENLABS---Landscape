import { useEffect } from 'react'

/**
 * Кладе довільну JSON-LD розмітку в <head> на час життя сторінки.
 *
 * Розмітку читають Google і AI-асистенти — вони беруть із неї структуровану
 * відповідь замість того, щоб розбирати верстку. Працює лише разом із
 * пререндером (scripts/prerender.mjs): без нього краулер не побачить скрипт,
 * бо той зʼявляється вже після виконання React.
 */
export function JsonLd({ data }: { data: object | null }) {
  const json = data ? JSON.stringify(data) : null

  useEffect(() => {
    if (!json) return
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = json
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [json])

  return null
}

const ORIGIN = 'https://greenlabs-one.vercel.app'

/**
 * Абсолютна адреса сторінки.
 *
 * У проді беремо сталий домен, а не window.location.origin: пререндер відкриває
 * зібраний сайт на localhost, і без цього в canonical та розмітку потрапляли б
 * адреси виду http://localhost:59111. `pathname` іде без базового шляху —
 * BrowserRouter відрізає його через basename, тож повертаємо на місце.
 */
export const siteUrl = (pathname: string) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  const origin = import.meta.env.PROD ? ORIGIN : window.location.origin
  return `${origin}${base}${pathname}`
}

/**
 * Послуга або окремий вид робіт.
 *
 * Розмітку самої компанії тут не дублюємо: HomeAndConstructionBusiness уже
 * віддається з .figma/make/site.json у <head> кожної сторінки, і два описи
 * одного бізнесу лише збивають краулер з пантелику.
 */
export const serviceSchema = ({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  url,
  serviceType: name,
  provider: { '@type': 'LocalBusiness', name: 'GREENLABS' },
  areaServed: { '@type': 'City', name: 'Львів' },
})

/**
 * Вакансія — для Google Jobs.
 *
 * `baseSalary` тут необовʼязковий навмисно: вилка в структурованих даних — це
 * заявка роботодавця, яку Google показує як факт. Поки цифри на сторінці не
 * звірені з власником (див. SALARY_CONFIRMED у data/careers.tsx), поле не
 * додається взагалі — краще оголошення без суми, ніж із вигаданою.
 */
export const jobPostingSchema = ({
  id,
  title,
  description,
  datePosted,
  validThrough,
  url,
  salary,
}: {
  id: string
  title: string
  description: string
  datePosted: string
  validThrough: string
  url: string
  salary?: { from: number; to: number }
}) => ({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title,
  description,
  identifier: { '@type': 'PropertyValue', name: 'GREENLABS', value: id },
  datePosted,
  validThrough,
  employmentType: 'FULL_TIME',
  hiringOrganization: {
    '@type': 'Organization',
    name: 'GREENLABS',
    sameAs: ORIGIN,
    logo: `${ORIGIN}/logo/logo-v2-208.webp`,
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Львів',
      addressRegion: 'Львівська область',
      addressCountry: 'UA',
    },
  },
  directApply: true,
  url,
  ...(salary && {
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'UAH',
      value: {
        '@type': 'QuantitativeValue',
        minValue: salary.from,
        maxValue: salary.to,
        unitText: 'MONTH',
      },
    },
  }),
})

/**
 * Покрокова технологія з чеклиста «Як ми це робимо».
 * Повертає null, якщо такого блока на сторінці немає — порожній HowTo шкідливий.
 */
export const howToSchema = (name: string, steps: string[] | undefined) =>
  steps && steps.length > 1
    ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name,
        step: steps.map((text, i) => ({ '@type': 'HowToStep', position: i + 1, text })),
      }
    : null
