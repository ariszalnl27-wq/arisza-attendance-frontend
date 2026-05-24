import api from '../../../lib/axios'

export const getProfile    = ()       => api.get('/users/profile')
export const updateProfile = (data)   => api.put('/users/profile', data)
export const uploadPhoto   = (file)   => {
  const fd = new FormData()
  fd.append('photo', file)
  return api.post('/users/profile/photo', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const changePassword = (data)  => api.put('/users/change-password', data)

// Attendance
export const checkIn      = (qr_token, activity) => api.post('/attendance/check-in', { qr_token, activity })
export const checkOut     = (qr_token)            => api.post('/attendance/check-out', { qr_token })
export const getTodayStatus = ()      => api.get('/attendance/today')
export const getHistory   = (params)  => api.get('/attendance/history', { params })
export const getPoints    = ()        => api.get('/attendance/points')
export const redeemPoints = ()        => api.post('/attendance/points/redeem')
export const getRedemptions = (params)=> api.get('/attendance/points/redemptions', { params })
