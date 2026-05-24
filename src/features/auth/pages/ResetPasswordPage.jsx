import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '../api/authApi'
import { getErrorMsg } from '../../../lib/utils'
import { AuthShell } from './LoginPage'
import Spinner from '../../../components/ui/Spinner'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword({ token, new_password: password })
      toast.success('Password berhasil direset. Silakan masuk kembali.')
      navigate('/login')
    } catch (err) {
      toast.error(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="fade-in">
        <h1 className="font-display text-2xl text-ink mb-1">Reset Password</h1>
        <p className="text-stone-500 text-sm mb-7">Masukkan password baru untuk akun Anda.</p>

        {!token ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-danger">
            Token tidak valid atau tidak ditemukan. Minta link reset ulang.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label">Password Baru</label>
              <input
                className="input"
                type="password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading && <Spinner size={15} />}
              Simpan Password Baru
            </button>
          </form>
        )}

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link to="/login" className="text-accent hover:underline">Kembali ke halaman masuk</Link>
        </p>
      </div>
    </AuthShell>
  )
}
