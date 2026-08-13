import { Reveal } from '../ui/Reveal'
import { SectionWave } from '../ui/SectionWave'
import { ConsultationForm } from './ConsultationForm'

export function LeadForm({ above }: { above?: string } = {}) {
  return (
    <section id="contact" className="relative py-28 md:py-36 bg-green">
      {/* Тегом <img>, а не фоном у стилях: фон вантажиться одразу і в повному
          розмірі, хоча секція стоїть у самому низу сторінки. Тут же — і lazy,
          і вибір розміру під ширину екрана. */}
      <div className="absolute inset-0">
        <img
          src={`${import.meta.env.BASE_URL}img/lead-form-1280.webp`}
          srcSet={[640, 960, 1280, 1920]
            .map((w) => `${import.meta.env.BASE_URL}img/lead-form-${w}.webp ${w}w`)
            .join(', ')}
          sizes="100vw"
          alt=""
          aria-hidden="true"
          width={1920}
          height={1080}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-green/80 via-green/55 to-green/80" />
      {/* Після затемнення: інакше воно лягає і на хвилю, і замість кольору
          сусіда над лінією стику виходить пляма іншого відтінку. */}
      <SectionWave shape="mirror" className="text-green" above={above} />
      <Reveal className="relative z-10 max-w-125 mx-auto px-6 w-full">
        <ConsultationForm dark />
      </Reveal>
    </section>
  )
}
