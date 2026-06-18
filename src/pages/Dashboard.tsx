import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import {
  Users, Package, AlertTriangle, Zap, RefreshCw,
  ShieldAlert, CalendarClock, Activity, Sparkles, Bell,
} from 'lucide-react'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent: string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{
      background: 'linear-gradient(145deg, #141414, #111)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────
function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{
      background: 'linear-gradient(145deg, #141414, #111)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {children}
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ icon: Icon, iconColor, title, subtitle, onRefresh, loading }: {
  icon: any; iconColor: string; title: string; subtitle?: string; onRefresh: () => void; loading: boolean
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${iconColor}15` }}>
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button onClick={onRefresh} className="text-gray-700 hover:text-amber-400 transition-colors">
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────
function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)', width: `${85 + (i % 3) * 5}%` }} />
      ))}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({ customers: 0, products: 0, transactions: 0 })

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
    Promise.all([
      api.getCustomers().catch(() => []),
      api.getProducts().catch(() => []),
      api.getAiOverdue().catch(() => []),
    ]).then(([customers, products, overdueData]) => {
      const totalOverdueTx = (overdueData as any[]).reduce((s: number, a: any) => s + a.overdueTransactions.length, 0)
      setStats({ customers: customers.length, products: products.length, transactions: totalOverdueTx })
    })
    loadRisk(); loadPredictions(); loadOverdue(); loadAnomalies()
  }, [])

  const loadAllAI = () => { loadRisk(); loadPredictions(); loadOverdue(); loadAnomalies(); loadSummary() }
  const loadRisk = async () => { setLoadingRisk(true); try { setRiskData(await api.getAiRisk()) } catch (_) {}; setLoadingRisk(false) }
  const loadPredictions = async () => { setLoadingPred(true); try { setPredictions(await api.getAiPredictions()) } catch (_) {}; setLoadingPred(false) }
  const loadOverdue = async () => { setLoadingOverdue(true); try { setOverdue(await api.getAiOverdue()) } catch (_) {}; setLoadingOverdue(false) }
  const loadAnomalies = async () => { setLoadingAnomalies(true); try { setAnomalies(await api.getAiAnomalies()) } catch (_) {}; setLoadingAnomalies(false) }
  const loadSummary = async () => {
    setLoadingSummary(true)
    try { const res = await api.getAiDailySummary(); setDailySummary(res.summary) } catch (_) {}
    setLoadingSummary(false)
  }

  const highRisk = riskData.filter(r => r.risk === 'high')
  const medRisk = riskData.filter(r => r.risk === 'medium')
  const totalPiutangOverdue = overdue.reduce((s, a) => s + a.totalOverdue, 0)
  const summaryLines = dailySummary.split('\n').filter(l => l.trim())

  const riskColor = (risk: string) => risk === 'high' ? '#f87171' : risk === 'medium' ? '#fbbf24' : '#4ade80'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="text-xs text-gray-600 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button onClick={loadAllAI}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-amber-400 transition-colors px-3.5 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh AI
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pelanggan" value={stats.customers} icon={Users} accent="#60a5fa" />
        <StatCard label="Produk" value={stats.products} icon={Package} accent="#34d399" />
        <StatCard label="Bon Overdue" value={overdue.reduce((s, a) => s + a.overdueTransactions.length, 0)} icon={AlertTriangle} accent="#f87171" />
        <StatCard label="Anomali" value={anomalies.length} icon={Zap} accent="#f59e0b" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* AI Summary */}
        <SectionCard>
          <SectionHeader icon={Sparkles} iconColor="#f59e0b" title="Ringkasan Bisnis Hari Ini" onRefresh={loadSummary} loading={loadingSummary} />
          {loadingSummary ? <Skeleton rows={5} /> : dailySummary ? (
            <div className="space-y-1.5 text-sm text-gray-400 leading-relaxed">
              {summaryLines.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-3">
              <p className="text-xs text-gray-600 text-center">Klik untuk generate ringkasan bisnis hari ini</p>
              <button onClick={loadSummary}
                className="flex items-center gap-2 text-xs font-medium text-amber-400 px-4 py-2 rounded-xl transition-colors hover:bg-amber-400/10"
                style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
                <Sparkles className="w-3.5 h-3.5" /> Generate Ringkasan
              </button>
            </div>
          )}
        </SectionCard>

        {/* Risk */}
        <SectionCard>
          <SectionHeader icon={ShieldAlert} iconColor="#f87171" title="Deteksi Risiko Piutang" onRefresh={loadRisk} loading={loadingRisk} />
          {loadingRisk ? <Skeleton rows={4} /> : (
            <>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Risiko Tinggi', value: highRisk.length, color: '#f87171' },
                  { label: 'Perhatian', value: medRisk.length, color: '#fbbf24' },
                  { label: 'Aman', value: riskData.length - highRisk.length - medRisk.length, color: '#4ade80' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}0d`, border: `1px solid ${s.color}22` }}>
                    <p className="text-xl font-semibold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {[...highRisk, ...medRisk].slice(0, 4).map(r => (
                  <div key={r.customerId} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-medium truncate">{r.customerName}</p>
                      <p className="text-xs text-gray-600 truncate mt-0.5">{r.summary}</p>
                    </div>
                    <span className="ml-3 flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: `${riskColor(r.risk)}15`, color: riskColor(r.risk), border: `1px solid ${riskColor(r.risk)}30` }}>
                      {r.riskLabel}
                    </span>
                  </div>
                ))}
                {highRisk.length === 0 && medRisk.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: '#4ade80' }}>Semua pelanggan dalam kondisi baik</p>
                )}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Overdue */}
        <SectionCard>
          <SectionHeader icon={Bell} iconColor="#fb923c" title="Auto-Alert Overdue" subtitle="Bon belum lunas >14 hari" onRefresh={loadOverdue} loading={loadingOverdue} />
          {loadingOverdue ? <Skeleton rows={3} /> : overdue.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm font-medium" style={{ color: '#4ade80' }}>Tidak ada bon overdue</p>
              <p className="text-xs text-gray-700 mt-1">Semua pembayaran dalam batas wajar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overdue.slice(0, 4).map((alert: any) => (
                <div key={alert.customerId} className="flex items-center justify-between px-3 py-3 rounded-xl" style={{ background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.15)' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{alert.customerName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.overdueTransactions[0]?.daysOverdue} hari · {alert.overdueTransactions.length} bon</p>
                  </div>
                  <p className="text-sm font-semibold text-orange-300">Rp {fmt(alert.totalOverdue)}</p>
                </div>
              ))}
              {overdue.length > 4 && <p className="text-xs text-center text-gray-600">+{overdue.length - 4} lainnya</p>}
              <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-600">Total overdue</span>
                <span className="text-sm font-semibold text-orange-400">Rp {fmt(totalPiutangOverdue)}</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Predictions */}
        <SectionCard>
          <SectionHeader icon={CalendarClock} iconColor="#60a5fa" title="Prediksi Pembayaran" subtitle="Estimasi berdasarkan histori" onRefresh={loadPredictions} loading={loadingPred} />
          {loadingPred ? <Skeleton rows={4} /> : predictions.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600">Belum ada piutang aktif untuk diprediksi</p>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.slice(0, 4).map((pred: any) => {
                const confColor = pred.confidence === 'high' ? '#4ade80' : pred.confidence === 'medium' ? '#fbbf24' : '#6b7280'
                const confLabel = pred.confidence === 'high' ? 'Akurat' : pred.confidence === 'medium' ? 'Sedang' : pred.confidence === 'low' ? 'Perkiraan' : 'Belum ada data'
                return (
                  <div key={pred.customerId} className="flex items-center justify-between px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{pred.customerName}</p>
                        <span className="text-[10px] font-medium flex-shrink-0" style={{ color: confColor }}>● {confLabel}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {pred.estimatedPayDate ? `Est. ${new Date(pred.estimatedPayDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : 'Belum cukup histori'}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-blue-300 ml-3 flex-shrink-0">Rp {fmt(pred.totalPiutang)}</p>
                  </div>
                )
              })}
              {predictions.length > 4 && <p className="text-xs text-center text-gray-600">+{predictions.length - 4} lainnya</p>}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Anomalies */}
      {(anomalies.length > 0 || loadingAnomalies) && (
        <SectionCard className="border-yellow-500/10">
          <SectionHeader icon={Activity} iconColor="#fbbf24" title="Anomali Terdeteksi" subtitle="Transaksi yang perlu dicek ulang" onRefresh={loadAnomalies} loading={loadingAnomalies} />
          {loadingAnomalies ? <Skeleton rows={3} /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {anomalies.slice(0, 6).map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{
                  background: a.severity === 'warning' ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${a.severity === 'warning' ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: a.severity === 'warning' ? '#fbbf24' : '#4b5563' }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">{a.anomalyType} · {a.nomor_bon}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{a.customerName} · {a.tanggal}</p>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

    </div>
  )
}
