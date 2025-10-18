import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const { threshold = 0.7, root = null, rootMargin = '0px', freezeOnceVisible = false } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const elementRef = useRef<HTMLElement | null>(null)
  const frozen = useRef(false)

  const updateEntry = ([newEntry]: IntersectionObserverEntry[]): void => {
    if (!frozen.current) {
      setEntry(newEntry)
      if (freezeOnceVisible && newEntry.isIntersecting) {
        frozen.current = true
      }
    }
  }

  useEffect(() => {
    const node = elementRef.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return { ref: elementRef, entry }
}

