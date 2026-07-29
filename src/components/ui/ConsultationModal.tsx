import { useEffect } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { IcoClose } from './Icons'
import { ConsultationForm } from '../sections/ConsultationForm'
import { useConsultationModal } from './ConsultationModalContext'

export function ConsultationModal() {
  const { isOpen, close } = useConsultationModal()

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

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <m.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-cream rounded-2xl p-8 md:p-10 max-w-125 w-full relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Закрити"
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-stone hover:text-ink hover:bg-parchment transition-colors"
            >
              <IcoClose className="w-5 h-5" />
            </button>
            <ConsultationForm />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
