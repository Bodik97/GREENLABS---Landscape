import type { ReactNode } from 'react'

/** Червоний рядок під полем. На темному тлі terra не читається — беремо світлий. */
export function FieldHint({ id, dark = false, children }: { id: string; dark?: boolean; children: ReactNode }) {
  return (
    <p id={id} role="alert" className={`text-[12px] font-sans leading-[1.5] mt-1.5 ${dark ? 'text-[#F0A882]' : 'text-terra'}`}>
      {children}
    </p>
  )
}
