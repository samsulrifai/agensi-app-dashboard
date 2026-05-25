# WORKER & ADMIN DASHBOARD PLATFORM

## Product Requirements Document (PRD)

| | |
|---|---|
| **Versi** | 1.2.0 – Vercel + Neon + Supabase Stack (Complete) |
| **Tanggal** | Mei 2026 |
| **Status** | Draft – For Review |
| **Disiapkan oleh** | Product Team |
| **Klasifikasi** | Confidential – Internal Use Only |

---

# 1. Gambaran Umum Produk

## 1.1 Latar Belakang

Manajemen tim pekerja lepas (freelancer) dan proyek berbasis kontrak semakin kompleks seiring pertumbuhan bisnis digital. Banyak perusahaan masih mengandalkan spreadsheet manual, grup WhatsApp, atau email untuk mengkoordinasikan pekerjaan — mengakibatkan data yang tidak terstruktur, keterlambatan pembayaran, dan sulitnya evaluasi performa.

Platform Worker & Admin Dashboard hadir sebagai solusi terpadu yang menghubungkan dua sisi ekosistem kerja: worker yang membutuhkan transparansi atas pendapatan dan progress-nya, serta admin yang membutuhkan kendali penuh atas manajemen proyek, tim, dan keuangan.

## 1.2 Tujuan Produk

- Menyediakan visibilitas real-time bagi worker atas pendapatan, proyek aktif, dan performa
- Memberikan admin alat manajemen proyek end-to-end dari pembuatan hingga pelaporan
- Mengotomasi proses pembayaran dan pelaporan keuangan
- Membangun sistem evaluasi performa yang objektif dan transparan
- Menjadi platform tunggal (single source of truth) untuk seluruh aktivitas tim

## 1.3 Ruang Lingkup

Dokumen ini mencakup spesifikasi lengkap untuk:

- Aplikasi web berbasis browser (responsive)
- Dua peran pengguna utama: Worker dan Admin
- Modul-modul inti: Autentikasi, Dashboard, Proyek, Keuangan, Notifikasi, Laporan
- Skema database relasional
- Use case diagram, UML class diagram, dan sequence diagram
- User flow dan wireframe konseptual

## 1.4 Definisi & Akronim

| Istilah | Definisi |
|---|---|
| Worker | Pengguna dengan peran pelaksana proyek (freelancer/karyawan) |
| Admin | Pengguna dengan peran manajerial: assign proyek, kelola keuangan |
| Project | Unit kerja yang di-assign ke satu atau beberapa worker |
| Task | Sub-pekerjaan di dalam sebuah project |
| Payout | Pembayaran dari admin ke worker atas pekerjaan selesai |
| Rating | Nilai evaluasi performa worker oleh admin setelah proyek selesai |
| Invoice | Dokumen tagihan yang dibuat worker kepada admin |
| SLA | Service Level Agreement – kesepakatan waktu penyelesaian pekerjaan |
| MVP | Minimum Viable Product – versi produk paling awal yang dapat dirilis |

---

# 2. Pemangku Kepentingan & Persona Pengguna

## 2.1 Stakeholder

| Stakeholder | Peran | Kepentingan |
|---|---|---|
| Worker / Freelancer | Pengguna Utama | Transparansi pendapatan & proyek |
| Admin / Manajer | Pengguna Utama | Kendali tim, proyek & keuangan |
| Finance Tim | Pengguna Pendukung | Akurasi laporan & payout |
| IT / Developer | Teknis | Keamanan data & integrasi sistem |
| Pimpinan Perusahaan | Executive Sponsor | ROI & efisiensi operasional |
| Klien Eksternal | Pemangku Tidak Langsung | Kualitas & ketepatan deliverable |

## 2.2 Persona Pengguna

### Persona 1 — Andi, Freelance Web Developer (Worker)

| | |
|---|---|
| **Profil** | Usia: 27 tahun \| Lokasi: Yogyakarta \| Pengalaman: 4 tahun |
| **Goals** | Melacak semua proyek aktif, memastikan pembayaran tepat waktu, melihat perkembangan rating-nya |
| **Pain points** | Sering lupa deadline proyek paralel, tidak tahu kapan uang masuk, tidak ada bukti performa untuk klien baru |
| **Tech savvy** | Tinggi – terbiasa dengan tools digital |

### Persona 2 — Rina, Project Manager (Admin)

| | |
|---|---|
| **Profil** | Usia: 34 tahun \| Lokasi: Jakarta \| Tim: 12 worker aktif |
| **Goals** | Assign proyek dengan cepat, pantau progress semua tim, buat laporan keuangan bulanan tanpa error |
| **Pain points** | Data proyek tersebar di email & spreadsheet, sulit tahu siapa yang overload, laporan keuangan memakan waktu lama |
| **Tech savvy** | Menengah – butuh UI yang intuitif |

---

# 3. Spesifikasi Fitur

## 3.1 Modul Autentikasi

### 3.1.1 Fitur

- Registrasi akun dengan email + password
- Login dengan JWT token (access + refresh token)
- Role-based access: Worker vs Admin
- Reset password via email
- 2FA opsional (TOTP / OTP email)
- Session management & auto-logout

## 3.2 Modul Worker Dashboard

### 3.2.1 Tracking Pendapatan

- Widget total pendapatan bulan ini vs bulan lalu (delta %)
- Grafik bar pendapatan harian / mingguan / bulanan
- Breakdown pendapatan per proyek dan per klien
- Riwayat transaksi: tanggal, nominal, status (paid/pending/overdue)
- Estimasi pendapatan berjalan berdasarkan proyek aktif
- Export riwayat ke CSV / PDF

### 3.2.2 Manajemen Proyek Aktif

- List proyek dengan status: To-Do, In Progress, In Review, Done
- Progress bar per proyek berdasarkan task selesai
- Deadline countdown dan badge "Urgent" jika < 3 hari
- Time tracker: start/stop per task, log jam otomatis
- Upload deliverable / file hasil kerja
- Thread diskusi per proyek dengan admin

### 3.2.3 Rating & Performa

- Skor performa agregat (0–5 bintang)
- Komponen skor: ketepatan deadline (40%), kualitas (40%), komunikasi (20%)
- Grafik tren rating per bulan
- Badge pencapaian: "On-Time 5x", "Top Earner", "Zero Revision"
- Riwayat review dari admin per proyek selesai

## 3.3 Modul Admin Dashboard

### 3.3.1 Manajemen Proyek

- Buat proyek: nama, deskripsi, klien, deadline, budget, prioritas (Low/Medium/High/Critical)
- Buat dan assign task ke worker spesifik
- Tambah milestone dengan deadline terpisah
- Board view (Kanban) dan list view
- Filter dan search proyek berdasarkan status, klien, worker
- Arsip proyek selesai dengan akses history

### 3.3.2 Manajemen Worker

- Direktori worker: nama, skill, rating, workload aktif
- Assign / re-assign worker ke proyek
- Lihat riwayat performa tiap worker
- Kelola profil dan skill worker
- Alert jika worker overload (> N proyek aktif)

### 3.3.3 Laporan Keuangan

- Summary: total revenue, total payout, margin bersih per periode
- Breakdown per proyek, per klien, per worker
- Approval payout: worker submit → admin review → approve/reject
- Alert otomatis jika pengeluaran mendekati budget
- Export laporan ke PDF dan Excel
- Grafik tren keuangan 6 bulan

## 3.4 Modul Notifikasi

### 3.4.1 Channel Notifikasi

- Notifikasi in-app (bell icon) dengan badge unread
- Email notifikasi untuk event kritis (via Resend)
- Push notification (web push) opsional
- Jenis notifikasi: deadline H-3 & H-1, assign proyek baru, payout approved/rejected, rating baru

### 3.4.2 Real-time Updates

- Menggunakan **Supabase Realtime** (WebSocket) untuk push notifikasi instan ke browser yang aktif
- Real-time update status task dan proyek tanpa perlu refresh halaman
- Presence indicator: tampilkan worker yang sedang online/aktif
- Fallback ke polling (30 detik) jika WebSocket tidak tersedia
- Event yang di-broadcast real-time:
  - Task status berubah
  - Invoice baru masuk (untuk admin)
  - Invoice di-approve/reject (untuk worker)
  - Worker baru di-assign ke proyek
  - Chat/diskusi proyek baru

## 3.5 Modul Pencarian & Filter

- **Full-text search** menggunakan PostgreSQL `tsvector` + `tsquery` (Neon-compatible)
- Search scope: proyek (judul, deskripsi, klien), task (judul), worker (nama, skill)
- Debounce input 300ms untuk mengurangi query berlebih
- Filter kombinasi: status, prioritas, tanggal, worker, klien
- Index GIN pada kolom yang di-search untuk performa optimal
- Hasil search di-highlight dengan match context

---

# 4. Use Case

## 4.1 Daftar Use Case

| ID | Nama Use Case | Aktor | Deskripsi Singkat |
|---|---|---|---|
| UC-01 | Login | Worker, Admin | Autentikasi pengguna dengan email & password |
| UC-02 | Lihat Dashboard Pendapatan | Worker | Melihat ringkasan dan grafik pendapatan |
| UC-03 | Lihat Proyek Aktif | Worker | Melihat daftar dan detail proyek yang di-assign |
| UC-04 | Update Status Task | Worker | Mengubah status task menjadi In Progress / Done |
| UC-05 | Track Waktu Kerja | Worker | Memulai dan menghentikan timer pada task |
| UC-06 | Submit Invoice | Worker | Mengajukan tagihan pembayaran ke admin |
| UC-07 | Lihat Rating & Performa | Worker | Melihat skor, tren, dan badge performa |
| UC-08 | Upload Deliverable | Worker | Mengunggah file hasil kerja ke proyek |
| UC-09 | Buat Proyek | Admin | Membuat proyek baru dengan detail lengkap |
| UC-10 | Assign Worker | Admin | Menugaskan worker ke proyek atau task tertentu |
| UC-11 | Monitor Progress | Admin | Memantau status semua proyek secara real-time |
| UC-12 | Approve Payout | Admin | Menyetujui atau menolak invoice dari worker |
| UC-13 | Beri Rating Worker | Admin | Memberikan penilaian performa setelah proyek selesai |
| UC-14 | Generate Laporan | Admin | Membuat dan mengunduh laporan keuangan |
| UC-15 | Kelola Worker | Admin | Tambah, edit, nonaktifkan akun worker |
| UC-16 | Terima Notifikasi | Worker, Admin | Menerima alert deadline, assign, dan payout |

## 4.2 Detail Use Case Utama

### UC-09: Buat Proyek (Admin)

| Atribut | Detail |
|---|---|
| **Aktor Utama** | Admin |
| **Pre-kondisi** | Admin sudah login dan memiliki akses modul Proyek |
| **Trigger** | Admin klik tombol "+ Buat Proyek" di halaman Projects |
| **Main Flow** | 1. Admin mengisi form: nama, deskripsi, klien, deadline, budget, prioritas<br>2. Admin menambahkan task dan milestone<br>3. Admin assign worker ke proyek / task<br>4. Sistem menyimpan dan mengirim notifikasi ke worker<br>5. Proyek muncul di dashboard admin dan worker |
| **Alternative Flow** | - Jika deadline lewat hari ini → sistem tampilkan warning<br>- Jika budget = 0 → sistem minta konfirmasi |
| **Post-kondisi** | Proyek tersimpan dengan status "Active", worker menerima notifikasi |
| **Exception** | Form tidak lengkap → validasi error ditampilkan |

### UC-06: Submit Invoice (Worker)

| Atribut | Detail |
|---|---|
| **Aktor Utama** | Worker |
| **Pre-kondisi** | Worker memiliki proyek dengan status selesai atau milestone tercapai |
| **Trigger** | Worker klik "Submit Invoice" pada proyek |
| **Main Flow** | 1. Worker pilih proyek dan periode tagihan<br>2. Worker isi nominal, lampirkan bukti kerja<br>3. Worker submit invoice<br>4. Admin menerima notifikasi invoice baru<br>5. Admin review dan approve / reject<br>6. Jika approved → saldo worker bertambah dan tercatat di laporan |
| **Alternative Flow** | Jika admin reject → worker terima notifikasi beserta alasan penolakan |
| **Post-kondisi** | Invoice tersimpan dengan status Pending/Approved/Rejected |
| **Exception** | Nominal melebihi budget proyek → sistem tampilkan warning |

---

# 5. Skema Database

## 5.1 Daftar Entitas

Database menggunakan **Neon** (serverless PostgreSQL) yang kompatibel penuh dengan PostgreSQL 16. Neon menyediakan branching database, auto-scaling, dan connection pooling bawaan. Berikut entitas utama dan relasinya:

### 5.1.1 Tabel: `users`

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK, NOT NULL | Primary key auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Alamat email pengguna |
| password_hash | TEXT | NOT NULL | Bcrypt hash password |
| full_name | VARCHAR(100) | NOT NULL | Nama lengkap pengguna |
| role | ENUM | NOT NULL | Nilai: `worker` \| `admin` |
| avatar_url | TEXT | NULL | URL foto profil |
| phone | VARCHAR(20) | NULL | Nomor telepon |
| is_active | BOOLEAN | DEFAULT true | Status akun aktif/nonaktif |
| created_at | TIMESTAMP | NOT NULL | Waktu registrasi |
| updated_at | TIMESTAMP | NOT NULL | Waktu update terakhir |
| last_login_at | TIMESTAMP | NULL | Waktu login terakhir |

### 5.1.2 Tabel: `projects`

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK, NOT NULL | Primary key |
| title | VARCHAR(200) | NOT NULL | Nama proyek |
| description | TEXT | NULL | Deskripsi detail proyek |
| client_name | VARCHAR(100) | NOT NULL | Nama klien |
| budget | DECIMAL(15,2) | NOT NULL | Anggaran proyek (Rupiah) |
| status | ENUM | NOT NULL | `todo` \| `in_progress` \| `review` \| `done` \| `archived` |
| priority | ENUM | NOT NULL | `low` \| `medium` \| `high` \| `critical` |
| deadline | DATE | NOT NULL | Tenggat waktu penyelesaian |
| admin_id | UUID | FK → users.id | Admin yang membuat proyek |
| created_at | TIMESTAMP | NOT NULL | Waktu proyek dibuat |
| completed_at | TIMESTAMP | NULL | Waktu proyek selesai |

### 5.1.3 Tabel: `tasks`

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| project_id | UUID | FK → projects.id | Proyek induk |
| assigned_to | UUID | FK → users.id | Worker yang di-assign |
| title | VARCHAR(200) | NOT NULL | Judul task |
| description | TEXT | NULL | Detail task |
| status | ENUM | NOT NULL | `todo` \| `in_progress` \| `review` \| `done` |
| deadline | DATE | NULL | Deadline task (opsional) |
| estimated_hours | DECIMAL(6,2) | NULL | Estimasi jam kerja |
| actual_hours | DECIMAL(6,2) | NULL | Jam aktual (dari time logs) |
| created_at | TIMESTAMP | NOT NULL | Waktu task dibuat |

### 5.1.4 Tabel: `invoices`

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| worker_id | UUID | FK → users.id | Worker yang submit invoice |
| project_id | UUID | FK → projects.id | Proyek terkait |
| amount | DECIMAL(15,2) | NOT NULL | Nominal tagihan (Rupiah) |
| status | ENUM | NOT NULL | `pending` \| `approved` \| `rejected` \| `paid` |
| invoice_date | DATE | NOT NULL | Tanggal invoice dibuat |
| due_date | DATE | NOT NULL | Tenggat pembayaran |
| notes | TEXT | NULL | Catatan dari worker |
| rejection_reason | TEXT | NULL | Alasan penolakan dari admin |
| approved_by | UUID | FK → users.id | Admin yang approve |
| approved_at | TIMESTAMP | NULL | Waktu approve |
| attachment_url | TEXT | NULL | URL bukti kerja |

### 5.1.5 Tabel: `ratings`

| Kolom | Tipe Data | Constraint | Keterangan |
|---|---|---|---|
| id | UUID | PK | Primary key |
| worker_id | UUID | FK → users.id | Worker yang dinilai |
| admin_id | UUID | FK → users.id | Admin yang memberi rating |
| project_id | UUID | FK → projects.id | Proyek terkait |
| score_deadline | DECIMAL(3,2) | NOT NULL | Skor ketepatan deadline (0–5) |
| score_quality | DECIMAL(3,2) | NOT NULL | Skor kualitas kerja (0–5) |
| score_communication | DECIMAL(3,2) | NOT NULL | Skor komunikasi (0–5) |
| overall_score | DECIMAL(3,2) | NOT NULL | Nilai gabungan (weighted avg) |
| review_text | TEXT | NULL | Komentar naratif admin |
| created_at | TIMESTAMP | NOT NULL | Waktu rating diberikan |

### 5.1.6 Tabel-Tabel Pendukung

| Tabel | Fungsi & Kolom Utama |
|---|---|
| `project_workers` | Junction table many-to-many proyek ↔ worker (`project_id`, `worker_id`, `role_in_project`) |
| `time_logs` | Rekam waktu kerja per task (`task_id`, `worker_id`, `started_at`, `ended_at`, `duration_minutes`) |
| `milestones` | Milestone per proyek (`project_id`, `title`, `due_date`, `status`, `amount`) |
| `notifications` | Notifikasi sistem (`user_id`, `type`, `title`, `body`, `is_read`, `created_at`) |
| `attachments` | File upload per proyek/task (`project_id`, `task_id`, `uploaded_by`, `file_url`, `file_name`, `size_bytes`) |
| `audit_logs` | Log perubahan data sensitif (`user_id`, `action`, `entity`, `old_value`, `new_value`, `ip_address`, `timestamp`) |
| `refresh_tokens` | Manajemen sesi login (`user_id`, `token_hash`, `expires_at`, `device_info`) |

## 5.2 Relasi Antar Entitas (ERD Naratif)

- `users` (1) ——< `projects_workers` (>1) : Satu user bisa terlibat di banyak proyek
- `projects` (1) ——< `tasks` (>1) : Satu proyek punya banyak task
- `tasks` (1) ——< `time_logs` (>1) : Satu task punya banyak log waktu
- `projects` (1) ——< `invoices` (>1) : Satu proyek bisa punya banyak invoice
- `invoices` (>1) ——1 `users` : Setiap invoice dimiliki satu worker
- `projects` (1) ——< `ratings` (>1) : Setiap proyek selesai menghasilkan satu rating per worker
- `users` (1) ——< `notifications` (>1) : Setiap user punya banyak notifikasi
- `projects` (1) ——< `milestones` (>1) : Satu proyek bisa punya banyak milestone

---

# 6. Diagram UML

## 6.1 UML Class Diagram (Deskripsi)

Berikut adalah representasi tekstual dari class diagram utama sistem. Implementasi visual dapat dibuat menggunakan PlantUML atau Mermaid berdasarkan definisi di bawah ini.

### Class: User

```
┌─────────────────────────────────────┐
│              User                   │
├─────────────────────────────────────┤
│ + id: UUID                          │
│ + email: String                     │
│ + fullName: String                  │
│ + role: Enum (worker | admin)       │
│ + isActive: Boolean                 │
├─────────────────────────────────────┤
│ + login(email, password): AuthToken │
│ + resetPassword(email): void        │
│ + updateProfile(data): User         │
│ + getNotifications(): Notification[]│
└─────────────────────────────────────┘
```

### Class: Project

```
┌─────────────────────────────────────┐
│             Project                 │
├─────────────────────────────────────┤
│ + id: UUID                          │
│ + title: String                     │
│ + description: String               │
│ + clientName: String                │
│ + budget: Decimal                   │
│ + status: Enum                      │
│ + priority: Enum                    │
│ + deadline: Date                    │
│ + adminId: UUID                     │
├─────────────────────────────────────┤
│ + create(data): Project             │
│ + assignWorker(workerId): void      │
│ + updateStatus(status): void        │
│ + getProgress(): Float              │
│ + getTasks(): Task[]                │
│ + archive(): void                   │
└─────────────────────────────────────┘
```

### Class: Task

```
┌─────────────────────────────────────┐
│               Task                  │
├─────────────────────────────────────┤
│ + id: UUID                          │
│ + projectId: UUID                   │
│ + assignedTo: UUID                  │
│ + title: String                     │
│ + status: Enum                      │
│ + estimatedHours: Float             │
│ + actualHours: Float                │
├─────────────────────────────────────┤
│ + startTimer(): TimeLog             │
│ + stopTimer(): void                 │
│ + updateStatus(status): void        │
│ + getTimeLogs(): TimeLog[]          │
└─────────────────────────────────────┘
```

### Class: Invoice

```
┌──────────────────────────────────────────────────┐
│                    Invoice                        │
├──────────────────────────────────────────────────┤
│ + id: UUID                                        │
│ + workerId: UUID                                  │
│ + projectId: UUID                                 │
│ + amount: Decimal                                 │
│ + status: Enum (pending|approved|rejected|paid)   │
├──────────────────────────────────────────────────┤
│ + submit(): void                                  │
│ + approve(adminId): void                          │
│ + reject(adminId, reason): void                   │
│ + generatePDF(): File                             │
└──────────────────────────────────────────────────┘
```

## 6.2 Sequence Diagram: Alur Submit & Approve Invoice

Sequence diagram di bawah menggambarkan interaksi antar komponen saat worker submit invoice dan admin memprosesnya:

| Step | Interaksi (Worker → System → Admin) |
|---|---|
| 1 | Worker membuka halaman proyek selesai dan klik "Submit Invoice" |
| 2 | Frontend menampilkan form: nominal, periode, catatan, lampiran |
| 3 | Worker mengisi form dan klik "Submit" → `POST /api/invoices` |
| 4 | Backend validasi: worker terhubung ke proyek, nominal tidak melebihi sisa budget |
| 5 | Invoice tersimpan di DB dengan status PENDING |
| 6 | `NotificationService.send()` → Admin menerima notifikasi email + in-app |
| 7 | Admin membuka daftar invoice pending di dashboard |
| 8 | Admin klik invoice → melihat detail, lampiran, history worker |
| 9a | **[Approve]** Admin klik Approve → `PUT /api/invoices/:id/approve` |
| 9b | **[Reject]** Admin klik Reject → `PUT /api/invoices/:id/reject` + isi alasan |
| 10 | Backend update status invoice, catat di audit_log |
| 11 | `NotificationService.send()` → Worker menerima notifikasi hasil |
| 12 | [Jika approved] Laporan keuangan otomatis terupdate |

## 6.3 Sequence Diagram: Alur Assign Proyek

| Step | Interaksi (Admin → System → Worker) |
|---|---|
| 1 | Admin membuka halaman "+ Buat Proyek" |
| 2 | Admin isi form: judul, klien, budget, deadline, prioritas → klik Next |
| 3 | Admin tambah task dan milestone → klik Next |
| 4 | Admin buka tab "Assign Worker" → sistem tampilkan daftar worker dengan workload & rating |
| 5 | Admin pilih worker per task (filter by skill/rating) → klik "Publish Proyek" |
| 6 | Backend: `POST /api/projects` → simpan proyek, tasks, project_workers |
| 7 | NotificationService: kirim notifikasi ke semua worker yang di-assign |
| 8 | Worker menerima notifikasi "Proyek Baru: [Nama Proyek]" |
| 9 | Worker buka dashboard → proyek muncul di "Proyek Aktif" |
| 10 | Worker klik proyek → lihat detail, task list, deadline, budget info |

---

# 7. User Flow & Navigasi Aplikasi

## 7.1 User Flow Worker

### 7.1.1 Onboarding & Login

- Pengguna buka aplikasi → Landing page dengan tombol Login / Daftar
- Klik "Login" → Form email + password + tombol "Lupa Password?"
- Input valid → JWT disimpan → Redirect ke Worker Dashboard
- Input invalid → Error message "Email atau password salah"

### 7.1.2 Worker Dashboard (Home)

Setelah login, worker disambut dengan halaman dashboard yang berisi:

- **Header**: nama, avatar, total pendapatan bulan ini, jumlah proyek aktif
- **Widget Pendapatan**: grafik 30 hari terakhir + tombol "Lihat Detail"
- **Widget Proyek Aktif**: 3 proyek terdekat deadline dengan progress bar
- **Widget Rating**: skor saat ini + perubahan vs bulan lalu
- **Notifikasi terbaru** (max 5 item, dengan badge jumlah yang belum dibaca)

### 7.1.3 Alur Kerja Harian Worker

- Worker buka halaman "Projects" → Lihat semua proyek dengan filter status
- Klik proyek → Halaman detail: task list, file, diskusi, progress
- Klik task → Update status ke "In Progress" → Klik "Start Timer"
- Kerja selesai → Klik "Stop Timer" → Log waktu tersimpan otomatis
- Update status task ke "Done" atau "Needs Review"
- Upload deliverable (file) ke proyek
- Jika milestone tercapai → Submit Invoice

### 7.1.4 Alur Submit Invoice

- Worker buka menu "Keuangan" → Tab "Invoice Saya"
- Klik "+ Submit Invoice" → Pilih proyek, isi nominal, tanggal, catatan
- Upload bukti kerja (opsional) → Klik "Submit"
- Invoice muncul dengan status "Pending"
- Setelah admin proses → status berubah + notifikasi masuk

## 7.2 User Flow Admin

### 7.2.1 Admin Dashboard (Home)

Admin dashboard menampilkan pandangan macro seluruh operasi:

- **KPI Cards**: total revenue bulan ini, total payout, proyek aktif, worker aktif
- **Alert**: invoice pending (butuh review), proyek melebihi deadline, budget overrun
- **Grafik**: tren revenue vs payout 6 bulan terakhir
- **Tabel proyek aktif**: nama, worker, deadline, progress, status

### 7.2.2 Alur Buat & Manage Proyek

- Admin buka "Projects" → Klik "+ New Project"
- Tab 1 – **Detail**: isi judul, klien, deskripsi, budget, deadline, prioritas
- Tab 2 – **Tasks**: tambah task, set deadline per task, estimasi jam
- Tab 3 – **Milestones**: tambah milestone dengan tanggal dan target amount
- Tab 4 – **Assign**: pilih worker untuk setiap task (lihat workload & rating)
- Review & Publish → Proyek aktif, worker dinotifikasi
- Monitor via halaman Project Detail: progress real-time, time log, file

### 7.2.3 Alur Review & Approve Invoice

- Notifikasi masuk "Invoice Baru dari [Worker]"
- Admin buka "Keuangan" → Tab "Invoice Masuk" → filter status Pending
- Klik invoice → Review detail, nominal, proyek, lampiran
- **[Approve]** Klik "Approve" → konfirmasi → invoice status jadi Approved
- **[Reject]** Klik "Reject" → isi alasan → worker dinotifikasi dengan alasan
- Laporan keuangan otomatis update setelah approve

### 7.2.4 Alur Generate Laporan Keuangan

- Admin buka "Laporan" → Pilih tipe: Keuangan / Performa / Proyek
- Set filter: periode (bulan/kuartal/custom), worker, klien, proyek
- Sistem generate laporan dengan grafik dan tabel ringkasan
- Admin klik "Export PDF" atau "Export Excel"
- File terunduh — siap dibagikan ke manajemen atau klien

---

# 8. Persyaratan Non-Fungsional

## 8.1 Performa

| Metrik | Target | Kritis |
|---|---|---|
| Page Load Time (awal) | < 2 detik | < 3 detik |
| API Response Time (P95) | < 300ms | < 800ms |
| Time to First Contentful Paint | < 1.5 detik | < 2.5 detik |
| Concurrent Users (MVP) | 100 user | 500 user |
| Database Query Time (avg) | < 50ms | < 200ms |
| File Upload (max) | 50MB per file | 100MB per file |

## 8.2 Keamanan

- Autentikasi berbasis JWT dengan access token (15 menit) + refresh token (7 hari)
- Password hashing menggunakan bcrypt dengan cost factor 12
- HTTPS mandatory – TLS 1.2 minimum di semua endpoint
- Role-based access control (RBAC) di setiap API endpoint
- Rate limiting: max 100 request/menit per IP untuk endpoint publik
- Input sanitization dan proteksi SQL injection, XSS, CSRF
- Audit log untuk semua aksi sensitif (login, perubahan data keuangan, approve payout)
- Data enkripsi at-rest untuk informasi PII (email, nomor telepon)

## 8.3 Skalabilitas & Ketersediaan

- Target uptime: 99.5% (downtime max 3.6 jam/bulan)
- Arsitektur serverless melalui Vercel Functions untuk auto-scaling tanpa konfigurasi
- Neon database auto-scaling dengan branching untuk preview deployment
- Vercel Edge Network (CDN global) untuk aset statis dan optimasi delivery
- Supabase Storage CDN untuk file deliverable dan attachment
- Vercel Cron Jobs + Inngest/Trigger.dev untuk background job (notifikasi, generate laporan)

## 8.4 Usability

- Responsive design: mendukung desktop (1280px+), tablet (768px), mobile (375px+)
- Dukungan browser: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- WCAG 2.1 Level AA compliance untuk aksesibilitas
- Waktu onboarding baru < 30 menit tanpa training

## 8.5 Maintainability

- Test coverage minimum 70% untuk unit test, 50% untuk integration test
- Dokumentasi API menggunakan OpenAPI 3.0 (Swagger)
- Semantic versioning untuk semua release
- CI/CD otomatis via Vercel: setiap push ke GitHub → preview deployment, merge ke main → production deployment
- Neon database branching: setiap preview deployment mendapat branch database terpisah untuk testing aman

## 8.6 Monitoring & Observability

### 8.6.1 Error Tracking

- **Sentry** untuk error tracking dan performance monitoring di frontend dan API routes
- Source maps upload otomatis saat deploy ke Vercel
- Alert ke Slack/Discord jika error rate melebihi threshold
- Breadcrumbs untuk trace user journey sebelum error

### 8.6.2 Analytics & Performance

- **Vercel Analytics** untuk Web Vitals (LCP, FID, CLS, TTFB)
- **Vercel Speed Insights** untuk real-user monitoring (RUM)
- Custom event tracking untuk fitur kritis (login, submit invoice, approve payout)
- Dashboard metrik bisnis: DAU, fitur adoption rate, task completion rate

### 8.6.3 Infrastructure Monitoring

- **Neon Dashboard**: query performance, connection count, storage usage, compute hours
- **Supabase Dashboard**: storage bandwidth, request count, active connections
- **Vercel Dashboard**: function invocations, bandwidth, edge cache hit rate
- Uptime monitoring via **BetterStack** (atau UptimeRobot) dengan alert SMS/email jika downtime

### 8.6.4 Logging

- Structured logging (JSON format) di semua API routes
- Log level: `error`, `warn`, `info`, `debug`
- **Vercel Log Drain** ke layanan agregasi (Axiom / Datadog) untuk retention dan query
- Audit log terpisah di database untuk aksi sensitif (sudah di tabel `audit_logs`)

## 8.7 Backup & Disaster Recovery

| Aspek | Strategi |
|---|---|
| **Database Backup** | Neon auto-backup dengan point-in-time restore hingga 7 hari (Pro) / 24 jam (Free) |
| **RPO** (Recovery Point Objective) | < 1 jam — Neon WAL-based continuous backup |
| **RTO** (Recovery Time Objective) | < 30 menit — restore dari Neon branch atau point-in-time |
| **File Storage Backup** | Supabase Storage dengan redundancy bawaan; cross-region replication opsional |
| **Branching Strategy** | Branch `production` sebagai source of truth; branch `staging` untuk QA; branch per preview |
| **Failover** | Neon auto-failover antar compute nodes; Vercel multi-region edge deployment |
| **Disaster Drill** | Simulasi restore database dari backup setiap kuartal |

### Prosedur Recovery

1. Identifikasi incident via monitoring alert
2. Tentukan scope (database / storage / application)
3. Database: restore Neon branch dari point-in-time terdekat sebelum incident
4. Storage: restore file dari Supabase backup atau re-upload dari client cache
5. Application: rollback Vercel deployment ke versi stabil sebelumnya (instant rollback)
6. Validasi data integrity post-restore
7. Post-mortem dalam 48 jam

## 8.8 Data Privacy & Compliance

### 8.8.1 Kebijakan Data

- **Data Residency**: Database Neon di region `ap-southeast-1` (Singapore); Supabase Storage di region terdekat
- **Data Retention**: Log audit disimpan 1 tahun; notifikasi yang sudah dibaca dihapus setelah 90 hari
- **PII Handling**: Data sensitif (email, phone, password_hash) dienkripsi at-rest oleh Neon; avatar disimpan di bucket private Supabase
- **Data Minimization**: Hanya kumpulkan data yang diperlukan untuk fungsi platform

### 8.8.2 Hak Pengguna

- **Akses Data**: User dapat melihat dan mengunduh seluruh data pribadinya (profile, invoices, ratings)
- **Hapus Akun**: User dapat request penghapusan akun; admin memproses dalam 14 hari kerja
- **Right to be Forgotten**: Saat akun dihapus, semua PII di-anonymize; data proyek dan finansial di-retain untuk audit (tanpa identitas)
- **Consent**: User menyetujui terms of service dan privacy policy saat registrasi

### 8.8.3 Keamanan Data di Third-Party

| Provider | Data yang Disimpan | Compliance |
|---|---|---|
| Neon | Seluruh database (users, projects, invoices, dll) | SOC 2 Type II, GDPR |
| Supabase | File attachment, avatar, deliverable | SOC 2 Type II, GDPR |
| Vercel | Application code, environment variables, logs | SOC 2 Type II, GDPR |
| Resend | Email transaksional (temporary) | GDPR, CAN-SPAM |

---

# 9. Arsitektur Teknis & Tech Stack

## 9.1 Arsitektur Sistem

Aplikasi menggunakan arsitektur **full-stack serverless** yang di-deploy di **Vercel**:

- **Frontend**: Next.js App Router dengan React Server Components (RSC) untuk rendering optimal
- **Backend API**: Next.js API Routes (`/app/api/`) sebagai serverless functions — menggantikan kebutuhan server Express/Fastify terpisah
- **Database**: Neon (serverless PostgreSQL) dengan connection pooling via `@neondatabase/serverless` driver, mendukung branching untuk preview environments
- **File Storage**: Supabase Storage untuk upload deliverable, attachment, dan avatar — dengan CDN dan signed URL untuk akses aman
- **Background Jobs**: Vercel Cron Jobs untuk scheduled tasks (deadline reminder, report generation), Inngest/Trigger.dev untuk event-driven workflows

Arsitektur ini mengeliminasi kebutuhan provisioning server manual dan memungkinkan scale-to-zero saat tidak ada traffic.

## 9.2 Rekomendasi Tech Stack

| Layer | Teknologi | Alasan Pemilihan |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Full-stack framework, RSC, API routes, optimized untuk Vercel |
| UI Library | Tailwind CSS + shadcn/ui | Kustomisasi tinggi, konsisten, aksesibel |
| State Management | Zustand + TanStack Query (React Query) | Ringan, cache otomatis, dev experience baik |
| ORM | Prisma + `@neondatabase/serverless` | Type-safe, migration mudah, kompatibel Neon serverless |
| Database | **Neon** (Serverless PostgreSQL 16) | Auto-scaling, branching per preview, connection pooling, scale-to-zero |
| Cache | Vercel KV (Redis-compatible) | Session, rate limiting, serverless-native |
| Background Jobs | Vercel Cron Jobs + Inngest | Reliable, retry logic, event-driven, serverless-compatible |
| File Storage | **Supabase Storage** | Object storage dengan CDN, signed URLs, RLS policies, integrasi mudah |
| Auth | NextAuth.js (Auth.js) + bcrypt | Session & JWT hybrid, OAuth-ready, built-in untuk Next.js |
| Email | Resend | API-first email transaksional, DX excellent, Vercel integration |
| Deployment | **Vercel** | Auto-deploy, preview per branch, Edge Network global, zero-config |
| CI/CD | Vercel Git Integration | Auto-deploy on push, preview deployments, tanpa konfigurasi pipeline |

## 9.3 Struktur API Endpoint Utama

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/login` | Login, kembalikan access + refresh token |
| POST | `/api/auth/refresh` | Perbarui access token menggunakan refresh token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/workers/me/earnings` | Ringkasan pendapatan worker yang login |
| GET | `/api/workers/me/projects` | Daftar proyek aktif worker |
| GET | `/api/workers/me/stats` | Statistik performa & rating worker |
| GET | `/api/projects` | Daftar semua proyek (admin) / proyek saya (worker) |
| POST | `/api/projects` | Buat proyek baru (admin only) |
| GET | `/api/projects/:id` | Detail proyek beserta task dan worker |
| PUT | `/api/projects/:id/status` | Update status proyek |
| POST | `/api/projects/:id/assign` | Assign worker ke proyek (admin only) |
| POST | `/api/tasks/:id/time/start` | Mulai timer pada task |
| POST | `/api/tasks/:id/time/stop` | Hentikan timer pada task |
| GET | `/api/invoices` | Daftar invoice (filter by worker/status) |
| POST | `/api/invoices` | Submit invoice baru (worker only) |
| PUT | `/api/invoices/:id/approve` | Approve invoice (admin only) |
| PUT | `/api/invoices/:id/reject` | Reject invoice beserta alasan (admin only) |
| GET | `/api/reports/financial` | Generate laporan keuangan (admin only) |
| GET | `/api/notifications` | Daftar notifikasi user yang login |
| PUT | `/api/notifications/:id/read` | Tandai notifikasi sebagai telah dibaca |

## 9.4 Environment Variables & Konfigurasi

Berikut daftar environment variables yang dibutuhkan untuk menjalankan aplikasi:

### 9.4.1 Database (Neon)

| Variable | Deskripsi | Contoh |
|---|---|---|
| `DATABASE_URL` | Connection string pooled (untuk Prisma query) | `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require&pgbouncer=true` |
| `DATABASE_URL_UNPOOLED` | Connection string direct (untuk Prisma migrate) | `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/dbname?sslmode=require` |

### 9.4.2 Supabase Storage

| Variable | Deskripsi |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase (public, digunakan di client) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key untuk akses public bucket |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key untuk operasi server-side (private, jangan expose ke client) |

### 9.4.3 Authentication

| Variable | Deskripsi |
|---|---|
| `NEXTAUTH_URL` | Base URL aplikasi (e.g., `https://app.example.com`) |
| `NEXTAUTH_SECRET` | Secret key untuk enkripsi session (min 32 karakter, generate via `openssl rand -base64 32`) |

### 9.4.4 Services

| Variable | Deskripsi |
|---|---|
| `RESEND_API_KEY` | API key dari Resend untuk kirim email transaksional |
| `KV_URL` | URL Vercel KV (Redis) untuk caching dan rate limiting |
| `KV_REST_API_URL` | REST API URL Vercel KV |
| `KV_REST_API_TOKEN` | Token autentikasi Vercel KV |
| `SENTRY_DSN` | Data Source Name untuk error tracking Sentry |
| `NEXT_PUBLIC_APP_URL` | Public base URL untuk link di email dan notifikasi |

> **⚠️ Penting**: Semua variable tanpa prefix `NEXT_PUBLIC_` bersifat server-only dan TIDAK boleh diakses dari client-side code.

## 9.5 Supabase Storage — Konfigurasi Detail

### 9.5.1 Struktur Bucket

| Bucket | Akses | Max File Size | Allowed MIME Types | Keterangan |
|---|---|---|---|---|
| `avatars` | Public | 2MB | `image/jpeg`, `image/png`, `image/webp` | Foto profil pengguna |
| `deliverables` | Private | 50MB | `*/*` (semua tipe) | File hasil kerja worker |
| `invoices` | Private | 10MB | `image/*`, `application/pdf` | Bukti kerja / lampiran invoice |
| `project-files` | Private | 50MB | `*/*` (semua tipe) | File proyek (dokumen, desain, dll) |

### 9.5.2 RLS (Row Level Security) Policies

```
-- avatars: public read, authenticated upload own
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar upload own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- deliverables: only project members can read/write
CREATE POLICY "Deliverable access" ON storage.objects FOR SELECT USING (bucket_id = 'deliverables' AND is_project_member(auth.uid(), extract_project_id(name)));
```

### 9.5.3 Upload Flow

1. Client request signed upload URL → `POST /api/storage/upload-url`
2. Server validasi: user authentication, file size, MIME type, bucket permission
3. Server generate signed URL via Supabase service role → return ke client
4. Client upload langsung ke Supabase Storage via signed URL (bypass server)
5. Setelah upload sukses → client notify server → server simpan metadata di tabel `attachments`
6. Untuk download: server generate signed download URL (expiry 1 jam) → return ke client

## 9.6 Neon Database — Konfigurasi & Optimasi

### 9.6.1 Connection Pooling

| Aspek | Konfigurasi |
|---|---|
| Pooling Mode | Transaction mode (via PgBouncer bawaan Neon) |
| Pooled Connection | Gunakan `DATABASE_URL` (port 5432 + `pgbouncer=true`) untuk semua query runtime |
| Direct Connection | Gunakan `DATABASE_URL_UNPOOLED` hanya untuk `prisma migrate` dan `prisma db push` |
| Max Connections | 100 (Neon Pro) / 20 (Neon Free) per compute endpoint |

### 9.6.2 Cold Start Mitigation

- Neon auto-suspend compute setelah 5 menit inaktivitas (Free tier) → cold start ~500ms-2s
- **Strategi mitigasi**:
  - Set auto-suspend timeout ke 10 menit (Pro tier) untuk mengurangi frekuensi cold start
  - Gunakan Vercel Cron Job setiap 4 menit untuk "keep-alive" query ringan (`SELECT 1`)
  - Prisma connection retry strategy: 3 retries dengan exponential backoff
  - Pre-warm database di `middleware.ts` untuk route kritis

### 9.6.3 Database Branching Strategy

| Branch | Tujuan | Lifecycle |
|---|---|---|
| `main` | Production database | Permanent |
| `staging` | QA dan pre-production testing | Permanent |
| `preview/*` | Satu branch per Vercel preview deployment | Auto-delete setelah PR merged |
| `dev/*` | Development lokal per developer | Manual create/delete |

### 9.6.4 Database Indexing Strategy

```sql
-- Performance-critical indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_admin_id ON projects(admin_id);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_invoices_worker_id ON invoices(worker_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, is_read);
CREATE INDEX idx_time_logs_task_worker ON time_logs(task_id, worker_id);

-- Full-text search indexes
CREATE INDEX idx_projects_search ON projects USING GIN(to_tsvector('indonesian', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_users_search ON users USING GIN(to_tsvector('simple', full_name));
```

## 9.7 Next.js Middleware & Route Protection

### 9.7.1 Route Groups

```
app/
├── (auth)/              # Public routes (tidak perlu login)
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/         # Protected routes (perlu login)
│   ├── layout.tsx       # Shared dashboard layout (sidebar, header)
│   ├── worker/          # Worker-only routes
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── earnings/
│   │   └── performance/
│   └── admin/           # Admin-only routes
│       ├── dashboard/
│       ├── projects/
│       ├── workers/
│       ├── finance/
│       └── reports/
├── api/                 # API Routes (serverless functions)
│   ├── auth/
│   ├── projects/
│   ├── tasks/
│   ├── invoices/
│   ├── notifications/
│   ├── reports/
│   └── storage/
└── middleware.ts        # Global auth + role check
```

### 9.7.2 Middleware Logic

```typescript
// middleware.ts (pseudocode)
export function middleware(request: NextRequest) {
  const session = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Public routes — skip auth
  if (path.startsWith('/login') || path.startsWith('/register')) return;

  // No session — redirect to login
  if (!session) return redirect('/login');

  // Role-based protection
  if (path.startsWith('/admin') && session.role !== 'admin')
    return redirect('/worker/dashboard');

  if (path.startsWith('/worker') && session.role !== 'worker')
    return redirect('/admin/dashboard');
}
```

### 9.7.3 API Route Protection

- Setiap API route di-wrap dengan `withAuth()` higher-order function
- Validasi JWT session di server-side sebelum query database
- Role check per endpoint: `requireRole('admin')` atau `requireRole('worker')`
- Rate limiting via Vercel KV: 100 req/menit per user untuk API, 20 req/menit untuk auth endpoints

## 9.8 API Versioning

- **Strategi**: URL-based versioning — `/api/v1/...`
- **MVP**: Semua endpoint menggunakan `/api/v1/` sebagai base path
- **Breaking changes**: Versi baru (`/api/v2/`) dibuat jika ada perubahan yang tidak backward-compatible
- **Deprecation policy**: Versi lama tetap aktif minimal 6 bulan setelah versi baru dirilis
- **Header**: Response menyertakan header `X-API-Version: v1` untuk identifikasi

---

# 10. Roadmap Pengembangan

## 10.1 Timeline Rilis

| Fase | Durasi | Deliverable Utama |
|---|---|---|
| **Phase 0** Foundation | 4 minggu | Setup repo Next.js + Vercel, Neon DB schema + Prisma, Supabase Storage bucket, auth skeleton (NextAuth.js), design system |
| **Phase 1** MVP Core | 8 minggu | Login/register, worker dashboard (pendapatan & proyek), admin manage project & assign worker, notifikasi basic |
| **Phase 2** Enhancement | 6 minggu | Time tracker, rating system, invoice flow (submit→approve), laporan keuangan + export CSV/PDF, alert deadline |
| **Phase 3** Growth | 8 minggu | AI smart assign, gamifikasi (badge, leaderboard), notifikasi WhatsApp, integrasi akuntansi, audit log |
| **Phase 4** Scale | Ongoing | Public API, multi-tenant, mobile app (React Native), advanced BI dashboard |

## 10.2 Prioritas Fitur (MoSCoW)

### Must Have (MVP)

- Autentikasi dengan role (Worker / Admin)
- Dashboard pendapatan worker dengan grafik
- List dan detail proyek aktif worker
- Manajemen proyek admin (CRUD, assign worker)
- Laporan keuangan dasar + export CSV
- Notifikasi in-app dan email

### Should Have (Phase 2)

- Time tracker per task
- Sistem rating & review pasca proyek
- Invoice submission & approval flow
- Alert budget overrun dan deadline
- Export laporan ke PDF

### Could Have (Phase 3+)

- AI smart assign recommendation
- Gamifikasi: badge, achievement, leaderboard
- Notifikasi WhatsApp / Telegram
- Integrasi software akuntansi eksternal
- Internationalization (i18n) — dukungan multi-bahasa (ID/EN)
- PWA (Progressive Web App) — installable, offline-capable basic features
- Supabase Realtime presence — tampilkan siapa yang sedang online

### Won't Have (MVP)

- Mobile app native (React Native)
- Multi-tenant (beberapa organisasi)
- Public API dengan rate limiting berbayar
- Video call / meeting bawaan
- Offline-first architecture
- End-to-end encryption untuk chat/diskusi

---

# 11. Risiko & Mitigasi

| Risiko | Dampak | Kemungkinan | Mitigasi |
|---|---|---|---|
| Scope creep – fitur terus bertambah saat development | Tinggi | Tinggi | Strict feature freeze pada MVP; backlog review mingguan |
| Keamanan data keuangan bocor atau diakses unauthorized | Tinggi | Rendah | Enkripsi, RBAC ketat, penetration test sebelum launch |
| Performa lambat saat data laporan besar | Menengah | Menengah | Pagination, indexing DB, background job untuk generate laporan berat |
| Adopsi rendah oleh worker (UX tidak intuitif) | Tinggi | Menengah | User testing dengan 5+ worker nyata di setiap fase, onboarding guided |
| Keterlambatan pengembangan | Menengah | Menengah | Buffer 20% di timeline, prioritas ketat via MoSCoW |
| Ketergantungan pada layanan pihak ketiga (email, storage) | Rendah | Rendah | Gunakan vendor dengan SLA tinggi, siapkan fallback provider |
| Neon cold start menyebabkan latency tinggi | Menengah | Menengah | Keep-alive cron job, connection retry, Pro tier auto-suspend 10 menit |
| Supabase Storage downtime / rate limit | Menengah | Rendah | Implement upload queue, retry mechanism, fallback ke Vercel Blob |
| Biaya infrastruktur melebihi budget saat scaling | Menengah | Menengah | Monitoring usage dashboard, alert threshold 80%, evaluasi tier bulanan |
| Vendor lock-in (Vercel/Neon/Supabase) | Rendah | Menengah | Gunakan standard SQL (Prisma), S3-compatible API, containerize sebagai fallback |

---

# 12. Kriteria Penerimaan (Definition of Done)

Sebuah fitur dianggap selesai jika memenuhi semua kriteria berikut:

- [ ] Semua acceptance criteria di user story terpenuhi
- [ ] Unit test coverage ≥ 70% untuk logika bisnis inti
- [ ] Integration test untuk API endpoint lulus
- [ ] Code review disetujui oleh minimal 1 developer lain
- [ ] Tidak ada bug dengan severity High atau Critical yang terbuka
- [ ] Dokumentasi API (Swagger) diperbarui
- [ ] QA testing manual lulus di staging environment (Vercel preview deployment)
- [ ] Performa sesuai target (load time, response time)
- [ ] Accessibility check dasar lulus (keyboard navigation, contrast ratio)
- [ ] Vercel preview deployment berhasil tanpa error
- [ ] Neon branch database berfungsi normal di preview

## 12.1 Testing Strategy & Tools

### 12.1.1 Unit Testing

| Aspek | Detail |
|---|---|
| Framework | **Vitest** (kompatibel dengan Vite/Next.js, lebih cepat dari Jest) |
| Coverage Target | ≥ 70% untuk business logic, utility functions, dan hooks |
| Scope | Komponen React (via React Testing Library), utility functions, API handlers |
| Mocking | `vi.mock()` untuk external services (Supabase, Neon, Resend) |

### 12.1.2 Integration Testing

| Aspek | Detail |
|---|---|
| Framework | **Vitest** + `next/test` utilities |
| Coverage Target | ≥ 50% untuk API routes dan database queries |
| Database | Neon branch terpisah untuk test (auto-create per CI run) |
| Scope | API route handlers end-to-end, Prisma queries, auth flow |

### 12.1.3 End-to-End Testing

| Aspek | Detail |
|---|---|
| Framework | **Playwright** |
| Environment | Vercel preview deployment + Neon test branch |
| Critical Flows | Login → Dashboard, Create Project → Assign Worker, Submit Invoice → Approve, Generate Report |
| Schedule | Sebelum merge ke `main`, dan nightly run di staging |

### 12.1.4 CI Pipeline

```
push ke branch → Vercel preview deploy
                → Neon branch auto-create
                → Prisma migrate on branch
                → Vitest (unit + integration)
                → Playwright (E2E on preview URL)
                → Jika semua pass → ready for review
merge ke main   → Vercel production deploy
                → Prisma migrate on main Neon branch
                → Smoke test on production
```

---

# 13. Estimasi Biaya Infrastruktur

## 13.1 Free Tier (Development & MVP Awal)

Cocok untuk fase development dan MVP dengan < 50 users.

| Layanan | Tier | Limit | Biaya |
|---|---|---|---|
| Vercel | Hobby | 100GB bandwidth, 100 jam serverless | **$0/bulan** |
| Neon | Free | 0.5 GB storage, 1 compute (shared), 24h backup | **$0/bulan** |
| Supabase | Free | 1 GB storage, 2 GB bandwidth, 50MB upload limit | **$0/bulan** |
| Resend | Free | 100 email/hari, 3000/bulan | **$0/bulan** |
| Sentry | Developer | 5K errors/bulan, 1 user | **$0/bulan** |
| **Total** | | | **$0/bulan** |

## 13.2 Pro Tier (Production — 50-500 Users)

Disarankan untuk production launch (Phase 1-2).

| Layanan | Tier | Limit | Biaya |
|---|---|---|---|
| Vercel | Pro | 1TB bandwidth, 1000 jam serverless, preview deploy | **$20/bulan** |
| Neon | Launch | 10 GB storage, auto-scaling compute, 7 hari backup, branching | **$19/bulan** |
| Supabase | Pro | 100 GB storage, 250 GB bandwidth, 5 GB upload limit | **$25/bulan** |
| Resend | Pro | 50K email/bulan | **$20/bulan** |
| Sentry | Team | 50K errors/bulan, unlimited users | **$26/bulan** |
| Vercel KV | Pro | 256 MB storage | **$0 (included)** |
| BetterStack | Starter | 5 monitors, 3 min check | **$0/bulan** |
| **Total** | | | **~$110/bulan** |

## 13.3 Scale Tier (500+ Users)

Untuk Phase 3-4 saat user base bertumbuh.

| Layanan | Tier | Biaya Estimasi |
|---|---|---|
| Vercel | Team/Enterprise | **$150-300/bulan** |
| Neon | Scale | **$69-200/bulan** |
| Supabase | Team | **$599/bulan** |
| Lainnya | Varies | **$50-100/bulan** |
| **Total** | | **~$870-1200/bulan** |

> **💡 Tips**: Monitor usage secara aktif via dashboard masing-masing provider. Set billing alert di 80% limit untuk menghindari overage charges.

---

# 14. Development Setup & Seed Data

## 14.1 Quick Start

```bash
# 1. Clone repository
git clone <repo-url> && cd worker-admin-dashboard

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Isi semua variable sesuai Section 9.4

# 4. Setup database
npx prisma generate
npx prisma db push

# 5. Seed demo data
npm run db:seed

# 6. Run development server
npm run dev
```

## 14.2 Seed Data (Demo Mode)

Seed script (`prisma/seed.ts`) membuat data demo untuk development dan demonstrasi ke stakeholder:

| Entitas | Jumlah | Detail |
|---|---|---|
| Admin | 2 | `admin@demo.com` (password: `demo1234`) dan `rina@demo.com` |
| Worker | 5 | `andi@demo.com`, `budi@demo.com`, `citra@demo.com`, `dian@demo.com`, `eko@demo.com` |
| Projects | 8 | 2 Done, 3 In Progress, 2 To-Do, 1 In Review — spread across clients |
| Tasks | 30+ | Distribusi merata per proyek, berbagai status |
| Invoices | 10 | 3 Paid, 3 Approved, 2 Pending, 2 Rejected |
| Ratings | 5 | Rating untuk proyek yang sudah selesai |
| Time Logs | 50+ | Data jam kerja realistis untuk 2 bulan terakhir |
| Notifications | 20 | Campuran read/unread untuk semua user |

### Seed Commands

```bash
# Jalankan seed data
npm run db:seed

# Reset database + seed ulang
npm run db:reset

# Seed data untuk performance testing (10x volume)
npm run db:seed -- --scale=10
```

---

> **Worker & Admin Dashboard PRD v1.2.0 — Confidential**
>
> Dokumen ini adalah milik Product Team. Dilarang disebarluaskan tanpa izin tertulis.
