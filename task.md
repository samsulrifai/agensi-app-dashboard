# 📋 Worker & Admin Dashboard — Task List

> Berdasarkan PRD v1.2.0 dan progress dari conversation:
> - **Converting PRD To Markdown** — PRD conversion, tech stack update, push ke GitHub
> - **Building Frontend From PRD** — Full-stack Next.js app, 27 API routes, 9 halaman

---

## ✅ Yang Sudah Selesai

### PRD & Dokumentasi
- [x] Konversi PRD.docx ke PRD.md
- [x] Update tech stack ke Vercel + Neon + Supabase
- [x] Tambah section yang kurang (monitoring, backup, privacy, env vars, storage, dll)
- [x] Push semua file ke GitHub (`samsulrifai/agensi-app-dashboard`)

### Foundation & Setup
- [x] Next.js 16 + TypeScript + Tailwind CSS 4 + App Router
- [x] 20 komponen shadcn/ui terinstall
- [x] Design system (emerald primary, navy dark mode, Inter font)
- [x] Prisma schema (12 model lengkap sesuai PRD)
- [x] Seed data (2 admin, 5 worker, 8 projects, 12 tasks, 5 invoices, dll)
- [x] NextAuth v5 (credentials, JWT, session callbacks)
- [x] Route protection / RBAC middleware (proxy.ts)
- [x] `.env.example` dengan semua variable

### Halaman Auth
- [x] Login page (glassmorphism, demo autofill)
- [x] Register page (full form + API)

### Layout
- [x] Sidebar navigation (role-based)
- [x] Header (search UI, notification bell, user avatar)
- [x] Dashboard layout (sidebar + header + content)

### Worker Pages (Connected to API ✅)
- [x] Worker Dashboard — KPI cards, active projects, notifications
- [x] Worker Projects — project listing + task details
- [x] Worker Finance — invoice management
- [x] Worker Performance — rating & performa stats

### Admin Pages (UI Only ⚠️)
- [x] Admin Dashboard — KPI stats, project table, invoice approval (partially refactored)
- [x] Admin Projects — UI dibuat (masih mock data)
- [x] Admin Finance — UI dibuat (masih mock data)
- [x] Admin Workers — UI dibuat (masih mock data)
- [x] Admin Reports — UI dibuat (masih mock data)

### API Routes (27 routes)
- [x] Auth: login, register, NextAuth handler
- [x] Workers: me/dashboard, me/earnings, me/projects, me/stats, list, detail
- [x] Projects: CRUD, assign worker, update status
- [x] Tasks: CRUD, time start/stop
- [x] Invoices: CRUD, approve, reject
- [x] Notifications: list, mark read, read all
- [x] Reports: financial
- [x] Admin: dashboard stats

### Libraries Terinstall
- [x] Recharts, Lucide React, Sonner, React Day Picker
- [x] Zustand, TanStack Query, Zod, date-fns
- [x] bcryptjs, Resend (lib only), Supabase JS (lib only)

---

## 🔧 Yang Perlu Dikerjakan

### 🔴 Prioritas 1 — Critical (Harus selesai sebelum MVP)

#### A. Refactor Admin Pages ke Live API
- [ ] `admin/projects/page.tsx` — Hubungkan ke `/api/projects`, termasuk Create Project modal
- [ ] `admin/finance/page.tsx` — Hubungkan ke `/api/invoices`, implementasi approve/reject flow
- [ ] `admin/workers/page.tsx` — Hubungkan ke `/api/workers`, implementasi Invite Worker modal
- [ ] `admin/reports/page.tsx` — Hubungkan ke `/api/reports/financial`, implementasi filter & export

#### B. Fix Known Issues
- [ ] Fix Recharts SSR warning — wrap semua chart dengan `ResponsiveContainer` yang proper
- [ ] Fix multiple lockfile warning — hapus root `package-lock.json` atau configure `turbopack.root`
- [ ] Review admin API hooks (`useAdminProjects`, `useAdminWorkers`, `useAdminInvoices`) — pastikan endpoint sesuai
- [ ] Pastikan admin `/api/invoices` support filter by status untuk approval page

#### C. Fitur Auth yang Kurang
- [ ] Halaman Forgot Password (`/forgot-password`)
- [ ] API route `/api/auth/reset-password` — kirim link reset via Resend
- [ ] Halaman Reset Password (`/reset-password?token=xxx`)
- [ ] Session management — tampilkan active sessions, force logout
- [ ] Auto-logout setelah idle timeout

#### D. File Upload — Supabase Storage Integration
- [ ] Setup Supabase Storage buckets (`avatars`, `deliverables`, `invoices`, `project-files`)
- [ ] API route `POST /api/storage/upload-url` — generate signed upload URL
- [ ] API route `GET /api/storage/download-url` — generate signed download URL
- [ ] Komponen `<FileUploader />` — reusable upload component dengan drag & drop
- [ ] Integrasi upload di Worker: upload deliverable ke proyek
- [ ] Integrasi upload di Worker: upload lampiran invoice
- [ ] Integrasi upload di Admin: upload file proyek
- [ ] Upload avatar di profil user
- [ ] RLS policies untuk setiap bucket

#### E. Notifikasi — Email via Resend
- [ ] Setup Resend client utility (`src/lib/resend.ts`)
- [ ] Email template: Worker di-assign ke proyek baru
- [ ] Email template: Invoice approved / rejected
- [ ] Email template: Deadline reminder (H-3 dan H-1)
- [ ] Email template: Reset password
- [ ] Email template: Welcome / registrasi berhasil
- [ ] Trigger email di API routes yang relevan (assign, approve, reject, dll)

---

### 🟡 Prioritas 2 — Important (Phase 2 Enhancement)

#### F. Time Tracker
- [ ] UI komponen Timer — tombol Start/Stop, tampilkan elapsed time
- [ ] Integrasi dengan API `/api/tasks/:id/time/start` dan `/stop`
- [ ] Tampilkan time log history per task
- [ ] Kalkulasi `actual_hours` otomatis dari time logs
- [ ] Widget time tracker di Worker Dashboard (currently running timer)

#### G. Rating & Review System
- [ ] Admin: form beri rating setelah proyek selesai (score deadline, quality, communication)
- [ ] API route `POST /api/ratings` — admin submit rating
- [ ] Worker: tampilkan riwayat review per proyek
- [ ] Worker: grafik tren rating per bulan (Recharts line chart)
- [ ] Badge system: "On-Time 5x", "Top Earner", "Zero Revision"
- [ ] Perhitungan overall_score weighted average otomatis

#### H. Invoice Flow Lengkap
- [ ] Worker: form Submit Invoice dengan pilih proyek, nominal, catatan, lampiran
- [ ] Admin: detail view invoice dengan lampiran dan history worker
- [ ] Status flow: Pending → Approved → Paid (atau Rejected)
- [ ] Alert: nominal melebihi sisa budget proyek
- [ ] Export invoice ke PDF

#### I. Laporan & Export
- [ ] Admin: generate laporan keuangan dengan filter (periode, worker, klien)
- [ ] Grafik tren revenue vs payout 6 bulan (Recharts)
- [ ] Breakdown per proyek, per klien, per worker
- [ ] Export ke CSV
- [ ] Export ke PDF (gunakan `@react-pdf/renderer` atau `jspdf`)
- [ ] Export ke Excel (gunakan `xlsx` / `exceljs`)

#### J. Search & Filter (Full-text)
- [ ] Implementasi full-text search PostgreSQL di Neon (`tsvector` + `tsquery`)
- [ ] API endpoint `GET /api/search?q=keyword`
- [ ] Fungsikan search bar di Header — debounce 300ms, tampilkan dropdown hasil
- [ ] Search scope: proyek, task, worker
- [ ] Filter proyek di admin: by status, priority, deadline, worker, client
- [ ] Database indexing (GIN index) sesuai PRD §9.6.4

#### K. Halaman Settings
- [ ] Halaman profil user — edit nama, avatar, phone
- [ ] Ganti password
- [ ] Preferensi notifikasi (email on/off per jenis event)
- [ ] Dark/Light mode toggle (sudah ada `next-themes`, perlu UI toggle)

---

### 🟢 Prioritas 3 — Nice to Have (Phase 3+)

#### L. Real-time Features
- [ ] Setup Supabase Realtime client
- [ ] Real-time notification push ke browser aktif
- [ ] Real-time update status task/proyek tanpa refresh
- [ ] Presence indicator (worker online/offline)
- [ ] Fallback ke polling 30 detik

#### M. Mobile Responsiveness
- [ ] Mobile sidebar drawer (Sheet component + hamburger menu)
- [ ] Responsive layout untuk semua halaman dashboard
- [ ] Touch-friendly interaction untuk task management
- [ ] Responsive tabel → card view di mobile

#### N. Monitoring & Error Tracking
- [ ] Setup Sentry (`@sentry/nextjs`) — error tracking frontend + API
- [ ] Vercel Analytics integration
- [ ] Vercel Speed Insights
- [ ] Structured logging di API routes
- [ ] Health check endpoint `GET /api/health`

#### O. Caching & Performance
- [ ] Setup Vercel KV (Redis)
- [ ] Cache session data di KV
- [ ] Rate limiting di auth endpoints (20 req/menit)
- [ ] Rate limiting di API endpoints (100 req/menit)
- [ ] Optimasi query Prisma (select specific fields, pagination)

#### P. Testing
- [ ] Setup Vitest + React Testing Library
- [ ] Unit test: utility functions, API helpers
- [ ] Unit test: komponen UI kritis
- [ ] Integration test: API routes (auth, projects, invoices)
- [ ] Setup Playwright untuk E2E testing
- [ ] E2E: Login → Dashboard flow
- [ ] E2E: Create Project → Assign Worker flow
- [ ] E2E: Submit Invoice → Approve flow
- [ ] CI pipeline config (GitHub Actions atau Vercel)

#### Q. Proyek Management Enhanced
- [ ] Kanban board view (drag & drop task antar kolom status)
- [ ] Milestone tracking UI dengan progress
- [ ] Thread diskusi per proyek (comment system)
- [ ] Deadline countdown + badge "Urgent" (< 3 hari)
- [ ] Arsip proyek selesai dengan akses history

#### R. API Versioning & Documentation
- [ ] Migrate endpoint ke `/api/v1/` prefix
- [ ] Setup Swagger/OpenAPI documentation
- [ ] Response header `X-API-Version: v1`

#### S. DevOps & Deployment
- [ ] Setup Vercel project + environment variables
- [ ] Connect Neon database (production branch)
- [ ] Run Prisma migrate di production
- [ ] Seed data di staging
- [ ] Setup Neon branching untuk preview deployments
- [ ] Setup custom domain
- [ ] SSL / HTTPS verification

#### T. Fitur Masa Depan (Phase 3-4)
- [ ] AI smart assign recommendation
- [ ] Gamifikasi: badge, achievement, leaderboard
- [ ] Notifikasi WhatsApp / Telegram
- [ ] Integrasi software akuntansi
- [ ] Internationalization (i18n) — ID/EN
- [ ] PWA support
- [ ] Multi-tenant architecture

---

## 📊 Ringkasan Progress

| Kategori | Selesai | Total | Progress |
|---|---|---|---|
| PRD & Dokumentasi | 4 | 4 | ✅ 100% |
| Foundation & Setup | 9 | 9 | ✅ 100% |
| Auth Pages | 2 | 2 | ✅ 100% |
| Layout Components | 3 | 3 | ✅ 100% |
| Worker Pages (API connected) | 4 | 4 | ✅ 100% |
| Admin Pages (refactor ke API) | 1 | 5 | 🟡 20% |
| API Routes | 27 | 27 | ✅ 100% |
| Auth lengkap (forgot/reset) | 0 | 5 | 🔴 0% |
| File Upload (Supabase) | 0 | 9 | 🔴 0% |
| Email Notifikasi (Resend) | 0 | 7 | 🔴 0% |
| Time Tracker | 0 | 5 | 🔴 0% |
| Rating System | 0 | 6 | 🔴 0% |
| Invoice Flow | 0 | 5 | 🔴 0% |
| Laporan & Export | 0 | 6 | 🔴 0% |
| Search & Filter | 0 | 6 | 🔴 0% |
| Settings | 0 | 4 | 🔴 0% |
| Real-time | 0 | 5 | ⬜ 0% |
| Mobile Responsive | 0 | 4 | ⬜ 0% |
| Monitoring | 0 | 5 | ⬜ 0% |
| Caching & Performance | 0 | 5 | ⬜ 0% |
| Testing | 0 | 9 | ⬜ 0% |
| DevOps & Deploy | 0 | 7 | ⬜ 0% |
| **TOTAL** | **50** | **~155** | **~32%** |

---

## 🎯 Urutan Pengerjaan yang Disarankan

```
Sprint 1 (Minggu 1-2): Prioritas 1 — Critical MVP
├── A. Refactor 4 admin pages ke live API
├── B. Fix known issues
├── C. Forgot/reset password flow
└── D. Supabase Storage integration (upload file)

Sprint 2 (Minggu 3-4): Prioritas 1 lanjutan + Prioritas 2 awal
├── E. Email notifications via Resend
├── F. Time tracker
├── G. Rating & review system
└── K. Settings page + dark mode toggle

Sprint 3 (Minggu 5-6): Prioritas 2 lanjutan
├── H. Invoice flow lengkap
├── I. Laporan & export (CSV/PDF)
├── J. Search & filter (full-text)
└── M. Mobile responsiveness

Sprint 4 (Minggu 7-8): Prioritas 3 — Polish & Deploy
├── L. Real-time features (Supabase Realtime)
├── N. Monitoring (Sentry)
├── O. Caching (Vercel KV)
├── P. Testing setup (Vitest + Playwright)
└── S. Deploy ke Vercel production
```
