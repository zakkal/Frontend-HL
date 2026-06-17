import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextType>({} as ToastContextType)
let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => remove(id), 4000)
  }, [remove])

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast])
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast])
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  }

  const colors = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  }

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 border rounded-xl px-4 py-3 shadow-2xl backdrop-blur-sm animate-slide-in ${colors[t.type]}`}
            >
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[t.type]}`} />
              <p className="text-sm text-white flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-gray-500 hover:text-white flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
