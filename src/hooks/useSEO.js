import { useEffect } from 'react'

// Zero-dependency SEO metadata — sets document.title and the meta
// description tag per page. Placeholder copy per page, not final SEO copy.
// (No react-helmet-async or similar was added — this project's stack was
// kept deliberately minimal throughout; revisit if per-page Open Graph tags
// are needed later.)

/**
 * @param {object} props
 * @param {string} title
 * @param {string} [description]
 */
export function useSEO({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title
    if (title) {
      document.title = title
    }

    let metaDescription = document.querySelector('meta[name="description"]')
    const previousDescription = metaDescription?.getAttribute('content')

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (metaDescription && previousDescription !== undefined) {
        metaDescription.setAttribute('content', previousDescription ?? '')
      }
    }
  }, [title, description])
}
