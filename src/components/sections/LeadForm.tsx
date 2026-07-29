import { Reveal } from '../ui/Reveal'
import { ConsultationForm } from './ConsultationForm'

export function LeadForm() {
  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 bg-green"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1749803915455-a7642520d0d3?w=1920&h=1080&fit=crop&auto=format')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-linear-to-b from-green/80 via-green/55 to-green/80" />
      <Reveal className="relative z-10 max-w-125 mx-auto px-6 w-full">
        <ConsultationForm dark />
      </Reveal>
    </section>
  )
}
