import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, Clock } from 'lucide-react'

const SESSION_TIMEOUT_MS = 15 * 60 * 1000 // 15 menit
const WARNING_BEFORE_MS = 2 * 60 * 1000   // peringatan 2 menit sebelum expired

export default function SessionExpiredModal() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<'active' | 'warning' | 'expired'>('active')
  const [countdown, setCountdown] = useState(120) // detik tersisa saat warning
  const lastActivity = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimer = useCallback(() => {
    if (state === 'expired') return
    lastActivity.current = Date.now()
    setState('active')
    setCountdown(120)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    // Set warning timer (13 menit)
    timerRef.current = setTimeout(() => {
      setState('warning')
      setCountdown(120)
      // Countdown per detik
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!)
            setState('expired')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, SESSION_TIMEOUT_MS - WARNING_BEFORE_MS)
  }, [state])

  // Track user activity
  useEffect(() => {
    if (!token) return

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    const handler = () => {
      if (state !== 'expired') resetTimer()
    }

    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [token])

  const handleGoToLogin = async () => {
    await logout()
    navigate('/login')
  }

  const handleContinue = () => {
    resetTimer()
  }

  if (!token || state === 'active') return null

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const countdownStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  if (state === 'warning') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{
          background: 'linear-gradient(145deg, #181818, #111)',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.1)',
        }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Clock className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Sesi Hampir Berakhir</h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Anda tidak aktif selama beberapa saat. Sesi akan berakhir dalam
          </p>
          <div className="text-4xl font-bold text-amber-400 mb-5" style={{ letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
            {countdownStr}
          </div>
          <div className="flex gap-3">
            <button onClick={handleGoToLogin}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Keluar
            </button>
            <button onClick={handleContinue}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-black transition-all"
              style={{ background: '#f59e0b', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
              Lanjutkan Sesi
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Expired — fullscreen block, tidak bisa diklik via overlay
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.stopPropagation()}>
      <div className="w-full max-w-sm rounded-2xl p-7 text-center" style={{
        background: 'linear-gradient(145deg, #181818, #111)',
        border: '1px solid rgba(248,113,113,0.25)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
      }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(248,113,113,0.1)' }}>
          <Clock className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">Sesi Telah Berakhir</h3>
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          Demi keamanan data Anda, sesi telah diakhiri secara otomatis karena tidak ada aktivitas selama 15 menit.
          Silakan login kembali untuk melanjutkan.
        </p>
        <button onClick={handleGoToLogin}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold text-black transition-all"
          style={{ background: '#f59e0b', boxShadow: '0 4px 20px rgba(245,158,11,0.35)' }}>
          <LogIn className="w-4 h-4" />
          Masuk Kembali
        </button>
        <p className="text-xs text-gray-700 mt-4">Semua perubahan yang belum disimpan mungkin telah hilang.</p>
      </div>
    </div>
  )
}
