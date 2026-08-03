import { Eyebrow } from '../ui/Eyebrow'
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs'

export function PageBanner({ eyebrow, title, desc, img, breadcrumbs }: { eyebrow: string; title: string; desc: string; img: string; breadcrumbs?: Crumb[] }) {
  return (
    <section className="relative min-h-[70vh] flex items-end pb-16 md:pb-24 pt-32">
      {/* Саме це фото — LCP сторінки. Тегом <img> замість фону, щоб браузер
          знайшов його сканером попереднього завантаження і взяв у роботу першим. */}
      <div className="absolute inset-0 bg-green">
        <img
          src={img}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-black/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {breadcrumbs && (
          <div className="animate-fade-up mb-4">
            <Breadcrumbs items={breadcrumbs} dark />
          </div>
        )}
        <Eyebrow dark className="animate-fade-up mb-4" style={{ animationDelay: '0ms' }}>{eyebrow}</Eyebrow>
        <h1 className="animate-fade-up font-display font-bold text-white text-[36px] md:text-[56px] leading-[1.08] max-w-170 mb-5" style={{ animationDelay: '80ms' }}>
          {title}
        </h1>
        <p className="animate-fade-up text-white/80 text-[16px] md:text-[18px] font-sans leading-[1.65] max-w-125" style={{ animationDelay: '160ms' }}>
          {desc}
        </p>
      </div>
    </section>
  )
}