Bimbel E-Learning App
Sistem informasi bimbingan belajar yang dibangun dengan Laravel dan React.

🚀 Tech Stack
Backend: Laravel (PHP 8.x)

Frontend: React (Vite)

Database: MySQL

🛠 Instalasi
Pastikan kamu sudah menginstal PHP (Composer) dan Node.js di sistemmu.

1. Backend (Laravel)
cd backend
# Salin file env dan konfigurasi
cp .env.example .env

# Instal dependensi dan jalankan migrasi
    composer install
    php artisan key:generate
    php artisan migrate --seed  # Tambahkan --seed jika ada data dummy
    php artisan storage:link
    php artisan serve

2. Frontend (React)
    cd frontend
    npm install

    # Buat file .env jika belum ada
    # Isi dengan: VITE_API_BASE_URL=http://127.0.0.1:8000/api
    npm run dev

📝 Catatan Penting
Pastikan XAMPP/MySQL sudah berjalan sebelum menjalankan migrasi.

Jika terjadi error pada file gambar/PDF, pastikan storage/app/public sudah benar-benar ter-link.