import { Link } from 'react-router-dom'
import { NAV, SERVICES } from '../../data/data'
import { IcoPin, IcoPhone, IcoMail, IcoClock, IcoFacebook, IcoInstagram } from '../ui/Icons'

export function Footer() {
  const socials = [
    { label: 'Facebook', href: '#', Icon: IcoFacebook },
    { label: 'Instagram', href: 'https://www.instagram.com/landspace_design10', Icon: IcoInstagram },
    { label: 'Email', href: 'mailto:labs17@gmail.com', Icon: IcoMail },
  ]

  return (
    <footer className="bg-green pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="inline-flex items-center bg-cream rounded-xl p-2 mb-5">
              <img src="/logo-v2.webp" alt="GREENLABS" className="h-10 md:h-14 w-auto object-contain" />
            </div>
            <p className="text-cream/55 text-[12px] font-sans leading-[1.72] mb-6">
              Студія ландшафтного дизайну у Львові. Від першого ескізу до вічнозеленого результату.
            </p>
            <div className="flex gap-2.5">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-11 h-11 rounded-full border border-white/18 flex items-center justify-center hover:border-white/45 hover:bg-white/5 transition-colors">
                  <s.Icon className="w-[18px] h-[18px] text-cream/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-cream text-[11px] tracking-[0.12em] uppercase mb-5">Меню</h4>
            <ul className="flex flex-col gap-3">
              {NAV.map((n) => (
                <li key={n.label}>
                  {n.href.includes('#') ? (
                    <a href={n.href} className="text-cream/55 text-[12px] font-sans hover:text-cream transition-colors">{n.label}</a>
                  ) : (
                    <Link to={n.href} className="text-cream/55 text-[12px] font-sans hover:text-cream transition-colors">{n.label}</Link>
                  )}
                </li>
              ))}
              <li><Link to="/private" className="text-cream/55 text-[12px] font-sans hover:text-cream transition-colors">Приватна ділянка</Link></li>
              <li><Link to="/commercial" className="text-cream/55 text-[12px] font-sans hover:text-cream transition-colors">Комерційний об'єкт</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-cream text-[11px] tracking-[0.12em] uppercase mb-5">Послуги</h4>
            <ul className="flex flex-col gap-3">
              {SERVICES.slice(0, 6).map((s) => (
                <li key={s.title}><Link to="/services" className="text-cream/55 text-[12px] font-sans hover:text-cream transition-colors">{s.title}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-cream text-[11px] tracking-[0.12em] uppercase mb-5">Контакти</h4>
            <ul className="flex flex-col gap-4">
              {[
                { lbl: 'Адреса', val: 'Львів', href: '#', Icon: IcoPin },
                { lbl: 'Телефон', val: '+38 (097) 695-24-73', href: 'tel:+380976952473', Icon: IcoPhone },
                { lbl: 'Email', val: 'labs17@gmail.com', href: 'mailto:labs17@gmail.com', Icon: IcoMail },
              ].map((c) => (
                <li key={c.lbl} className="flex gap-2.5">
                  <c.Icon className="w-4 h-4 text-terra shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cream/55 text-[10px] font-display uppercase tracking-wider mb-0.5">{c.lbl}</p>
                    <a href={c.href} className="text-cream/72 text-[12px] font-sans hover:text-cream transition-colors">{c.val}</a>
                  </div>
                </li>
              ))}
              <li className="flex gap-2.5">
                <IcoClock className="w-4 h-4 text-terra shrink-0 mt-0.5" />
                <div>
                  <p className="text-cream/55 text-[10px] font-display uppercase tracking-wider mb-0.5">Години роботи</p>
                  <p className="text-cream/72 text-[12px] font-sans">Пн–Пт 9:00–18:00</p>
                  <p className="text-cream/72 text-[12px] font-sans">Сб 10:00–15:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-cream/55 text-[11px] font-sans">© 2026 GREENLABS Ландшафт. Всі права захищено.</p>
          <div className="flex gap-5">
            <a href="#" className="text-cream/55 text-[11px] font-sans hover:text-cream/60 transition-colors">Політика конфіденційності</a>
            <a href="#" className="text-cream/55 text-[11px] font-sans hover:text-cream/60 transition-colors">Публічна оферта</a>
          </div>
        </div>
      </div>
    </footer>
  )
}