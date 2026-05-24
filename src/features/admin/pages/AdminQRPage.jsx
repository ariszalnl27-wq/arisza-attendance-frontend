import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getQRCodes, generateToken } from '../api/adminApi'
import { toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function AdminQRPage() {
  const [qrData,   setQrData]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [genLoading, setGenLoading] = useState({ checkin: false, checkout: false })

  const fetchQR = () =>
    getQRCodes()
      .then((r) => setQrData(r.data.data))
      .catch(toastErr)
      .finally(() => setLoading(false))

  useEffect(() => { fetchQR() }, [])

  const handleGenerate = async (type) => {
    setGenLoading((p) => ({ ...p, [type]: true }))
    try {
      await generateToken(type)
      toast.success(`Token ${type === 'checkin' ? 'check-in' : 'check-out'} berhasil digenerate.`)
      const r = await getQRCodes()
      setQrData(r.data.data)
    } catch (err) { toastErr(err) }
    finally { setGenLoading((p) => ({ ...p, [type]: false })) }
  }

  const downloadQR = (dataUrl, name) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${name}-perpustakaan.png`
    a.click()
  }

  const printQR = (dataUrl, label) => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR ${label}</title>
      <style>
        body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
             min-height:100vh;font-family:Georgia,serif;background:#fff}
        img{width:280px;height:280px}
        h2{font-size:18px;margin:20px 0 6px;color:#1a1814}
        p{font-size:13px;color:#78716c;margin:0}
        .box{border:1px solid #e7e5e4;border-radius:8px;padding:32px 40px;text-align:center;margin:20px}
      </style></head>
      <body onload="window.print()">
        <div class="box">
          <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a8a29e;margin-bottom:20px">
            Arisza Library - Attendance
          </p>
          <img src="${dataUrl}" alt="QR ${label}" />
          <h2>${label}</h2>
          <p>Scan QR ini untuk ${label.toLowerCase()} kunjungan Anda</p>
        </div>
      </body></html>
    `)
    win.document.close()
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner size={24} className="text-stone-400" />
    </div>
  )

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 className="page-title">QR Code & Token</h1>
        <p className="page-subtitle">Dua metode absensi: QR statis (cetak) dan token manual (generate)</p>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1: QR STATIS
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
            <span className="text-parchment text-xs font-mono font-bold">01</span>
          </div>
          <div>
            <h2 className="font-display text-base font-medium text-ink">QR Code Statis</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Token permanen — cetak dan tempel di kasir perpustakaan. Tidak perlu diganti berkala.
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-sm text-amber-800">
          <InfoIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            QR ini bersifat <strong>permanen</strong> — dibuat sekali dan tersimpan di database.
            Ideal untuk dicetak fisik dan dipasang tetap di kasir.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <StaticQRCard
            label="Check-in"
            description="Pasang di pintu masuk — pengunjung scan saat tiba."
            dataUrl={qrData?.checkin?.qr_data_url}
            token={qrData?.checkin?.token}
            onDownload={() => downloadQR(qrData.checkin.qr_data_url, 'checkin')}
            onPrint={() => printQR(qrData.checkin.qr_data_url, 'Check-in')}
          />
          <StaticQRCard
            label="Check-out"
            description="Pasang di pintu keluar — pengunjung scan saat hendak pulang."
            dataUrl={qrData?.checkout?.qr_data_url}
            token={qrData?.checkout?.token}
            onDownload={() => downloadQR(qrData.checkout.qr_data_url, 'checkout')}
            onPrint={() => printQR(qrData.checkout.qr_data_url, 'Check-out')}
          />
        </div>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400 font-mono uppercase tracking-widest">atau</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2: TOKEN GENERATE
      ══════════════════════════════════════════════════════ */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-mono font-bold">02</span>
          </div>
          <div>
            <h2 className="font-display text-base font-medium text-ink">Token Generate (Fallback)</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Token teks 8 karakter — untuk pengunjung yang kamera-nya rusak / tidak bisa scan QR.
              Berlaku sampai di-generate ulang.
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-md px-4 py-3 text-sm text-blue-800">
          <InfoIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>
            Token ini <strong>tidak kedaluwarsa</strong> berdasarkan waktu — hanya tidak valid jika admin
            men-generate token baru. Pengunjung tinggal mengetik kodenya secara manual di field token.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <GeneratedTokenCard
            label="Check-in"
            data={qrData?.generated?.checkin}
            loading={genLoading.checkin}
            onGenerate={() => handleGenerate('checkin')}
          />
          <GeneratedTokenCard
            label="Check-out"
            data={qrData?.generated?.checkout}
            loading={genLoading.checkout}
            onGenerate={() => handleGenerate('checkout')}
          />
        </div>
      </section>

      {/* Cara penggunaan */}
      <div className="card">
        <div className="card-header">
          <p className="font-display text-base font-medium text-ink">Alur Penggunaan</p>
        </div>
        <div className="card-body">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Via QR Scan (utama)</p>
              <ol className="space-y-2.5">
                {[
                  'Cetak dan tempel QR statis di kasir perpustakaan',
                  'Pengunjung buka aplikasi → menu Kehadiran',
                  'Klik "Scan QR dengan Kamera" → arahkan ke QR',
                  'Pilih kegiatan → submit check-in',
                  'Saat pulang, scan QR Check-out → +1 poin otomatis',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="font-mono text-xs text-stone-300 flex-shrink-0 pt-0.5">{String(i+1).padStart(2,'0')}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Via Token Manual (fallback)</p>
              <ol className="space-y-2.5">
                {[
                  'Admin generate token check-in di halaman ini',
                  'Beritahukan kode 8 karakter kepada pengunjung',
                  'Pengunjung ketik kode di field "Token Manual"',
                  'Klik Kirim → check-in berhasil',
                  'Ulangi dengan token check-out saat hendak pulang',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="font-mono text-xs text-stone-300 flex-shrink-0 pt-0.5">{String(i+1).padStart(2,'0')}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Static QR Card ──────────────────────────────────────────── */
function StaticQRCard({ label, description, dataUrl, token, onDownload, onPrint }) {
  const [copied, setCopied] = useState(false)
  const copyToken = () => {
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="card">
      <div className="card-header">
        <p className="font-display text-base font-medium text-ink">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">{description}</p>
      </div>
      <div className="card-body flex flex-col items-center gap-4">
        <div className="border border-stone-200 rounded-md p-3 bg-white">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR ${label}`} className="w-44 h-44" />
          ) : (
            <div className="w-44 h-44 bg-stone-50 flex items-center justify-center">
              <Spinner size={20} className="text-stone-300" />
            </div>
          )}
        </div>
        <div className="w-full bg-stone-50 border border-stone-200 rounded p-3">
          <p className="text-xs text-stone-400 mb-1">Token QR (raw)</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-stone-500 flex-1 break-all leading-relaxed line-clamp-2">
              {token?.substring(0, 24)}…
            </code>
            <button className="btn btn-ghost btn-sm flex-shrink-0" onClick={copyToken}>
              {copied ? <span className="text-green-600 text-xs">✓ Disalin</span> : <CopyIcon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          <button className="btn btn-secondary flex-1" onClick={onDownload}>
            <DownloadIcon className="w-4 h-4" />Unduh
          </button>
          <button className="btn btn-primary flex-1" onClick={onPrint}>
            <PrintIcon className="w-4 h-4" />Cetak
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Generated Token Card ────────────────────────────────────── */
function GeneratedTokenCard({ label, data, loading, onGenerate }) {
  const [copied, setCopied] = useState(false)
  const copyToken = () => {
    if (!data?.token) return
    navigator.clipboard.writeText(data.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="card">
      <div className="card-header">
        <p className="font-display text-base font-medium text-ink">{label}</p>
        <p className="text-xs text-stone-500 mt-0.5">Token teks untuk diketik manual oleh pengunjung</p>
      </div>
      <div className="card-body space-y-4">
        {/* Token display */}
        {data ? (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-center">
            <p className="text-xs text-stone-400 mb-2 uppercase tracking-wide">Token Aktif</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-3xl font-bold text-ink tracking-[0.25em]">
                {data.token}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={copyToken}>
                {copied
                  ? <span className="text-green-600 text-xs font-medium">✓</span>
                  : <CopyIcon className="w-4 h-4" />
                }
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Digenerate: {formatDate(data.generated_at)}
            </p>
          </div>
        ) : (
          <div className="bg-stone-50 border border-dashed border-stone-300 rounded-lg p-6 text-center">
            <p className="text-sm text-stone-400">Belum ada token</p>
            <p className="text-xs text-stone-300 mt-1">Klik tombol di bawah untuk generate</p>
          </div>
        )}

        {/* Status badge */}
        {data && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Aktif hingga di-generate ulang
          </div>
        )}

        {/* Generate button */}
        <button
          className="btn btn-accent w-full"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading
            ? <><Spinner size={14} /> Generating...</>
            : <><RefreshIcon className="w-4 h-4" />{data ? 'Generate Ulang Token' : 'Generate Token'}</>
          }
        </button>

        {data && (
          <p className="text-xs text-stone-400 text-center">
            ⚠ Generate ulang akan menonaktifkan token lama
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── Icons ───────────────────────────────────────────────────── */
function InfoIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function DownloadIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
}
function PrintIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
}
function CopyIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
}
function RefreshIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
}
