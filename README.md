# 📚 Library Frontend

Aplikasi frontend untuk sistem kehadiran dan poin pengunjung perpustakaan.

---

## 🛠️ Tech Stack

| Layer       | Teknologi                         |
|-------------|-----------------------------------|
| Build Tool  | Vite 5                            |
| Framework   | React 18 (JSX)                    |
| Styling     | Tailwind CSS 3                    |
| HTTP Client | Axios (dengan interceptor JWT)    |
| State       | Zustand (persist ke localStorage)|
| Routing     | React Router DOM v6               |
| Toast       | react-hot-toast                   |
| Deploy      | Vercel                            |

---

## 📁 Struktur Proyek (Feature-based)

```
src/
├── features/
│   ├── auth/
│   │   ├── api/authApi.js
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       ├── ForgotPasswordPage.jsx
│   │       ├── ResetPasswordPage.jsx
│   │       └── AdminLoginPage.jsx
│   ├── user/
│   │   ├── api/userApi.js
│   │   └── pages/
│   │       ├── DashboardPage.jsx
│   │       ├── AttendancePage.jsx
│   │       ├── PointsPage.jsx
│   │       └── ProfilePage.jsx
│   └── admin/
│       ├── api/adminApi.js
│       └── pages/
│           ├── AdminDashboardPage.jsx
│           ├── AdminAttendancesPage.jsx
│           ├── AdminRedemptionsPage.jsx
│           ├── AdminUsersPage.jsx
│           └── AdminQRPage.jsx
├── components/
│   ├── ui/
│   │   ├── Spinner.jsx
│   │   ├── Modal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Pagination.jsx
│   │   └── EmptyState.jsx
│   └── layouts/
│       ├── UserLayout.jsx
│       └── AdminLayout.jsx
├── router/index.jsx       # Routes + guards
├── store/authStore.js     # Zustand auth state
├── lib/
│   ├── axios.js           # Axios instance + interceptors
│   └── utils.js           # Helpers (format, toast, badge)
├── App.jsx
├── main.jsx
└── index.css              # Tailwind + global styles
```

---

## ⚙️ Setup & Development

### 1. Install

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Jalankan

```bash
npm run dev       # development
npm run build     # production build
npm run preview   # preview build lokal
```

---

## 🌐 Halaman & Routes

### Publik (tidak perlu login)
| Route               | Halaman                  |
|---------------------|--------------------------|
| `/login`            | Login pengunjung          |
| `/register`         | Daftar akun baru          |
| `/forgot-password`  | Lupa password             |
| `/reset-password`   | Reset password via token  |
| `/admin/login`      | Login admin               |

### Pengunjung (role: user)
| Route         | Halaman                          |
|---------------|----------------------------------|
| `/dashboard`  | Beranda — status + statistik     |
| `/attendance` | Check-in, check-out, riwayat     |
| `/points`     | Poin, penukaran, riwayat hadiah  |
| `/profile`    | Edit profil, ganti password      |

### Admin (role: admin)
| Route                  | Halaman                          |
|------------------------|----------------------------------|
| `/admin/dashboard`     | Statistik & ringkasan            |
| `/admin/attendances`   | Verifikasi kehadiran pengunjung  |
| `/admin/redemptions`   | Proses penukaran poin            |
| `/admin/users`         | Kelola akun pengguna             |
| `/admin/qr`            | QR code statis (lihat & cetak)   |

---

## 🔐 Auth Flow

1. Login → dapat `accessToken` (15m) + `refreshToken` (7d)
2. Keduanya disimpan di Zustand + `localStorage` via `persist`
3. Axios interceptor otomatis attach `Bearer token` ke setiap request
4. Jika 401 → coba refresh token → jika gagal → logout & redirect login

---

## 🎨 Design System

Tema: **Minimalis modern ala perpustakaan**

- **Font display:** Playfair Display (serif, untuk heading)
- **Font body:** Lato (sans-serif)
- **Font mono:** JetBrains Mono (untuk kode/token/waktu)
- **Palet:** Warm neutral (stone, parchment, ink)
- **Aksen:** Coklat warm `#8b6f47`
- **Komponen:** Didesain via `@layer components` di `index.css`

---

## 🚀 Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set Environment Variable:
   - `VITE_API_URL` → URL backend Railway (contoh: `https://library-api.up.railway.app/api`)
4. Deploy — Vercel otomatis build dengan `npm run build`
5. `vercel.json` sudah dikonfigurasi untuk SPA routing

---

## 📝 Catatan Penting

- Token QR bersifat statis — admin salin dari halaman QR dan paste ke input di sisi pengunjung (simulasi scan QR)
- Refresh token otomatis dihandle oleh axios interceptor, tidak perlu logout manual saat access token expired
- Semua response error ditampilkan via `react-hot-toast`
