import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Eye, EyeOff, LogIn } from 'lucide-react'

// ─── Animated Heading ─────────────────────────────────────────
interface AnimatedHeadingProps {
  text: string
  className?: string
  initialDelay?: number
  charDelay?: number
}

function AnimatedHeading({ text, className = '', initialDelay = 200, charDelay = 30 }: AnimatedHeadingProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), initialDelay)
    return () => clearTimeout(t)
  }, [initialDelay])

  const lines = text.split('\n')

  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => {
        const prevLineLength = lines.slice(0, lineIndex).reduce((acc, l) => acc + l.length, 0)
        return (
          <span key={lineIndex} className="block">
            {line.split('').map((char, charIndex) => {
              const globalIndex = prevLineLength + charIndex
              const delay = (globalIndex * charDelay)
              return (
                <span
                  key={charIndex}
                  className="inline-block"
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateX(0)' : 'translateX(-18px)',
                    transition: `opacity 500ms ease ${delay}ms, transform 500ms ease ${delay}ms`,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              )
            })}
          </span>
        )
      })}
    </h1>
  )
}

// ─── FadeIn wrapper ───────────────────────────────────────────
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

function FadeIn({ children, delay = 0, duration = 1000, className = '' }: FadeInProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
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

      {/* ── Video Background ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
          type="video/mp4"
        />
      </video>

      {/* ── Content Layer ── */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 md:px-12 lg:px-16">

        {/* Navbar */}
        <div className="pt-6">
          <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
            {/* Logo */}
            <span className="text-xl font-semibold tracking-tight text-white">HL Sales</span>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-8 text-sm text-white/80">
              <a href="#" className="hover:text-gray-300 transition-colors">Transaksi</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Pelanggan</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Laporan</a>
              <a href="#" className="hover:text-gray-300 transition-colors">AI Assistant</a>
            </div>

            {/* CTA */}
            <button className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Masuk
            </button>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

            {/* Left — Main content */}
            <div>
              <AnimatedHeading
                text={"Kelola piutang\ndengan cerdas dan cepat."}
                initialDelay={200}
                charDelay={30}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal text-white mb-4"
              />

              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  Platform manajemen penjualan & piutang dengan AI — dirancang untuk bisnis yang bergerak cepat.
                </p>
              </FadeIn>

              {/* Login Card */}
              <FadeIn delay={1200} duration={1000}>
                <div className="liquid-glass border border-white/20 rounded-2xl p-6 max-w-sm">
                  <h2 className="text-lg font-semibold text-white mb-1">Masuk ke Akun</h2>
                  <p className="text-sm text-gray-400 mb-5">Masukkan kredensial Anda untuk melanjutkan</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Alamat Email</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                        placeholder="admin@hlsales.id"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          name="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors"
                          tabIndex={-1}
                          aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-black font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" />
                          <span>Masuk</span>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-white/30 text-xs mt-5">
                    © 2026 HL Sales &amp; Receivables. All Rights Reserved.
                  </p>
                </div>
              </FadeIn>
            </div>

            {/* Right — Tag card */}
            <FadeIn delay={1400} duration={1000} className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                <p className="text-lg md:text-xl lg:text-2xl font-light text-white">
                  Penjualan. Piutang. Laporan.
                </p>
              </div>
            </FadeIn>

          </div>
        </div>
      </div>
    </div>
  )
}
