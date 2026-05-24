import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getAttendances, approveAttendance } from '../api/adminApi'
import { formatDateShort, formatTime, formatDuration, statusBadge, statusLabel, toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'

export default function AdminAttendancesPage() {
  const [searchParams]    = useSearchParams()
  const [attendances, setAttendances] = useState([])
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1 })
  const [loading,     setLoading]     = useState(true)
  const [filters,     setFilters]     = useState({
    date: '', user_id: '', status: searchParams.get('status') || '',
  })
  const [selected,     setSelected]     = useState(null)
  const [approveForm,  setApproveForm]  = useState({ status: 'approved', admin_notes: '' })
  const [approveLoading, setApproveLoading] = useState(false)

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const res = await getAttendances({ ...filters, page, limit: 20 })
      setAttendances(res.data.data.attendances)
      setPagination({ page, totalPages: res.data.data.pagination.totalPages })
    } catch (err) { toastErr(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filters])

  const handleApprove = async () => {
    setApproveLoading(true)
    try {
      await approveAttendance(selected.id, approveForm)
      toast.success(approveForm.status === 'approved' ? 'Kehadiran disetujui.' : 'Kehadiran ditolak.')
      setSelected(null)
      await fetchData(pagination.page)
    } catch (err) { toastErr(err) }
    finally { setApproveLoading(false) }
  }

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="page-title">Data Kehadiran</h1>
        <p className="page-subtitle">Verifikasi dan kelola kehadiran pengunjung</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body flex flex-wrap gap-3">
          <input className="input w-36" type="date" value={filters.date}
            onChange={(e) => setFilters(p => ({ ...p, date: e.target.value }))} />
          <select className="input w-40" value={filters.status}
            onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}>
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <button className="btn btn-secondary btn-sm"
            onClick={() => setFilters({ date: '', user_id: '', status: '' })}>
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} className="text-stone-400" /></div>
      ) : attendances.length === 0 ? (
        <EmptyState message="Tidak ada data kehadiran." />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Pengunjung</th>
                  <th>Kegiatan</th>
                  <th>Tanggal</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <p className="font-medium text-ink text-xs">{a.user_name}</p>
                      <p className="text-stone-400 text-xs">{a.user_phone || a.user_email}</p>
                    </td>
                    <td className="text-xs text-stone-500 max-w-[120px]">
                      <span className="truncate block" title={a.activity || ''}>{a.activity || '—'}</span>
                    </td>
                    <td className="whitespace-nowrap text-xs">{formatDateShort(a.visit_date)}</td>
                    <td className="font-mono text-xs">{formatTime(a.check_in_time)}</td>
                    <td className="font-mono text-xs">{formatTime(a.check_out_time)}</td>
                    <td className="text-xs">{formatDuration(a.duration_minutes)}</td>
                    <td><span className={statusBadge(a.status)}>{statusLabel(a.status)}</span></td>
                    <td>
                      {a.status === 'pending' ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSelected(a); setApproveForm({ status: 'approved', admin_notes: '' }) }}
                        >
                          Proses
                        </button>
                      ) : (
                        <span className="text-stone-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
        </>
      )}

      {/* Approve modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Proses Kehadiran" size="sm">
        {selected && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-stone-50 rounded border border-stone-100 p-3 space-y-1">
              <p className="font-medium text-ink text-sm">{selected.user_name}</p>
              <p className="text-stone-500 text-xs">
                {formatDateShort(selected.visit_date)} — Check-in: {formatTime(selected.check_in_time)}
              </p>
              {selected.activity && (
                <p className="text-stone-600 text-xs">
                  <span className="text-stone-400">Kegiatan:</span> {selected.activity}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="label">Keputusan</label>
              <div className="grid grid-cols-2 gap-2">
                {['approved', 'rejected'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setApproveForm(p => ({ ...p, status: s }))}
                    className={`px-3 py-2.5 rounded border text-sm font-medium transition-all ${
                      approveForm.status === s
                        ? s === 'approved'
                          ? 'border-success bg-green-50 text-success'
                          : 'border-danger bg-red-50 text-danger'
                        : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }`}
                  >
                    {s === 'approved' ? 'Setujui' : 'Tolak'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="label">Catatan Admin <span className="text-stone-400">(opsional)</span></label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Catatan untuk pengunjung..."
                value={approveForm.admin_notes}
                onChange={(e) => setApproveForm(p => ({ ...p, admin_notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button className="btn btn-secondary flex-1" onClick={() => setSelected(null)} disabled={approveLoading}>
                Batal
              </button>
              <button
                className={`btn flex-1 ${approveForm.status === 'approved' ? 'btn-primary' : 'btn-danger'}`}
                onClick={handleApprove}
                disabled={approveLoading}
              >
                {approveLoading && <Spinner size={14} />}
                {approveForm.status === 'approved' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
