import { AlertTriangle, X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', onConfirm, onCancel, danger = true }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-sm rounded-2xl p-6" style={{
        background: 'linear-gradient(145deg, #181818, #111)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
      }}>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: danger ? 'rgba(248,113,113,0.1)' : 'rgba(245,158,11,0.1)' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: danger ? '#f87171' : '#f59e0b' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: danger ? '#ef4444' : '#f59e0b',
              color: danger ? '#fff' : '#000',
              boxShadow: danger ? '0 4px 12px rgba(239,68,68,0.25)' : '0 4px 12px rgba(245,158,11,0.25)',
            }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
