import { JsonLd } from './JsonLd'

/**
 * Питання й відповіді для пошуковика.
 *
 * Кладеться через JsonLd, а не власним кодом: там уже вирішено, що робити з
 * розміткою, яку запік пререндер, — інакше блок їхав у head двічі.
 */
export function FaqSchema({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }}
    />
  )
}
