# Laptop Recommendation Aggregator Backend API (SPK)

Backend API untuk **Sistem Pendukung Keputusan (SPK) Agregator Rekomendasi Laptop** menggunakan metode pengambilan keputusan multikriteria: **SAW (Simple Additive Weighting)**, **WP (Weighted Product)**, and **TOPSIS**.

Sistem ini mendukung arsitektur berbasis peran (Role-Based Access Control / RBAC) dengan JWT Auth yang mengisolasi data untuk Superadmin, Admin Toko, dan Customer secara aman.

---

## 🚀 Fitur Utama
1. **Multi-Criteria Decision Making (MCDM) Engine**:
   - Memproses kalkulasi rekomendasi laptop secara paralel dengan metode **SAW**, **WP**, dan **TOPSIS** berdasarkan kriteria & bobot kebutuhan customer.
2. **Role-Based Access Control (RBAC)**:
   - **Superadmin**: Mengelola data master (Brand, Toko, Kriteria SPK, Sub-Kriteria SPK, Akun Staff, Produk Global).
   - **Store Admin**: Mengelola inventaris produk toko lokal, harga, stok, ketersediaan, profil toko, serta laporan summary penjualan.
   - **Customer**: Registrasi/login, melihat katalog publik laptop terdekat (berdasarkan kalkulasi jarak koordinat GPS), edit profil, dan mengajukan permintaan rekomendasi laptop (SPK).
3. **Database Relasional & ORM**:
   - Menggunakan **Prisma ORM** dengan database **MySQL** yang terstruktur rapi.

---

## 🛠️ Tech Stack
*   **Runtime**: [Node.js](https://nodejs.org/) (v18+)
*   **Framework**: [Express.js](https://expressjs.com/) dengan [TypeScript](https://www.typescriptlang.org/)
*   **Database ORM**: [Prisma Client](https://www.prisma.io/)
*   **Database**: [MySQL](https://www.mysql.com/)
*   **Keamanan & Auth**: [JSON Web Token (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
*   **Alat Testing**: Postman / Thunder Client

---

## 📂 Struktur Folder Utama
```text
├── prisma/
│   └── schema.prisma         # Definisi skema database Prisma (MySQL)
├── src/
│   ├── config/               # Konfigurasi database & global
│   ├── controllers/          # Logika handler Express (Superadmin, Admin, Customer, Shared)
│   ├── middlewares/          # Middleware keamanan (Auth JWT, Error Handler)
│   ├── repositories/         # Layer database kueri Prisma (Data Access)
│   ├── routes/               # Definisi rute Express API
│   ├── services/             # Layer logika bisnis & perhitungan SPK (SAW, WP, TOPSIS)
│   ├── utils/                # Fungsi utilitas pembantu (Geo-distance calculation)
│   └── index.ts              # Entry point aplikasi utama
├── .env.example              # Contoh konfigurasi environment variables
├── API_DOCS.md               # Dokumentasi API Lengkap & Detail
└── spk-laptop-api.postman_collection.json # Draf koleksi Postman siap pakai
```

---

## ⚙️ Cara Instalasi & Menjalankan Project

### 1. Prasyarat
Pastikan Anda sudah menginstal:
*   [Node.js](https://nodejs.org/) (versi LTS terbaru direkomendasikan)
*   [MySQL Server](https://dev.mysql.com/downloads/installer/)

### 2. Kloning Repositori
```bash
git clone <url-repo-github>
cd backend-spk-laptop
```

### 3. Instal Dependensi
```bash
npm install
```

### 4. Konfigurasi Environment Variables
Buat salinan file `.env.example` dengan nama `.env`:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi koneksi MySQL Anda di dalam berkas `.env` (misal: password dan nama database):
```ini
DATABASE_URL="mysql://root:password@localhost:3306/uas4_db"
PORT=3000
JWT_SECRET="ganti_dengan_key_yang_sangat_rahasia_dan_panjang"
```

### 5. Sinkronisasi Database & Generasi Prisma Client
Lakukan generasi tipe Prisma Client lokal untuk menyelaraskan ORM dengan skema database Anda:
```bash
# Pastikan server backend sedang tidak berjalan (tidak mengunci file node_modules)
npx prisma generate
```

Jika database Anda masih kosong atau ingin menyinkronkan struktur tabel dari `schema.prisma` ke basis data MySQL:
```bash
npx prisma db push
```

### 6. Jalankan Aplikasi
*   **Mode Pengembangan (Development)**:
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:3000`.

*   **Mode Produksi (Production Build)**:
    ```bash
    npm run build
    npm start
    ```

---

## 📝 Pengujian API (Postman / Thunder Client)
1. Kami telah menyediakan file **[spk-laptop-api.postman_collection.json](./spk-laptop-api.postman_collection.json)** di direktori root.
2. Impor file tersebut ke aplikasi **Postman** atau ekstensi **Thunder Client** di VS Code Anda.
3. Seluruh alur autentikasi telah disiapkan secara otomatis. Ketika Anda melakukan login, JWT token akan disimpan langsung dalam variabel koleksi `token` untuk digunakan pada request lainnya.
4. Detail spesifikasi input, payload body, dan response JSON dari setiap endpoint dapat dibaca di **[API_DOCS.md](./API_DOCS.md)**.
