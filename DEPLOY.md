# 🚀 Panduan Deploy ke Vercel

## Bug yang Sudah Diperbaiki

### 1. `src/main.jsx` — React Router future flags
Menghilangkan warning v7_startTransition & v7_relativeSplatPath:
```jsx
// SEBELUM
<BrowserRouter>

// SESUDAH
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

### 2. `vercel.json` (frontend) — COOP header untuk Google OAuth
Popup Google Login diblokir karena header `Cross-Origin-Opener-Policy: same-origin`.
Ganti ke `same-origin-allow-popups` agar `window.closed` bisa dipanggil:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [{ "key": "Cross-Origin-Opener-Policy", "value": "same-origin-allow-popups" }]
  }]
}
```

---

## 📋 Urutan Deploy

> Deploy **backend dulu**, baru frontend. Frontend butuh URL backend.

---

## STEP 1 — Deploy Backend ke Vercel

### 1.1 Push ke GitHub
```bash
cd library-backend
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/library-backend.git
git push -u origin main
```

### 1.2 Import di Vercel
1. Buka https://vercel.com → **Add New Project**
2. Import repo `library-backend`
3. Framework preset: **Other**
4. Build & Output Settings biarkan default (sudah ada `vercel.json`)
5. Klik **Environment Variables** → tambahkan semua variabel berikut:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PGHOST` | _(dari Railway/Neon/Supabase)_ |
| `PGPORT` | `5432` |
| `PGDATABASE` | `library_db` |
| `PGUSER` | _(dari provider DB)_ |
| `PGPASSWORD` | _(dari provider DB)_ |
| `PGSSL` | `true` |
| `JWT_ACCESS_SECRET` | _(string random min 32 karakter)_ |
| `JWT_REFRESH_SECRET` | _(string random min 32 karakter)_ |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | `dgflgjrxr` |
| `CLOUDINARY_API_KEY` | `122884552448365` |
| `CLOUDINARY_API_SECRET` | _(dari Cloudinary dashboard)_ |
| `MAIL_FROM` | `noreply@library.app` |
| `MAIL_FROM_NAME` | `Library System` |
| `MAILTRAP_HOST` | _(atau SMTP production)_ |
| `MAILTRAP_PORT` | `2525` |
| `MAILTRAP_USER` | _(SMTP user)_ |
| `MAILTRAP_PASS` | _(SMTP pass)_ |
| `FRONTEND_URL` | _(URL frontend setelah deploy, contoh: https://library.vercel.app)_ |
| `APP_URL` | _(URL backend ini setelah deploy)_ |
| `GOOGLE_CLIENT_ID` | `236075271697-0gon6...` |
| `QR_CHECKIN_TOKEN` | _(token unik, jangan ubah setelah QR dicetak)_ |
| `QR_CHECKOUT_TOKEN` | _(token unik, jangan ubah setelah QR dicetak)_ |

6. Klik **Deploy**
7. Setelah selesai, **catat URL backend** (contoh: `https://library-backend-xxx.vercel.app`)

### 1.3 Setup Database
Gunakan salah satu provider PostgreSQL gratis:
- **Neon** → https://neon.tech (recommended, free tier generous)
- **Supabase** → https://supabase.com
- **Railway** → https://railway.app

Setelah dapat connection string, jalankan migrasi lokal dulu:
```bash
# Arahkan ke database production sementara
DATABASE_URL=postgresql://user:pass@host/db npm run migrate up
```

---

## STEP 2 — Deploy Frontend ke Vercel

### 2.1 Update file sebelum push
Pastikan dua file hasil fix sudah tersimpan:
- `src/main.jsx` — sudah ada future flags
- `vercel.json` — sudah ada COOP header

### 2.2 Push ke GitHub
```bash
cd library-frontend
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/username/library-frontend.git
git push -u origin main
```

### 2.3 Import di Vercel
1. Buka https://vercel.com → **Add New Project**
2. Import repo `library-frontend`
3. Framework preset: **Vite**
4. Klik **Environment Variables** → tambahkan:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://library-backend-xxx.vercel.app/api` |
| `VITE_GOOGLE_CLIENT_ID` | `236075271697-0gon6...` |

5. Klik **Deploy**
6. Setelah selesai, **catat URL frontend** (contoh: `https://library-frontend-xxx.vercel.app`)

### 2.4 Update FRONTEND_URL di backend
Setelah tahu URL frontend, perbarui env variable backend:
- Vercel → Backend Project → Settings → Environment Variables
- Update `FRONTEND_URL` = `https://library-frontend-xxx.vercel.app`
- Klik **Redeploy** (tanpa build cache)

---

## STEP 3 — Update Google OAuth

1. Buka https://console.cloud.google.com
2. Pilih project → **APIs & Services → Credentials**
3. Klik OAuth 2.0 Client ID yang dipakai
4. Tambahkan di **Authorized JavaScript origins**:
   ```
   https://library-frontend-xxx.vercel.app
   ```
5. Tambahkan di **Authorized redirect URIs**:
   ```
   https://library-frontend-xxx.vercel.app
   ```
6. Klik **Save**

---

## STEP 4 — Verifikasi

Checklist setelah deploy:
- [ ] Buka URL frontend → redirect ke `/login` ✓
- [ ] Register akun baru → berhasil ✓
- [ ] Login email/password → berhasil ✓
- [ ] Login Google → popup muncul, tidak ada error COOP ✓
- [ ] Upload foto profil → foto tersimpan di Cloudinary ✓
- [ ] Forgot password → email masuk (cek Mailtrap atau inbox) ✓
- [ ] Reset password → link di email mengarah ke URL production ✓

---

## ⚠️ Catatan Penting

**Custom Domain (opsional)**
Jika pakai custom domain di Vercel, tambahkan domain tersebut ke Google OAuth origins dan update semua env variable (`FRONTEND_URL`, `APP_URL`, `VITE_API_URL`).

**Database di Vercel Postgres**
Jika pakai Vercel Postgres, connection sudah auto-inject ke env — tapi perlu rename var sesuai format Vercel (`POSTGRES_HOST` bukan `PGHOST`). Lebih mudah pakai Neon karena bisa set `PGHOST` sendiri.

**Serverless Limitation**
Backend berjalan sebagai serverless function di Vercel. Ini berarti:
- Cold start ~1-2 detik pertama kali dipanggil
- Tidak bisa simpan state di memory (sudah di-handle dengan DB)
- File upload via Cloudinary buffer sudah aman ✓