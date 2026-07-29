import { Eyebrow } from '../ui/Eyebrow'

export function PageBanner({ eyebrow, title, desc, img }: { eyebrow: string; title: string; desc: string; img: string }) {
  return (
    <section className="relative min-h-[70vh] flex items-end pb-16 md:pb-24 pt-32">
      <div
        className="absolute inset-0 bg-green"
        style={{ backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-black/10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
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