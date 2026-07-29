import { Reveal, Eyebrow, BLOG } from '../../shared'

export function BlogSection() {
  return (
    <section id="blog" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="mb-14">
          <Eyebrow className="mb-3">Блог</Eyebrow>
          <h2 className="font-display font-bold text-ink text-[32px] md:text-[48px] leading-[1.08]">Корисні матеріали</h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {BLOG.map((b, i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <article className="group cursor-pointer">
                <div className="rounded-2xl overflow-hidden bg-green aspect-16/10 mb-5">
                  <img
                    src={b.img}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="text-stone text-[11px] font-sans mb-2">{b.date}</p>
                <h3 className="font-display font-semibold text-ink text-[17px] leading-snug mb-3 group-hover:text-green transition-colors">
                  {b.title}
                </h3>
                <p className="text-stone text-[13px] font-sans leading-[1.65]">{b.excerpt}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}