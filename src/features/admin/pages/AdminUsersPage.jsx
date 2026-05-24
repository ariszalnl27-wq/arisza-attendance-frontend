import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, getUserById, updateUser, deactivateUser, createAdmin, exportUsers } from '../api/adminApi'
import { formatDateShort, formatTime, formatDuration, toastErr, resolvePhotoUrl, statusBadge, statusLabel } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

export default function AdminUsersPage() {
  const [users,           setUsers]           = useState([])
  const [pagination,      setPagination]      = useState({ page: 1, totalPages: 1 })
  const [search,          setSearch]          = useState('')
  const [loading,         setLoading]         = useState(true)
  const [detail,          setDetail]          = useState(null)
  const [detailLoading,   setDetailLoading]   = useState(false)
  const [editForm,        setEditForm]        = useState({})
  const [editLoading,     setEditLoading]     = useState(false)
  const [deactivateTarget,setDeactivateTarget]= useState(null)
  const [deactivateLoading,setDeactivateLoading]=useState(false)
  const [createAdminModal,setCreateAdminModal]= useState(false)
  const [adminForm,       setAdminForm]       = useState({ name: '', email: '', phone: '', password: '' })
  const [adminLoading,    setAdminLoading]    = useState(false)
  const [exportLoading,   setExportLoading]   = useState(false)
  const [detailTab,       setDetailTab]       = useState('info')

  const fetchUsers = async (page = 1) => {
    setLoading(true)
    try {
      const res = await getUsers({ page, limit: 15, search })
      setUsers(res.data.data.users)
      setPagination({ page, totalPages: res.data.data.pagination.totalPages })
    } catch (err) { toastErr(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchUsers(), 350)
    return () => clearTimeout(t)
  }, [search])

  const openDetail = async (id) => {
    setDetailLoading(true)
    setDetailTab('info')
    try {
      const res = await getUserById(id)
      const u = res.data.data.user
      setDetail(res.data.data)
      setEditForm({ name: u.name, phone: u.phone || '', institution: u.institution || '' })
    } catch (err) { toastErr(err) }
    finally { setDetailLoading(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await updateUser(detail.user.id, editForm)
      toast.success('Data pengguna diperbarui.')
      setDetail(null)
      await fetchUsers(pagination.page)
    } catch (err) { toastErr(err) }
    finally { setEditLoading(false) }
  }

  const handleDeactivate = async () => {
    setDeactivateLoading(true)
    try {
      await deactivateUser(deactivateTarget.id)
      toast.success(`Pengguna ${deactivateTarget.name} dinonaktifkan.`)
      setDeactivateTarget(null)
      await fetchUsers(pagination.page)
    } catch (err) { toastErr(err) }
    finally { setDeactivateLoading(false) }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setAdminLoading(true)
    try {
      await createAdmin(adminForm)
      toast.success('Akun admin baru berhasil dibuat.')
      setCreateAdminModal(false)
      setAdminForm({ name: '', email: '', phone: '', password: '' })
      await fetchUsers()
    } catch (err) { toastErr(err) }
    finally { setAdminLoading(false) }
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const res = await exportUsers()
      const url  = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href  = url
      link.setAttribute('download', `data-pengunjung-${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('File Excel berhasil diunduh.')
    } catch (err) { toastErr(err) }
    finally { setExportLoading(false) }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Pengguna</h1>
          <p className="page-subtitle">Kelola akun pengunjung dan administrator</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? <Spinner size={14} /> : <ExportIcon className="w-4 h-4" />}
            Ekspor Excel
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setCreateAdminModal(true)}>
            + Admin Baru
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
          <input className="input" placeholder="Cari nama, email, atau nomor telepon..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size={22} className="text-stone-400" /></div>
      ) : users.length === 0 ? (
        <EmptyState message="Tidak ada pengguna ditemukan." />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr><th>Nama</th><th>Email</th><th>No. Telepon</th><th>Role</th><th>Poin</th><th>Kunjungan</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const photo = resolvePhotoUrl(u.photo_url)
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-stone-200">
                            {photo
                              ? <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              : <span className="text-xs text-stone-400">{u.name[0]}</span>}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-ink">{u.name}</p>
                            {u.auth_provider === 'google' && (
                              <p className="text-xs text-stone-400">via Google</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-xs text-stone-500">{u.email}</td>
                      <td className="text-xs font-mono text-stone-500">{u.phone || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-approved' : 'badge-neutral'}`}>
                          {u.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="text-center font-medium text-sm">{u.total_points}</td>
                      <td className="text-center text-sm">{u.total_visits}</td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                          {u.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-sm" onClick={() => openDetail(u.id)}>Detail</button>
                          {u.role !== 'admin' && u.is_active && (
                            <button className="btn btn-ghost btn-sm text-danger" onClick={() => setDeactivateTarget(u)}>Nonaktif</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchUsers} />
        </>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────── */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detail Pengguna" size="xl">
        {detailLoading ? (
          <div className="flex justify-center py-10"><Spinner size={22} className="text-stone-400" /></div>
        ) : detail && (
          <div className="space-y-5">
            {/* Photo + summary */}
            <div className="flex items-center gap-4 pb-4 border-b border-stone-100">
              <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {resolvePhotoUrl(detail.user.photo_url)
                  ? <img src={resolvePhotoUrl(detail.user.photo_url)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : <span className="font-display text-2xl text-stone-400">{detail.user.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink">{detail.user.name}</p>
                <p className="text-stone-500 text-sm">{detail.user.email}</p>
                <p className="text-stone-400 text-xs mt-0.5">{detail.user.institution || 'Instansi tidak diisi'}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <StatChip label="Poin" value={detail.user.total_points} />
                <StatChip label="Kunjungan" value={detail.user.total_visits} />
                <StatChip label="Ditukar" value={detail.totalPointsRedeemed} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-stone-200 -mt-1">
              {[['info','Info & Edit'], ['attendances','Kehadiran'], ['redemptions','Penukaran']].map(([t, label]) => (
                <button key={t} onClick={() => setDetailTab(t)}
                  className={`px-3 py-2 text-xs transition-colors border-b-2 -mb-px ${
                    detailTab === t ? 'border-accent text-ink font-medium' : 'border-transparent text-stone-500 hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Info & Edit */}
            {detailTab === 'info' && (
              <form onSubmit={handleEdit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label">Nama</label>
                    <input className="input" value={editForm.name || ''} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="label">No. Telepon</label>
                    <input className="input" value={editForm.phone || ''} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Instansi</label>
                  <input className="input" value={editForm.institution || ''} onChange={(e) => setEditForm(p => ({ ...p, institution: e.target.value }))} />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button type="button" className="btn btn-secondary" onClick={() => setDetail(null)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={editLoading}>
                    {editLoading && <Spinner size={14} />} Simpan
                  </button>
                </div>
              </form>
            )}

            {/* Tab: Kehadiran */}
            {detailTab === 'attendances' && (
              <div className="table-wrapper max-h-64 overflow-y-auto">
                <table className="table text-xs">
                  <thead><tr><th>Tanggal</th><th>Kegiatan</th><th>Check-in</th><th>Check-out</th><th>Durasi</th><th>Status</th></tr></thead>
                  <tbody>
                    {detail.recentAttendances.length === 0
                      ? <tr><td colSpan={6} className="text-center text-stone-400 py-6">Belum ada kehadiran.</td></tr>
                      : detail.recentAttendances.map((a) => (
                        <tr key={a.id}>
                          <td className="whitespace-nowrap">{formatDateShort(a.visit_date)}</td>
                          <td className="max-w-[120px] truncate text-stone-500">{a.activity || '—'}</td>
                          <td className="font-mono">{formatTime(a.check_in_time)}</td>
                          <td className="font-mono">{formatTime(a.check_out_time)}</td>
                          <td>{formatDuration(a.duration_minutes)}</td>
                          <td><span className={statusBadge(a.status)}>{statusLabel(a.status)}</span></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Penukaran */}
            {detailTab === 'redemptions' && (
              <div className="table-wrapper max-h-64 overflow-y-auto">
                <table className="table text-xs">
                  <thead><tr><th>Tanggal</th><th>Poin</th><th>Status</th><th>Catatan</th></tr></thead>
                  <tbody>
                    {detail.recentRedemptions.length === 0
                      ? <tr><td colSpan={4} className="text-center text-stone-400 py-6">Belum ada penukaran.</td></tr>
                      : detail.recentRedemptions.map((r) => (
                        <tr key={r.id}>
                          <td className="whitespace-nowrap">{formatDateShort(r.created_at)}</td>
                          <td className="text-danger font-medium">-{r.points_redeemed}</td>
                          <td><span className={statusBadge(r.status)}>{statusLabel(r.status)}</span></td>
                          <td className="text-stone-500 italic">{r.admin_notes || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Deactivate confirm */}
      <ConfirmDialog
        open={!!deactivateTarget} onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate} loading={deactivateLoading}
        title="Nonaktifkan Pengguna"
        message={`Nonaktifkan akun ${deactivateTarget?.name}? Pengguna tidak bisa login setelah ini.`}
        confirmLabel="Nonaktifkan"
      />

      {/* Create admin modal */}
      <Modal open={createAdminModal} onClose={() => setCreateAdminModal(false)} title="Buat Admin Baru">
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="form-group">
            <label className="label">Nama Lengkap</label>
            <input className="input" value={adminForm.name} onChange={(e) => setAdminForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={adminForm.email} onChange={(e) => setAdminForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">No. Telepon</label>
              <input className="input" placeholder="Opsional" value={adminForm.phone} onChange={(e) => setAdminForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Minimal 8 karakter" value={adminForm.password} onChange={(e) => setAdminForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-secondary" onClick={() => setCreateAdminModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={adminLoading}>
              {adminLoading && <Spinner size={14} />} Buat Admin
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function StatChip({ label, value }) {
  return (
    <div className="bg-stone-50 rounded border border-stone-100 px-3 py-2">
      <p className="font-display text-lg text-ink">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  )
}

function ExportIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
}
