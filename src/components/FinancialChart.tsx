import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { TrendingUp, RefreshCw } from 'lucide-react'

interface ChartPoint {
  month: number
  year: number
  label: string
  omzet: number
  piutang: number
  lunas: number
  laba: number
}

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

const fmtFull = (n: number) => Number(n).toLocaleString('id-ID')

export default function FinancialChart() {
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBar, setActiveBar] = useState<number | null>(null)
  const [view, setView] = useState<'omzet' | 'piutang' | 'laba'>('omzet')

  const load = async () => {
    setLoading(true)
    try { setData(await api.getMonthlyChart()) } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const currentMonth = data[data.length - 1]
  const prevMonth = data[data.length - 2]

  const getValue = (point: ChartPoint) =>
    view === 'omzet' ? point.lunas : view === 'piutang' ? point.piutang : point.laba

  const maxVal = Math.max(...data.map(getValue), 1)

  const growth = currentMonth && prevMonth
    ? getValue(prevMonth) === 0
      ? 0
      : ((getValue(currentMonth) - getValue(prevMonth)) / getValue(prevMonth)) * 100
    : 0

  const tabs = [
    { key: 'omzet', label: 'Omzet Lunas', color: '#f59e0b' },
    { key: 'piutang', label: 'Piutang', color: '#f87171' },
    { key: 'laba', label: 'Laba HL', color: '#4ade80' },
  ] as const

  const activeTab = tabs.find(t => t.key === view)!

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'linear-gradient(145deg, #141414, #111)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${activeTab.color}15` }}>
            <TrendingUp className="w-4 h-4" style={{ color: activeTab.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white leading-none">Performa Keuangan</h2>
            <p className="text-xs text-gray-600 mt-0.5">6 bulan terakhir</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-medium text-green-400">Live</span>
          </div>
          <button onClick={load} className="text-gray-700 hover:text-amber-400 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1.5 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg transition-all duration-150"
            style={{
              background: view === tab.key ? `${tab.color}18` : 'transparent',
              color: view === tab.key ? tab.color : '#6b7280',
              border: view === tab.key ? `1px solid ${tab.color}30` : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary mini cards */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs text-gray-500 mb-1">{activeTab.label} Bulan Ini</p>
          <p className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>
            {loading ? '—' : `Rp ${fmt(currentMonth ? getValue(currentMonth) : 0)}`}
          </p>
          <p className="text-xs mt-1" style={{ color: growth >= 0 ? '#4ade80' : '#f87171' }}>
            {loading ? '' : `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs bulan lalu`}
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs text-gray-500 mb-1">Total 6 Bulan</p>
          <p className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>
            {loading ? '—' : `Rp ${fmt(data.reduce((s, d) => s + getValue(d), 0))}`}
          </p>
          <p className="text-xs text-gray-600 mt-1">{data.length} bulan data</p>
        </div>
      </div>

      {/* Bar Chart */}
      {loading ? (
        <div className="flex items-end justify-between gap-2 h-32 px-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 rounded-lg animate-pulse" style={{
              height: `${30 + Math.random() * 70}%`,
              background: 'rgba(255,255,255,0.04)',
            }} />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Y-axis guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ paddingBottom: '28px' }}>
            {[1, 0.75, 0.5, 0.25].map((ratio, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[9px] text-gray-700 w-8 text-right flex-shrink-0">
                  {fmt(maxVal * ratio)}
                </span>
                <div className="flex-1 border-t border-white/4" />
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end justify-between gap-1.5 pl-10" style={{ height: '120px', paddingBottom: '0px' }}>
            {data.map((point, i) => {
              const val = getValue(point)
              const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0
              const isActive = activeBar === i
              const isCurrentMonth = i === data.length - 1

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer group"
                  style={{ height: '100%' }}
                  onMouseEnter={() => setActiveBar(i)}
                  onMouseLeave={() => setActiveBar(null)}
                >
                  {/* Tooltip */}
                  {isActive && (
                    <div className="absolute bottom-10 z-10 px-3 py-2 rounded-xl text-xs text-white whitespace-nowrap pointer-events-none"
                      style={{
                        background: '#1a1a1a',
                        border: `1px solid ${activeTab.color}40`,
                        boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
                        transform: 'translateX(-50%)',
                        left: `${(i / (data.length - 1)) * 100}%`,
                      }}>
                      <p className="font-semibold" style={{ color: activeTab.color }}>{point.label}</p>
                      <p className="text-gray-400 mt-0.5">Rp {fmtFull(val)}</p>
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${Math.max(heightPct, 2)}%`,
                      background: isActive || isCurrentMonth
                        ? `linear-gradient(180deg, ${activeTab.color}, ${activeTab.color}88)`
                        : `linear-gradient(180deg, ${activeTab.color}60, ${activeTab.color}30)`,
                      boxShadow: isActive ? `0 0 12px ${activeTab.color}50` : 'none',
                      transition: 'height 0.4s ease, background 0.2s',
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between pl-10 mt-2">
            {data.map((point, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-[10px]" style={{ color: i === data.length - 1 ? activeTab.color : '#4b5563' }}>
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
