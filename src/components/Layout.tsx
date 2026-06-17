import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, Package, Receipt, BarChart3, LogOut, DollarSign } from 'lucide-react'
import AiAssistant from './AiAssistant'

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
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <div>
              <h1 className="text-lg font-bold text-white">HL Sales</h1>
              <p className="text-xs text-gray-500">Management App</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 truncate">{user?.email}</span>
            <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      <AiAssistant />
    </div>
  )
}