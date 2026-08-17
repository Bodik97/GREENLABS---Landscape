import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { trackFormOpen } from '../../lib/track'

type ConsultationModalCtx = {
  isOpen: boolean
  /** `from` — яка саме кнопка відкрила вікно; потрапляє у звіт про звернення. */
  open: (from: string) => void
  close: () => void
}

const Ctx = createContext<ConsultationModalCtx | null>(null)

const TIME_TRIGGER_MS = 45000
const TIME_TRIGGER_KEY = 'greenlabs-consultation-shown'

export function ConsultationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const shownRef = useRef(false)

  const markShown = () => {
    shownRef.current = true
    sessionStorage.setItem(TIME_TRIGGER_KEY, '1')
  }

  useEffect(() => {
    if (sessionStorage.getItem(TIME_TRIGGER_KEY)) return
    const timer = setTimeout(() => {
      // Сторінку читає не клієнт, а кандидат на роботу: пропозиція прорахувати
      // вартість саду там недоречна, і в неї є власне нагадування. Дивимось на
      // адресу саме тут, а не на монтажі: таймер один на всю сесію і має
      // пережити переходи між сторінками, а не перезапускатись на кожному.
      if (window.location.pathname.endsWith('/robota')) return
      if (!shownRef.current) {
        markShown()
        setIsOpen(true)
      }
    }, TIME_TRIGGER_MS)
    return () => clearTimeout(timer)
  }, [])

  // Рахуємо тільки те, що людина відкрила сама. Вікно за таймером вище
  // викликає setIsOpen напряму й у таблицю не потрапляє — це наша дія, не її.
  const open = (from: string) => { markShown(); trackFormOpen(from); setIsOpen(true) }
  const close = () => setIsOpen(false)

  return (
    <Ctx.Provider value={{ isOpen, open, close }}>
      {children}
    </Ctx.Provider>
  )
}

export function useConsultationModal() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useConsultationModal must be used within ConsultationModalProvider')
  return ctx
}
