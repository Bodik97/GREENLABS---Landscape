import {
  PageBanner,
  LeadForm,
  Seo,
  Reveal,
  IcoCheck,
  SvcDesign,
  SvcPlant,
  SvcLawn,
  SvcWater,
  SvcLight,
  SvcPond,
  SvcCare,
  SvcPave,
  SERVICE_CATEGORIES,
} from '../shared'

const CATEGORY_ICONS = [SvcDesign, SvcPlant, SvcLawn, SvcWater, SvcLight, SvcPond, SvcCare, SvcPave]

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Послуги — ландшафтний дизайн, озеленення, догляд | GREENLABS"
        description="Повний цикл ландшафтних робіт у Львові: проєктування, озеленення та благоустрій, регулярний догляд за ділянкою. Все в одній команді."
        breadcrumbs={[
          { name: 'Головна', path: '/' },
          { name: 'Послуги', path: '/services' },
        ]}
      />
      <PageBanner
        eyebrow="Послуги"
        title="Карта послуг: що саме входить у роботу"
        desc="Пропонуємо всі етапи створення та підтримки саду в одній команді: проєктування, реалізацію та регулярний догляд."
        img="https://images.unsplash.com/photo-1765129049887-bae454eecc92?w=1600&h=1000&fit=crop&auto=format"
      />

      {SERVICE_CATEGORIES.map((cat, i) => {
        const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length]
        const imgFirst = i % 2 === 0
        return (
          <section key={cat.slug} id={cat.slug} className={`py-24 scroll-mt-20 md:scroll-mt-24 ${i % 2 === 0 ? 'bg-cream' : 'bg-parchment'}`}>
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
              <Reveal className={imgFirst ? 'md:order-1' : 'md:order-2'}>
                <div className="rounded-2xl overflow-hidden aspect-4/3 relative">
                  <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-green text-cream flex items-center justify-center shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100} className={imgFirst ? 'md:order-2' : 'md:order-1'}>
                <h2 className="font-display font-bold text-ink text-[28px] md:text-[36px] leading-[1.1] mb-3">{cat.title}</h2>
                <p className="text-stone text-[14px] font-sans leading-[1.65] mb-4 max-w-150">{cat.desc}</p>
                <p className="text-ink text-[15px] font-sans leading-[1.72] mb-6 max-w-150">{cat.intro}</p>
                <ul className="flex flex-col gap-3">
                  {cat.items.map((item) => (
                    <li key={item} className={`flex items-start gap-2.5 rounded-xl p-4 ${i % 2 === 0 ? 'bg-parchment' : 'bg-cream'}`}>
                      <IcoCheck className="w-4 h-4 text-green mt-0.5 shrink-0" />
                      <span className="text-ink text-[13px] font-sans leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </section>
        )
      })}

      <LeadForm />
    </>
  )
}
