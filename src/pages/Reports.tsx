import { useState } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Download, BarChart3, FileText } from 'lucide-react'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function Reports() {
  const [type, setType] = useState('customer')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  // Hanya load saat user klik Tampilkan — tidak auto-load
  const loadReport = async () => {
    setLoading(true)
    setReport(null) // reset dulu sebelum load baru
    try {
      const data = await api.getRecap(type, month, year)
      setReport(data)
      success('Laporan berhasil dimuat')
    } catch (err: any) {
      error(err.message)
    }
    setLoading(false)
  }

  const exportPdf = async () => {
    try {
      const blob = await api.exportPdf(type, month, year)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rekap-${type}-${month}-${year}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      success('PDF berhasil di-export')
    } catch (err: any) {
      error(err.message)
    }
  }

  const typeLabel = type === 'customer' ? 'Per Pelanggan' : type === 'product' ? 'Per Produk' : 'Keseluruhan'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Laporan & Rekap</h1>
          <p className="text-xs text-gray-600 mt-0.5">Rekap keuangan berdasarkan periode</p>
        </div>
        {report && (
          <button onClick={exportPdf}
            className="flex items-center gap-2 text-sm font-semibold text-black px-4 py-2 rounded-xl transition-colors"
            style={{ background: '#f59e0b' }}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-5" style={{
        background: 'linear-gradient(145deg, #141414, #111)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex flex-wrap gap-4 items-end">

          {/* Tipe */}
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Tipe Laporan</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <option value="customer">Per Pelanggan</option>
              <option value="product">Per Produk</option>
              <option value="overall">Keseluruhan</option>
            </select>
          </div>

          {/* Bulan */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Bulan</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none w-24"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={loadReport}
            disabled={loading}
            className="flex items-center gap-2 font-semibold text-sm text-black px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            style={{ background: '#f59e0b', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
          >
            <BarChart3 className="w-4 h-4" />
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
          <div className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !report && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <FileText className="w-6 h-6 text-amber-400/60" />
          </div>
          <p className="text-sm text-gray-600">Pilih tipe, bulan, dan tahun lalu klik Tampilkan</p>
        </div>
      )}

      {/* Report content */}
      {!loading && report && (
        <div className="space-y-4">

          {/* Period label */}
          <p className="text-xs text-gray-600">
            {typeLabel} · {MONTHS[report.month - 1]} {report.year}
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Omzet', value: report.totals.total_omzet, color: '#f59e0b' },
              { label: 'Total Laba HL', value: report.totals.total_laba_hl, color: '#4ade80' },
              { label: 'Total Piutang', value: report.totals.total_piutang, color: '#f87171' },
              { label: 'Total Lunas', value: report.totals.total_lunas, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{
                background: 'linear-gradient(145deg, #141414, #111)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p className="text-xs text-gray-600 mb-1.5">{s.label}</p>
                <p className="text-lg font-semibold" style={{ color: s.color, letterSpacing: '-0.02em' }}>
                  Rp {fmt(s.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, #141414, #111)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Omzet LM</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Omzet BR</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Omzet</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Laba HL</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Piutang</th>
                  </tr>
                </thead>
                <tbody>
                  {report.entries.map((e: any, idx: number) => (
                    <tr key={e.id} style={{ borderBottom: idx < report.entries.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-white font-medium">{e.name}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 text-right">Rp {fmt(e.total_omzet_lm)}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 text-right">Rp {fmt(e.total_omzet_br)}</td>
                      <td className="px-5 py-3.5 text-sm text-white font-semibold text-right">Rp {fmt(e.total_omzet)}</td>
                      <td className="px-5 py-3.5 text-sm text-right font-medium" style={{ color: '#4ade80' }}>Rp {fmt(e.total_laba_hl)}</td>
                      <td className="px-5 py-3.5 text-sm text-right font-medium" style={{ color: e.total_piutang > 0 ? '#f87171' : '#6b7280' }}>
                        Rp {fmt(e.total_piutang)}
                      </td>
                    </tr>
                  ))}
                  {report.entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-600">
                        Tidak ada data untuk periode ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bonus log */}
          {report.bonus_log?.length > 0 && (
            <div className="rounded-2xl p-5" style={{
              background: 'linear-gradient(145deg, #141414, #111)',
              border: '1px solid rgba(167,139,250,0.15)',
            }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#a78bfa' }}>
                Bonus Log ({report.bonus_log.length} transaksi)
              </h3>
              <div className="space-y-1.5">
                {report.bonus_log.map((bt: any) => (
                  <div key={bt.id} className="flex items-center gap-4 text-xs px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(167,139,250,0.05)' }}>
                    <span className="font-semibold text-white">{bt.nomor_bon}</span>
                    <span className="text-gray-500">{bt.tanggal}</span>
                    <span className="text-gray-600 truncate">ID: {bt.customer_id.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
