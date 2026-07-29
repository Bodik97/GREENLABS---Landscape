import { PageBanner, Characteristics, ExamplesSection, Process, LeadForm, Seo } from '../shared'

const CHARACTERISTICS = [
  "Готелі, ресторани, офіси, ЖК-комплекси",
  'Проєктування з урахуванням прохідності та експлуатаційних навантажень',
  'Договори на регулярне сезонне обслуговування території',
  'Мінімальний простій для відвідувачів та персоналу під час робіт',
  'Представницьке озеленення, що працює на імідж бізнесу',
  'Гарантія 12 місяців на всі роботи та висаджені рослини',
]

const EXAMPLES = [
  { img: 'https://images.unsplash.com/photo-1758450399245-0e1c5d4c2536?w=800&h=600&fit=crop&auto=format', label: 'Територія бізнес-центру' },
  { img: 'https://images.unsplash.com/photo-1758526116322-52919e89b3c3?w=800&h=600&fit=crop&auto=format', label: 'Прибудинкова територія ЖК' },
  { img: 'https://images.unsplash.com/photo-1596481768453-8befafc2d7ae?w=800&h=600&fit=crop&auto=format', label: 'Озеленення входу' },
]

export default function CommercialPage() {
  return (
    <>
      <Seo
        title="Комерційне озеленення — готелі, офіси, ЖК | GREENLABS"
        description="Озеленення та ландшафтний дизайн комерційних об'єктів у Львові — готелі, офіси, ЖК-комплекси. Проєктування та сезонне обслуговування території бізнесу."
        breadcrumbs={[
          { name: 'Головна', path: '/' },
          { name: "Комерційний об'єкт", path: '/commercial' },
        ]}
      />
      <PageBanner
        eyebrow="Комерційний об'єкт"
        title="Представницька зелень для бізнесу"
        desc="Готелі, ресторани, офіси та ЖК-комплекси. Проєктуємо й обслуговуємо озеленення, що витримує навантаження комерційного простору і працює на імідж вашого бізнесу."
        img="https://images.unsplash.com/photo-1758526116322-52919e89b3c3?w=1600&h=1000&fit=crop&auto=format"
      />
      <Characteristics title="Що включає робота над комерційним об'єктом" items={CHARACTERISTICS} />
      <Process />
      <ExamplesSection
        eyebrow="Приклади оформлення"
        title="Як може виглядати ваш об'єкт"
        note="Це демонстрація механіки «до/після» на ілюстративних фото — потягніть повзунок. Реальні кейси комерційних об'єктів додамо, щойно погодимо фото з клієнтами."
        items={EXAMPLES}
      />
      <LeadForm />
    </>
  )
}
