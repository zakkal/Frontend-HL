import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DollarSign, Eye, EyeOff, LogIn } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Decorative background glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Top-right amber glow */}
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-amber-500/10 blur-[120px]" />
        {/* Bottom-left cool glow */}
        <div className="absolute -bottom-48 -left-48 w-[480px] h-[480px] rounded-full bg-amber-600/8 blur-[100px]" />
        {/* Center subtle pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-slate-800/20 blur-[160px]" />

        {/* Thin geometric grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Decorative corner accent — top left */}
        <div className="absolute top-8 left-8 w-24 h-24 border border-amber-500/10 rounded-full" />
        <div className="absolute top-10 left-10 w-16 h-16 border border-amber-500/10 rounded-full" />
        {/* Decorative corner accent — bottom right */}
        <div className="absolute bottom-8 right-8 w-32 h-32 border border-slate-700/30 rounded-full" />
        <div className="absolute bottom-12 right-12 w-20 h-20 border border-slate-700/20 rounded-full" />
      </div>

      {/* ── Login card ── */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-5 shadow-lg shadow-amber-500/5">
            <DollarSign className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">HL Sales</h1>
          <p className="text-slate-500 text-sm mt-1 tracking-wide">Receivables Management System</p>
        </div>

        {/* Glass card */}
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl shadow-black/40 p-8">

          {/* Card title */}
          <div className="mb-7">
            <h2 className="text-xl font-bold text-white">Masuk ke Akun</h2>
            <p className="text-slate-400 text-sm mt-1">Masukkan kredensial Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Alamat Email
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                placeholder="admin@hlsales.id"
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-600 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors duration-200"
                  tabIndex={-1}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="pt-1">
              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            </div>

          </form>

          {/* Footer copyright */}
          <p className="text-center text-slate-600 text-xs mt-7 leading-relaxed">
            © 2026 HL Sales &amp; Receivables. All Rights Reserved.
          </p>

        </div>
      </div>
    </div>
  )
}
