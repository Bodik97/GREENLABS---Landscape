import { useRef, useState } from 'react'

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
  const boxRef = useRef<HTMLDivElement>(null)

  /* Тягнемо самі, через pointer-події: нативний повзунок на дотик рухається,
     лише коли палець влучив у бігунок, а бігунок у нас нульового розміру.
     touch-action: pan-y лишає сторінці вертикальне гортання поверх картинки. */
  const moveTo = (clientX: number) => {
    const box = boxRef.current?.getBoundingClientRect()
    if (!box) return
    setPos(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)))
  }

  return (
    <div
      ref={boxRef}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        moveTo(e.clientX)
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        // buttons === 0 означає, що кнопку вже відпустили, а події про це ми не
        // отримали — так буває, коли її відпустили поза вкладкою. Без перевірки
        // повзунок після повернення курсора їхав би за ним без натиснутої кнопки.
        // Тільки для миші: у пальця такої ситуації немає, а покладатися на те,
        // що кожен мобільний браузер віддасть buttons=1 під час руху, не варто —
        // помилка тут зламає саме те перетягування, заради якого все й робилось.
        if (e.pointerType === 'mouse' && e.buttons === 0) {
          e.currentTarget.releasePointerCapture(e.pointerId)
          return
        }
        moveTo(e.clientX)
      }}
      onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
      onPointerCancel={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
      style={{ touchAction: 'pan-y' }}
      className="relative rounded-2xl overflow-hidden aspect-4/3 select-none bg-green cursor-ew-resize"
    >
      {/* Розміри 800×600 — рівно ті, що в самих файлах, і рівно те
          співвідношення, яке тримає контейнер (aspect-4/3). Місце тут резервує
          контейнер, тож макет і так не стрибає, але з розмірами браузер знає
          пропорцію ще до завантаження кадру. */}
      <img src={img} alt={`${label} — ${afterLabel}`} width={800} height={600} className="absolute inset-0 w-full h-full object-cover pointer-events-none" loading="lazy" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img
          src={imgBefore ?? img}
          alt={`${label} — ${beforeLabel}`}
          width={800}
          height={600}
          /* Без окремого знімка «до» ліва половина — той самий кадр, лише
             приглушений. Приглушення легке: раніше воно було майже чорно-білим
             і читалось як інша, гірша фотографія, хоча це той самий сад. */
          className={`absolute inset-0 w-full h-full object-cover ${imgBefore ? '' : 'grayscale-[0.45] brightness-[0.95] saturate-[0.7]'}`}
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
      {/* Лишається заради клавіатури й читалок; мишу й дотик обробляє контейнер */}
      <input
        type="range" min={0} max={100} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Повзунок до і після — ${label}`}
        className="compare absolute inset-0 w-full h-full opacity-0 m-0 pointer-events-none"
      />
    </div>
  )
}