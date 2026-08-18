import { Eyebrow } from '../ui/Eyebrow'
import { Breadcrumbs, type Crumb } from '../ui/Breadcrumbs'

/**
 * Компактна шапка для сторінок-списків і документів.
 *
 * Від `PageBanner` відрізняється висотою: той займає 70vh, а тут фото лише
 * підкладка під заголовком, і список починається одразу під нею. Це навмисно —
 * на сторінках-списках людина прийшла дивитись список, а не картинку.
 *
 * Фото необовʼязкове: без нього лишається рівна зелена заливка, як було в
 * політики конфіденційності, де кадр ні до чого.
 */
export function PageHeader({
  eyebrow,
  title,
  desc,
  breadcrumbs,
  img,
  srcSet,
  portrait,
}: {
  eyebrow: string
  title: string
  desc?: string
  breadcrumbs?: Crumb[]
  img?: string
  srcSet?: string
  portrait?: string
}) {
  return (
    <section className="relative overflow-hidden bg-green pt-28 pb-14 md:pt-36 md:pb-18">
      {img ? (
        <>
          {/* Тегом <img>, а не фоном у стилях: це найперше зображення сторінки,
              і браузер має знайти його сканером попереднього завантаження.
              sizes простий — шапка завжди на всю ширину. */}
          <picture className="absolute inset-0 block">
            {portrait && <source media="(max-aspect-ratio: 1/1)" srcSet={portrait} />}
            <img
              src={img}
              srcSet={srcSet}
              sizes="100vw"
              alt=""
              aria-hidden="true"
              width={1600}
              height={1000}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </picture>
          {/* Щільніше, ніж у повноекранного банера: тут текст займає майже всю
              висоту секції, і світлих місць під ним лишатись не має. */}
          <div className="absolute inset-0 bg-linear-to-r from-green/92 via-green/80 to-green/55" />
        </>
      ) : (
        <div className="absolute -top-32 -right-24 w-150 h-100 rounded-[50%] bg-white/[0.06] blur-3xl" aria-hidden="true" />
      )}

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
