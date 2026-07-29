import { useRef, useState } from 'react'
import { imageUrl, type SanityImage } from '../../lib/sanity'

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={dir === 'prev' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Slider({ images, alt }: { images: SanityImage[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = Math.max(0, Math.min(i, images.length - 1))
    track.scrollTo({ left: clamped * track.clientWidth, behavior: 'smooth' })
    setActive(clamped)
  }

  // Позицію ведемо зі скролу, щоб свайп пальцем теж оновлював крапки
  const onScroll = () => {
    const track = trackRef.current
    if (!track) return
    setActive(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl bg-green"
      >
        {images.map((img, i) => (
          <figure key={img._key ?? i} className="shrink-0 w-full snap-start">
            <div className="aspect-4/3">
              <img
                src={imageUrl(img, 1400, 1050)}
                alt={img.alt || alt}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          </figure>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            disabled={active === 0}
            aria-label="Попереднє фото"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-ink shadow-md flex items-center justify-center transition-opacity disabled:opacity-0 hover:bg-white"
          >
            <Arrow dir="prev" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            disabled={active === images.length - 1}
            aria-label="Наступне фото"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-ink shadow-md flex items-center justify-center transition-opacity disabled:opacity-0 hover:bg-white"
          >
            <Arrow dir="next" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {images.map((img, i) => (
              <button
                key={img._key ?? i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Фото ${i + 1} з ${images.length}`}
                aria-current={i === active}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-green' : 'w-1.5 bg-[#d9d6d0] hover:bg-stone'}`}
              />
            ))}
          </div>
        </>
      )}

      {images[active]?.caption && (
        <p className="text-stone text-[12px] font-sans mt-3 text-center">{images[active].caption}</p>
      )}
    </div>
  )
}
