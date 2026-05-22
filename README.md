# 🇮🇩 NutriVision ID — National Nutrition Intelligence

[![JuaraVibeCoding](https://img.shields.io/badge/Competition-%23juaravibecoding-emerald?style=for-the-badge)](https://github.com/matchateens/nutrivision_)
[![Google Cloud Run](https://img.shields.io/badge/GCP-Cloud%20Run-blue?style=for-the-badge&logo=google-cloud)](https://cloud.google.com/run)
[![Docker](https://img.shields.io/badge/Docker-Enabled-cyan?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-v18.x-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**NutriVision ID** adalah platform dashboard intelijen gizi nasional yang dirancang khusus untuk memantau prevalensi stunting secara real-time dan mensimulasikan dampak fiskal serta cakupan operasional dari program **Makan Bergizi Gratis (MBG)** di seluruh Indonesia.

Project ini dibangun dengan mengutamakan **estetika desain premium (Military-grade/Intelligence Dashboard)**, performa tinggi, dan interaktivitas data yang mulus untuk mendukung pengambilan keputusan berbasis data demi mewujudkan **Indonesia Emas 2045**.

---

## 📸 Tampilan Dashboard Utama
![NutriVision ID Dashboard](https://nutrivision-836488272477.asia-southeast2.run.app/favicon.svg) *(Logo Aplikasi)*

Dashboard di-deploy secara publik dan dapat diakses pada:  
🔗 **[Live Demo NutriVision ID](https://nutrivision-836488272477.asia-southeast2.run.app)**

---

## 🚀 Fitur Utama

### 1. Geospatial Heatmap & Drill-Down
* Peta interaktif 38 Provinsi Indonesia berbasis **TopoJSON** dengan penskalaan warna otomatis (*color-scale*) sesuai tingkat keparahan stunting:
  * 🟢 **Aman (<15%)** — Prevalensi stunting di bawah standar kritis nasional.
  * 🟡 **Waspada (15-25%)** — Wilayah dengan perhatian sedang.
  * 🔴 **Darurat (>25%)** — Wilayah dengan prevalensi stunting kritis yang memerlukan tindakan segera.
* Transisi zoom dan pemuatan wilayah secara cerdas, mendukung *drill-down* otomatis ke tingkat Kabupaten/Kota saat wilayah provinsi diklik.

### 2. Simulator Fiskal & Operasional MBG (Makan Bergizi Gratis)
* Simulator interaktif untuk memproyeksikan cakupan anak penerima manfaat berdasarkan total anggaran yang dialokasikan.
* Fitur pengaturan parameter dinamis seperti **Biaya per Porsi** (default Rp15.000) dan **Hari Operasional** per tahun.
* Kalkulator kebutuhan infrastruktur dapur produksi (**Satuan Pelayanan Program Gizi - SPPG**) dengan kapasitas 3.000 anak per SPPG.
* Proyeksi teoritis penurunan stunting wilayah berdasarkan cakupan nutrisi yang diberikan.

### 3. AI Strategic Insight (Powered by Gemini API)
* Rekomendasi kebijakan taktis bertenaga AI yang membaca data riil stunting, jumlah anak terdampak, dan rasio wasting wilayah.
* AI secara otomatis memetakan akar masalah (geografis, infrastruktur, atau nutrisi) serta menyusun 3 poin aksi strategis prioritas untuk pemerintah daerah terkait.

### 4. Panel Komparasi Wilayah
* Memungkinkan pengguna membandingkan metrik gizi dan kesiapan MBG antara dua provinsi secara berdampingan (*side-by-side comparison*).
* Menyajikan visualisasi grafik radar/batang perbandingan prevalensi stunting, wasting, target penurunan, serta jumlah anak sekolah terdampak.

### 5. Smart Search & Region Filter
* Kolom pencarian dinamis dengan fitur *auto-complete* untuk menemukan provinsi atau kabupaten tertentu secara instan.
* Filter cepat wilayah berdasarkan pulau utama (Jawa, Sumatera, Kalimantan, Sulawesi, Bali & Nusa Tenggara, Maluku, dan Papua).

---

## 🛠️ Tech Stack & Dependensi

* **React.js (Vite)**: Basis framework aplikasi cepat, modular, dan modern.
* **Tailwind CSS v4**: Pemrosesan styling modern berkecepatan tinggi dengan variabel CSS bawaan untuk efek glassmorphism.
* **Framer Motion**: Pustaka animasi premium untuk transisi panel dan efek peta interaktif.
* **React Simple Maps & D3-Geo**: Rendering proyeksi peta kepulauan Indonesia secara presisi dengan interaksi hover & klik.
* **Recharts**: Pembuat grafik data statistik tren stunting historis (2019 - 2024).
* **Lucide React**: Set ikon premium minimalis untuk nuansa dashboard intelijen yang konsisten.
* **Node.js (Server Produksi)**: Server ultra-ringan menggunakan modul bawaan `http` untuk optimalisasi Cloud Run tanpa dependensi eksternal tambahan.

---

## 📁 Struktur Direktori

```text
nutri/
├── .dockerignore           # Daftar pengecualian untuk Docker build context
├── Dockerfile              # Konfigurasi containerization multi-stage
├── package.json            # Daftar script, dependensi, dan devDependencies
├── postcss.config.js       # Konfigurasi pemrosesan CSS dengan PostCSS
├── tailwind.config.js      # Kustomisasi tema warna brand & animasi Tailwind
├── server.js               # Node.js production server (sebagai penyaji aset static)
├── index.html              # Template HTML utama dengan meta tag SEO lengkap
├── public/                 # Aset publik (favicon, TopoJSON peta Indonesia)
└── src/
    ├── main.jsx            # Entry point React
    ├── index.css           # Styling dasar dengan import Tailwind v4
    ├── App.jsx             # Komponen utama penyusun tata letak dashboard
    ├── components/         # Komponen UI modular
    │   ├── AiInsight.jsx       # Panel rekomendasi berbasis Gemini AI
    │   ├── ComparePanel.jsx    # Panel pembanding antar wilayah
    │   ├── MapChart.jsx        # Peta SVG interaktif dengan TopoJSON
    │   ├── ProvinceDetail.jsx  # Panel detail informasi & grafik tren wilayah
    │   ├── ProvinceRanking.jsx # Tabel peringkat wilayah dari terbaik-terburuk
    │   └── SimulationPanel.jsx # Simulator proyeksi anggaran & SPPG MBG
    ├── data/               # Dataset JSON statis
    │   ├── districtData.json   # Prevalensi stunting tingkat kabupaten/kota
    │   └── nutritionData.json  # Data prevalensi stunting 38 provinsi (SKI 2023)
    └── services/           # Logika interaksi API luar
        └── geminiService.js    # Penghubung prompt dengan Google Gemini API
```

---

## 📦 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
* Node.js versi 18.x atau lebih tinggi.
* NPM versi 9.x atau lebih tinggi.

### Langkah-langkah
1. **Clone repository dan masuk ke direktori proyek:**
   ```bash
   git clone https://github.com/matchateens/nutrivision_.git
   cd nutrivision_
   ```

2. **Instal seluruh dependensi proyek:**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi pada server development:**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses secara lokal pada alamat: `http://localhost:5173`.

4. **Kompilasi build produksi (opsional):**
   ```bash
   npm run build
   ```
   Hasil kompilasi file statis yang dioptimalkan akan tersimpan di dalam folder `dist/`.

5. **Jalankan server produksi secara lokal:**
   ```bash
   npm run start
   ```
   Aplikasi akan menyajikan aset hasil build produksi melalui port `8080` (dapat disesuaikan lewat ENV `$PORT`).

---

## 🚀 Panduan Deployment ke Google Cloud Run

NutriVision ID sepenuhnya didukung oleh Docker dan siap dideploy langsung ke Google Cloud Run dengan containerisasi minimalis berkinerja tinggi.

### Opsi: Deployment Menggunakan Google Cloud Shell

1. **Buka Cloud Shell** pada Google Cloud Console Anda.
2. **Klon repositori proyek:**
   ```bash
   git clone https://github.com/matchateens/nutrivision_.git
   cd nutrivision_
   ```
3. **Picu Google Cloud Build untuk merakit container image:**
   *(Ganti `silent-turbine-410521` dengan Project ID GCP Anda).*
   ```bash
   gcloud builds submit --tag gcr.io/silent-turbine-410521/nutrivision
   ```
4. **Deploy hasil build image ke Google Cloud Run:**
   ```bash
   gcloud run deploy nutrivision \
     --image gcr.io/silent-turbine-410521/nutrivision \
     --platform managed \
     --region asia-southeast2 \
     --allow-unauthenticated
   ```
5. Tunggu proses hingga selesai, Google Cloud Run akan memberikan URL layanan aktif Anda (misalnya: `https://nutrivision-[hash].run.app`).

---

## 📊 Sumber Data & Metodologi

Platform ini mengintegrasikan beberapa database resmi untuk memproyeksikan hasil yang kredibel:
1. **Survei Kesehatan Indonesia (SKI) 2023 (Kemenkes RI)**: Data prevalensi stunting tingkat provinsi dan kabupaten sebagai data awal utama.
2. **Badan Pusat Statistik (BPS)**: Data jumlah penduduk usia sekolah dasar dan menengah untuk memproyeksikan basis penerima manfaat MBG.
3. **Badan Gizi Nasional (BGN)**: Parameter standar biaya makanan bergizi lengkap per hari (Rp15.000/porsi) dan rancangan Satuan Pelayanan Program Gizi (SPPG) berkapasitas 3.000 anak per unit.

---

## 🏆 Informasi Tambahan
Proyek ini dikembangkan secara antusias untuk memeriahkan program **#juaravibecoding**. Seluruh desain visual, pemrosesan peta data kepulauan Indonesia, dan arsitektur server ultra-ringan dirancang untuk membuktikan efisiensi pengembangan aplikasi web modern yang fungsional, berdampak nyata bagi kebijakan sosial, serta menyenangkan secara visual.

---
© 2026 **NutriVision Indonesia**. Dibuat dengan 💚 untuk masa depan anak-anak Indonesia.
