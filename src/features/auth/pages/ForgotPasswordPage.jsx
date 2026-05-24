import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword } from '../api/authApi'
import { getErrorMsg } from '../../../lib/utils'
import { AuthShell } from './LoginPage'
import Spinner from '../../../components/ui/Spinner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
      toast.success('Link reset password telah dikirim.')
    } catch (err) {
      toast.error(getErrorMsg(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="fade-in">
        <h1 className="font-display text-2xl text-ink mb-1">Lupa Password</h1>
        <p className="text-stone-500 text-sm mb-7">
          Masukkan email terdaftar untuk menerima link reset password.
        </p>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded p-4 text-sm text-green-700">
            Email telah dikirim ke <strong>{email}</strong>. Periksa kotak masuk atau folder spam Anda.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="label">Alamat Email</label>
              <input
                className="input"
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading && <Spinner size={15} />}
              Kirim Link Reset
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
