import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop automatically resets the window scroll position to the top
 * whenever the route pathname changes (e.g. clicking a product in Recently Viewed).
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
