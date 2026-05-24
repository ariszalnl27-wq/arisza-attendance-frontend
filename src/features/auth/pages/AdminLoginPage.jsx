import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMsg } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await login(form)
      const { user, accessToken, refreshToken } = res.data.data
      if (user.role !== 'admin') {
        toast.error('Akun ini bukan admin.')
        return
      }
      setAuth(user, accessToken, refreshToken)
      toast.success('Selamat datang, Admin.')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(getErrorMsg(err))
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="label">Email / Nomor Telepon</label>
                <input
                  className="input"
                  placeholder="admin@library.app"
                  value={form.identifier}
                  onChange={set('identifier')}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                />
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
