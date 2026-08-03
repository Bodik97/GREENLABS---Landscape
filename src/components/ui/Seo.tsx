import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteUrl } from './JsonLd'

function setMeta(selector: string, tagName: 'meta' | 'link', attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = document.createElement(tagName)
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
}

export function Seo({
  title,
  description,
  image,
  breadcrumbs,
}: {
  title: string
  description: string
  /** Абсолютна адреса картинки для превʼю в соцмережах. Без неї лишається загальносайтова. */
  image?: string
  breadcrumbs?: { name: string; path: string }[]
}) {
  const { pathname } = useLocation()

  useEffect(() => {
    const url = siteUrl(pathname)
    document.title = title
    setMeta('meta[name="description"]', 'meta', { name: 'description', content: description })
    setMeta('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
    setMeta('meta[property="og:title"]', 'meta', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', 'meta', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', 'meta', { property: 'og:url', content: url })
    if (image) {
      setMeta('meta[property="og:image"]', 'meta', { property: 'og:image', content: image })
      setMeta('meta[name="twitter:image"]', 'meta', { name: 'twitter:image', content: image })
    }

    const breadcrumbId = 'breadcrumb-schema'
    let script = document.getElementById(breadcrumbId) as HTMLScriptElement | null
    if (breadcrumbs && breadcrumbs.length > 0) {
      if (!script) {
        script = document.createElement('script')
        script.id = breadcrumbId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.name,
          item: siteUrl(b.path),
        })),
      })
    } else if (script) {
      script.remove()
    }
  }, [title, description, pathname, breadcrumbs])

  return null
}
