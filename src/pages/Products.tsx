import { useState, useEffect, useMemo } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import RupiahInput from '../components/RupiahInput'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, Pencil, Trash2, X, Search, Package } from 'lucide-react'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'LM' | 'BR'>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [form, setForm] = useState({ name: '', type: 'LM' as string, cost_price: 0, base_price: 0 })
  const { success, error } = useToast()

  const load = async () => {
    setLoading(true)
    try { setProducts(await api.getProducts()) } catch (e: any) { error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', type: 'LM', cost_price: 0, base_price: 0 })
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({ name: p.name, type: p.type, cost_price: Number(p.cost_price), base_price: Number(p.base_price) })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      if (editing) { await api.updateProduct(editing.id, form); success('Produk berhasil diupdate') }
      else { await api.createProduct(form); success('Produk berhasil ditambahkan') }
      setShowModal(false)
      load()
    } catch (err: any) { error(err.message) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try { await api.deleteProduct(deleteTarget.id); success('Produk berhasil dihapus'); load() }
    catch (err: any) { error(err.message) }
    setDeleteTarget(null)
  }

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === 'ALL' || p.type === filterType
      return matchSearch && matchType
    })
  }, [products, search, filterType])

  const lmCount = products.filter(p => p.type === 'LM').length
  const brCount = products.filter(p => p.type === 'BR').length

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Produk</h1>
          <p className="text-xs text-gray-600 mt-0.5">{products.length} produk · {lmCount} LM · {brCount} BR</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 text-sm font-semibold text-black px-4 py-2 rounded-xl"
          style={{ background: '#f59e0b' }}>
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
            style={inputStyle}
          />
        </div>
        <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['ALL', 'LM', 'BR'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: filterType === t ? 'rgba(245,158,11,0.15)' : 'transparent',
                color: filterType === t ? '#f59e0b' : '#6b7280',
                border: filterType === t ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent',
              }}>
              {t === 'ALL' ? 'Semua' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(145deg, #141414, #111)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Produk</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga Modal</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Harga Jual</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Margin</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const margin = p.base_price > 0 ? ((p.base_price - p.cost_price) / p.base_price * 100).toFixed(1) : '0'
                const marginColor = Number(margin) >= 20 ? '#4ade80' : Number(margin) >= 10 ? '#fbbf24' : '#f87171'
                return (
                  <tr key={p.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: p.type === 'LM' ? 'rgba(96,165,250,0.1)' : 'rgba(52,211,153,0.1)' }}>
                          <Package className="w-3.5 h-3.5" style={{ color: p.type === 'LM' ? '#60a5fa' : '#34d399' }} />
                        </div>
                        <span className="text-sm font-medium text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{
                          background: p.type === 'LM' ? 'rgba(96,165,250,0.1)' : 'rgba(52,211,153,0.1)',
                          color: p.type === 'LM' ? '#60a5fa' : '#34d399',
                          border: `1px solid ${p.type === 'LM' ? 'rgba(96,165,250,0.2)' : 'rgba(52,211,153,0.2)'}`,
                        }}>
                        {p.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 text-right">Rp {fmt(p.cost_price)}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium text-right">Rp {fmt(p.base_price)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold" style={{ color: marginColor }}>{margin}%</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-sm text-gray-600">
                  {search || filterType !== 'ALL' ? 'Tidak ada produk yang sesuai filter' : 'Belum ada produk'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl p-6" style={{
            background: 'linear-gradient(145deg, #161616, #111)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nama Produk</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Produk A"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'}
                  onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Tipe Produk</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none" style={inputStyle}>
                  <option value="LM">LM</option>
                  <option value="BR">BR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Harga Modal</label>
                <RupiahInput value={form.cost_price} onChange={v => setForm({ ...form, cost_price: v })} placeholder="Harga modal" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Harga Jual (Base)</label>
                <RupiahInput value={form.base_price} onChange={v => setForm({ ...form, base_price: v })} placeholder="Harga jual" />
              </div>
              {form.base_price > 0 && form.cost_price > 0 && (
                <div className="px-4 py-2.5 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <span className="text-gray-500">Margin: </span>
                  <span className="font-semibold" style={{ color: '#4ade80' }}>
                    {((form.base_price - form.cost_price) / form.base_price * 100).toFixed(1)}%
                  </span>
                  <span className="text-gray-600 ml-2">(Rp {fmt(form.base_price - form.cost_price)} per unit)</span>
                </div>
              )}
              <button onClick={handleSave}
                className="w-full font-semibold py-3 rounded-xl text-sm text-black"
                style={{ background: '#f59e0b', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Produk"
        message={`Yakin ingin menghapus produk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Produk"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
