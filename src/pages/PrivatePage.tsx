import { PageBanner, Characteristics, ExamplesSection, Process, LeadForm, Seo } from '../shared'

const CHARACTERISTICS = [
  'Ділянки від 3 до 100 соток — заміський будинок чи міська садиба',
  'Індивідуальний дизайн-проект із 3D-візуалізацією під ваш стиль життя',
  'Рослини, підібрані з урахуванням клімату Львівщини',
  'Гнучкий графік робіт, узгоджений із побутом родини',
  'Гарантія 12 місяців на всі роботи та висаджені рослини',
  'Місяць обслуговування безкоштовно при замовленні проекту',
]

const EXAMPLES = [
  { img: 'https://images.unsplash.com/photo-1772040942277-b194d9d0b648?w=800&h=600&fit=crop&auto=format', label: 'Тераса та газон' },
  { img: 'https://images.unsplash.com/photo-1749803915455-a7642520d0d3?w=800&h=600&fit=crop&auto=format', label: 'Озеленення ділянки' },
  { img: 'https://images.unsplash.com/photo-1765129049887-bae454eecc92?w=800&h=600&fit=crop&auto=format', label: 'Вхідна група' },
]

export default function PrivatePage() {
  return (
    <>
      <Seo
        title="Приватна ділянка — ландшафтний дизайн саду | GREENLABS"
        description="Ландшафтний дизайн приватних ділянок у Львові — проєкт, озеленення, полив і догляд за садом заміського будинку чи міської садиби. Консультація безкоштовно."
        breadcrumbs={[
          { name: 'Головна', path: '/' },
          { name: 'Приватна ділянка', path: '/private' },
        ]}
      />
      <PageBanner
        eyebrow="Приватна ділянка"
        title="Сад вашої мрії біля дому"
        desc="Створюємо приватні сади для заміських будинків і міських садиб — від першого ескізу до бездоганної реалізації. Враховуємо стиль життя родини, клімат Львівщини та ваші побажання."
        img="https://images.unsplash.com/photo-1772040942277-b194d9d0b648?w=1600&h=1000&fit=crop&auto=format"
      />
      <Characteristics title="Що включає робота над приватною ділянкою" items={CHARACTERISTICS} />
      <Process />
      <ExamplesSection
        eyebrow="Приклади оформлення"
        title="Як може виглядати ваша ділянка"
        note="Це демонстрація механіки «до/після» на ілюстративних фото — потягніть повзунок. Реальні кейси приватних ділянок додамо, щойно погодимо фото з клієнтами."
        items={EXAMPLES}
      />
      <LeadForm />
    </>
  )
}
