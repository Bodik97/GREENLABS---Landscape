import type { ComponentType } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  PageBanner,
  Seo,
  Reveal,
  Eyebrow,
  Team,
  FaqSection,
  CountUp,
  JsonLd,
  jobPostingSchema,
  siteUrl,
  IcoArrow,
  IcoCheck,
  IcoChat,
  IcoClock,
  IcoPhone,
  IcoShield,
  IcoSteps,
  IcoTarget,
  IcoMail,
  SvcCare,
} from '../shared'
import { SectionWave } from '../components/ui/SectionWave'
import { VacancyForm, OTHER_POSITION } from '../components/sections/VacancyForm'
import { CareersNudge } from '../components/ui/HiringPrompts'
import { fileBanner } from '../lib/banner'
import { useSanity, imageUrl, VACANCIES_QUERY, type Vacancy } from '../lib/sanity'
import { Placeholder } from '../components/ui/Placeholder'
import { SvcDesign, SvcLawn, SvcLight, SvcPave, SvcPlant, SvcPond, SvcWater } from '../components/ui/Icons'
import {
  CAREER_BENEFITS,
  CONDITIONS,
  GROWTH_PATH,
  CAREERS_FAQ,
  CAREERS_CONTACTS,
  SALARY_CONFIRMED,
  POSTED_AT,
  VALID_THROUGH,
} from '../data/careers'

const CRUMBS = [
  { name: 'Головна', path: '/' },
  { name: 'Робота', path: '/robota' },
]

const BENEFIT_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  clock: IcoClock,
  shield: IcoShield,
  steps: IcoSteps,
  tools: SvcCare,
  chat: IcoChat,
  target: IcoTarget,
}

/** Значок вакансії: в адмінці обирають зі списку, тут назва стає малюнком. */
const VACANCY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  plant: SvcPlant,
  lawn: SvcLawn,
  pave: SvcPave,
  water: SvcWater,
  care: SvcCare,
  design: SvcDesign,
  light: SvcLight,
  pond: SvcPond,
}

/** «25 000» замість «25000»: суму треба схопити оком, а не перерахувати нулі. */
const money = (value: number) => new Intl.NumberFormat('uk-UA').format(value)

/**
 * Рядок про гроші в картці вакансії.
 *
 * Порожня нижня межа — не недогляд, а свідомий вибір: краще чесне «за
 * домовленістю», ніж сума, нижча за ринок, від якої фахівець розвертається.
 * Тому в адмінці поле необовʼязкове.
 */
function Salary({ from, to }: { from?: number; to?: number }) {
  const підпис = !from ? 'Оплата за домовленістю' : to ? `${money(from)}–${money(to)} ₴` : `від ${money(from)} ₴`
  return (
    <p className="font-display font-bold text-terra text-[17px] mb-3">
      {підпис}
      {from ? <span className="text-stone font-sans font-normal text-[12px]"> / місяць</span> : null}
    </p>
  )
}

/**
 * Опис вакансії для Google Jobs.
 *
 * Google хоче саме розмітку, а не голий рядок: список вимог у <ul> він показує
 * списком, а те саме через кому — суцільним абзацом.
 */
const jobDescription = (v: Vacancy) =>
  `<p>${v.summary}</p>` +
  (v.requirements?.length
    ? `<p><strong>Вимоги:</strong></p><ul>${v.requirements.map((r) => `<li>${r}</li>`).join('')}</ul>`
    : '') +
  `<p><strong>Графік:</strong> ${v.schedule}</p>`

export default function CareersPage() {
  const { data: vacancies, loading, error } = useSanity<Vacancy[]>(VACANCIES_QUERY)
  /** Обрана посада. Порожня, поки людина не тицьнула, — тоді береться перша. */
  const [picked, setPicked] = useState('')
  const formRef = useRef<HTMLDivElement>(null)
  const { hash } = useLocation()

  const scrollToForm = () => formRef.current?.scrollIntoView({ block: 'start' })

  /**
   * Прихід одразу до форми — з картки про набір, посиланням /robota#vidhuk.
   *
   * ScrollToTop уміє якорі, але тут його замало: він прокручує, щойно вузол
   * зʼявився в DOM, а сторінка після того ще підростає — шрифти, банер, фото
   * команди. Промах виходив на 400 пікселів: людина бачила заголовок секції, а
   * поля лишались за краєм екрана.
   *
   * Тому доводимо двічі: одразу після появи вакансій і ще раз за півсекунди,
   * коли макет уже влігся. Друга прокрутка спрацьовує, лише якщо промах справді
   * помітний, — інакше сторінка смикалась би на рівному місці.
   */
  useEffect(() => {
    if (hash !== '#vidhuk' || !vacancies) return

    const кадр = requestAnimationFrame(scrollToForm)
    const доводчик = setTimeout(() => {
      const зверху = formRef.current?.getBoundingClientRect().top ?? 0
      if (Math.abs(зверху) > 120) scrollToForm()
    }, 500)

    return () => {
      cancelAnimationFrame(кадр)
      clearTimeout(доводчик)
    }
  }, [hash, vacancies])

  const apply = (slug: string) => {
    setPicked(slug)
    scrollToForm()
  }

  // Порожній масив краще за падіння: сторінка лишається живою і з формою,
  // навіть якщо всі вакансії сховані в адмінці.
  const список = vacancies ?? []
  const position = picked || список[0]?.slug || OTHER_POSITION

  if (loading) return <Placeholder note="Завантажуємо вакансії…" />
  if (error) return <Placeholder note="Не вдалося завантажити вакансії. Перевірте зʼєднання і спробуйте оновити сторінку." />

  return (
    <>
      <Seo
        title="Робота озеленювачем і садівником у Львові — вакансії"
        description="Вакансії у Львові: садівник, озеленювач, майстер мощення, монтажник поливу, різнороб. Робота цілий рік, оплата вчасно. Залиште відгук — передзвонимо за день."
        breadcrumbs={CRUMBS}
      />

      {/* Окрема розмітка на кожну вакансію — так їх бачить Google Jobs. Суми
          додаються лише після того, як вилки звірені з власником. */}
      {список.map((v) => (
        <JsonLd
          key={v._id}
          data={jobPostingSchema({
            id: v.slug,
            title: v.title,
            description: jobDescription(v),
            datePosted: POSTED_AT,
            validThrough: VALID_THROUGH,
            url: siteUrl('/robota'),
            // Вилка потрапляє в Google Jobs, лише коли вона є і власник її
            // підтвердив: там це офіційна заявка роботодавця, а не орієнтир.
            salary:
              SALARY_CONFIRMED && v.salaryFrom
                ? { from: v.salaryFrom, to: v.salaryTo ?? v.salaryFrom }
                : undefined,
          })}
        />
      ))}

      <PageBanner
        eyebrow="Робота в GREENLABS"
        title="Робота в озелененні у Львові — приєднуйтесь до команди"
        desc="Відкриті вакансії у Львові: садівник, озеленювач, майстер мощення, монтажник поливу, різноробочий. Робота цілий рік, оплата вчасно."
        {...fileBanner('banner-about')}
        breadcrumbs={CRUMBS}
        action={
          <button
            type="button"
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 bg-terra text-white font-display font-semibold text-[15px] px-7 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
          >
            Залишити відгук
            <IcoArrow className="w-4 h-4" />
          </button>
        }
      />

      {/* Чому в нас */}
      <section className="relative py-24 bg-cream">
        <SectionWave shape="calm" className="text-cream" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-14">
            <Eyebrow className="mb-3">Чому ми</Eyebrow>
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-150">
              Що ви отримуєте, крім зарплати
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAREER_BENEFITS.map((item, i) => {
              const Icon = BENEFIT_ICONS[item.icon]
              return (
                <Reveal key={item.title} delay={(i % 3) * 60}>
                  <div className="bg-parchment rounded-2xl p-6 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                    <span className="text-green mb-4 inline-flex">
                      <Icon className="w-6 h-6" />
                    </span>
                    <h3 className="font-display font-semibold text-ink text-[15px] mb-2">{item.title}</h3>
                    <p className="text-stone text-[12px] font-sans leading-[1.65]">{item.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Відкриті вакансії */}
      <section id="vakansii" className="relative py-24 bg-parchment scroll-mt-24">
        <SectionWave shape="mirror" className="text-parchment" above="text-cream" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-14">
            <Eyebrow className="mb-3">Вакансії</Eyebrow>
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-150">
              Кого шукаємо просто зараз
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {список.map((v, i) => {
              const Icon = VACANCY_ICONS[v.icon ?? 'plant'] ?? SvcPlant
              return (
              <Reveal key={v._id} delay={(i % 3) * 60}>
                <article className="bg-cream rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
                  {/* Фото, якщо його додали в адмінці; якщо ні — той самий
                      значок, що був. Кандидат шукає в кадрі себе, тож фото
                      працює краще, але порожньої дірки в картці бути не має. */}
                  {v.image?.asset ? (
                    <img
                      src={imageUrl(v.image, 720, 420)}
                      alt={v.image.alt || v.title}
                      width={720}
                      height={420}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[12/7] object-cover"
                    />
                  ) : null}
                  <div className="p-6 flex flex-col flex-1">
                  {!v.image?.asset && (
                    <span className="text-green mb-4 inline-flex">
                      <Icon className="w-8 h-8" />
                    </span>
                  )}
                  <h3 className="font-display font-semibold text-ink text-[18px] mb-2">{v.title}</h3>
                  <Salary from={v.salaryFrom} to={v.salaryTo} />
                  <p className="text-stone text-[12px] font-sans leading-[1.65] mb-5">{v.summary}</p>

                  <ul className="flex flex-col gap-2 mb-5">
                    {v.requirements?.map((r) => (
                      <li key={r} className="flex gap-2.5 text-stone text-[12px] font-sans leading-[1.55]">
                        <IcoCheck className="w-4 h-4 text-green shrink-0 mt-px" />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <p className="flex items-center gap-2 text-stone text-[12px] font-sans mb-6">
                    <IcoClock className="w-4 h-4 text-green shrink-0" />
                    {v.schedule}
                  </p>

                  {/* mt-auto: кнопки в сусідніх картках стоять на одній лінії,
                      навіть якщо вимог у них різна кількість. */}
                  <button
                    type="button"
                    onClick={() => apply(v.slug)}
                    className="mt-auto w-full bg-terra text-white font-display font-semibold text-[14px] py-3.5 rounded-lg hover:bg-[#b35c34] active:scale-95 transition-all duration-200"
                  >
                    Відгукнутись
                  </button>
                  </div>
                </article>
              </Reveal>
              )
            })}
          </div>

          {!список.length && (
            <p className="text-stone text-[14px] font-sans leading-[1.65] max-w-150">
              Просто зараз відкритих вакансій немає. Але руки нам потрібні постійно — залиште відгук нижче, і ми
              звернемось, щойно зʼявиться місце.
            </p>
          )}

          <Reveal className="mt-8">
            <p className="text-stone text-[13px] font-sans leading-[1.65]">
              Не знайшли себе в списку?{' '}
              <button type="button" onClick={() => apply(OTHER_POSITION)} className="text-terra font-semibold underline underline-offset-2 hover:text-[#b35c34] transition-colors">
                Напишіть нам однаково
              </button>{' '}
              — руки потрібні завжди, а посаду знайдемо під людину.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Умови цифрами */}
      <section className="relative bg-green py-14 md:py-16">
        <SectionWave shape="crest" className="text-green" above="text-parchment" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-10">
            <Eyebrow dark className="mb-3">Умови</Eyebrow>
            <h2 className="font-display font-bold text-cream text-[28px] md:text-[40px] leading-[1.08] max-w-150">
              Домовленості, які не змінюються заднім числом
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {CONDITIONS.map((fact, i) => (
              <Reveal key={fact.label} delay={i * 70} className="text-center lg:text-left">
                {/* Той самий лічильник, що на сторінці послуг: число набігає від
                    нуля, коли блок доходить до екрана. Значення без цифр — на
                    кшталт «Сезонні» — він показує як є, без анімації. */}
                <p className="font-display font-bold text-cream text-[24px] md:text-[30px] leading-none mb-2">
                  <CountUp value={fact.value} />
                </p>
                <p className="text-cream/60 text-[12px] md:text-[13px] font-sans leading-snug">{fact.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Шлях росту */}
      <section className="relative py-24 bg-cream">
        <SectionWave shape="double" className="text-cream" above="text-green" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-14">
            <Eyebrow className="mb-3">Розвиток</Eyebrow>
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-150">
              Від помічника до бригадира
            </h2>
            <p className="text-stone text-[14px] font-sans leading-[1.72] max-w-150 mt-4">
              Ми ростимо своїх, а не шукаємо готових на кожну позицію. Терміни нижче — реальні для того, хто
              хоче вчитись; вони не залежать від того, скільки ви «відсиділи» в компанії.
            </p>
          </Reveal>

          <div className="hidden md:block relative">
            <div className="absolute top-8 left-[12%] right-[12%] h-px bg-[#d9d6d0]" />
            <div className="grid grid-cols-4 gap-4">
              {GROWTH_PATH.map((s, i) => (
                <Reveal key={s.n} delay={i * 90}>
                  <div className="relative text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-[#d9d6d0] bg-cream flex items-center justify-center z-10 mb-5 font-display font-bold text-terra text-[15px] transition-transform duration-300 hover:scale-110 hover:border-terra">
                      {s.n}
                    </div>
                    <h3 className="font-display font-semibold text-ink text-[16px] mb-1.5">{s.title}</h3>
                    <p className="text-stone text-[12px] font-sans leading-[1.55] mb-2">{s.desc}</p>
                    <span className="text-[11px] font-display font-semibold text-terra">{s.dur}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="md:hidden flex flex-col">
            {GROWTH_PATH.map((s, i) => (
              <div key={s.n} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#d9d6d0] bg-cream flex items-center justify-center shrink-0 font-display font-bold text-terra text-[13px]">
                    {s.n}
                  </div>
                  {i < GROWTH_PATH.length - 1 && <div className="w-px flex-1 bg-[#d9d6d0] my-1" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-display font-semibold text-ink text-[16px] mb-1">{s.title}</h3>
                  <p className="text-stone text-[12px] font-sans leading-snug mb-1">{s.desc}</p>
                  <span className="text-[11px] font-display font-semibold text-terra">{s.dur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Team above="text-cream" />

      {/* Форма відгуку */}
      <section ref={formRef} id="vidhuk" className="relative py-24 bg-green scroll-mt-20">
        {/* Фото за формою — те саме, що в клієнтській заявці на решті сайту.
            Секція була суцільно зеленою й через це читалась як службова
            вставка, хоча це головна дія сторінки. Тегом <img>, а не фоном у
            стилях: так браузер вибирає розмір під екран і вантажить кадр лише
            коли до нього дійшли — секція в самому низу. */}
        <div className="absolute inset-0 overflow-hidden">
          <picture className="block w-full h-full">
            {/* На вертикальному екрані широкий кадр майже весь пішов би під
                обрізку — там окремий портретний. */}
            <source media="(max-aspect-ratio: 1/1)" srcSet={`${import.meta.env.BASE_URL}img/lead-form-portrait.webp`} />
            <img
              src={`${import.meta.env.BASE_URL}img/lead-form-1280.webp`}
              srcSet={[640, 960, 1280, 1920]
                .map((w) => `${import.meta.env.BASE_URL}img/lead-form-${w}.webp ${w}w`)
                .join(', ')}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </picture>
        </div>
        {/* Затемнення щільніше, ніж у клієнтській формі: тут поверх лежить не
            лише заголовок, а й світла картка з полями. */}
        <div className="absolute inset-0 bg-linear-to-b from-green/85 via-green/70 to-green/90" />
        {/* Після затемнення: інакше воно лягає й на хвилю, і на стику
            зʼявляється смуга іншого відтінку. */}
        <SectionWave shape="calm" className="text-green" above="text-parchment" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="mb-10 text-center">
            <Eyebrow dark center className="mb-3">Відгук</Eyebrow>
            <h2 className="font-display font-bold text-cream text-[32px] md:text-[44px] leading-[1.08] max-w-150 mx-auto">
              Три поля — і ми вам передзвонимо
            </h2>
            <p className="text-cream/70 text-[14px] font-sans leading-[1.72] max-w-125 mx-auto mt-4">
              Резюме не потрібне. Розкажіть про себе на співбесіді — або просто зателефонуйте, якщо так зручніше.
            </p>
          </Reveal>

          <Reveal className="max-w-137 mx-auto">
            <div className="bg-cream rounded-2xl p-6 md:p-9">
              <VacancyForm vacancies={список} position={position} onPositionChange={setPicked} />
            </div>
          </Reveal>
        </div>
      </section>

      <FaqSection above="text-green" items={CAREERS_FAQ} title="Питання від кандидатів" />

      {/* Фінальний заклик */}
      <section className="relative py-20 bg-parchment">
        <SectionWave shape="mirror" className="text-parchment" above="text-cream" />
        <div className="relative max-w-7xl mx-auto px-6">
          <Reveal className="max-w-150">
            <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.08] mb-4">
              Зателефонуйте, якщо писати незручно
            </h2>
            <p className="text-stone text-[14px] font-sans leading-[1.72] mb-8">
              Відповідаємо в робочий час: Пн–Пт 9:00–18:00, Сб 10:00–15:00. Розкажемо про вакансію та умови
              без зобовʼязань — навіть якщо ви лише придивляєтесь.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={CAREERS_CONTACTS.phoneHref}
                className="inline-flex items-center justify-center gap-2 bg-terra text-white font-display font-semibold text-[15px] px-7 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
              >
                <IcoPhone className="w-4 h-4" />
                {CAREERS_CONTACTS.phone}
              </a>
              <a
                href={`mailto:${CAREERS_CONTACTS.email}`}
                className="inline-flex items-center justify-center gap-2 border border-green/25 text-green font-display font-semibold text-[15px] px-7 py-4 rounded-lg hover:bg-green/5 active:scale-95 transition-all duration-200"
              >
                <IcoMail className="w-4 h-4" />
                {CAREERS_CONTACTS.email}
              </a>
            </div>
            <p className="text-stone text-[13px] font-sans mt-6">
              А поки — подивіться,{' '}
              <Link to="/works" className="text-terra font-semibold underline underline-offset-2 hover:text-[#b35c34] transition-colors">
                що саме робить наша команда
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <CareersNudge onApply={scrollToForm} />
    </>
  )
}
