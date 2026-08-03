import { useEffect, useRef, useState } from 'react'

/**
 * Витягує число з рядка на кшталт «1 200 м²» або «від 8».
 * Анімуємо тільки цифри, решту тексту лишаємо як написали в студії.
 */
function parse(value: string) {
  const match = value.match(/[\d\s ]*\d/)
  if (!match || match.index === undefined) return null
  const digits = match[0].replace(/[\s ]/g, '')
  const target = Number(digits)
  if (!Number.isFinite(target)) return null
  return {
    target,
    before: value.slice(0, match.index),
    after: value.slice(match.index + match[0].length),
    grouped: /[\s ]/.test(match[0]),
  }
}

/**
 * Малі числа рахуємо швидше: «0, 1, 2» за три секунди виглядає як зависання,
 * а не як анімація. Великі отримують більше часу, але не понад 2,8 с — темп
 * підібраний так, щоб лічбу було видно, а не вгадувати, що вона відбулась.
 */
const duration = (target: number) => Math.min(2800, 1500 + Math.log10(Math.abs(target) + 1) * 700)

/**
 * Цифра, що набігає від нуля, коли блок зʼявляється в екрані.
 *
 * Якщо число з рядка витягти не вдалось або людина просила менше руху —
 * показуємо значення як є. Рахунок іде один раз: повторна анімація при
 * кожному скролі дратує.
 */
export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const parsed = parse(value)
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState<number | null>(parsed ? 0 : null)
  const [progress, setProgress] = useState(parsed ? 0 : 1)

  useEffect(() => {
    if (!parsed || !ref.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(parsed.target)
      setProgress(1)
      return
    }

    let frame = 0
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const total = duration(parsed.target)
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / total, 1)
          // easeOutSine: різкі криві на кшталт easeOutExpo дострибують до
          // кінцевого числа за третину часу, і далі цифра просто стоїть.
          // Ця розподіляє лічбу рівномірніше — рух видно майже до кінця.
          const eased = Math.sin((t * Math.PI) / 2)
          setShown(Math.round(parsed.target * eased))
          // Підйом і проявлення встигають за перші ~45%, щоб блок устоявся,
          // поки цифри ще рахуються.
          setProgress(Math.min(t * 2.2, 1))
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(ref.current)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [parsed?.target])

  if (!parsed || shown === null) return <span className={className}>{value}</span>

  return (
    <span
      ref={ref}
      className={`inline-block ${className}`}
      // Цифра підіймається й проявляється рівно за тим же прогресом, що й лічба,
      // тож рух і число зупиняються одночасно.
      style={{
        opacity: 0.25 + progress * 0.75,
        transform: `translateY(${(1 - progress) * 10}px)`,
      }}
    >
      {parsed.before}
      {parsed.grouped ? shown.toLocaleString('uk-UA') : shown}
      {parsed.after}
    </span>
  )
}
