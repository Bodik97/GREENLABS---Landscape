import type { CSSProperties, ReactNode } from 'react'

export function Eyebrow({
  children,
  dark = false,
  color,
  className = '',
  center = false,
  style,
}: {
  children: ReactNode
  dark?: boolean
  color?: string
  className?: string
  center?: boolean
  style?: CSSProperties
}) {
  const chip = dark
    ? 'bg-white/10 backdrop-blur-md border border-white/40'
    : 'bg-black/[0.04] backdrop-blur-sm border border-black/10'
  const textColor = color ?? (dark ? 'text-[#E8A87C]' : 'text-terra')

  const pill = (
    <p
      style={style}
      className={`inline-flex items-center ${chip} rounded-full px-4 py-1.5 text-[12px] font-display font-semibold tracking-[0.14em] uppercase ${textColor} ${className}`}
    >
      {children}
    </p>
  )

  return center ? <div className="flex justify-center">{pill}</div> : pill
}
