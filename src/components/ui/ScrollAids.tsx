import { useEffect, useState } from 'react'

function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const [deep, setDeep] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      setDeep(window.scrollY > window.innerHeight * 1.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return { progress, deep }
}

export function ScrollProgress() {
  const { progress } = useScrollProgress()

  return (
    <div className="fixed top-0 inset-x-0 z-60 h-0.5 pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-terra origin-left transition-transform duration-75 ease-out"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  )
}

    
export function BackToTop() {
  const { deep } = useScrollProgress()

  // Кнопка лишається в розмітці й ховається стилями: інакше зникнення нема чим
  // анімувати — елемента вже немає. Поява живе на обгортці, бо на самій кнопці
  // вже висять hover і active, і вони чіпають ту саму властивість.
  // `inert` прибирає кнопку з-під клавіатури, поки вона невидима.
  return (
    <div
      inert={!deep}
      className={`pop ${deep ? 'pop-open' : ''} fixed bottom-40 right-5.5 md:bottom-27 md:right-9.5 z-50`}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Нагору сторінки"
        className="w-11 h-11 rounded-full bg-cream/90 backdrop-blur-sm border border-e-amber-600 text-ink shadow-[0_4px_14px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-cream hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
      >
        <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 12.5V4M4 7.5L8 3.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
