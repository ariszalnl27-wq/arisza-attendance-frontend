import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login } from '../api/authApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMsg } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'
import GoogleAuthButton from '../../../components/ui/GoogleAuthButton'

export default function LoginPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
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
    if (!form.identifier.trim() || !form.password.trim()) {
      return setError('Email/telepon dan password wajib diisi.')
    }
    setLoading(true)
    try {
      const res = await login(form)
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Selamat datang, ${user.name}.`)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } catch (err) {
      setError(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="fade-in">
        <h1 className="font-display text-2xl text-ink mb-1">Masuk</h1>
        <p className="text-stone-500 text-sm mb-7">Sistem kehadiran pengunjung perpustakaan</p>

        {/* Google login */}
        <GoogleAuthButton label="Masuk dengan Google" />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-stone-200" />
          <span className="text-xs text-stone-400">atau</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

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
              className={`input ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder="email@contoh.com atau 08xxxxxxxxxx"
              value={form.identifier}
              onChange={set('identifier')}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="relative">
              <input
                className={`input pr-10 ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
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

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-stone-500 hover:text-accent transition-colors">
              Lupa password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading && <Spinner size={15} />}
            Masuk
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Belum punya akun?{' '}
          <Link to="/register" className="text-accent hover:underline font-medium">Daftar sekarang</Link>
        </p>
      </div>
    </AuthShell>
  )
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-dvh flex">
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-ink flex-col justify-between p-12">
        <div>
          <p className="font-display text-parchment text-xl">Perpustakaan</p>
          <p className="text-stone-500 text-xs mt-1 font-mono tracking-wider">SISTEM MANAJEMEN KEHADIRAN</p>
        </div>
        <div className="space-y-6">
          <div className="h-px bg-white/10" />
          <blockquote className="font-display text-stone-300 text-lg leading-relaxed italic">
            "Perpustakaan adalah tempat di mana pikiran bebas bertumbuh."
          </blockquote>
          <p className="text-stone-600 text-xs">— Sistem pencatatan kunjungan otomatis</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Absensi QR', 'Poin Reward', 'Laporan'].map((f) => (
            <div key={f} className="border border-white/10 rounded p-3">
              <p className="text-stone-400 text-xs">{f}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
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
