import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Package, Receipt, BarChart3, LogOut, Settings } from 'lucide-react'
import AiAssistant from './AiAssistant'
import SessionExpiredModal from './SessionExpiredModal'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Pelanggan' },
  { to: '/products', icon: Package, label: 'Produk' },
  { to: '/transactions', icon: Receipt, label: 'Transaksi' },
  { to: '/reports', icon: BarChart3, label: 'Laporan' },
]

export default function Layout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a]">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex flex-col flex-shrink-0" style={{
        background: 'linear-gradient(180deg, #111111 0%, #0d0d0d 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.35)' }}>
              <span className="text-black font-bold text-sm">HL</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">HL Sales</h1>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-none">Management App</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-amber-400 bg-amber-400/8'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom — Settings + User */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>

          {/* Settings link */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mb-1 ${
                isActive
                  ? 'text-amber-400 bg-amber-400/8'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-gray-500'}`} />
                <span>Pengaturan</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </>
            )}
          </NavLink>

          {/* User info + logout */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-400 text-xs font-semibold">
                {user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <span className="text-xs text-gray-400 truncate flex-1">{user?.email}</span>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0" title="Keluar">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0a0a0a' }}>
        <div className="p-7">
          <Outlet />
        </div>
      </main>

      <AiAssistant />
      <SessionExpiredModal />
    </div>
  )
}
