import { useState } from 'react'
import { SectionWave } from '../ui/SectionWave'
import { Reveal } from '../ui/Reveal'
import { Eyebrow } from '../ui/Eyebrow'
import { IcoCheck, IcoPhone } from '../ui/Icons'
import { useConsultationModal } from '../ui/ConsultationModalContext'
import type { ServiceCard } from '../../lib/sanity'

const SOTKA_M2 = 100

const money = (n: number) => Math.round(n).toLocaleString('uk-UA')

/** Скільки одиниць виміру в заданій площі — залежно від того, чим міряють послугу. */
function quantity(basis: string | undefined, areaM2: number) {
  if (basis === 'm2') return areaM2
  if (basis === 'sotka') return areaM2 / SOTKA_M2
  if (basis === 'fixed') return 1
  return 0
}

/**
 * Калькулятор-орієнтир на сторінці послуг.
 *
 * Свідомо не вдає точність: показує вилку «від–до» з тих самих цін, що і в
 * картках, і кожен результат веде до менеджера. Послуги без ціни або з базою
 * «не рахувати» у список не потрапляють, тож калькулятор не бреше про те,
 * чого не знає, і зникає повністю, поки ціни не заповнені.
 */
export const calculable = (services: ServiceCard[]) =>
  services.filter((s) => s.price?.from && s.price.basis && s.price.basis !== 'none')

/** Менш ніж дві порахованих послуги — калькулятор не має що порівнювати, тож не показуємо. */
export const hasCalculator = (services: ServiceCard[]) => calculable(services).length >= 2

export function PriceCalculator({ services, above }: { services: ServiceCard[]; above?: string }) {
  const { open } = useConsultationModal()
  const [picked, setPicked] = useState<string[]>([])
  const [area, setArea] = useState('600')

  const usable = calculable(services)
  if (usable.length < 2) return null

  const areaM2 = Math.max(0, Number(area.replace(',', '.')) || 0)
  const chosen = usable.filter((s) => picked.includes(s._id))

  const total = chosen.reduce(
    (acc, s) => {
      const qty = quantity(s.price?.basis, areaM2)
      const from = (s.price?.from ?? 0) * qty
      return { from: acc.from + from, to: acc.to + (s.price?.to ?? s.price?.from ?? 0) * qty }
    },
    { from: 0, to: 0 },
  )

  const toggle = (id: string) =>
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const ready = chosen.length > 0 && areaM2 > 0 && total.from > 0

  return (
    <section className="relative py-24 bg-parchment">
      <SectionWave shape="double" className="text-parchment" above={above} />

      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="mb-12 max-w-160">
          <Eyebrow className="mb-3">Орієнтовний розрахунок</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[28px] md:text-[40px] leading-[1.1] mb-4">
            Прикиньте бюджет за хвилину
          </h2>
          <p className="text-stone text-[14px] font-sans leading-[1.72]">
            Оберіть роботи й вкажіть площу — покажемо вилку з наших чинних цін. Це орієнтир для планування, а не
            кошторис: точну суму менеджер називає після розмови, бо вона залежить від стану ділянки, підʼїзду для
            техніки та обраних матеріалів.
          </p>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
          <Reveal className="flex flex-col gap-6">
            <div>
              <p className="text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-3">
                Що потрібно зробити
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {usable.map((s) => {
                  const active = picked.includes(s._id)
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => toggle(s._id)}
                      aria-pressed={active}
                      className={`flex items-start gap-2.5 text-left rounded-xl p-4 border transition-all duration-200 ${
                        active
                          ? 'bg-green border-green text-cream'
                          : 'bg-cream border-[#d9d6d0] text-ink hover:border-green'
                      }`}
                    >
                      <span className={`mt-0.5 shrink-0 ${active ? 'text-cream' : 'text-green/35'}`}>
                        <IcoCheck className="w-4 h-4" />
                      </span>
                      <span className="text-[13px] font-sans leading-snug">{s.title}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="calc-area"
                className="block text-stone text-[11px] font-display font-semibold uppercase tracking-wider mb-3"
              >
                Площа ділянки, м²
              </label>
              <input
                id="calc-area"
                type="number"
                inputMode="numeric"
                min={0}
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full sm:w-60 bg-cream border border-[#d9d6d0] rounded-xl px-4 py-3.5 text-ink text-[15px] font-sans focus:border-green focus:outline-none transition-colors"
              />
              {areaM2 > 0 && (
                <p className="text-stone text-[12px] font-sans mt-2">
                  Це приблизно {(areaM2 / SOTKA_M2).toFixed(1).replace('.', ',')} сотки
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={100} className="bg-green rounded-2xl p-6 md:p-8 flex flex-col gap-4">
            <p className="text-cream/60 text-[11px] font-display font-semibold uppercase tracking-wider">
              Орієнтовно
            </p>

            {ready ? (
              <p className="font-display font-bold text-cream text-[26px] md:text-[32px] leading-none">
                {total.to > total.from ? `${money(total.from)}–${money(total.to)}` : money(total.from)}
                <span className="text-[16px] font-semibold text-cream/70"> грн</span>
              </p>
            ) : (
              <p className="text-cream/70 text-[14px] font-sans leading-[1.6]">
                Оберіть хоча б одну роботу і вкажіть площу.
              </p>
            )}

            <p className="text-cream/55 text-[12px] font-sans leading-[1.65]">
              Цифра орієнтовна і не є пропозицією. Матеріали, підготовка основи та вивіз ґрунту рахуються окремо —
              менеджер уточнить це за 5 хвилин розмови.
            </p>

            <button
              type="button"
              onClick={open}
              className="bg-terra text-white font-display font-semibold text-[14px] px-6 py-3.5 rounded-lg hover:bg-[#b35c34] active:scale-95 transition-all duration-200"
            >
              Уточнити суму в менеджера
            </button>

            <a
              href="tel:+380976952473"
              className="inline-flex items-center justify-center gap-2 text-cream/80 font-display font-semibold text-[13px] hover:text-cream transition-colors"
            >
              <IcoPhone className="w-4 h-4" />
              +38 (097) 695-24-73
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
