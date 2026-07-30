import { Eyebrow } from '../ui/Eyebrow'
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs'

/**
 * Компактна шапка для сторінок-списків і документів — на відміну від `PageBanner`
 * не займає екран фотографією, тож контент видно одразу.
 */
export function PageHeader({
  eyebrow,
  title,
  desc,
  breadcrumbs,
}: {
  eyebrow: string
  title: string
  desc?: string
  breadcrumbs?: Crumb[]
}) {
  return (
    <section className="relative overflow-hidden bg-green pt-28 pb-14 md:pt-36 md:pb-18">
      <div className="absolute -top-32 -right-24 w-150 h-100 rounded-[50%] bg-white/[0.06] blur-3xl" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6">
        {breadcrumbs && (
          <div className="animate-fade-up mb-5">
            <Breadcrumbs items={breadcrumbs} dark />
          </div>
        )}
        <Eyebrow dark className="animate-fade-up mb-4" style={{ animationDelay: '60ms' }}>{eyebrow}</Eyebrow>
        <h1 className="animate-fade-up font-display font-bold text-white text-[34px] md:text-[52px] leading-[1.08] max-w-170 mb-4" style={{ animationDelay: '120ms' }}>
          {title}
        </h1>
        {desc && (
          <p className="animate-fade-up text-white/75 text-[15px] md:text-[17px] font-sans leading-[1.65] max-w-150" style={{ animationDelay: '180ms' }}>
            {desc}
          </p>
        )}
      </div>
    </section>
  )
}
