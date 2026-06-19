import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { Plus, CheckCircle, X, Sparkles, ChevronDown, ChevronUp, Receipt } from 'lucide-react'
import RupiahInput from '../components/RupiahInput'
import ConfirmDialog from '../components/ConfirmDialog'

const fmt = (n: number) => Number(n).toLocaleString('id-ID')
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export default function Transactions() {
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [activity, setActivity] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [expandedTx, setExpandedTx] = useState<string | null>(null)
  const [settleTarget, setSettleTarget] = useState<any>(null)
  const [settleMonthConfirm, setSettleMonthConfirm] = useState(false)
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
    try { setActivity(await api.getActivity(selectedCustomer, month, year)) }
    catch (err: any) { error(err.message) }
  }

  useEffect(() => { if (selectedCustomer) loadActivity() }, [selectedCustomer, month, year])

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }))
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const handleCreate = async () => {
    try {
      await api.createTransaction(form)
      success('Transaksi berhasil dibuat')
      setShowModal(false)
      setForm({ nomor_bon: '', customer_id: '', tanggal: new Date().toISOString().split('T')[0], items: [{ product_id: '', quantity: 1 }], ongkir: 0, deskripsi: '', is_bonus: false })
      loadActivity()
    } catch (err: any) { error(err.message) }
  }

  const handleSettle = async () => {
    if (!settleTarget) return
    try { await api.settleTransaction(settleTarget.id, new Date().toISOString().split('T')[0]); success('Transaksi berhasil dilunasi'); loadActivity() }
    catch (err: any) { error(err.message) }
    setSettleTarget(null)
  }

  const handleSettleMonth = async () => {
    if (!selectedCustomer) return
    try {
      const result = await api.settleMonth(selectedCustomer, month, year)
      success(`${result.settled_count} transaksi berhasil dilunasi`)
      loadActivity()
    } catch (err: any) { error(err.message) }
    setSettleMonthConfirm(false)
  }

  const handleDraftReminder = async (txId: string) => {
    try {
      success('Menyusun draf pengingat dengan AI...')
      const { message } = await api.getAiReminder(selectedCustomer, txId)
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank')
    } catch (err: any) { error(err.message) }
  }

  const selectedCustomerName = customers.find(c => c.id === selectedCustomer)?.name

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>Transaksi</h1>
          <p className="text-xs text-gray-600 mt-0.5">Kelola bon penjualan & pelunasan piutang</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-semibold text-black px-4 py-2 rounded-xl"
          style={{ background: '#f59e0b' }}>
          <Plus className="w-4 h-4" /> Buat Bon
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4" style={{
        background: 'linear-gradient(145deg, #141414, #111)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-600 mb-1.5">Pelanggan</label>
            <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none" style={inputStyle}>
              <option value="">Pilih pelanggan...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1.5">Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none" style={inputStyle}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1.5">Tahun</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
              className="rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none w-24" style={inputStyle} />
          </div>
          {selectedCustomer && activity?.transactions?.some((t: any) => t.status === 'Piutang') && (
            <button onClick={() => setSettleMonthConfirm(true)}
              className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
              Lunasi Semua Bulan Ini
            </button>
          )}
        </div>
      </div>

      {/* Activity summary */}
      {activity && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Piutang', value: activity.total_piutang, color: '#f87171' },
              { label: 'Lunas', value: activity.total_lunas, color: '#4ade80' },
              { label: 'Omzet LM', value: activity.total_omzet_lm, color: '#60a5fa' },
              { label: 'Omzet BR', value: activity.total_omzet_br, color: '#a78bfa' },
              { label: 'Laba HL', value: activity.total_laba_hl, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{
                background: 'linear-gradient(145deg, #141414, #111)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <p className="text-xs text-gray-600 mb-1">{s.label}</p>
                <p className="text-base font-semibold" style={{ color: s.color, letterSpacing: '-0.02em' }}>
                  Rp {fmt(s.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Transactions table */}
          <div className="rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(145deg, #141414, #111)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {activity.transactions?.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Receipt className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Belum ada transaksi untuk {selectedCustomerName} di {MONTHS[month - 1]} {year}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider w-8"></th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Bon</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Tagihan</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.transactions?.map((tx: any, idx: number) => (
                    <>
                      <tr key={tx.id}
                        style={{ borderBottom: expandedTx === tx.id ? 'none' : idx < activity.transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                        className="hover:bg-white/[0.02] transition-colors">
                        {/* Expand toggle */}
                        <td className="pl-5 py-4">
                          <button onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                            className="text-gray-600 hover:text-gray-400 transition-colors">
                            {expandedTx === tx.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-white">{tx.nomor_bon}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{tx.tanggal}</td>
                        <td className="px-5 py-4 text-sm text-white font-medium text-right">Rp {fmt(tx.amount_owed)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                              style={{
                                background: tx.status === 'Lunas' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                                color: tx.status === 'Lunas' ? '#4ade80' : '#fbbf24',
                                border: `1px solid ${tx.status === 'Lunas' ? 'rgba(74,222,128,0.2)' : 'rgba(251,191,36,0.2)'}`,
                              }}>
                              {tx.status}
                            </span>
                            {tx.is_bonus && (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                                Bonus
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {tx.status === 'Piutang' && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleDraftReminder(tx.id)} title="Draft Reminder WA"
                                className="p-2 rounded-lg text-gray-600 hover:text-amber-400 hover:bg-amber-400/10 transition-all">
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setSettleTarget(tx)} title="Lunasi"
                                className="p-2 rounded-lg text-gray-600 hover:text-green-400 hover:bg-green-400/10 transition-all">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          {tx.status === 'Lunas' && tx.tanggal_pelunasan && (
                            <p className="text-xs text-gray-600">Lunas: {tx.tanggal_pelunasan}</p>
                          )}
                        </td>
                      </tr>
                      {/* Expanded items */}
                      {expandedTx === tx.id && (
                        <tr key={`${tx.id}-detail`} style={{ borderBottom: idx < activity.transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                          <td colSpan={6} className="px-5 pb-3">
                            <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th className="text-left px-4 py-2 text-gray-600">Produk</th>
                                    <th className="text-right px-4 py-2 text-gray-600">Qty</th>
                                    <th className="text-right px-4 py-2 text-gray-600">Harga Satuan</th>
                                    <th className="text-right px-4 py-2 text-gray-600">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tx.items?.map((item: any) => (
                                    <tr key={item.id}>
                                      <td className="px-4 py-2 text-gray-400">{item.product_id.slice(0, 8)}...</td>
                                      <td className="px-4 py-2 text-gray-400 text-right">{item.quantity}</td>
                                      <td className="px-4 py-2 text-gray-400 text-right">Rp {fmt(item.unit_discounted_price)}</td>
                                      <td className="px-4 py-2 text-white font-medium text-right">Rp {fmt(item.line_omzet)}</td>
                                    </tr>
                                  ))}
                                  {tx.ongkir > 0 && (
                                    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                      <td className="px-4 py-2 text-gray-500" colSpan={3}>Ongkir</td>
                                      <td className="px-4 py-2 text-gray-400 text-right">Rp {fmt(tx.ongkir)}</td>
                                    </tr>
                                  )}
                                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td className="px-4 py-2 font-semibold text-white" colSpan={3}>Total Tagihan</td>
                                    <td className="px-4 py-2 font-semibold text-white text-right">Rp {fmt(tx.amount_owed)}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!activity && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Receipt className="w-6 h-6 text-amber-400/60" />
          </div>
          <p className="text-sm text-gray-600">Pilih pelanggan untuk melihat aktivitas transaksi</p>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{
            background: 'linear-gradient(145deg, #161616, #111)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-white">Buat Transaksi Baru</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Nomor Bon</label>
                  <input value={form.nomor_bon} onChange={e => setForm({ ...form, nomor_bon: e.target.value })}
                    placeholder="Contoh: BON-001"
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-700 focus:outline-none" style={inputStyle}
                    onFocus={e => e.currentTarget.style.border = '1px solid rgba(245,158,11,0.5)'}
                    onBlur={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Tanggal</label>
                  <input type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Pelanggan</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none" style={inputStyle}>
                  <option value="">Pilih pelanggan...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Item Produk</label>
                  <button onClick={addItem} className="text-xs font-medium text-amber-400 hover:text-amber-300">+ Tambah Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <select value={item.product_id} onChange={e => { const items = [...form.items]; items[i].product_id = e.target.value; setForm({ ...form, items }) }}
                        className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none" style={inputStyle}>
                        <option value="">Pilih produk...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
                      </select>
                      <input type="number" placeholder="Qty" min={1} value={item.quantity}
                        onChange={e => { const items = [...form.items]; items[i].quantity = Number(e.target.value); setForm({ ...form, items }) }}
                        className="w-20 rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none" style={inputStyle} />
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-gray-600 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/10 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Ongkir</label>
                  <RupiahInput value={form.ongkir} onChange={v => setForm({ ...form, ongkir: v })} placeholder="0" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="is_bonus" checked={form.is_bonus}
                    onChange={e => setForm({ ...form, is_bonus: e.target.checked })} className="w-4 h-4 accent-amber-400" />
                  <label htmlFor="is_bonus" className="text-sm text-gray-400">Transaksi Bonus (Gratis)</label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Deskripsi (opsional)</label>
                <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none" style={inputStyle} />
              </div>
              <button onClick={handleCreate}
                className="w-full font-semibold py-3 rounded-xl text-sm text-black"
                style={{ background: '#f59e0b', boxShadow: '0 4px 16px rgba(245,158,11,0.25)' }}>
                Buat Transaksi
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!settleTarget}
        title="Konfirmasi Pelunasan"
        message={`Tandai bon "${settleTarget?.nomor_bon}" senilai Rp ${fmt(settleTarget?.amount_owed || 0)} sebagai Lunas hari ini?`}
        confirmLabel="Lunasi"
        onConfirm={handleSettle}
        onCancel={() => setSettleTarget(null)}
        danger={false}
      />

      <ConfirmDialog
        open={settleMonthConfirm}
        title="Lunasi Semua Bulan Ini"
        message={`Tandai semua transaksi Piutang milik ${selectedCustomerName} di ${MONTHS[month - 1]} ${year} sebagai Lunas?`}
        confirmLabel="Lunasi Semua"
        onConfirm={handleSettleMonth}
        onCancel={() => setSettleMonthConfirm(false)}
        danger={false}
      />
    </div>
  )
}
