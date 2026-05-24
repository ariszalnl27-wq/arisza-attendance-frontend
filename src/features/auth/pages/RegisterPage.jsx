import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register, login } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMsg } from '../../../lib/utils'
import { AuthShell } from './LoginPage'
import Spinner from '../../../components/ui/Spinner'
import GoogleAuthButton from '../../../components/ui/GoogleAuthButton'

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [form, setForm]       = useState({ name: '', email: '', phone: '', institution: '', password: '' })
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
    if (form.password.length < 8) return setError('Password minimal 8 karakter.')
    setLoading(true)
    try {
      // 1. Daftar
      await register(form)

      // 2. Langsung login otomatis
      const res = await login({ identifier: form.email, password: form.password })
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)

      toast.success(`Akun berhasil dibuat. Selamat datang, ${user.name}!`)
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="fade-in">
        <h1 className="font-display text-2xl text-ink mb-1">Daftar Akun</h1>
        <p className="text-stone-500 text-sm mb-6">Buat akun pengunjung perpustakaan</p>

        {/* Google register */}
        <GoogleAuthButton label="Daftar dengan Google" />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">atau isi form</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        {/* Inline error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md px-3.5 py-3 mb-4 text-sm">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="form-group">
            <label className="label">Nama Lengkap</label>
            <input className="input" placeholder="Budi Santoso" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="budi@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="label">No. Telepon</label>
              <input className="input" placeholder="08123456789" value={form.phone} onChange={set('phone')} inputMode="tel" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Instansi <span className="text-stone-400 font-normal">(opsional)</span></label>
            <input className="input" placeholder="Universitas / Sekolah / dll" value={form.institution} onChange={set('institution')} />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPass ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                {showPass
                  ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                }
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg mt-1 w-full" disabled={loading}>
            {loading && <Spinner size={15} />}
            {loading ? 'Membuat akun...' : 'Buat Akun'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">Masuk</Link>
        </p>
      </div>
    </AuthShell>
  )
}
