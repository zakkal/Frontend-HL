import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Eye, EyeOff, Lock, User, Shield, History } from 'lucide-react'

// ─── Simple password history (hashed with Web Crypto) ────────
async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function getPasswordHistory(): string[] {
  try { return JSON.parse(localStorage.getItem('hl_pw_history') || '[]') } catch { return [] }
}

function savePasswordHistory(hash: string) {
  const history = getPasswordHistory()
  if (!history.includes(hash)) {
    history.unshift(hash)
    localStorage.setItem('hl_pw_history', JSON.stringify(history.slice(0, 5))) // simpan 5 terakhir
  }
}

export default function Settings() {
  const { user } = useAuth()
  const { success, error } = useToast()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) { error('Password minimal 6 karakter'); return }
    if (newPassword !== confirmPassword) { error('Konfirmasi password tidak cocok'); return }

    // Cek histori password
    const hash = await hashPassword(newPassword)
    const history = getPasswordHistory()
    if (history.includes(hash)) {
      error('Password ini pernah digunakan sebelumnya. Gunakan password yang berbeda.')
      return
    }

    setLoading(true)
    try {
      await api.changePassword(newPassword)
      savePasswordHistory(hash)
      success('Password berhasil diubah')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      error(err.message || 'Gagal mengubah password')
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  const cardStyle = {
    background: 'linear-gradient(145deg, #141414, #111)',
    border: '1px solid rgba(255,255,255,0.06)',
  }

  return (
    <div className="space-y-5 max-w-xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Pengaturan</h1>
        <p className="text-xs text-gray-600 mt-0.5">Kelola akun dan keamanan</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)' }}>
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Informasi Akun</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs text-gray-500">Email</span>
            <span className="text-sm text-white font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs text-gray-500">Role</span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              Owner / Admin
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-xs text-gray-500">User ID</span>
            <span className="text-xs text-gray-600 font-mono">{user?.id?.slice(0, 16)}...</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Ganti Password</h2>
            <p className="text-xs text-gray-600 mt-0.5">Minimal 6 karakter · Tidak boleh sama dengan password sebelumnya</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* New password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Password Baru</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'}
                onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-700 focus:outline-none"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'}
                onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Match indicator */}
            {confirmPassword && (
              <p className="text-xs mt-1.5" style={{ color: confirmPassword === newPassword ? '#4ade80' : '#f87171' }}>
                {confirmPassword === newPassword ? '✓ Password cocok' : '✗ Password tidak cocok'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#f59e0b', color: '#000', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)' }}>
            <Shield className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Keamanan</h2>
        </div>
        <div className="space-y-2 text-xs text-gray-600">
          <p>• Sesi otomatis berakhir setelah 15 menit tidak aktif</p>
          <p>• Autentikasi menggunakan Supabase Auth (JWT)</p>
          <p>• Semua data dienkripsi dalam transit (HTTPS)</p>
          <p>• Histori 5 password terakhir tidak dapat digunakan kembali</p>
        </div>
      </div>

    </div>
  )
}
