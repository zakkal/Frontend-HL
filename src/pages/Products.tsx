import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import RupiahInput from '../components/RupiahInput'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function Products() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
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

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus produk ini?')) return
    try { await api.deleteProduct(id); success('Produk berhasil dihapus'); load() }
    catch (err: any) { error(err.message) }
  }

  const fmt = (n: number) => Number(n).toLocaleString('id-ID')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Produk</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /> Tambah
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Nama</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Tipe</th>
                <th className="text-right px-6 py-4 text-sm text-gray-400 font-medium">Harga Modal</th>
                <th className="text-right px-6 py-4 text-sm text-gray-400 font-medium">Harga Base</th>
                <th className="text-right px-6 py-4 text-sm text-gray-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${p.type === 'LM' ? 'bg-blue-400/10 text-blue-400' : 'bg-green-400/10 text-green-400'}`}>{p.type}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-right">Rp {fmt(p.cost_price)}</td>
                  <td className="px-6 py-4 text-gray-300 text-right">Rp {fmt(p.base_price)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-amber-400"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada produk</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipe</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none">
                  <option value="LM">LM</option><option value="BR">BR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Harga Modal</label>
                <RupiahInput value={form.cost_price} onChange={v => setForm({ ...form, cost_price: v })} placeholder="Harga modal" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Harga Base</label>
                <RupiahInput value={form.base_price} onChange={v => setForm({ ...form, base_price: v })} placeholder="Harga base" />
              </div>
              <button onClick={handleSave} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-lg transition-colors">
                {editing ? 'Simpan' : 'Buat Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}