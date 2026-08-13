import { useConsultationModal } from '../ui/ConsultationModalContext'

export function Hero() {
  const { open } = useConsultationModal()

  return (
    <section className="relative min-h-screen flex items-center pb-20 md:pb-32">
      {/* Тег img, а не фон у стилях: фон не вміє srcset, тож телефон качав ті
          самі 1920 px, що й монітор. Це найважчий файл на сторінці і водночас
          той, за яким браузер міряє швидкість показу. */}
      <div className="absolute inset-0 bg-green">
        <img
          src={`${import.meta.env.BASE_URL}img/hero-1280.webp`}
          srcSet={[640, 960, 1280, 1920]
            .map((w) => `${import.meta.env.BASE_URL}img/hero-${w}.webp ${w}w`)
            .join(', ')}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-black/72 via-black/28 to-black/8" />
      <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/25 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full mt-16 md:mt-4">
        <h1
          className="animate-fade-up font-display font-bold text-[#8f9d5a] text-[40px] md:text-[64px] leading-[1.08] mb-3 [text-shadow:0_2px_16px_rgba(0,0,0,0.65)]"
          style={{ animationDelay: '80ms' }}
        >
          GREENLABS
        </h1>
        <p
          className="animate-fade-up font-display font-semibold text-cream text-[18px] md:text-[26px] tracking-wide max-w-170 mb-6 [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]"
          style={{ animationDelay: '120ms' }}
        >
          Створюємо зелене майбутнє
        </p>
        <p
          className="animate-fade-up text-white/78 text-[16px] md:text-[18px] font-sans leading-[1.65] max-w-125 mb-10"
          style={{ animationDelay: '160ms' }}
        >
          Приватні сади та комерційні простори у Львові. <br /> Від першого ескізу до бездоганної реалізації.
        </p>

        <div className="animate-fade-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: '240ms' }}>
          <button
            type="button"
            onClick={() => open('Перший екран')}
            className="bg-terra text-white font-display font-semibold text-[15px] px-8 py-4 rounded-lg hover:bg-[#b35c34] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200 text-center"
          >
            Отримати консультацію
          </button>
          <a
            href="#portfolio"
            className="border border-white/55 text-white font-display font-semibold text-[15px] px-8 py-4 rounded-lg hover:bg-white/10 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-200 text-center"
          >
            Дивитись роботи
          </a>
        </div>
      </div>
    </section>
  )
}