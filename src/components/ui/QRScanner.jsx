import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

/**
 * QRScanner — komponen scan QR menggunakan kamera perangkat.
 *
 * Props:
 *  onScan(decodedText: string) — dipanggil saat QR berhasil terbaca
 *  onClose()                   — dipanggil saat scanner ditutup
 */
export default function QRScanner({ onScan, onClose }) {
  const scannerRef = useRef(null)
  const elementId  = 'qr-reader-element'

  const [permission, setPermission] = useState('idle') // idle | requesting | granted | denied | error
  const [cameras,    setCameras]    = useState([])
  const [activeCamera, setActiveCamera] = useState(null)
  const [scanning,   setScanning]   = useState(false)
  const [errorMsg,   setErrorMsg]   = useState('')

  /* ── mount: cek kamera yang tersedia ─────────────────────── */
  useEffect(() => {
    let cancelled = false
    setPermission('requesting')

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (cancelled) return
        if (!devices || devices.length === 0) {
          setPermission('error')
          setErrorMsg('Tidak ada kamera yang ditemukan di perangkat ini.')
          return
        }
        setCameras(devices)
        // Default: kamera belakang (environment) jika ada
        const back = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        )
        setActiveCamera(back?.id || devices[0].id)
        setPermission('granted')
      })
      .catch((err) => {
        if (cancelled) return
        console.error('QR getCameras error:', err)
        if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission')) {
          setPermission('denied')
        } else {
          setPermission('error')
          setErrorMsg(err?.message || 'Gagal mengakses kamera.')
        }
      })

    return () => { cancelled = true }
  }, [])

  /* ── mulai scan saat kamera tersedia ──────────────────────── */
  useEffect(() => {
    if (permission !== 'granted' || !activeCamera) return

    const html5QrCode = new Html5Qrcode(elementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    })
    scannerRef.current = html5QrCode

    setScanning(true)
    setErrorMsg('')

    html5QrCode
      .start(
        activeCamera,
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
        (decodedText) => {
          // Sukses — hentikan scanner & teruskan ke parent
          html5QrCode.stop().catch(() => {})
          setScanning(false)
          onScan(decodedText)
        },
        () => {} // frame error — diabaikan (normal saat belum ada QR)
      )
      .catch((err) => {
        setScanning(false)
        if (err?.toString().includes('NotAllowedError') || err?.toString().includes('Permission')) {
          setPermission('denied')
        } else {
          setErrorMsg('Gagal memulai kamera. Coba pilih kamera lain.')
        }
      })

    return () => {
      html5QrCode.isScanning && html5QrCode.stop().catch(() => {})
    }
  }, [permission, activeCamera])

  /* ── ganti kamera ─────────────────────────────────────────── */
  const switchCamera = async (newId) => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop().catch(() => {})
    }
    setActiveCamera(newId)
  }

  /* ── render ───────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center gap-4">

      {/* Permission: requesting */}
      {permission === 'requesting' && (
        <div className="flex flex-col items-center gap-3 py-8 text-stone-500">
          <span className="spinner text-stone-400" style={{ width: 28, height: 28 }} />
          <p className="text-sm">Meminta izin kamera...</p>
        </div>
      )}

      {/* Permission: denied */}
      {permission === 'denied' && (
        <PermissionDenied onClose={onClose} />
      )}

      {/* Error */}
      {permission === 'error' && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <CameraOffIcon className="w-5 h-5 text-danger" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">Kamera tidak tersedia</p>
            <p className="text-xs text-stone-500 mt-0.5">{errorMsg}</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Tutup</button>
        </div>
      )}

      {/* Granted: tampilkan scanner */}
      {permission === 'granted' && (
        <>
          {/* Viewfinder wrapper */}
          <div className="relative w-full">
            {/* Scanner element — html5-qrcode akan inject video ke sini */}
            <div
              id={elementId}
              className="w-full overflow-hidden rounded-md bg-black"
              style={{ minHeight: 260 }}
            />

            {/* Overlay: corner brackets */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[220px] h-[220px]">
                  {/* corners */}
                  {[
                    'top-0 left-0 border-t-2 border-l-2 rounded-tl',
                    'top-0 right-0 border-t-2 border-r-2 rounded-tr',
                    'bottom-0 left-0 border-b-2 border-l-2 rounded-bl',
                    'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
                  ].map((c, i) => (
                    <span key={i} className={`absolute w-6 h-6 border-accent ${c}`} />
                  ))}
                  {/* scan line animation */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-accent/70 animate-[scanline_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {/* Loading overlay while scanner initialises */}
            {!scanning && permission === 'granted' && !errorMsg && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                <span className="spinner text-white" style={{ width: 24, height: 24 }} />
              </div>
            )}
          </div>

          {/* Camera selector — only show if more than one camera */}
          {cameras.length > 1 && (
            <div className="w-full form-group">
              <label className="label">Pilih Kamera</label>
              <select
                className="input"
                value={activeCamera || ''}
                onChange={(e) => switchCamera(e.target.value)}
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Kamera ${c.id.slice(0, 8)}…`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs text-danger bg-red-50 border border-red-200 rounded px-3 py-2 w-full">
              {errorMsg}
            </p>
          )}

          <p className="text-xs text-stone-400 text-center">
            Arahkan kamera ke QR code yang tersedia di kasir perpustakaan
          </p>

          <button className="btn btn-secondary btn-sm w-full" onClick={onClose}>
            Batal
          </button>
        </>
      )}
    </div>
  )
}

/* ── Permission denied UI ──────────────────────────────────── */
function PermissionDenied({ onClose }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-14 h-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center">
        <CameraOffIcon className="w-6 h-6 text-stone-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">Izin kamera ditolak</p>
        <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-xs">
          Izinkan akses kamera di pengaturan browser Anda, lalu muat ulang halaman ini.
        </p>
      </div>
      <div className="bg-stone-50 border border-stone-200 rounded p-3 text-left w-full text-xs text-stone-600 space-y-1">
        <p className="font-medium text-ink mb-1.5">Cara mengizinkan kamera:</p>
        <p>Chrome: klik ikon kunci/kamera di address bar → Izinkan</p>
        <p>Firefox: klik ikon kamera di address bar → Izinkan</p>
        <p>Safari: Pengaturan → Safari → Kamera → Izinkan</p>
      </div>
      <button className="btn btn-secondary btn-sm w-full" onClick={onClose}>Tutup</button>
    </div>
  )
}

function CameraOffIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 3l18 18M7 7H4a2 2 0 00-2 2v9a2 2 0 002 2h13m3-3V9a2 2 0 00-2-2h-1.5M11 5h2l1.5 2H19m0 0a2 2 0 012 2v.5M15 12a3 3 0 11-4.243 4.243" />
    </svg>
  )
}
