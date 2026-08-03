export function Placeholder({ note }: { note: string }) {
  return (
    // data-placeholder — мітка для scripts/prerender.mjs: поки вона в DOM, дані ще їдуть
    <section data-placeholder className="min-h-[70vh] flex items-center justify-center px-6 pt-32 pb-24">
      <p className="text-stone text-[14px] font-sans text-center max-w-100">{note}</p>
    </section>
  )
}
