"use client"

import { useState, useEffect, useCallback } from "react"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useApi<T>(fetchFn: () => Promise<T>, dependencies: any[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setState({ data: null, loading: true, error: null })
        const result = await fetchFn()
        if (isMounted) {
          setState({ data: result, loading: false, error: null })
        }
      } catch (err) {
        if (isMounted) {
          setState({ data: null, loading: false, error: err as Error })
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, dependencies)

  const refetch = useCallback(async () => {
    try {
      setState({ data: null, loading: true, error: null })
      const result = await fetchFn()
      setState({ data: result, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: err as Error })
    }
  }, [fetchFn])

  return { ...state, refetch }
}
