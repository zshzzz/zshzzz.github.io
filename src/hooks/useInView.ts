import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.12, rootMargin: '40px', ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [options?.threshold, options?.rootMargin, options?.root])

  return { ref, inView }
}
