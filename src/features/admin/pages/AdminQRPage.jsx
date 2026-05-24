import { useEffect, useState } from 'react'
import { getQRCodes } from '../api/adminApi'
import { toastErr } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function AdminQRPage() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQRCodes()
      .then((r) => setQrData(r.data.data))
      .catch(toastErr)
      .finally(() => setLoading(false))
  }, [])

  const downloadQR = (dataUrl, name) => {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-${name}-perpustakaan.png`
    a.click()
  }

  const printQR = (dataUrl, label) => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR ${label} — Perpustakaan</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center;
               justify-content: center; min-height: 100vh; font-family: Georgia, serif;
               background: #fff; }
        img  { width: 280px; height: 280px; }
        h2   { font-size: 18px; margin: 20px 0 6px; color: #1a1814; }
        p    { font-size: 13px; color: #78716c; margin: 0; }
        .box { border: 1px solid #e7e5e4; border-radius: 8px; padding: 32px 40px;
               text-align: center; margin: 20px; }
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
    <div className="fade-in space-y-6">
      <div>
        <h1 className="page-title">QR Code Perpustakaan</h1>
        <p className="page-subtitle">QR code statis untuk check-in dan check-out pengunjung</p>
      </div>

      {/* Info banner */}
      <div className="card border-amber-200 bg-amber-50">
        <div className="card-body flex gap-3">
          <InfoIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 space-y-1">
            <p className="font-medium">QR Code Statis</p>
            <p className="text-amber-700">
              QR code ini tidak berubah. Cetak dan tempel di kasir perpustakaan.
              Pengunjung scan QR menggunakan aplikasi untuk melakukan check-in dan check-out.
            </p>
          </div>
        </div>
      </div>

      {/* QR Cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        <QRCard
          label="Check-in"
          description="Dipasang di pintu masuk atau kasir. Pengunjung scan saat tiba."
          dataUrl={qrData?.checkin?.qr_data_url}
          token={qrData?.checkin?.token}
          onDownload={() => downloadQR(qrData.checkin.qr_data_url, 'checkin')}
          onPrint={() => printQR(qrData.checkin.qr_data_url, 'Check-in')}
        />
        <QRCard
          label="Check-out"
          description="Dipasang di pintu keluar atau kasir. Pengunjung scan saat hendak pulang."
          dataUrl={qrData?.checkout?.qr_data_url}
          token={qrData?.checkout?.token}
          onDownload={() => downloadQR(qrData.checkout.qr_data_url, 'checkout')}
          onPrint={() => printQR(qrData.checkout.qr_data_url, 'Check-out')}
        />
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <p className="font-display text-base font-medium text-ink">Cara Penggunaan</p>
        </div>
        <div className="card-body">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Alur Pengunjung</p>
              <ol className="space-y-3">
                {[
                  'Pengunjung buka aplikasi dan login ke akun mereka',
                  'Scan QR Check-in di kasir, salin token yang muncul',
                  'Masukkan token di menu Kehadiran → Check-in',
                  'Tunggu persetujuan dari admin perpustakaan',
                  'Saat hendak pulang, scan QR Check-out & masukkan token',
                  'Poin +1 otomatis diberikan setelah check-out berhasil',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="font-mono text-xs text-stone-300 flex-shrink-0 pt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">Alur Admin</p>
              <ol className="space-y-3">
                {[
                  'Buka dashboard → lihat notifikasi check-in pending',
                  'Masuk ke menu Kehadiran → filter status "Menunggu"',
                  'Klik Proses pada baris yang ingin diverifikasi',
                  'Pilih Setujui (pengunjung bisa check-out) atau Tolak',
                  'Tambahkan catatan jika diperlukan, klik konfirmasi',
                  'Pengunjung menerima status update secara real-time',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="font-mono text-xs text-stone-300 flex-shrink-0 pt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
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

function QRCard({ label, description, dataUrl, token, onDownload, onPrint }) {
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
        {/* QR Image */}
        <div className="border border-stone-200 rounded-md p-4 bg-white">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR ${label}`} className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 bg-stone-50 flex items-center justify-center">
              <span className="text-stone-300 text-sm">Gagal memuat QR</span>
            </div>
          )}
        </div>

        {/* Token display */}
        <div className="w-full bg-stone-50 border border-stone-200 rounded p-3">
          <p className="text-xs text-stone-400 mb-1">Token QR</p>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-stone-600 flex-1 break-all leading-relaxed">
              {token}
            </code>
            <button
              className="btn btn-ghost btn-sm flex-shrink-0"
              onClick={copyToken}
            >
              {copied ? (
                <span className="text-success text-xs">Disalin</span>
              ) : (
                <CopyIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <button className="btn btn-secondary flex-1" onClick={onDownload}>
            <DownloadIcon className="w-4 h-4" />
            Unduh PNG
          </button>
          <button className="btn btn-primary flex-1" onClick={onPrint}>
            <PrintIcon className="w-4 h-4" />
            Cetak
          </button>
        </div>
      </div>
    </div>
  )
}

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
