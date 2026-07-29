import { WorkCards } from './WorkCards'
import { useSanity, WORKS_QUERY, type WorkCard } from '../../lib/sanity'

export function Portfolio({ bg = 'bg-cream' }: { bg?: string }) {
  const { data: works, loading } = useSanity<WorkCard[]>(WORKS_QUERY)

  // Поки дані вантажаться — тримаємо висоту, щоб сторінка не стрибала
  if (loading) return <section id="portfolio" className={`py-24 min-h-125 ${bg}`} aria-hidden="true" />

  return <WorkCards id="portfolio" eyebrow="Портфоліо" title="Наші роботи" items={works ?? []} bg={bg} slider />
}
