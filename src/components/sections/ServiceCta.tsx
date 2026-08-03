import { SectionWave } from '../ui/SectionWave'
import { Reveal } from '../ui/Reveal'
import { useConsultationModal } from '../ui/ConsultationModalContext'
import { IcoPhone } from '../ui/Icons'

/**
 * Проміжний заклик між блоками сторінки послуги.
 *
 * Головна дія сайту — розмова з менеджером, тому кнопка відкриває те саме
 * вікно консультації, що й у шапці, а поруч стоїть клікабельний телефон для
 * тих, кому швидше подзвонити, ніж заповнювати форму.
 */
export function ServiceCta({
  title = 'Порахуємо вартість саме для вашої ділянки',
  desc = 'Розкажіть площу й що хочете отримати — менеджер підкаже вилку по вашому випадку і домовиться про виїзд на ділянку.',
  above,
}: {
  title?: string
  desc?: string
  above?: string
}) {
  const { open } = useConsultationModal()

  return (
    <section className="relative py-20 bg-green">
      <SectionWave shape="mirror" className="text-green" above={above} />

      <Reveal className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-5">
        <h2 className="font-display font-bold text-cream text-[26px] md:text-[36px] leading-[1.12] max-w-160">{title}</h2>
        <p className="text-cream/70 text-[14px] md:text-[15px] font-sans leading-[1.65] max-w-150">{desc}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button
            type="button"
            onClick={open}
            className="bg-terra text-white font-display font-semibold text-[15px] px-8 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
          >
            Отримати консультацію
          </button>
          <a
            href="tel:+380976952473"
            className="inline-flex items-center justify-center gap-2 border border-cream/45 text-cream font-display font-semibold text-[15px] px-8 py-4 rounded-lg hover:bg-cream/10 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200"
          >
            <IcoPhone className="w-4 h-4" />
            +38 (097) 695-24-73
          </a>
        </div>
      </Reveal>
    </section>
  )
}
