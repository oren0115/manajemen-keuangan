# FinanceHub – Frontend

Aplikasi web React untuk **FinanceHub**, manajemen keuangan pribadi. Menampilkan dashboard, income, transaksi, budget, dan laporan keuangan dengan tema gelap/terang.

## Tech stack

- **Framework:** React 19
- **Build:** Vite 7
- **Bahasa:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui (Radix UI)
- **Data & state:** TanStack React Query, Zustand
- **Routing:** React Router DOM 7
- **Charts:** Recharts
- **Icons:** Lucide React

## Struktur folder

```
src/
├── components/       # UI reusable (theme-provider, ProtectedRoute, ui/)
├── features/         # Fitur per halaman
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Dashboard (kartu, chart, transaksi terbaru)
│   ├── income/       # Kelola income
│   ├── transaction/  # Daftar & tambah transaksi
│   ├── budget/       # Set & lihat budget
│   └── report/       # Ringkasan bulanan, health score
├── hooks/
├── layouts/          # AuthLayout, DashboardLayout
├── lib/              # utils (cn, dll.)
├── services/         # api.ts (client API + authApi, incomesApi, dll.)
├── store/            # authStore (Zustand)
├── css/              # index.css, theme
├── App.tsx
└── main.tsx
```

## Prasyarat

- Node.js 20+
- Backend API FinanceHub berjalan (lihat `../backend/README.md`)

## Setup

1. **Install dependensi**

   ```bash
   npm install
   # atau
   pnpm install
   ```

2. **Atur environment (opsional)**

   Buat `.env` di root frontend jika API tidak di `http://localhost:3000`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Jalankan development server**

   ```bash
   npm run dev
   # atau
   pnpm run dev
   ```

   Buka **http://localhost:5173**

## Scripts

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Server development (Vite HMR) |
| `npm run build` | Build production ke `dist/` |
| `npm run preview` | Preview build production |
| `npm run lint` | Jalankan ESLint |

## Fitur

- **Auth** – Login, register, logout; token disimpan (Zustand + localStorage)
- **Tema** – Dark / light (default dark), toggle di navbar, persist di localStorage
- **Dashboard** – Kartu (income, expense, sisa, savings rate), pie chart kategori, line chart 6 bulan, tabel transaksi terbaru
- **Income** – Tambah income per bulan/tahun, daftar income
- **Transactions** – Tambah transaksi (kategori, tipe, jumlah, tanggal), filter bulan/tahun/tipe
- **Budgets** – Set limit per kategori per bulan, daftar budget
- **Reports** – Ringkasan bulanan, skor kesehatan keuangan + saran

## Environment variables

| Variabel | Keterangan |
|----------|------------|
| `VITE_API_URL` | Base URL API (default: `http://localhost:3000/api`) |

## License

MIT
