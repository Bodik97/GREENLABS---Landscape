import { useEffect, useState } from 'react'
import { IcoClose } from './Icons'
import { ConsultationForm } from '../sections/ConsultationForm'
import { useConsultationModal } from './ConsultationModalContext'

/** Скільки триває зникання — стільки ж, скільки перехід у стилях нижче. */
const FADE = 250

export function ConsultationModal() {
  const { isOpen, close } = useConsultationModal()
  // Вікно живе в розмітці трохи довше за own стан: спершу знімаємо клас
  // «відкрито», даємо зникнути — і аж потім прибираємо. Інакше форма щезала б
  // миттєво, а вікно закривалось ривком.
  const [mounted, setMounted] = useState(isOpen)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMounted(true)
      // Наступний кадр: клас має лягти вже після того, як елемент з'явився,
      // інакше браузер не побачить зміни й переходу не буде.
      const id = requestAnimationFrame(() => setShown(true))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const id = setTimeout(() => setMounted(false), FADE)
    return () => clearTimeout(id)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, close])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200"
      style={{ opacity: shown ? 1 : 0 }}
      onClick={close}
    >
      <div
        className="bg-cream rounded-2xl p-8 md:p-10 max-w-125 w-full relative max-h-[90vh] overflow-y-auto transition-all duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ opacity: shown ? 1 : 0, transform: shown ? 'none' : 'translateY(16px) scale(0.98)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Закрити"
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-stone hover:text-ink hover:bg-parchment transition-colors"
        >
          <IcoClose className="w-5 h-5" />
        </button>
        <ConsultationForm from="Спливне вікно" />
      </div>
    </div>
  )
}
