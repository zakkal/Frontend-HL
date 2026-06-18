import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

// ─── Animated Heading ─────────────────────────────────────────
function AnimatedHeading({ text, initialDelay = 200, charDelay = 28 }: { text: string; initialDelay?: number; charDelay?: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), initialDelay); return () => clearTimeout(t) }, [initialDelay])
  const lines = text.split('\n')
  return (
    <h1 className="text-4xl md:text-5xl lg:text-[56px] font-normal text-white leading-tight" style={{ letterSpacing: '-0.03em' }}>
      {lines.map((line, li) => {
        const offset = lines.slice(0, li).reduce((a, l) => a + l.length, 0)
        return (
          <span key={li} className="block">
            {line.split('').map((char, ci) => (
              <span key={ci} className="inline-block" style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateX(0)' : 'translateX(-16px)',
                transition: `opacity 480ms ease ${(offset + ci) * charDelay}ms, transform 480ms ease ${(offset + ci) * charDelay}ms`,
              }}>{char === ' ' ? '\u00A0' : char}</span>
            ))}
          </span>
        )
      })}
    </h1>
  )
}

// ─── FadeIn ───────────────────────────────────────────────────
function FadeIn({ children, delay = 0, duration = 900, className = '' }: { children: React.ReactNode; delay?: number; duration?: number; className?: string }) {
  const [v, setV] = useState(false)
  useEffect(() => { const t = setTimeout(() => setV(true), delay); return () => clearTimeout(t) }, [delay])
  return <div className={`transition-opacity ${className}`} style={{ opacity: v ? 1 : 0, transitionDuration: `${duration}ms` }}>{children}</div>
}

// ─── Login Page ───────────────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { error, success } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      success('Login berhasil!')
      navigate('/')
    } catch (err: any) {
      error(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col">

      {/* Video Background */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4" type="video/mp4" />
      </video>

      {/* Subtle bottom gradient so text is readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-20">

        {/* Top bar */}
        <FadeIn delay={0} duration={600}>
          <div className="pt-7 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">HL</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">HL Sales</span>
            </div>
            <span className="text-white/40 text-sm hidden md:block">Receivables Management System</span>
          </div>
        </FadeIn>

        {/* Main layout — pushed to bottom */}
        <div className="flex-1 flex flex-col justify-end pb-14 lg:pb-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">

            {/* Left — Headline */}
            <div className="max-w-xl">
              <AnimatedHeading text={"Kelola piutang\ndengan cerdas."} initialDelay={300} charDelay={28} />
              <FadeIn delay={900} duration={900}>
                <p className="text-gray-300/80 text-base md:text-lg mt-4 mb-2 font-light leading-relaxed">
                  Platform penjualan & piutang berbasis AI —<br className="hidden md:block" />
                  dirancang untuk bisnis yang bergerak cepat.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400/80 text-sm font-medium">Penjualan · Piutang · Laporan · AI</span>
                </div>
              </FadeIn>
            </div>

            {/* Right — Login Card */}
            <FadeIn delay={1100} duration={900}>
              <div className="w-full max-w-sm lg:max-w-[360px]" style={{
                background: 'rgba(6,6,6,0.88)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                boxShadow: '0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
                padding: '32px',
              }}>

                {/* Card header */}
                <div className="mb-7">
                  <p className="text-xs font-semibold text-amber-400/90 uppercase tracking-widest mb-2">Selamat datang</p>
                  <h2 className="text-xl font-semibold text-white leading-snug">Masuk ke Akun</h2>
                  <p className="text-sm text-gray-400 mt-1">Masukkan kredensial Anda untuk melanjutkan</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@hlsales.id"
                      required
                      className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
                      }}
                      onFocus={e => { e.currentTarget.style.border = '1px solid rgba(245,158,11,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1), inset 0 1px 2px rgba(0,0,0,0.4)' }}
                      onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)',
                        }}
                        onFocus={e => { e.currentTarget.style.border = '1px solid rgba(245,158,11,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1), inset 0 1px 2px rgba(0,0,0,0.4)' }}
                        onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
                      />
                      <button type="button" tabIndex={-1} onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                        aria-label={showPw ? 'Sembunyikan' : 'Tampilkan'}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    style={{
                      background: loading ? 'rgba(245,158,11,0.7)' : '#f59e0b',
                      color: '#000',
                      boxShadow: '0 4px 24px rgba(245,158,11,0.3)',
                    }}>
                    {loading ? (
                      <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><span>Memproses...</span></>
                    ) : (
                      <><LogIn className="w-4 h-4" /><span>Masuk</span></>
                    )}
                  </button>
                </form>

                <p className="text-center text-white/20 text-xs mt-6">© 2026 HL Sales &amp; Receivables. All Rights Reserved.</p>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </div>
  )
}
