# PINTU (Pusat Integrasi Tautan Utama)

PINTU adalah sebuah aplikasi portal (*dashboard*) terpusat yang dirancang untuk mengintegrasikan dan memantau status berbagai tautan aplikasi lain. Aplikasi ini dibangun menggunakan **Next.js** dan menggunakan basis data **MySQL**.

## Fitur Utama
- **Dashboard Publik**: Menampilkan daftar aplikasi beserta deskripsi, kategori, logo, dan status ketersediaannya (ONLINE/OFFLINE) yang dipantau secara langsung (*real-time ping*).
- **Pencarian & Filter**: Pengguna dapat mencari aplikasi berdasarkan nama atau menyaring berdasarkan kategori (mendukung multi-kategori per aplikasi).
- **Panel Admin**: Halaman khusus admin yang dilengkapi autentikasi untuk mengelola daftar aplikasi (Tambah, Edit, Hapus).
- **Pengaturan Tampilan Admin**: Mengurutkan aplikasi menggunakan fitur *drag-and-drop*, memfilter, dan mengatur jumlah baris per halaman (Paginasi).
- **Preview Gambar**: Fitur pratinjau *pop-up* untuk logo dan *screenshot* aplikasi saat dikelola oleh admin.

## Persyaratan Sistem
- Node.js (v18 atau lebih baru disarankan)
- MySQL (XAMPP/MariaDB)
- Web Server (Opsional, misalnya Apache Reverse Proxy jika ingin dihosting berdampingan dengan aplikasi lain)

## Instalasi & Menjalankan Aplikasi Lokal

1. **Persiapan Database**
   - Buat database baru bernama `pintu_db` di MySQL Anda.
   - Aplikasi akan membuat tabel `apps` dan `users` secara otomatis. (Atau *import* file SQL Anda jika ada).

2. **Konfigurasi Lingkungan (Environment Variables)**
   Buat file `.env.local` atau sesuaikan konfigurasi koneksi database Anda di `src/lib/db.js`.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Menjalankan Server Mode Development**
   ```bash
   npm run dev
   ```

5. **Build dan Mode Production**
   ```bash
   npm run build
   npm run start
   ```

## Konfigurasi Port & Base Path
Secara bawaan, aplikasi ini dikonfigurasi untuk berjalan pada `basePath: '/pintu'` (dapat disesuaikan di `next.config.mjs`) agar dapat beroperasi di balik *reverse proxy* Apache pada sebuah sub-folder.

## Hak Akses & Akun Default
- URL Halaman Publik: `http://localhost:3000/pintu`
- URL Halaman Admin: `http://localhost:3000/pintu/admin`

## Teknologi yang Digunakan
- [Next.js](https://nextjs.org/) (App Router)
- React
- MySQL2 (Node.js driver)
- CSS Module / Global CSS
