# Cashly – Frontend

Aplikasi web React untuk **Cashly**, manajemen keuangan pribadi. Menampilkan dashboard, pemasukan, transaksi, anggaran, dan laporan keuangan.

## Tech stack

- **Framework:** React 19
- **Build:** Vite 7
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui (Radix UI)
- **Auth:** Firebase Authentication (email/password, Google)
- **Data & state:** TanStack React Query, Zustand
- **Routing:** React Router DOM 7
- **Internasionalisasi:** i18next (EN / ID)
- **Charts:** Recharts
- **Icons:** Lucide React

## Struktur folder

```
src/
├── components/       # UI reusable (theme-provider, ProtectedRoute, LanguageSwitcher, ui/)
├── features/         # Fitur per halaman
│   ├── auth/         # Login, Register, Forgot password, Set password (Google)
│   ├── dashboard/    # Dashboard (kartu, chart, transaksi terbaru)
│   ├── income/      # Kelola pemasukan
│   ├── transaction/ # Daftar & tambah transaksi
│   ├── budget/      # Set & lihat anggaran
│   ├── report/      # Ringkasan bulanan, health score
│   └── profile/     # Edit nama, ganti kata sandi
├── hooks/
├── layouts/         # AuthLayout (background auth-logo), DashboardLayout
├── lib/             # utils (cn), firebase
├── locales/         # en.json, id.json
├── services/        # api.ts (client API + authApi, incomesApi, dll.)
├── store/           # authStore (Zustand)
├── css/             # index.css, tema (light/dark)
├── App.tsx
└── main.tsx
```

## Prasyarat

- Node.js 20+
- Backend API Cashly berjalan (lihat `../be/README.md`)
- Project Firebase dengan Authentication (email/password + Google) diaktifkan

## Setup

1. **Install dependensi**

   ```bash
   pnpm install
   ```

2. **Atur environment**

   Buat `.env` di root frontend (fe/):

   ```env
   VITE_API_URL=http://localhost:3000/api

   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. **Asset layout auth (opsional)**

   Letakkan `auth-logo.jpg` di `public/` agar tampil sebagai background panel kiri halaman login/register.

4. **Jalankan development server**

   ```bash
   pnpm run dev
   ```

   Buka **http://localhost:5173**

## Scripts

| Perintah | Keterangan |
|----------|------------|
| `pnpm run dev` | Server development (Vite HMR) |
| `pnpm run build` | Build production ke `dist/` |
| `pnpm run preview` | Preview build production |
| `pnpm run lint` | Jalankan ESLint |

## Fitur

- **Auth** – Login & daftar (email/kata sandi + Google). Token Firebase disimpan (Zustand + persist). Error login: pesan ramah untuk kredensial salah / email tidak terdaftar.
- **Profil** – Edit nama, ganti kata sandi (untuk akun email/password). Set kata sandi setelah login Google agar bisa login dengan email nanti.
- **Lupa kata sandi** – Kirim link reset ke email via Firebase.
- **Tema** – Dark / light (light mode dengan warna lembut). Toggle di navbar, persist di localStorage.
- **Bahasa** – Indonesia / English (i18next), switcher di layout.
- **Dashboard** – Kartu (pemasukan, pengeluaran, sisa saldo, tingkat tabungan), pie chart kategori, line chart 6 bulan, tabel transaksi terbaru.
- **Pemasukan** – Tambah pemasukan per bulan/tahun, daftar pemasukan.
- **Transaksi** – Tambah transaksi (kategori, tipe, jumlah, tanggal), filter bulan/tahun/tipe.
- **Anggaran** – Set limit per kategori per bulan, daftar anggaran.
- **Laporan** – Ringkasan bulanan, skor kesehatan keuangan + saran.

## Environment variables

| Variabel | Keterangan |
|----------|------------|
| `VITE_API_URL` | Base URL API (default: `http://localhost:3000/api`) |
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

## License

MIT
