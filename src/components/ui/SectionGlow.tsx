/**
 * М'які еліптичні плями на фоні секції — дають глибину на стику двох рівних
 * заливок, не змінюючи геометрію блоків.
 *
 * Це radial-gradient, а не `blur`: розмиття такої площі змушує браузер
 * перемальовувати шар на кожному кадрі скролу, а градієнт малюється один раз.
 *
 * Секція-господар має бути `relative overflow-hidden`, інакше плями вилізуть
 * на сусідні блоки.
 */
export function SectionGlow({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const [warm, cool] =
    tone === 'dark'
      ? ['rgba(196,106,63,0.22)', 'rgba(247,245,240,0.08)']
      : ['rgba(196,106,63,0.14)', 'rgba(31,61,43,0.13)']

  const blob = (color: string) => ({
    background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, transparent 72%)`,
  })

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-52 -left-40 w-[42rem] h-[30rem]" style={blob(cool)} />
      <div className="absolute top-1/3 -right-56 w-[38rem] h-[28rem]" style={blob(cool)} />
      <div className="absolute -bottom-56 -right-48 w-[48rem] h-[34rem]" style={blob(warm)} />
    </div>
  )
}
