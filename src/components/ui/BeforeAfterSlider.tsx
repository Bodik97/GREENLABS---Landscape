import { useState } from 'react'

export function BeforeAfterSlider({
  img,
  imgBefore,
  label,
  beforeLabel = 'До',
  afterLabel = 'Після',
}: {
  img: string
  imgBefore?: string
  label: string
  beforeLabel?: string
  afterLabel?: string
}) {
  const [pos, setPos] = useState(50)
  return (
    <div className="relative rounded-2xl overflow-hidden aspect-4/3 select-none bg-green">
      <img src={img} alt={`${label} — ${afterLabel}`} className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={imgBefore ?? img}
          alt={`${label} — ${beforeLabel}`}
          className={`absolute inset-0 w-full h-full object-cover ${imgBefore ? '' : 'grayscale brightness-75 saturate-50'}`}
          loading="lazy"
        />
      </div>
      <div className="absolute inset-y-0 w-0.5 bg-white/90 pointer-events-none" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-ink" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4L2 8l4 4M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {imgBefore ? (
        /* Реальний кейс: підписи приходять із Sanity — виводимо їх як є, без плашок */
        <>
          <span className="absolute top-3 left-4 text-white text-[13px] font-sans drop-shadow-md pointer-events-none">{beforeLabel}</span>
          <span className="absolute top-3 right-4 text-white text-[13px] font-sans drop-shadow-md pointer-events-none">{afterLabel}</span>
        </>
      ) : (
        <>
          <span className="absolute top-3 left-3 bg-black/55 text-white text-[10px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none">{beforeLabel}</span>
          <span className="absolute top-3 right-3 bg-black/55 text-white text-[10px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none">{afterLabel}</span>
          <span className="absolute bottom-3 left-3 bg-terra text-white text-[10px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full pointer-events-none">Приклад оформлення</span>
        </>
      )}
      <input
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Повзунок до і після — ${label}`}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize m-0"
      />
    </div>
  )
}