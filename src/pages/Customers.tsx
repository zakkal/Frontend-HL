import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import RupiahInput from '../components/RupiahInput'

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', bonus_threshold: 0, discounts: [] as any[] })
  const { success, error } = useToast()

  const load = async () => {
    setLoading(true)
    try { setCustomers(await api.getCustomers()) } catch (e: any) { error(e.message) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

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

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus pelanggan ini?')) return
    try { await api.deleteCustomer(id); success('Pelanggan berhasil dihapus'); load() }
    catch (err: any) { error(err.message) }
  }

  const addDiscount = () => {
    setForm(f => ({ ...f, discounts: [...f.discounts, { type: 'LM', step_order: f.discounts.length + 1, discount_percentage: 0 }] }))
  }

  const removeDiscount = (idx: number) => {
    setForm(f => ({ ...f, discounts: f.discounts.filter((_, i) => i !== idx) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Pelanggan</h1>
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
                <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Bonus Threshold</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Diskon LM</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Diskon BR</th>
                <th className="text-right px-6 py-4 text-sm text-gray-400 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-white font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-gray-300">{Number(c.bonus_threshold).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-gray-300">{c.effective_discount_lm?.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-gray-300">{c.effective_discount_br?.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => openEdit(c)} className="p-2 text-gray-400 hover:text-amber-400"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada pelanggan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editing ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bonus Threshold</label>
                <RupiahInput value={form.bonus_threshold} onChange={v => setForm({ ...form, bonus_threshold: v })} placeholder="Bonus threshold" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Diskon Bertingkat</label>
                  <button onClick={addDiscount} className="text-xs text-amber-400 hover:text-amber-300">+ Tambah Diskon</button>
                </div>
                {form.discounts.map((d, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={d.type} onChange={e => { const disc = [...form.discounts]; disc[i].type = e.target.value; setForm({ ...form, discounts: disc }) }}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="LM">LM</option><option value="BR">BR</option>
                    </select>
                    <input type="number" placeholder="Step" value={d.step_order} onChange={e => { const disc = [...form.discounts]; disc[i].step_order = Number(e.target.value); setForm({ ...form, discounts: disc }) }}
                      className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                    <input type="number" placeholder="%" value={d.discount_percentage} onChange={e => { const disc = [...form.discounts]; disc[i].discount_percentage = Number(e.target.value); setForm({ ...form, discounts: disc }) }}
                      className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                    <button onClick={() => removeDiscount(i)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={handleSave} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-lg transition-colors">
                {editing ? 'Simpan' : 'Buat Pelanggan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}