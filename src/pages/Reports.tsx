import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Download } from 'lucide-react'

export default function Reports() {
  const [type, setType] = useState('customer')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { success, error } = useToast()

  const loadReport = async () => {
    setLoading(true)
    try { setReport(await api.getRecap(type, month, year)); success('Laporan berhasil dimuat') }
    catch (err: any) { error(err.message) }
    setLoading(false)
  }

  useEffect(() => {
    loadReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exportPdf = async () => {
    try {
      const blob = await api.exportPdf(type, month, year)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `recap-${type}-${month}-${year}.pdf`; a.click()
      URL.revokeObjectURL(url)
      success('PDF berhasil di-export')
    } catch (err: any) { error(err.message) }
  }

  const fmt = (n: number) => Number(n).toLocaleString('id-ID')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Laporan & Rekap</h1>
        {report && (
          <button onClick={exportPdf} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
            <Download className="w-5 h-5" /> Export PDF
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipe</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white">
              <option value="customer">Per Pelanggan</option>
              <option value="product">Per Produk</option>
              <option value="overall">Keseluruhan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white">
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tahun</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white w-24" />
          </div>
          <button onClick={loadReport} disabled={loading}
            className="bg-amber-400 hover:bg-amber-500 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Loading...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Omzet</p>
              <p className="text-lg font-bold text-amber-400">Rp {fmt(report.totals.total_omzet)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Laba HL</p>
              <p className="text-lg font-bold text-green-400">Rp {fmt(report.totals.total_laba_hl)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Piutang</p>
              <p className="text-lg font-bold text-red-400">Rp {fmt(report.totals.total_piutang)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total Lunas</p>
              <p className="text-lg font-bold text-blue-400">Rp {fmt(report.totals.total_lunas)}</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-3 text-sm text-gray-400">Nama</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Omzet LM</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Omzet BR</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Total Omzet</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Laba HL</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Piutang</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((e: any) => (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white font-medium">{e.name}</td>
                    <td className="px-6 py-3 text-gray-300 text-right">Rp {fmt(e.total_omzet_lm)}</td>
                    <td className="px-6 py-3 text-gray-300 text-right">Rp {fmt(e.total_omzet_br)}</td>
                    <td className="px-6 py-3 text-white text-right font-semibold">Rp {fmt(e.total_omzet)}</td>
                    <td className="px-6 py-3 text-green-400 text-right">Rp {fmt(e.total_laba_hl)}</td>
                    <td className="px-6 py-3 text-red-400 text-right">Rp {fmt(e.total_piutang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.bonus_log?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Bonus Log</h3>
              <div className="space-y-2">
                {report.bonus_log.map((bt: any) => (
                  <div key={bt.id} className="flex items-center gap-4 text-sm text-gray-300 bg-gray-800/50 px-4 py-2 rounded-lg">
                    <span className="font-medium text-white">{bt.nomor_bon}</span>
                    <span>{bt.tanggal}</span>
                    <span className="text-gray-500">Customer: {bt.customer_id.slice(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}