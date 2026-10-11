import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop automatically resets the window scroll position to the top
 * whenever the route pathname changes (e.g. clicking a product in Recently Viewed).
 * A link with a #hash (e.g. /#shop-by-category) scrolls to that element instead,
 * when it exists on the page.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) {
        target.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
