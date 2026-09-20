import { createContext, useContext, useState } from 'react'

// Owns transient visibility/interaction state — nothing about products,
// enquiries, or business data. See ARCHITECTURE.md §2/§4. No import of
// EnquiryContext.

const UIContext = createContext(null)

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function UIProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [enquiryDrawerOpen, setEnquiryDrawerOpen] = useState(false)

  const value = {
    mobileMenuOpen,
    toggleMobileMenu: () => setMobileMenuOpen((open) => !open),
    closeMobileMenu: () => setMobileMenuOpen(false),

    searchOpen,
    openSearch: () => setSearchOpen(true),
    closeSearch: () => setSearchOpen(false),
    searchValue,
    setSearchValue,

    enquiryDrawerOpen,
    openEnquiryDrawer: () => setEnquiryDrawerOpen(true),
    closeEnquiryDrawer: () => setEnquiryDrawerOpen(false),
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}
