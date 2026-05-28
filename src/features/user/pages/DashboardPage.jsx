import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { getTodayStatus, getPoints } from '../api/userApi'
import { formatDate, formatTime, formatDuration, attendanceStatusLabel, toastErr, resolvePhotoUrl } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Modal from '../../../components/ui/Modal'

export default function DashboardPage() {
  const user      = useAuthStore((s) => s.user)
  const navigate  = useNavigate()
  const [todayData,      setTodayData]      = useState(null)
  const [pointsData,     setPointsData]     = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [checkinReminder,setCheckinReminder]= useState(false)

  useEffect(() => {
    Promise.all([getTodayStatus(), getPoints()])
      .then(([t, p]) => {
        const today = t.data.data
        setTodayData(today)
        setPointsData(p.data.data)
        // Tampilkan reminder hanya jika user belum check-in sama sekali hari ini
        if (today.status === 'not_checked_in') {
          setCheckinReminder(true)
        }
      })
      .catch(toastErr)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={24} className="text-stone-400" />
    </div>
  )

  const today    = new Date()
  const hour     = today.getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat sore'
  const photoUrl = resolvePhotoUrl(user?.photo_url)

  return (
    <div className="fade-in space-y-7">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
          {photoUrl
            ? <img src={photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <span className="font-display text-xl text-stone-400">{user?.name?.[0]}</span>}
        </div>
        <div>
          <p className="text-stone-500 text-xs">{formatDate(today.toISOString())}</p>
          <h1 className="font-display text-xl text-ink">{greeting}, {user?.name?.split(' ')[0]}.</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Poin</p>
          <p className="stat-value">{pointsData?.total_points ?? 0}</p>
          <p className="stat-sub">poin terkumpul</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Kunjungan</p>
          <p className="stat-value">{pointsData?.total_visits ?? 0}</p>
          <p className="stat-sub">hari berkunjung</p>
        </div>
        <div className="stat-card col-span-2 sm:col-span-1">
          <p className="stat-label">Menuju Hadiah</p>
          <p className="stat-value">{pointsData?.can_redeem ? '✓' : (pointsData?.points_needed ?? 10)}</p>
          <p className="stat-sub">{pointsData?.can_redeem ? 'Bisa ditukar sekarang' : 'poin lagi'}</p>
        </div>
      </div>

      {/* Today attendance */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-display text-base font-medium text-ink">Kehadiran Hari Ini</h2>
          <Link to="/attendance" className="text-xs text-accent hover:underline">Lihat riwayat</Link>
        </div>
        <div className="card-body">
          <TodayCard data={todayData} />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { to: '/attendance', label: 'Kehadiran',    desc: 'Check-in & riwayat kunjungan', Icon: CalendarIcon },
          { to: '/points',     label: 'Poin & Hadiah', desc: 'Tukar poin dengan hadiah',     Icon: GiftIcon },
        ].map(({ to, label, desc, Icon }) => (
          <Link key={to} to={to} className="card p-4 hover:shadow-card-hover transition-shadow group">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center flex-shrink-0 group-hover:bg-parchment-dark transition-colors">
                <Icon className="w-4 h-4 text-stone-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-stone-500 mt-0.5">{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Check-in Reminder Modal ─────────────────────── */}
      <Modal
        open={checkinReminder}
        onClose={() => setCheckinReminder(false)}
        title={null}
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-5 py-2">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <ClockIcon className="w-7 h-7 text-amber-600" />
          </div>

          <div className="space-y-1.5">
            <p className="font-display text-lg text-ink">Belum Check-in Hari Ini</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              Anda belum melakukan check-in hari ini. Silakan lakukan check-in terlebih dahulu untuk mencatat kunjungan Anda ke perpustakaan.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              className="btn btn-primary btn-lg w-full"
              onClick={() => { setCheckinReminder(false); navigate('/attendance') }}
            >
              Pergi ke Absen Check-in
            </button>
            <button
              className="btn btn-ghost btn-sm w-full text-stone-400"
              onClick={() => setCheckinReminder(false)}
            >
              Nanti saja
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
function TodayCard({ data }) {
  if (!data) return <p className="text-stone-400 text-sm">Gagal memuat data.</p>
  const { status, attendance } = data
  const cfgMap = {
    not_checked_in:   { color: 'text-stone-400', bg: 'bg-stone-50 border-stone-200',  dot: 'bg-stone-300' },
    pending_approval: { color: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-400' },
    checked_in:       { color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  dot: 'bg-green-500 animate-pulse' },
    checked_out:      { color: 'text-stone-600',  bg: 'bg-stone-50 border-stone-200',  dot: 'bg-stone-400' },
    rejected:         { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',      dot: 'bg-danger' },
  }
  const cfg = cfgMap[status] || cfgMap.not_checked_in

  return (
    <div className={`rounded border ${cfg.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`text-sm font-medium ${cfg.color}`}>{attendanceStatusLabel(status)}</span>
      </div>

      {attendance ? (
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <Pair label="Check-in"  value={formatTime(attendance.check_in_time)}  mono />
          {attendance.check_out_time && <Pair label="Check-out" value={formatTime(attendance.check_out_time)} mono />}
          {attendance.activity && <Pair label="Kegiatan" value={attendance.activity} className="col-span-2" />}
          {attendance.duration_minutes && <Pair label="Durasi" value={formatDuration(attendance.duration_minutes)} className="col-span-2" />}
          {attendance.admin_notes && (
            <div className="col-span-2 pt-2 border-t border-stone-200 mt-1">
              <p className="text-xs text-stone-400">Catatan admin</p>
              <p className="text-xs text-stone-600 italic">{attendance.admin_notes}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-stone-400">Scan QR code di kasir perpustakaan untuk check-in.</p>
      )}

      <div className="mt-3 pt-3 border-t border-stone-200">
        <Link to="/attendance" className="text-xs text-accent hover:underline">
          {status === 'not_checked_in' ? 'Cara check-in →' : 'Detail kehadiran →'}
        </Link>
      </div>
    </div>
  )
}

function Pair({ label, value, mono, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs text-stone-400">{label}</p>
      <p className={`text-xs text-stone-700 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function CalendarIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> }
function GiftIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg> }
function ClockIcon({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
