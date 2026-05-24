import api from '../../../lib/axios'

export const register       = (data)  => api.post('/auth/register', data)
export const login          = (data)  => api.post('/auth/login', data)
export const googleAuth     = (token) => api.post('/auth/google', { access_token: token })
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email })
export const resetPassword  = (data)  => api.post('/auth/reset-password', data)
export const refreshToken   = (token) => api.post('/auth/refresh-token', { refresh_token: token })
export const logout         = (token) => api.post('/auth/logout', { refresh_token: token })
