import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Plus, CheckCircle, X, Sparkles } from 'lucide-react'
import RupiahInput from '../components/RupiahInput'

export default function Transactions() {
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [activity, setActivity] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const { success, error } = useToast()

  const [form, setForm] = useState({
    nomor_bon: '', customer_id: '', tanggal: new Date().toISOString().split('T')[0],
    items: [{ product_id: '', quantity: 1 }], ongkir: 0, deskripsi: '', is_bonus: false,
  })

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(() => {})
    api.getProducts().then(setProducts).catch(() => {})
  }, [])

  const loadActivity = async () => {
    if (!selectedCustomer) return
    try { const data = await api.getActivity(selectedCustomer, month, year); setActivity(data) }
    catch (err: any) { error(err.message) }
  }

  useEffect(() => { if (selectedCustomer) loadActivity() }, [selectedCustomer, month, year])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))

  const handleCreate = async () => {
    try {
      await api.createTransaction(form)
      success('Transaksi berhasil dibuat')
      setShowModal(false)
      setForm({ nomor_bon: '', customer_id: '', tanggal: new Date().toISOString().split('T')[0], items: [{ product_id: '', quantity: 1 }], ongkir: 0, deskripsi: '', is_bonus: false })
      loadActivity()
    } catch (err: any) { error(err.message) }
  }

  const handleSettle = async (txId: string) => {
    try { await api.settleTransaction(txId, new Date().toISOString().split('T')[0]); success('Transaksi berhasil dilunasi'); loadActivity() }
    catch (err: any) { error(err.message) }
  }

  const handleDraftReminder = async (txId: string) => {
    try {
      success('Menyusun draf pengingat dengan AI...')
      const { message } = await api.getAiReminder(selectedCustomer, txId)
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank')
      success('Draf selesai, membuka WhatsApp...')
    } catch (err: any) {
      error(err.message)
    }
  }

  const handleSettleMonth = async () => {
    if (!selectedCustomer) return
    try {
      const result = await api.settleMonth(selectedCustomer, month, year)
      success(result.settled_count + ' transaksi berhasil dilunasi')
      loadActivity()
    } catch (err: any) { error(err.message) }
  }

  const fmt = (n: number) => Number(n).toLocaleString('id-ID')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Transaksi</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" /> Buat Bon
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Pelanggan</label>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white min-w-[200px]">
              <option value="">Pilih pelanggan...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          {selectedCustomer && (
            <button onClick={handleSettleMonth} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors">
              Lunasi Semua
            </button>
          )}
        </div>
      </div>

      {activity && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Piutang', value: activity.total_piutang, color: 'text-red-400' },
              { label: 'Lunas', value: activity.total_lunas, color: 'text-green-400' },
              { label: 'Omzet LM', value: activity.total_omzet_lm, color: 'text-blue-400' },
              { label: 'Omzet BR', value: activity.total_omzet_br, color: 'text-purple-400' },
              { label: 'Laba HL', value: activity.total_laba_hl, color: 'text-amber-400' },
            ].map(s => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>Rp {fmt(s.value)}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-3 text-sm text-gray-400">No. Bon</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-400">Tanggal</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Omzet</th>
                  <th className="text-left px-6 py-3 text-sm text-gray-400">Status</th>
                  <th className="text-right px-6 py-3 text-sm text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {activity.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-6 py-3 text-white font-medium">{tx.nomor_bon}</td>
                    <td className="px-6 py-3 text-gray-300">{tx.tanggal}</td>
                    <td className="px-6 py-3 text-gray-300 text-right">Rp {fmt(tx.total_omzet)}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${tx.status === 'Lunas' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>{tx.status}</span>
                      {tx.is_bonus && <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-purple-400/10 text-purple-400">Bonus</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {tx.status === 'Piutang' && (
                          <>
                            <button onClick={() => handleDraftReminder(tx.id)} title="Buat Draft WA Pengingat (AI)" className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">
                              <Sparkles className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleSettle(tx.id)} title="Lunasi" className="text-green-400 hover:text-green-300 transition-colors cursor-pointer">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!activity.transactions || activity.transactions.length === 0) && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Belum ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Buat Transaksi Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nomor Bon</label>
                  <input value={form.nomor_bon} onChange={e => setForm({ ...form, nomor_bon: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Pelanggan</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white">
                  <option value="">Pilih pelanggan...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-400">Item</label>
                  <button onClick={addItem} className="text-xs text-amber-400 hover:text-amber-300">+ Tambah Item</button>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={item.product_id} onChange={e => { const items = [...form.items]; items[i].product_id = e.target.value; setForm({ ...form, items }) }}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm">
                      <option value="">Pilih produk...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                    </select>
                    <input type="number" placeholder="Qty" value={item.quantity} min={1}
                      onChange={e => { const items = [...form.items]; items[i].quantity = Number(e.target.value); setForm({ ...form, items }) }}
                      className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ongkir</label>
                  <RupiahInput value={form.ongkir} onChange={v => setForm({ ...form, ongkir: v })} placeholder="Ongkir" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="is_bonus" checked={form.is_bonus} onChange={e => setForm({ ...form, is_bonus: e.target.checked })} className="w-5 h-5 accent-amber-400" />
                  <label htmlFor="is_bonus" className="text-sm text-gray-300">Transaksi Bonus (Gratis)</label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:border-amber-400 focus:outline-none" rows={2} />
              </div>
              <button onClick={handleCreate} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-semibold py-3 rounded-lg transition-colors">
                Buat Transaksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}