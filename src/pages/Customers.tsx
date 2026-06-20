import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Plus, Pencil, Trash2, X, ShieldAlert, ShieldCheck, ShieldBan, Search } from 'lucide-react'
import RupiahInput from '../components/RupiahInput'
import ConfirmDialog from '../components/ConfirmDialog'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')

// ─── Risk Badge ───────────────────────────────────────────────
function RiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' | null }) {
  if (!risk) return <span className="text-xs text-gray-700">—</span>

  const config = {
    low: {
      label: 'Aman',
      icon: ShieldCheck,
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.08)',
      border: 'rgba(74,222,128,0.2)',
    },
    medium: {
      label: 'Perhatian',
      icon: ShieldAlert,
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.2)',
    },
    high: {
      label: 'Berisiko',
      icon: ShieldBan,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.2)',
    },
  }

  const c = config[risk]
  const Icon = c.icon

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [riskMap, setRiskMap] = useState<Record<string, 'low' | 'medium' | 'high'>>({})
  const [bonusMap, setBonusMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [loadingRisk, setLoadingRisk] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [form, setForm] = useState({ name: '', bonus_threshold: 0, discounts: [] as any[] })
  const { success, error } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.getCustomers()
      setCustomers(data)
      // Load bonus status per customer
      const bonuses: Record<string, any> = {}
      await Promise.all(data.map(async (c: any) => {
        try {
          bonuses[c.id] = await api.getBonusStatus(c.id)
        } catch (_) {}
      }))
      setBonusMap(bonuses)
    } catch (e: any) { error(e.message) }
    setLoading(false)
  }

  const loadRisk = async () => {
    setLoadingRisk(true)
    try {
      const risks = await api.getAiRisk()
      const map: Record<string, 'low' | 'medium' | 'high'> = {}
      risks.forEach((r: any) => { map[r.customerId] = r.risk })
      setRiskMap(map)
    } catch (_) {}
    setLoadingRisk(false)
  }

  useEffect(() => {
    load()
    loadRisk()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', bonus_threshold: 0, discounts: [] })
    setShowModal(true)
  }

  const openEdit = (c: any) => {
    setEditing(c)
    setForm({
      name: c.name,
      bonus_threshold: c.bonus_threshold,
      discounts: c.discounts?.map((d: any) => ({
        type: d.type, step_order: d.step_order, discount_percentage: Number(d.discount_percentage),
      })) || [],
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await api.updateCustomer(editing.id, form)
        success('Pelanggan berhasil diupdate')
      } else {
        await api.createCustomer(form)
        success('Pelanggan berhasil ditambahkan')
      }
      setShowModal(false)
      load()
    } catch (err: any) { error(err.message) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.deleteCustomer(deleteTarget.id); success('Pelanggan berhasil dihapus'); load() }
    catch (err: any) { error(err.message) }
    setDeleteTarget(null)
  }

  const addDiscount = () => {
    setForm(f => ({ ...f, discounts: [...f.discounts, { type: 'LM', step_order: f.discounts.length + 1, discount_percentage: 0 }] }))
  }

  const removeDiscount = (idx: number) => {
    setForm(f => ({ ...f, discounts: f.discounts.filter((_, i) => i !== idx) }))
  }

  // Group discounts by type for display
  const getDiscountLabel = (discounts: any[], type: string) => {
    const filtered = discounts?.filter((d: any) => d.type === type)
      .sort((a: any, b: any) => a.step_order - b.step_order)
    if (!filtered || filtered.length === 0) return '—'
    return filtered.map((d: any) => `${Number(d.discount_percentage)}%`).join(' + ')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Pelanggan</h1>
          <p className="text-xs text-gray-600 mt-0.5">{customers.length} pelanggan terdaftar</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 text-sm font-semibold text-black px-4 py-2 rounded-xl transition-colors"
          style={{ background: '#f59e0b' }}>
          <Plus className="w-4 h-4" /> Tambah Pelanggan
        </button>
      </div>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama pelanggan..."
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(145deg, #141414, #111)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bonus Target</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Diskon LM</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Diskon BR</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    Status Risiko
                    {loadingRisk && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </span>
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Bonus</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((c, idx, arr) => (
                <tr key={c.id}
                  style={{ borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  className="hover:bg-white/[0.02] transition-colors">

                  {/* Nama */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <span className="text-amber-400 text-xs font-semibold">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-white">{c.name}</span>
                    </div>
                  </td>

                  {/* Bonus threshold */}
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-300">
                      {c.bonus_threshold > 0 ? `Rp ${fmt(c.bonus_threshold)}` : <span className="text-gray-600">—</span>}
                    </span>
                  </td>

                  {/* Diskon LM */}
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-sm text-gray-300">{getDiscountLabel(c.discounts, 'LM')}</span>
                      {c.effective_discount_lm > 0 && (
                        <p className="text-[10px] text-gray-600 mt-0.5">Efektif {c.effective_discount_lm?.toFixed(1)}%</p>
                      )}
                    </div>
                  </td>

                  {/* Diskon BR */}
                  <td className="px-5 py-4">
                    <div>
                      <span className="text-sm text-gray-300">{getDiscountLabel(c.discounts, 'BR')}</span>
                      {c.effective_discount_br > 0 && (
                        <p className="text-[10px] text-gray-600 mt-0.5">Efektif {c.effective_discount_br?.toFixed(1)}%</p>
                      )}
                    </div>
                  </td>

                  {/* Risk badge */}
                  <td className="px-5 py-4">
                    <RiskBadge risk={riskMap[c.id] ?? null} />
                  </td>

                  {/* Bonus status */}
                  <td className="px-5 py-4">
                    {(() => {
                      const b = bonusMap[c.id]
                      if (!b) return <span className="text-xs text-gray-700">—</span>
                      if (b.bonuses_remaining > 0) return (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                          🎁 {b.bonuses_remaining} bonus
                        </span>
                      )
                      if (b.bonus_threshold > 0) {
                        const pct = Math.min(100, Math.round((b.carry_over_omzet / b.bonus_threshold) * 100))
                        return (
                          <div className="min-w-[80px]">
                            <p className="text-[10px] text-gray-600 mb-1">{pct}% ke bonus</p>
                            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#f59e0b' }} />
                            </div>
                          </div>
                        )
                      }
                      return <span className="text-xs text-gray-700">—</span>
                    })()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget(c)}
                        className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-600 text-sm">
                    {search ? 'Tidak ada pelanggan yang sesuai pencarian' : 'Belum ada pelanggan terdaftar'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{
              background: 'linear-gradient(145deg, #161616, #111)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
            }}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">
                {editing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">

              {/* Nama */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nama Pelanggan</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Toko Maju Jaya"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'}
                  onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Bonus threshold */}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Target Belanja Bonus
                </label>
                <p className="text-xs text-gray-700 mb-2">
                  Kelipatan omzet pelanggan (sudah lunas) untuk memicu 1 jatah bonus gratis
                </p>
                <RupiahInput
                  value={form.bonus_threshold}
                  onChange={v => setForm({ ...form, bonus_threshold: v })}
                  placeholder="Contoh: 10.000.000"
                />
              </div>

              {/* Diskon bertingkat */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skema Diskon Bertingkat
                    </label>
                    <p className="text-xs text-gray-700 mt-0.5">
                      Diskon dihitung berurutan, bukan dijumlah (misal: 20+20+10)
                    </p>
                  </div>
                  <button onClick={addDiscount}
                    className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
                    + Tambah
                  </button>
                </div>

                {form.discounts.length === 0 && (
                  <p className="text-xs text-gray-700 italic py-2">Belum ada diskon — klik "+ Tambah" untuk menambahkan</p>
                )}

                <div className="space-y-2">
                  {form.discounts.map((d, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select
                        value={d.type}
                        onChange={e => { const disc = [...form.discounts]; disc[i].type = e.target.value; setForm({ ...form, discounts: disc }) }}
                        className="rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', width: '80px' }}>
                        <option value="LM">LM</option>
                        <option value="BR">BR</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Step"
                        value={d.step_order}
                        onChange={e => { const disc = [...form.discounts]; disc[i].step_order = Number(e.target.value); setForm({ ...form, discounts: disc }) }}
                        className="rounded-lg px-3 py-2 text-sm text-white focus:outline-none w-16 text-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          placeholder="Diskon %"
                          value={d.discount_percentage}
                          onChange={e => { const disc = [...form.discounts]; disc[i].discount_percentage = Number(e.target.value); setForm({ ...form, discounts: disc }) }}
                          className="w-full rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">%</span>
                      </div>
                      <button onClick={() => removeDiscount(i)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleSave}
                className="w-full font-semibold py-3 rounded-xl transition-all text-sm text-black"
                style={{ background: '#f59e0b', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                {editing ? 'Simpan Perubahan' : 'Tambah Pelanggan'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Pelanggan"
        message={`Yakin ingin menghapus pelanggan "${deleteTarget?.name}"? Semua data diskon terkait akan ikut terhapus.`}
        confirmLabel="Hapus Pelanggan"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
