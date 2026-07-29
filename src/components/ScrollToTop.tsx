import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })

    if (!hash) return
    const id = hash.slice(1)

    const tryScroll = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'instant' as ScrollBehavior })
      return !!el
    }

    if (tryScroll()) return

    const observer = new MutationObserver(() => {
      if (tryScroll()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    const timeout = setTimeout(() => observer.disconnect(), 5000)

    return () => {
      observer.disconnect()
      clearTimeout(timeout)
    }
  }, [pathname, hash])

  return null
}