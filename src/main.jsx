import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { validateEnv } from './lib/env.js'
import App from './App.jsx'
import DesignSystemShowcase from './pages/dev/DesignSystemShowcase.jsx'
import AdminApp from './admin/AdminApp.jsx'

// Fail fast on a missing/misconfigured .env rather than deep inside the
// Supabase client on the first data fetch.
validateEnv()

// KNOWN ISSUE: `npm run dev` logs "Invalid hook call" console errors from
// react-router-dom's BrowserRouter under this Vite 8 + React 19 combo.
// Isolated and confirmed dev-server-only (esbuild dependency pre-bundling) —
// a clean `npm run build` + `npm run preview` shows zero console errors, and
// the app renders/functions correctly in dev despite the noisy console.
// Tried: clearing node_modules/.vite, pinning react-router-dom to an older
// 7.x, and resolve.dedupe (kept, didn't fix it). Revisit if a
// react-router-dom/Vite patch addresses it, or if it starts affecting
// behavior rather than just logging.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Dev-only route — gated out of production builds (import.meta.env.DEV
            is a build-time constant, so Vite drops this branch and the
            DesignSystemShowcase import from the production bundle entirely).
            Remove alongside pages/dev/ if this page is no longer needed. */}
        {import.meta.env.DEV && (
          <Route path="/dev/design-system" element={<DesignSystemShowcase />} />
        )}
        {/* Admin — a separate authenticated area, isolated from the
            customer storefront's chrome (Header/Footer/EnquiryDrawer/etc
            live only inside App, never here). See src/admin/AdminApp.jsx. */}
        <Route path="/admin/*" element={<AdminApp />} />
        {/* App owns every other path and defines its own nested <Routes> for
            the real pages, so it can pass shared state as plain props to
            each route's element instead of via Context or Outlet context. */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
