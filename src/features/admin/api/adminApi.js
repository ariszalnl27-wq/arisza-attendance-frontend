import api from '../../../lib/axios'

export const getDashboard     = ()           => api.get('/admin/dashboard')
export const getQRCodes       = ()           => api.get('/admin/qr')
export const generateToken    = (type)       => api.post('/admin/qr/generate-token', { type })

// Users
export const getUsers         = (params)     => api.get('/admin/users', { params })
export const getUserById      = (id)         => api.get(`/admin/users/${id}`)
export const updateUser       = (id, data)   => api.put(`/admin/users/${id}`, data)
export const deactivateUser   = (id)         => api.delete(`/admin/users/${id}`)
export const createAdmin      = (data)       => api.post('/admin/create-admin', data)
export const exportUsers      = ()           =>
  api.get('/admin/users/export', { responseType: 'blob' })

// Attendances
export const getAttendances   = (params)     => api.get('/admin/attendances', { params })
export const approveAttendance= (id, data)   => api.put(`/admin/attendances/${id}`, data)

// Redemptions
export const getRedemptions   = (params)     => api.get('/admin/redemptions', { params })
export const processRedemption= (id, data)   => api.put(`/admin/redemptions/${id}`, data)
