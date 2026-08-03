import { Reveal } from '../ui/Reveal'
import { SectionWave } from '../ui/SectionWave'
import { ConsultationForm } from './ConsultationForm'

export function LeadForm({ above }: { above?: string } = {}) {
  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 bg-green"
      style={{ backgroundImage: `url('${import.meta.env.BASE_URL}img/lead-form.webp')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
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
