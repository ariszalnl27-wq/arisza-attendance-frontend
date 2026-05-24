import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile, uploadPhoto, changePassword } from '../api/userApi'
import { useAuthStore } from '../../../store/authStore'
import { getErrorMsg, toastErr, resolvePhotoUrl } from '../../../lib/utils'
import Spinner from '../../../components/ui/Spinner'

export default function ProfilePage() {
  const { setUser } = useAuthStore()
  const [profile,     setProfile]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState({ name: '', phone: '', institution: '' })
  const [pwForm,      setPwForm]      = useState({ current_password: '', new_password: '' })
  const [pwLoading,   setPwLoading]   = useState(false)
  const [photoLoading,setPhotoLoading]= useState(false)
  const [showCurrPw,  setShowCurrPw]  = useState(false)
  const [showNewPw,   setShowNewPw]   = useState(false)
  const fileRef = useRef()

  const fetchProfile = async () => {
    const res = await getProfile()
    const u = res.data.data.user
    setProfile(u)
    setForm({ name: u.name, phone: u.phone || '', institution: u.institution || '' })
    setUser(u)
  }

  useEffect(() => {
    fetchProfile().catch(toastErr).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Profil berhasil diperbarui.')
      await fetchProfile()
    } catch (err) { toastErr(err) }
    finally { setSaving(false) }
  }

  const handlePhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoLoading(true)
    try {
      await uploadPhoto(file)
      toast.success('Foto profil diperbarui.')
      await fetchProfile()
    } catch (err) { toastErr(err) }
    finally { setPhotoLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.new_password.length < 8) return toast.error('Password baru minimal 8 karakter.')
    setPwLoading(true)
    try {
      await changePassword(pwForm)
      toast.success('Password berhasil diubah.')
      setPwForm({ current_password: '', new_password: '' })
    } catch (err) { toast.error(getErrorMsg(err)) }
    finally { setPwLoading(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size={24} className="text-stone-400" /></div>

  const photoUrl = resolvePhotoUrl(profile?.photo_url)
  const isGoogleUser = profile?.auth_provider === 'google'

  return (
    <div className="fade-in space-y-6 max-w-xl">
      <div>
        <h1 className="page-title">Profil Saya</h1>
        <p className="page-subtitle">Kelola informasi akun Anda</p>
      </div>

      {/* Photo + basic info */}
      <div className="card">
        <div className="card-body flex items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center">
              {photoUrl
                ? <img src={photoUrl} alt="Foto profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                : <span className="font-display text-2xl text-stone-400">{profile?.name?.[0]}</span>}
            </div>
            {photoLoading && (
              <div className="absolute inset-0 rounded-full bg-white/70 flex items-center justify-center">
                <Spinner size={16} className="text-stone-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-ink">{profile?.name}</p>
            <p className="text-stone-500 text-sm">{profile?.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="badge badge-neutral capitalize">{profile?.role}</span>
              {isGoogleUser && (
                <span className="badge badge-neutral">
                  <svg width="10" height="10" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
                  Google
                </span>
              )}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={photoLoading}>
            Ganti Foto
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {/* Edit profile */}
      <div className="card">
        <div className="card-header"><p className="font-display text-base font-medium text-ink">Informasi Pribadi</p></div>
        <div className="card-body">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="form-group">
              <label className="label">Nama Lengkap</label>
              <input className="input" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">No. Telepon</label>
                <input className="input" value={form.phone} placeholder="08xxxxxxxxxx" onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input className="input bg-stone-50 text-stone-400 cursor-not-allowed" value={profile?.email} disabled />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Instansi</label>
              <input className="input" placeholder="Universitas / Sekolah / dll" value={form.institution} onChange={(e) => setForm(p => ({ ...p, institution: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Spinner size={14} />}
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>

      {/* Change password — hanya untuk non-Google user */}
      {isGoogleUser ? (
        <div className="card border-stone-100">
          <div className="card-body">
            <p className="text-sm text-stone-500">
              Akun Anda terhubung dengan Google. Untuk mengganti password, kelola melalui akun Google Anda.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header"><p className="font-display text-base font-medium text-ink">Ubah Password</p></div>
          <div className="card-body">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="form-group">
                <label className="label">Password Saat Ini</label>
                <div className="relative">
                  <input className="input pr-10" type={showCurrPw ? 'text' : 'password'}
                    placeholder="••••••••" value={pwForm.current_password}
                    onChange={(e) => setPwForm(p => ({ ...p, current_password: e.target.value }))} required />
                  <TogglePassBtn show={showCurrPw} onToggle={() => setShowCurrPw(v => !v)} />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Password Baru</label>
                <div className="relative">
                  <input className="input pr-10" type={showNewPw ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter" value={pwForm.new_password}
                    onChange={(e) => setPwForm(p => ({ ...p, new_password: e.target.value }))} required />
                  <TogglePassBtn show={showNewPw} onToggle={() => setShowNewPw(v => !v)} />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={pwLoading}>
                {pwLoading && <Spinner size={14} />}
                Ubah Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TogglePassBtn({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
      {show
        ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
        : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
      }
    </button>
  )
}
