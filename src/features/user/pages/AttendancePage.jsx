import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { checkIn, checkOut, getTodayStatus, getHistory } from '../api/userApi'
import { formatDateShort, formatTime, formatDuration, toastErr, statusBadge, statusLabel } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'
import QRScanner from '../../../components/ui/QRScanner'

const ACTIVITY_SUGGESTIONS = [
  'Membaca buku',
  'Mengerjakan tugas',
  'Penelitian / skripsi',
  'Belajar mandiri',
  'Diskusi kelompok',
  'Menggunakan komputer',
  'Lainnya',
]

export default function AttendancePage() {
  const [today,        setToday]        = useState(null)
  const [history,      setHistory]      = useState([])
  const [pagination,   setPagination]   = useState({ page: 1, totalPages: 1 })
  const [loading,      setLoading]      = useState(true)
  const [actionLoading,setActionLoading]= useState(false)
  const [qrToken,      setQrToken]      = useState('')
  const [tab,          setTab]          = useState('today')
  const [scannerOpen,  setScannerOpen]  = useState(false)
  const [scanMode,     setScanMode]     = useState('checkin')

  // Activity modal
  const [activityModal,  setActivityModal]  = useState(false)
  const [pendingToken,   setPendingToken]   = useState('')
  const [activity,       setActivity]       = useState('')
  const [customActivity, setCustomActivity] = useState('')

  const fetchToday = async () => {
    const res = await getTodayStatus()
    setToday(res.data.data)
  }

  const fetchHistory = async (page = 1) => {
    const res = await getHistory({ page, limit: 10 })
    setHistory(res.data.data.attendances)
    setPagination({ page, totalPages: res.data.data.pagination.totalPages })
  }

  useEffect(() => {
    Promise.all([fetchToday(), fetchHistory()])
      .catch(toastErr)
      .finally(() => setLoading(false))
  }, [])

  const submitCheckIn = async (token, act) => {
    setActionLoading(true)
    try {
      const finalActivity = act === 'Lainnya' ? customActivity : act
      await checkIn(token, finalActivity)
      toast.success('Check-in berhasil. Menunggu persetujuan admin.')
      setQrToken('')
      setActivity('')
      setCustomActivity('')
      setActivityModal(false)
      await fetchToday()
    } catch (err) { toastErr(err) }
    finally { setActionLoading(false) }
  }

  const submitCheckOut = async (token) => {
    const t = (token ?? qrToken).trim()
    if (!t) return toast.error('Masukkan atau scan token QR terlebih dahulu.')
    setActionLoading(true)
    try {
      const res = await checkOut(t)
      toast.success(res.data.message)
      setQrToken('')
      await Promise.all([fetchToday(), fetchHistory()])
    } catch (err) { toastErr(err) }
    finally { setActionLoading(false) }
  }

  const handleManualCheckIn = () => {
    if (!qrToken.trim()) return toast.error('Masukkan token QR terlebih dahulu.')
    setPendingToken(qrToken.trim())
    setActivity('')
    setCustomActivity('')
    setActivityModal(true)
  }

  const handleScan = (decodedText) => {
    setScannerOpen(false)
    toast.success('QR berhasil dibaca.')
    if (scanMode === 'checkin') {
      setPendingToken(decodedText)
      setActivity('')
      setCustomActivity('')
      setActivityModal(true)
    } else {
      submitCheckOut(decodedText)
    }
  }

  const openScanner = (mode) => {
    setScanMode(mode)
    setQrToken('')
    setScannerOpen(false)
    requestAnimationFrame(() => setScannerOpen(true))
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} className="text-stone-400" /></div>

  const canCheckIn  = today?.status === 'not_checked_in'
  const canCheckOut = today?.status === 'checked_in'

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="page-title">Kehadiran</h1>
        <p className="page-subtitle">Check-in &amp; riwayat kunjungan perpustakaan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {[['today', 'Hari Ini'], ['history', 'Riwayat']].map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-accent text-ink font-medium' : 'border-transparent text-stone-500 hover:text-ink'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'today' ? (
        <div className="space-y-5">
          {/* Status card */}
          <div className="card">
            <div className="card-header">
              <p className="font-display text-base font-medium text-ink">Status Saat Ini</p>
            </div>
            <div className="card-body">
              <StatusDisplay data={today} />
            </div>
          </div>

          {/* ── Action card: Check-in ──────────────────────── */}
          {canCheckIn && (
            <div className="card border-stone-200">
              <div className="card-header flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-300" />
                  <p className="font-display text-base font-medium text-ink">Check-in</p>
                </div>
                <span className="text-xs text-stone-400">Tiba di perpustakaan</span>
              </div>
              <div className="card-body space-y-4">
                <button
                  className="btn btn-primary btn-lg w-full gap-3"
                  onClick={() => openScanner('checkin')}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size={16} /> : <CameraIcon className="w-5 h-5" />}
                  Check-in menggunakan Kamera
                </button>
                <p className="text-xs text-stone-400 text-center -mt-1">
                  Arahkan kamera ke QR code Check-in yang terpasang di kasir
                </p>
                <Divider />
                <div className="flex gap-2">
                  <input className="input font-mono text-xs flex-1" placeholder="Tempel token QR Check-in..."
                    value={qrToken} onChange={(e) => setQrToken(e.target.value)} />
                  <button className="btn btn-secondary flex-shrink-0"
                    onClick={handleManualCheckIn}
                    disabled={actionLoading || !qrToken.trim()}>
                    {actionLoading ? <Spinner size={14} /> : 'Kirim'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Action card: Check-out ─────────────────────── */}
          {canCheckOut && (
            <div className="card border-accent/30">
              <div className="card-header flex items-center justify-between bg-accent/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="font-display text-base font-medium text-ink">Check-out</p>
                </div>
                <span className="text-xs text-stone-400">Hendak meninggalkan perpustakaan</span>
              </div>
              <div className="card-body space-y-4">
                <button
                  className="btn btn-accent btn-lg w-full gap-3"
                  onClick={() => openScanner('checkout')}
                  disabled={actionLoading}
                >
                  {actionLoading ? <Spinner size={16} /> : <CameraIcon className="w-5 h-5" />}
                  Check-out menggunakan Kamera
                </button>
                <p className="text-xs text-stone-400 text-center -mt-1">
                  Arahkan kamera ke QR code Check-out yang terpasang di kasir
                </p>
                <Divider />
                <div className="flex gap-2">
                  <input className="input font-mono text-xs flex-1" placeholder="Tempel token QR Check-out..."
                    value={qrToken} onChange={(e) => setQrToken(e.target.value)} />
                  <button className="btn btn-secondary flex-shrink-0"
                    onClick={() => submitCheckOut(qrToken)}
                    disabled={actionLoading || !qrToken.trim()}>
                    {actionLoading ? <Spinner size={14} /> : 'Kirim'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info banner untuk status lain */}
          {!canCheckIn && !canCheckOut && today?.attendance && (
            <InfoBanner status={today.status} />
          )}
        </div>
      ) : (
        /* ── Tab: Riwayat ──────────────────────────────────── */
        <div className="space-y-3">
          {history.length === 0 ? <EmptyState message="Belum ada riwayat kehadiran." /> : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kegiatan</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Durasi</th>
                      <th>Status</th>
                      <th>Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((a) => (
                      <tr key={a.id}>
                        <td className="whitespace-nowrap">{formatDateShort(a.visit_date)}</td>
                        <td className="text-xs text-stone-500 max-w-[140px] truncate">{a.activity || '—'}</td>
                        <td className="font-mono text-xs">{formatTime(a.check_in_time)}</td>
                        <td className="font-mono text-xs">{formatTime(a.check_out_time)}</td>
                        <td>{formatDuration(a.duration_minutes)}</td>
                        <td><span className={statusBadge(a.status)}>{statusLabel(a.status)}</span></td>
                        <td>{a.point_awarded
                          ? <span className="text-success text-xs font-medium">+1</span>
                          : <span className="text-stone-300 text-xs">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchHistory} />
            </>
          )}
        </div>
      )}

      {/* ── QR Scanner Modal ──────────────────────────────── */}
      <Modal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        title={scanMode === 'checkin' ? 'Scan QR Check-in' : 'Scan QR Check-out'}
        size="sm"
      >
        <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />
      </Modal>

      {/* ── Activity Modal ────────────────────────────────── */}
      <Modal open={activityModal} onClose={() => setActivityModal(false)} title="Kegiatan Hari Ini" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            QR check-in berhasil dibaca. Pilih kegiatan yang akan kamu lakukan hari ini:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACTIVITY_SUGGESTIONS.map((a) => (
              <button key={a} type="button" onClick={() => setActivity(a)}
                className={`text-left px-3 py-2.5 rounded border text-sm transition-all ${
                  activity === a
                    ? 'border-accent bg-parchment text-ink font-medium'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50'}`}>
                {a}
              </button>
            ))}
          </div>
          {activity === 'Lainnya' && (
            <div className="form-group">
              <label className="label">Tuliskan kegiatan kamu</label>
              <input className="input" placeholder="Contoh: Membaca jurnal..."
                value={customActivity} onChange={(e) => setCustomActivity(e.target.value)} autoFocus />
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button className="btn btn-secondary flex-1" onClick={() => setActivityModal(false)}>Batal</button>
            <button className="btn btn-primary flex-1"
              disabled={actionLoading || !activity || (activity === 'Lainnya' && !customActivity.trim())}
              onClick={() => submitCheckIn(pendingToken, activity)}>
              {actionLoading && <Spinner size={14} />}
              Check-in Sekarang
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────── */
function StatusDisplay({ data }) {
  if (!data) return null
  const { status, attendance } = data
  const map = {
    not_checked_in:   { label: 'Belum Check-in',            color: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' },
    pending_approval: { label: 'Menunggu Persetujuan Admin', color: 'bg-amber-50 text-amber-700',  dot: 'bg-amber-400' },
    checked_in:       { label: 'Sedang Berkunjung',          color: 'bg-green-50 text-green-700',  dot: 'bg-green-500 animate-pulse' },
    checked_out:      { label: 'Kunjungan Selesai',          color: 'bg-stone-100 text-stone-600', dot: 'bg-stone-400' },
    rejected:         { label: 'Ditolak Admin',              color: 'bg-red-50 text-danger',       dot: 'bg-danger' },
  }
  const cfg = map[status] || map.not_checked_in
  return (
    <div className="space-y-3">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm font-medium ${cfg.color}`}>
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </div>
      {attendance && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-stone-100">
          <Pair label="Check-in"  value={formatTime(attendance.check_in_time)}  mono />
          <Pair label="Check-out" value={formatTime(attendance.check_out_time)} mono />
          {attendance.activity && <Pair label="Kegiatan" value={attendance.activity} className="col-span-2" />}
          <Pair label="Durasi"   value={formatDuration(attendance.duration_minutes)} />
          {attendance.admin_notes && <Pair label="Catatan Admin" value={attendance.admin_notes} className="col-span-2" />}
        </div>
      )}
    </div>
  )
}

function InfoBanner({ status }) {
  const map = {
    pending_approval: { bg: 'bg-amber-50 border-amber-200 text-amber-800', text: 'Check-in Anda sedang menunggu persetujuan admin. Silakan tunggu.' },
    rejected:         { bg: 'bg-red-50 border-red-200 text-danger',        text: 'Check-in Anda ditolak oleh admin. Hubungi petugas perpustakaan.' },
    checked_out:      { bg: 'bg-stone-50 border-stone-200 text-stone-600', text: 'Kunjungan hari ini sudah selesai. Sampai jumpa besok!' },
  }
  const cfg = map[status]
  if (!cfg) return null
  return <div className={`border rounded p-4 text-sm ${cfg.bg}`}>{cfg.text}</div>
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-stone-100" />
      <span className="text-xs text-stone-400">atau token manual</span>
      <div className="flex-1 h-px bg-stone-100" />
    </div>
  )
}

function Pair({ label, value, mono, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs text-stone-400">{label}</p>
      <p className={`text-sm text-stone-700 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  )
}

function CameraIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
}
