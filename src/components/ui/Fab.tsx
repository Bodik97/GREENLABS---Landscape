import { useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { IcoPhone, IcoMail, IcoClose, IcoChat, IcoTelegram, IcoInstagram } from './Icons'

const CHANNELS = [
  { label: 'Подзвонити', href: 'tel:+380976952473', Icon: IcoPhone },
  { label: 'Telegram', href: 'https://t.me/+380976952473', Icon: IcoTelegram },
  { label: 'Viber', href: 'viber://chat?number=%2B380976952473', Icon: IcoChat },
  { label: 'Instagram', href: 'https://www.instagram.com/landspace_design10', Icon: IcoInstagram },
  { label: 'Email', href: 'mailto:labs17@gmail.com', Icon: IcoMail },
]

export function Fab() {
  const [open, setOpen] = useState(false)

  return (
    <div data-from="Кнопка збоку" className="fixed bottom-23 right-4 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-16 right-0 flex flex-col gap-2.5 items-end"
          >
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="w-44 flex items-center justify-between gap-3 bg-black/30 backdrop-blur-md text-white pl-4 pr-2 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-black/45 hover:-translate-x-1 transition-all duration-200 whitespace-nowrap"
              >
                <span className="text-[13px] font-display font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">{c.label}</span>
                <span className="w-9 h-9 rounded-full bg-white text-green flex items-center justify-center shrink-0">
                  <c.Icon className="w-4 h-4" />
                </span>
              </a>
            ))}
          </m.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Зв'язатись з нами"
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-terra text-white flex items-center justify-center shadow-[0_6px_24px_rgba(0,0,0,0.3)] hover:bg-[#b35c34] active:scale-95 transition-all duration-200"
      >
        {open ? <IcoClose className="w-6 h-6" /> : <IcoChat className="w-6 h-6" />}
      </button>
    </div>
  )
}
