import { Link } from 'react-router-dom'

export type Crumb = { name: string; path: string }

/** Той самий масив ідемо і в `Seo` — там він стає мікророзміткою для Google, тут видимим шляхом. */
export function Breadcrumbs({ items, dark = false }: { items: Crumb[]; dark?: boolean }) {
  const link = dark ? 'text-white/60 hover:text-white' : 'text-stone hover:text-ink'
  const current = dark ? 'text-white/90' : 'text-ink'
  const sep = dark ? 'text-white/35' : 'text-stone/45'

  return (
    <nav aria-label="Хлібні крихти">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-sans">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span className={current} aria-current="page">{c.name}</span>
              ) : (
                <>
                  <Link to={c.path} className={`${link} transition-colors`}>{c.name}</Link>
                  <span className={sep} aria-hidden="true">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
