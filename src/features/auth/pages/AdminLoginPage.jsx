import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMsg } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [form, setForm]       = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError]     = useState('')

  const set = (k) => (e) => {
    setError('')
    setForm((p) => ({ ...p, [k]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(form)
      const { user, accessToken, refreshToken } = res.data.data
      if (user.role !== 'admin') {
        setError('Akun ini bukan admin. Gunakan halaman login pengunjung.')
        return
      }
      setAuth(user, accessToken, refreshToken)
      toast.success('Selamat datang, Admin.')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-stone-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-ink mb-4">
            <svg className="w-6 h-6 text-parchment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-ink">Admin Panel</h1>
          <p className="text-stone-500 text-sm mt-1">Perpustakaan — Sistem Kehadiran</p>
        </div>

        <div className="card">
          <div className="card-body">
            {/* Inline error alert */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md px-3.5 py-3 mb-4 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="label">Email / Nomor Telepon</label>
                <input
                  className={`input ${error ? 'border-red-300' : ''}`}
                  placeholder="admin@library.app"
                  value={form.identifier}
                  onChange={set('identifier')}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className={`input pr-10 ${error ? 'border-red-300' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full mt-1" disabled={loading}>
                {loading && <Spinner size={15} />}
                Masuk sebagai Admin
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-stone-400 mt-5">
          <Link to="/login" className="hover:text-stone-600 transition-colors">
            Masuk sebagai pengunjung
          </Link>
        </p>
      </div>
    </div>
  )
}

function EyeIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
}
function EyeOffIcon() {
  return <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
}
