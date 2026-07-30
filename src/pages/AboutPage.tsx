import type { ComponentType } from 'react'
import {
  PageBanner,
  LeadForm,
  Seo,
  Reveal,
  Eyebrow,
  Team,
  WHY_CHOOSE_US,
  IcoTarget,
  IcoCycle,
  IcoSteps,
  IcoShield,
  IcoPhone,
} from '../shared'
import { SvcPlant } from '../components/ui/Icons'

const WHY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  target: IcoTarget,
  plant: SvcPlant,
  cycle: IcoCycle,
  steps: IcoSteps,
  shield: IcoShield,
  phone: IcoPhone,
}

export default function AboutPage() {
  return (
    <>
      <Seo
        title="Про нас — команда GREENLABS | Ландшафтний дизайн Львів"
        description="GREENLABS — студія ландшафтного дизайну у Львові. Індивідуальний підхід, повний цикл робіт в одній команді та гарантія на всі роботи."
        breadcrumbs={[
          { name: 'Головна', path: '/' },
          { name: 'Про нас', path: '/about' },
        ]}
      />
      <PageBanner
        eyebrow="Про нас"
        title="Команда, що перетворює ділянки на живий простір"
        desc="GREENLABS — студія ландшафтного дизайну у Львові. Ми поєднуємо продуманий план і живу природу, щоб простір навколо вашого дому чи бізнесу працював на вас роками."
        img={`${import.meta.env.BASE_URL}img/banner-about.webp`}
      />

      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="max-w-170 flex flex-col gap-5">
            <p className="text-ink text-[16px] font-sans leading-[1.72]">
              Ми вважаємо, що ділянка — це не просто територія навколо будівлі, а частина того, як ви живете.
              Тому перш ніж запропонувати рішення, ми вивчаємо, як ви користуєтесь простором: де любите
              снідати, куди виходять діти гратись, як рухається сонце над ділянкою протягом дня.
            </p>
            <p className="text-ink text-[16px] font-sans leading-[1.72]">
              Ландшафт, який враховує ці деталі, служить довше і приносить більше задоволення, ніж просто
              красива картинка.
            </p>
          </Reveal>
        </div>
      </section>

      <Team />

      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-14">
            <Eyebrow className="mb-3">Чому обирають нас</Eyebrow>
            <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08] max-w-125">
              Що ми гарантуємо на кожному проєкті
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CHOOSE_US.map((item, i) => {
              const Icon = WHY_ICONS[item.icon]
              return (
                <Reveal key={item.title} delay={(i % 6) * 60}>
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

      <LeadForm />
    </>
  )
}
