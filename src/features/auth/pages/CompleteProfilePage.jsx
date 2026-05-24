import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateProfile } from '../../user/api/userApi';
import { useAuthStore } from '../../../store/authStore';
import { getErrorMsg } from '../../../lib/utils';
import Spinner from '../../../components/ui/Spinner';

/**
 * Halaman lengkapi profil untuk user baru yang daftar via Google.
 * Diakses setelah googleRegister berhasil.
 * Hanya bisa diakses saat logged in (RequireAuth di router).
 */
export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearProfileCompletion = useAuthStore((s) => s.clearProfileCompletion);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    institution: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    setError('');
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Nama lengkap wajib diisi.');
    if (!form.phone.trim()) return setError('Nomor telepon wajib diisi.');
    if (!/^08\d{8,11}$/.test(form.phone.trim()))
      return setError('Format nomor telepon tidak valid. Contoh: 08123456789');

    setLoading(true);
    try {
      const res = await updateProfile(form);
      const updated = res.data.data.user;
      updateUser(updated);
      clearProfileCompletion();
      toast.success(
        `Profil berhasil dilengkapi. Selamat datang, ${updated.name}!`,
      );
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex">
      {/* Panel kiri dekoratif */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-ink flex-col justify-between p-12">
        <div>
          <p className="font-display text-parchment text-xl">
            Arisza Library Attendance
          </p>
          <p className="text-stone-500 text-xs mt-1 font-mono tracking-wider">
            Sistem Absensi Pengunjung
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Absensi QR', 'Poin Reward', 'Laporan'].map((f) => (
            <div key={f} className="border border-white/10 rounded p-3">
              <p className="text-stone-400 text-xs">{f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Konten utama */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.name}
                className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-stone-200 object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <h1 className="font-display text-2xl text-ink mb-1">
              Lengkapi Profil
            </h1>
            <p className="text-stone-500 text-sm">
              Satu langkah lagi sebelum mulai menggunakan layanan perpustakaan
            </p>
          </div>

          {/* Info akun Google */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-md px-3 py-2.5 mb-6 text-xs text-blue-700">
            <GoogleIcon />
            <span>
              Terhubung sebagai <strong>{user?.email}</strong>
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-md px-3.5 py-3 mb-4 text-sm">
              <svg
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nama */}
            <div className="form-group">
              <label className="label">
                Nama Lengkap
                <span className="ml-1 text-xs font-normal text-stone-400">
                  (dari Google, bisa diubah)
                </span>
              </label>
              <input
                className="input"
                value={form.name}
                onChange={set('name')}
                placeholder="Nama lengkap kamu"
                required
              />
            </div>

            {/* Nomor Telepon */}
            <div className="form-group">
              <label className="label">
                Nomor Telepon
                <span className="ml-1 text-red-500 text-xs">*</span>
              </label>
              <input
                className="input"
                placeholder="08123456789"
                value={form.phone}
                onChange={set('phone')}
                inputMode="tel"
                required
              />
              <p className="text-xs text-stone-400 mt-1">
                Digunakan untuk identifikasi kunjungan
              </p>
            </div>

            {/* Instansi */}
            <div className="form-group">
              <label className="label">
                Instansi
                <span className="ml-1 text-xs font-normal text-stone-400">
                  (opsional)
                </span>
              </label>
              <input
                className="input"
                placeholder="Universitas / Sekolah / Umum"
                value={form.institution}
                onChange={set('institution')}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full mt-2"
              disabled={loading}
            >
              {loading && <Spinner size={15} />}
              Simpan & Masuk ke Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
