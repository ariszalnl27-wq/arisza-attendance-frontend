import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/adminApi'
import { toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data.data))
      .catch(toastErr)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} className="text-stone-400" /></div>

  const stats = [
    { label: 'Total Pengguna', value: data?.total_users ?? 0, sub: `${data?.regular_users} pengunjung aktif`, link: '/admin/users' },
    { label: 'Hadir Hari Ini', value: data?.active_today ?? 0, sub: 'pengunjung unik', link: '/admin/attendances' },
    { label: 'Menunggu Persetujuan', value: data?.pending_checkins ?? 0, sub: 'check-in pending', link: '/admin/attendances?status=pending', alert: data?.pending_checkins > 0 },
    { label: 'Penukaran Poin', value: data?.pending_redemptions ?? 0, sub: 'pengajuan pending', link: '/admin/redemptions?status=pending', alert: data?.pending_redemptions > 0 },
    { label: 'Total Kunjungan', value: data?.total_completed_visits ?? 0, sub: 'kunjungan selesai', link: '/admin/attendances' },
  ]

  return (
    <div className="fade-in space-y-7">
      <div>
        <h1 className="page-title">Dashboard Admin</h1>
        <p className="page-subtitle">Ringkasan aktivitas perpustakaan hari ini</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(({ label, value, sub, link, alert }) => (
          <Link key={label} to={link} className="stat-card hover:shadow-card-hover transition-shadow group">
            <div className="flex items-start justify-between">
              <p className="stat-label">{label}</p>
              {alert && <span className="w-2 h-2 rounded-full bg-amber-400 mt-0.5 flex-shrink-0" />}
            </div>
            <p className="stat-value group-hover:text-accent transition-colors">{value}</p>
            <p className="stat-sub">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="card">
        <div className="card-header">
          <p className="font-display text-base font-medium text-ink">Aksi Cepat</p>
        </div>
        <div className="card-body grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/admin/attendances?status=pending', label: 'Approve Kehadiran', desc: 'Validasi check-in pengunjung' },
            { to: '/admin/redemptions?status=pending', label: 'Proses Penukaran', desc: 'Approve/tolak penukaran poin' },
            { to: '/admin/users', label: 'Kelola Pengguna', desc: 'Lihat & edit data pengunjung' },
            { to: '/admin/qr', label: 'QR Code', desc: 'Lihat & cetak QR perpustakaan' },
          ].map(({ to, label, desc }) => (
            <Link key={to} to={to} className="border border-stone-200 rounded p-3 hover:border-accent hover:bg-parchment/50 transition-all group">
              <p className="text-sm font-medium text-ink group-hover:text-accent transition-colors">{label}</p>
              <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
