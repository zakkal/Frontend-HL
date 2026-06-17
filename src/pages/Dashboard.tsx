import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import {
  Users, Package, Receipt, TrendingUp,
  AlertTriangle, Clock, Zap, RefreshCw,
  ShieldAlert, CalendarClock, Activity, Sparkles,
  ChevronRight, Bell
} from 'lucide-react'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')

export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, products: 0, transactions: 0 })

  // AI states
  const [riskData, setRiskData] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [overdue, setOverdue] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [dailySummary, setDailySummary] = useState<string>('')

  const [loadingRisk, setLoadingRisk] = useState(false)
  const [loadingPred, setLoadingPred] = useState(false)
  const [loadingOverdue, setLoadingOverdue] = useState(false)
  const [loadingAnomalies, setLoadingAnomalies] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    // Stats dasar
    Promise.all([
      api.getCustomers().catch(() => []),
      api.getProducts().catch(() => []),
      api.getAiOverdue().catch(() => []),
    ]).then(([customers, products, overdueData]) => {
      const totalOverdueTx = (overdueData as any[]).reduce((s: number, a: any) => s + a.overdueTransactions.length, 0)
      setStats({
        customers: customers.length,
        products: products.length,
        transactions: totalOverdueTx,
      })
    })

    // Load semua AI data — summary tidak auto-load, hemat quota
    loadRisk()
    loadPredictions()
    loadOverdue()
    loadAnomalies()
    // Daily summary hanya load manual lewat tombol refresh
  }, [])

  const loadAllAI = () => {
    loadRisk()
    loadPredictions()
    loadOverdue()
    loadAnomalies()
    loadSummary() // hanya jalan kalau klik "Refresh AI" manual
  }

  const loadRisk = async () => {
    setLoadingRisk(true)
    try { setRiskData(await api.getAiRisk()) } catch (_) {}
    setLoadingRisk(false)
  }

  const loadPredictions = async () => {
    setLoadingPred(true)
    try { setPredictions(await api.getAiPredictions()) } catch (_) {}
    setLoadingPred(false)
  }

  const loadOverdue = async () => {
    setLoadingOverdue(true)
    try { setOverdue(await api.getAiOverdue()) } catch (_) {}
    setLoadingOverdue(false)
  }

  const loadAnomalies = async () => {
    setLoadingAnomalies(true)
    try { setAnomalies(await api.getAiAnomalies()) } catch (_) {}
    setLoadingAnomalies(false)
  }

  const loadSummary = async () => {
    setLoadingSummary(true)
    try {
      const res = await api.getAiDailySummary()
      setDailySummary(res.summary)
    } catch (_) {}
    setLoadingSummary(false)
  }

  const highRisk = riskData.filter(r => r.risk === 'high')
  const medRisk = riskData.filter(r => r.risk === 'medium')
  const totalPiutangOverdue = overdue.reduce((s, a) => s + a.totalOverdue, 0)

  const riskBadge = (risk: string) => {
    if (risk === 'high') return 'bg-red-500/10 text-red-400 border border-red-500/20'
    if (risk === 'medium') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    return 'bg-green-500/10 text-green-400 border border-green-500/20'
  }

  const confidenceBadge = (c: string) => {
    if (c === 'high') return 'text-green-400'
    if (c === 'medium') return 'text-yellow-400'
    return 'text-gray-500'
  }

  const summaryLines = dailySummary.split('\n').filter(l => l.trim())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button
          onClick={loadAllAI}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 transition-colors border border-gray-800 hover:border-amber-500/30 px-3 py-1.5 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh AI
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pelanggan', value: stats.customers, icon: Users, color: 'text-blue-400 bg-blue-400/10' },
          { label: 'Total Produk', value: stats.products, icon: Package, color: 'text-green-400 bg-green-400/10' },
          { label: 'Bon Overdue', value: overdue.reduce((s, a) => s + a.overdueTransactions.length, 0), icon: AlertTriangle, color: 'text-red-400 bg-red-400/10' },
          { label: 'Anomali Terdeteksi', value: anomalies.length, icon: Zap, color: 'text-amber-400 bg-amber-400/10' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Row 1: AI Daily Summary + Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* AI Daily Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-400/10 rounded-lg">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Ringkasan Bisnis Hari Ini</h2>
            </div>
            <button onClick={loadSummary} className="text-gray-600 hover:text-amber-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingSummary ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-800 rounded animate-pulse" style={{ width: `${70 + (i % 3) * 10}%` }} />
              ))}
            </div>
          ) : dailySummary ? (
            <div className="space-y-1.5 text-sm text-gray-300 leading-relaxed">
              {summaryLines.map((line, i) => (
                <p key={i} className={line.trim() === '' ? 'h-1' : ''}>{line}</p>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 gap-3">
              <p className="text-sm text-gray-500 text-center">Klik refresh untuk generate ringkasan bisnis hari ini.</p>
              <button
                onClick={loadSummary}
                className="flex items-center gap-2 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Ringkasan
              </button>
            </div>
          )}
        </div>

        {/* Risk Overview */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-red-400/10 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Deteksi Risiko Piutang</h2>
            </div>
            <button onClick={loadRisk} className="text-gray-600 hover:text-amber-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRisk ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingRisk ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-400">{highRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Risiko Tinggi</p>
                </div>
                <div className="flex-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-yellow-400">{medRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Perlu Perhatian</p>
                </div>
                <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-green-400">{riskData.length - highRisk.length - medRisk.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Aman</p>
                </div>
              </div>

              {/* High risk list */}
              <div className="space-y-2">
                {[...highRisk, ...medRisk].slice(0, 4).map(r => (
                  <div key={r.customerId} className="flex items-center justify-between p-2.5 bg-gray-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{r.customerName}</p>
                      <p className="text-xs text-gray-500 truncate">{r.summary}</p>
                    </div>
                    <span className={`ml-2 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${riskBadge(r.risk)}`}>
                      {r.riskLabel}
                    </span>
                  </div>
                ))}
                {highRisk.length === 0 && medRisk.length === 0 && (
                  <p className="text-sm text-green-400 text-center py-2">Semua pelanggan dalam kondisi baik</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Overdue Alerts + Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Overdue Alerts */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-400/10 rounded-lg">
                <Bell className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Auto-Alert Overdue</h2>
                <p className="text-xs text-gray-500">Bon belum lunas &gt;14 hari</p>
              </div>
            </div>
            <button onClick={loadOverdue} className="text-gray-600 hover:text-amber-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOverdue ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingOverdue ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : overdue.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-green-400 text-sm font-medium">Tidak ada bon overdue</p>
              <p className="text-xs text-gray-600 mt-1">Semua pembayaran dalam batas wajar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 4).map((alert: any) => (
                <div key={alert.customerId} className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white">{alert.customerName}</p>
                    <span className="text-xs font-bold text-orange-400">
                      {alert.overdueTransactions.length} bon
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Tertunggak hingga {alert.overdueTransactions[0]?.daysOverdue} hari
                    </p>
                    <p className="text-xs font-semibold text-orange-300">
                      Rp {fmt(alert.totalOverdue)}
                    </p>
                  </div>
                </div>
              ))}
              {overdue.length > 4 && (
                <p className="text-xs text-center text-gray-500">+{overdue.length - 4} pelanggan lainnya</p>
              )}
              <div className="mt-2 pt-2 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-right">
                  Total overdue: <span className="text-orange-400 font-semibold">Rp {fmt(totalPiutangOverdue)}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Payment Predictions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-400/10 rounded-lg">
                <CalendarClock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Prediksi Pembayaran</h2>
                <p className="text-xs text-gray-500">Estimasi berdasarkan histori</p>
              </div>
            </div>
            <button onClick={loadPredictions} className="text-gray-600 hover:text-amber-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPred ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingPred ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">Belum ada piutang aktif untuk diprediksi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.slice(0, 4).map((pred: any) => (
                <div key={pred.customerId} className="p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-white truncate flex-1">{pred.customerName}</p>
                    <span className={`text-xs ml-2 flex-shrink-0 ${confidenceBadge(pred.confidence)}`}>
                      {pred.confidence === 'high' ? '● Akurat' : pred.confidence === 'medium' ? '● Sedang' : pred.confidence === 'low' ? '● Perkiraan' : '● Belum ada data'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {pred.estimatedPayDate
                        ? `Est. bayar: ${new Date(pred.estimatedPayDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                        : 'Belum cukup histori'}
                    </p>
                    <p className="text-xs text-blue-300 font-medium">
                      Rp {fmt(pred.totalPiutang)}
                    </p>
                  </div>
                </div>
              ))}
              {predictions.length > 4 && (
                <p className="text-xs text-center text-gray-500">+{predictions.length - 4} pelanggan lainnya</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Anomaly Detection */}
      {(anomalies.length > 0 || loadingAnomalies) && (
        <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-yellow-400/10 rounded-lg">
                <Activity className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Anomali Terdeteksi</h2>
                <p className="text-xs text-gray-500">Transaksi yang perlu dicek ulang</p>
              </div>
            </div>
            <button onClick={loadAnomalies} className="text-gray-600 hover:text-amber-400 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAnomalies ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingAnomalies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {anomalies.slice(0, 6).map((a: any, i: number) => (
                <div key={i} className={`p-3 rounded-lg border ${a.severity === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-gray-800/50 border-gray-700'}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${a.severity === 'warning' ? 'text-yellow-400' : 'text-gray-500'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">{a.anomalyType} — Bon {a.nomor_bon}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.customerName} · {a.tanggal}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{a.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
