import { useEffect, useState } from 'react'

// Generic loading/error wrapper around a Promise-returning function (used
// for productRepository calls). Not a cache/query library — just avoids
// repeating the same loading/error useState boilerplate on every page.
// Re-runs whenever `deps` changes.

/**
 * @template T
 * @param {() => Promise<T>} asyncFn
 * @param {React.DependencyList} deps
 * @returns {{ data: T|null, loading: boolean, error: Error|null }}
 */
export function useAsync(asyncFn, deps) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    // Resetting to `loading: true` when deps change (a re-fetch, not the
    // initial mount) is the whole point of this hook — eslint-plugin-react-hooks'
    // newer set-state-in-effect rule flags any synchronous setState at the
    // top of an effect on general principle, but there's no non-effect way
    // to know "the deps changed, the old data is stale" without a query
    // library, which this project deliberately doesn't have yet.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, loading: true, error: null }))

    asyncFn()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error })
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
