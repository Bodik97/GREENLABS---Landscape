/**
 * Хвиляста лінія стику: край секції піднімається і опускається.
 *
 * Два режими, бо зона над самою хвилею мусить чимось бути залита:
 *
 * - `above` заданий (колір блока зверху) — хвиля лежить у межах своєї секції
 *   і нічого не перекриває. Це основний режим.
 * - `above` не заданий — хвиля виступає вгору за межі секції і прозорою
 *   частиною показує те, що під нею. Потрібно там, де блок зверху не має
 *   рівного кольору: фото героя, фонове фото форми заявки.
 *
 * `preserveAspectRatio="none"` розтягує контур на будь-яку ширину, тож висота
 * хвилі лишається сталою і на телефоні, і на широкому екрані.
 */

const H = 90

/** Кожен контур закінчується заливкою низу, щоб хвиля змикалася з тілом секції. */
const SHAPES = {
  /** Пологий підйом зліва, спуск праворуч. */
  calm: `M0,74 C240,26 420,86 720,58 C1020,30 1220,72 1440,34 L1440,${H} L0,${H} Z`,
  /** Дзеркальна до calm — щоб сусідні стики не повторювались. */
  mirror: `M0,34 C220,72 420,30 720,58 C1020,86 1200,26 1440,74 L1440,${H} L0,${H} Z`,
  /** Один високий горб посередині. */
  crest: `M0,80 C300,80 420,14 720,14 C1020,14 1140,80 1440,80 L1440,${H} L0,${H} Z`,
  /** Дві хвилі — найактивніший стик. */
  double: `M0,58 C180,18 300,78 480,52 C660,26 780,80 960,50 C1140,20 1280,66 1440,40 L1440,${H} L0,${H} Z`,
} as const

export type WaveShape = keyof typeof SHAPES

const SIZE = 'h-[46px] md:h-[69px]'

export function SectionWave({
  shape = 'calm',
  className = '',
  above,
}: {
  shape?: WaveShape
  /** Колір самої секції — `text-*`, бо контур заливається currentColor. */
  className?: string
  /** Колір блока зверху — `bg-*`. Без нього хвиля виступає за межі секції. */
  above?: string
}) {
  const path = (
    <svg
      aria-hidden="true"
      viewBox={`0 0 1440 ${H}`}
      preserveAspectRatio="none"
      className={`absolute inset-0 w-full h-full ${className}`}
    >
      <path d={SHAPES[shape]} fill="currentColor" />
    </svg>
  )

  if (!above) {
    return (
      <div className={`pointer-events-none absolute inset-x-0 -top-[45px] md:-top-[68px] ${SIZE}`}>{path}</div>
    )
  }

  return (
    <div className={`pointer-events-none absolute inset-x-0 top-0 ${SIZE} ${above}`}>{path}</div>
  )
}
