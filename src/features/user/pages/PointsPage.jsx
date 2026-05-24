import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPoints, redeemPoints, getRedemptions } from '../api/userApi'
import { formatDateShort, statusBadge, statusLabel, toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import Pagination from '../../../components/ui/Pagination'
import EmptyState from '../../../components/ui/EmptyState'
import Modal from '../../../components/ui/Modal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

const MIN_POINTS = 5

const REDEEM_STEPS = [
  { num: '01', title: `Kumpulkan ${MIN_POINTS} Poin`, desc: `Setiap kunjungan yang selesai (check-in + checkout dalam satu hari) memberikan 1 poin.` },
  { num: '02', title: 'Ajukan Penukaran', desc: `Klik tombol "Tukar ${MIN_POINTS} Poin" di halaman ini. ${MIN_POINTS} poin akan dipotong dari total poin Anda.` },
  { num: '03', title: 'Tunggu Persetujuan Admin', desc: 'Admin perpustakaan akan memproses pengajuan Anda. Anda akan menerima notifikasi email.' },
  { num: '04', title: 'Ambil Hadiah', desc: 'Jika disetujui, datang ke loket perpustakaan dan tunjukkan notifikasi email persetujuan Anda.' },
]

export default function PointsPage() {
  const [points,      setPoints]      = useState(null)
  const [redemptions, setRedemptions] = useState([])
  const [pagination,  setPagination]  = useState({ page: 1, totalPages: 1 })
  const [loading,     setLoading]     = useState(true)
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [guideOpen,   setGuideOpen]   = useState(false)

  const fetchData = async (page = 1) => {
    const [p, r] = await Promise.all([
      getPoints(),
      getRedemptions({ page, limit: 10 }),
    ])
    setPoints(p.data.data)
    setRedemptions(r.data.data.redemptions)
    setPagination({ page, totalPages: r.data.data.pagination.totalPages })
  }

  useEffect(() => {
    fetchData().catch(toastErr).finally(() => setLoading(false))
  }, [])

  const handleRedeem = async () => {
    setRedeemLoading(true)
    try {
      await redeemPoints()
      toast.success('Penukaran poin berhasil diajukan. Menunggu persetujuan admin.')
      setConfirmOpen(false)
      await fetchData()
    } catch (err) { toastErr(err) }
    finally { setRedeemLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} className="text-stone-400" /></div>

  const currentPct = points ? Math.min(((points.total_points % MIN_POINTS) / MIN_POINTS) * 100, 100) : 0
  const vouchers   = points ? Math.floor(points.total_points / MIN_POINTS) : 0

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="page-title">Poin Saya</h1>
        <p className="page-subtitle">Kumpulkan poin dari kunjungan dan tukar dengan hadiah</p>
      </div>

      {/* Points card */}
      <div className="card">
        <div className="card-body space-y-5">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wide">Total Poin</p>
              <p className="font-display text-5xl text-ink mt-1">{points?.total_points ?? 0}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {points?.can_redeem ? (
                <button
                  className="btn btn-accent"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!!points.pending_redemptions}
                >
                  Tukar {MIN_POINTS} Poin
                </button>
              ) : (
                <p className="text-sm text-stone-400">
                  Butuh <span className="font-medium text-ink">{points?.points_needed ?? MIN_POINTS}</span> poin lagi
                </p>
              )}
              <button
                onClick={() => setGuideOpen(true)}
                className="text-xs text-accent hover:underline"
              >
                Cara menukar poin?
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-400">
              <span>Progress menuju hadiah berikutnya</span>
              <span>{points?.total_points % MIN_POINTS} / {MIN_POINTS} poin</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700"
                style={{ width: `${currentPct}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <InfoChip label="Voucher Tersedia" value={vouchers} />
            <InfoChip label="Total Kunjungan"  value={points?.total_visits ?? 0} />
            <InfoChip label="Poin Ditukar"     value={points?.total_redeemed ?? 0} />
          </div>

          {points?.pending_redemptions > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700">
              Anda memiliki penukaran yang sedang diproses admin. Tunggu konfirmasi sebelum mengajukan yang baru.
            </div>
          )}
        </div>
      </div>

      {/* Redemption history */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <p className="font-display text-base font-medium text-ink">Riwayat Penukaran</p>
          <span className="text-xs text-stone-400">{redemptions.length} transaksi</span>
        </div>
        <div className="card-body p-0">
          {redemptions.length === 0 ? (
            <div className="p-5"><EmptyState message="Belum ada penukaran poin." /></div>
          ) : (
            <>
              <div className="table-wrapper border-0 rounded-none">
                <table className="table">
                  <thead>
                    <tr><th>Tanggal</th><th>Poin</th><th>Status</th><th>Catatan Admin</th></tr>
                  </thead>
                  <tbody>
                    {redemptions.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap">{formatDateShort(r.created_at)}</td>
                        <td className="font-medium text-danger">-{r.points_redeemed}</td>
                        <td><span className={statusBadge(r.status)}>{statusLabel(r.status)}</span></td>
                        <td className="text-stone-500 italic text-xs">{r.admin_notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3">
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={fetchData} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Confirm redeem ─────────────────────────────── */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleRedeem}
        loading={redeemLoading}
        title="Tukar Poin"
        message={`Anda akan menukar ${MIN_POINTS} poin untuk 1 hadiah. Pengajuan akan diproses oleh admin perpustakaan. Lanjutkan?`}
        confirmLabel="Ya, Ajukan Sekarang"
        variant="accent"
      />

      {/* ── Panduan cara menukar ───────────────────────── */}
      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Cara Menukar Poin" size="md">
        <div className="space-y-5">
          <p className="text-sm text-stone-500">
            Ikuti langkah-langkah berikut untuk menukarkan poin Anda dengan hadiah dari perpustakaan.
          </p>

          <div className="space-y-4">
            {REDEEM_STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-ink flex items-center justify-center">
                  <span className="font-mono text-xs text-parchment font-medium">{num}</span>
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-sm font-medium text-ink">{title}</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-parchment border border-stone-200 rounded p-4">
            <p className="text-xs font-medium text-ink mb-1">Catatan penting</p>
            <ul className="text-xs text-stone-500 space-y-1">
              <li>• 1 penukaran = {MIN_POINTS} poin = 1 hadiah</li>
              <li>• Poin dikurangi saat pengajuan, bukan saat disetujui</li>
              <li>• Jika ditolak, poin Anda akan dikembalikan otomatis</li>
              <li>• Hanya 1 pengajuan yang bisa diproses dalam satu waktu</li>
            </ul>
          </div>

          <button className="btn btn-secondary w-full" onClick={() => setGuideOpen(false)}>
            Mengerti
          </button>
        </div>
      </Modal>
    </div>
  )
}

function InfoChip({ label, value }) {
  return (
    <div className="bg-stone-50 rounded border border-stone-100 p-3 text-center">
      <p className="font-display text-xl text-ink">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  )
}
