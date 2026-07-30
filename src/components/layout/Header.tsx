import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { NAV } from '../../data/data'
import { IcoClose, IcoMenu } from '../ui/Icons'
import { useConsultationModal } from '../ui/ConsultationModalContext'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { open: openConsultation } = useConsultationModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const textCls = scrolled ? 'text-ink' : 'text-white'

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-gray-100/80 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.07)]' : 'bg-black/15 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={`${import.meta.env.BASE_URL}logo/logo-v2.webp`} alt="GREENLABS" className="h-10 md:h-14 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 xl:gap-8 flex-1 justify-center">
          {NAV.map((n) =>
            n.href.includes('#') ? (
              <a key={n.label} href={n.href} className={`text-[13px] font-medium font-sans tracking-wide transition-colors hover:opacity-60 ${textCls}`}>{n.label}</a>
            ) : (
              <Link key={n.label} to={n.href} className={`text-[13px] font-medium font-sans tracking-wide transition-colors hover:opacity-60 ${textCls}`}>{n.label}</Link>
            )
          )}
        </nav>

        <div className="hidden md:flex items-center gap-5 shrink-0 ml-auto">
          <a href="tel:+380976952473" className={`text-[13px] font-sans font-medium transition-colors hover:opacity-60 ${textCls}`}>
            +38 (097) 695-24-73
          </a>
          <button type="button" onClick={openConsultation} className="bg-terra text-white text-[13px] font-display font-semibold px-5 py-2.5 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200">
            Консультація
          </button>
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden ml-auto active:scale-90 transition-transform duration-150 ${textCls}`} aria-label="Меню">
          {open ? <IcoClose /> : <IcoMenu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-cream/85 backdrop-blur-md border-t border-[#e6e2db] px-6 py-6 flex flex-col gap-5 animate-drawer-in">
          {NAV.map((n) =>
            n.href.includes('#') ? (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="text-ink text-[16px] font-sans font-medium">{n.label}</a>
            ) : (
              <Link key={n.label} to={n.href} onClick={() => setOpen(false)} className="text-ink text-[16px] font-sans font-medium">{n.label}</Link>
            )
          )}
          <div className="pt-4 border-t border-[#e6e2db] flex flex-col gap-3">
            <a href="tel:+380976952473" className="text-ink text-[15px] font-sans">+38 (097) 695-24-73</a>
            <button
              type="button"
              onClick={() => { setOpen(false); openConsultation() }}
              className="bg-terra text-white text-center text-[15px] font-display font-semibold px-5 py-3.5 rounded-lg active:scale-95 transition-transform duration-150"
            >
              Отримати консультацію
            </button>
          </div>
        </div>
      )}
    </header>
  )
}