import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getRedemptions, processRedemption } from '../api/adminApi'
import { formatDateShort, statusBadge, statusLabel, toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'

export default function AdminRedemptionsPage() {
  const [searchParams] = useSearchParams()
  const [redemptions, setRedemptions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status: 'approved', admin_notes: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await getRedemptions({ status: statusFilter || undefined, page, limit: 20 })
      setRedemptions(res.data.data.redemptions)
      setPagination({ page, totalPages: res.data.data.pagination.totalPages })
    } catch (err) { toastErr(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [statusFilter])

  const handleProcess = async () => {
    setActionLoading(true)
    try {
      await processRedemption(selected.id, form)
      toast.success(form.status === 'approved' ? 'Penukaran disetujui.' : 'Penukaran ditolak, poin dikembalikan.')
      setSelected(null)
      await fetchData(pagination.page)
    } catch (err) { toastErr(err) }
    finally { setActionLoading(false) }
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="page-title">Penukaran Poin</h1>
        <p className="page-subtitle">Proses pengajuan penukaran hadiah dari pengunjung</p>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="card-body flex gap-3">
          <select className="input w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} className="text-stone-400" /></div>
      ) : redemptions.length === 0 ? (
        <EmptyState message="Tidak ada pengajuan penukaran." />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Pengunjung</th>
                  <th>Poin</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Catatan Admin</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <p className="font-medium text-xs text-ink">{r.user_name}</p>
                      <p className="text-stone-400 text-xs">{r.user_email}</p>
                    </td>
                    <td className="font-medium text-danger text-sm">-{r.points_redeemed}</td>
                    <td className="whitespace-nowrap text-xs">{formatDateShort(r.created_at)}</td>
                    <td><span className={statusBadge(r.status)}>{statusLabel(r.status)}</span></td>
                    <td className="text-stone-500 text-xs italic">{r.admin_notes || '—'}</td>
                    <td>
                      {r.status === 'pending' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSelected(r); setForm({ status: 'approved', admin_notes: '' }) }}
                        >
                          Proses
                        </button>
                      ) : <span className="text-stone-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}

      {/* Process modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Proses Penukaran Poin">
        {selected && (
          <div className="space-y-4">
            <div className="bg-stone-50 border border-stone-100 rounded p-3">
              <p className="font-medium text-ink text-sm">{selected.user_name}</p>
              <p className="text-stone-500 text-xs mt-0.5">
                Pengajuan {selected.points_redeemed} poin — {formatDateShort(selected.created_at)}
              </p>
            </div>

            <div className="form-group">
              <label className="label">Keputusan</label>
              <select className="input" value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="approved">Setujui — Hadiah diberikan</option>
                <option value="rejected">Tolak — Poin dikembalikan</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Catatan <span className="text-stone-400">(opsional)</span></label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Misal: Hadiah sudah disiapkan di loket..."
                value={form.admin_notes}
                onChange={(e) => setForm(p => ({ ...p, admin_notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary" onClick={() => setSelected(null)} disabled={actionLoading}>Batal</button>
              <button
                className={`btn ${form.status === 'approved' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleProcess}
                disabled={actionLoading}
              >
                {actionLoading && <Spinner size={14} />}
                {form.status === 'approved' ? 'Setujui' : 'Tolak & Kembalikan Poin'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
