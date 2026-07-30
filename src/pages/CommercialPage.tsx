import { PageBanner, Characteristics, ExamplesSection, Process, LeadForm, Seo } from '../shared'

const BASE = import.meta.env.BASE_URL

const CHARACTERISTICS = [
  "Готелі, ресторани, офіси, ЖК-комплекси",
  'Проєктування з урахуванням прохідності та експлуатаційних навантажень',
  'Договори на регулярне сезонне обслуговування території',
  'Мінімальний простій для відвідувачів та персоналу під час робіт',
  'Представницьке озеленення, що працює на імідж бізнесу',
  'Гарантія 12 місяців на всі роботи та висаджені рослини',
]

const EXAMPLES = [
  { img: `${BASE}img/commercial-grounds.webp`, label: 'Територія бізнес-центру' },
  { img: `${BASE}img/commercial-complex.webp`, label: 'Прибудинкова територія ЖК' },
  { img: `${BASE}img/commercial-entrance.webp`, label: 'Озеленення входу' },
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
        img={`${BASE}img/banner-commercial.webp`}
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
