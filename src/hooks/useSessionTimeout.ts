import { useEffect, useRef, useState, useCallback } from 'react'

const TIMEOUT_MS = 15 * 60 * 1000 // 15 menit
const WARNING_MS = 60 * 1000       // warning 1 menit sebelum expire (opsional future use)

export function useSessionTimeout(isLoggedIn: boolean, onExpired: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [expired, setExpired] = useState(false)

  const resetTimer = useCallback(() => {
    if (!isLoggedIn) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setExpired(true)
      onExpired()
    }, TIMEOUT_MS)
  }, [isLoggedIn, onExpired])

  useEffect(() => {
    if (!isLoggedIn) {
      setExpired(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // Start timer on login
    resetTimer()

    // Reset on any user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']
    const handleActivity = () => {
      if (!expired) resetTimer()
    }

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
    }
  }, [isLoggedIn, resetTimer, expired])

  const clearExpired = () => setExpired(false)

  return { expired, clearExpired }
}
