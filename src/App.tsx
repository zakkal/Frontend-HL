import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Transactions from './pages/Transactions'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import SessionExpiredModal from './components/SessionExpiredModal'
import { useSessionTimeout } from './hooks/useSessionTimeout'

function AppInner() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const handleExpired = () => {
    // Token sudah tidak valid, cukup clear local state
    logout()
  }

  const { expired, clearExpired } = useSessionTimeout(!!token, handleExpired)

  const handleLogin = () => {
    clearExpired()
    navigate('/login')
  }

  if (!token) {
    return (
      <>
        <SessionExpiredModal open={expired} onLogin={handleLogin} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </>
    )
  }

  return (
    <>
      <SessionExpiredModal open={expired} onLogin={handleLogin} />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}