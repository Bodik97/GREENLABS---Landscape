import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Проявляє блок, коли той доходить до екрана.
 *
 * `-60px` унизу: блок починає проявлятись трохи раніше, ніж торкнеться краю,
 * інакше на швидкому гортанні поява помітно запізнюється.
 *
 * Спостерігач відписується одразу після спрацювання — блок проявляється раз
 * і назад уже не ховається.
 */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        io.disconnect()
      },
      { rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'reveal-in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
