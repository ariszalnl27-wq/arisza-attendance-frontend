import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

/** Resolve photo URL — handle Google URL, local path, or null */
export const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl) return null
  if (photoUrl.startsWith('http')) return photoUrl   // Google photo / absolute URL
  return `${BASE_URL}${photoUrl}`                    // local /uploads/...
}

export const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export const formatTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export const formatDuration = (minutes) => {
  if (!minutes) return '-'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} menit`
  if (m === 0) return `${h} jam`
  return `${h} jam ${m} menit`
}

export const getErrorMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Terjadi kesalahan.'

export const toastErr = (err) => toast.error(getErrorMsg(err))

export const statusBadge = (status) => {
  switch (status) {
    case 'pending':  return 'badge-pending'
    case 'approved': return 'badge-approved'
    case 'rejected': return 'badge-rejected'
    default:         return 'badge-neutral'
  }
}

export const statusLabel = (status) => {
  switch (status) {
    case 'pending':  return 'Menunggu'
    case 'approved': return 'Disetujui'
    case 'rejected': return 'Ditolak'
    default:         return status
  }
}

export const attendanceStatusLabel = (status) => {
  switch (status) {
    case 'not_checked_in':   return 'Belum Check-in'
    case 'pending_approval': return 'Menunggu Persetujuan'
    case 'checked_in':       return 'Sedang Berkunjung'
    case 'checked_out':      return 'Selesai'
    case 'rejected':         return 'Ditolak Admin'
    default:                 return status
  }
}
