# Panduan Memulai Cepat Quantum Studio

Panduan ini membantu Anda memulai penggunaan Quantum Studio dari tahap instalasi awal hingga mengekspor video resolusi tinggi pertama Anda.

---

## Prasyarat Sistem

Sebelum menginstal Quantum Studio, pastikan komputer Anda memenuhi spesifikasi minimum berikut:

* **Sistem Operasi:** Windows 10/11 (64-bit), macOS 11 Big Sur ke atas (Apple Silicon atau Intel), atau distribusi Linux modern (Ubuntu 20.04+, Fedora 36+).
* **Prosesor:** Dual-core 2.0 GHz atau lebih tinggi.
* **Memori RAM:** Minimal 4 GB (disarankan 8 GB untuk pratinjau canvas 60 FPS).
* **Ruang Penyimpanan:** 200 MB untuk aplikasi, plus ruang penyimpanan tambahan untuk berkas media Anda.
* **Node.js (Khusus mode pengembangan dari source):** Versi 18.0.0 atau lebih baru.

---

## Langkah 1: Memasang Aplikasi

### Menggunakan Installer Desktop
1. Unduh installer resmi Windows: [Quantum-Studio-Setup-1.0.0-beta.exe](https://github.com/Danuhadiana/quantum-studio/releases/download/v1.0.0-beta/Quantum-Studio-Setup-1.0.0-beta.exe) atau melalui [GitHub Releases](https://github.com/Danuhadiana/quantum-studio/releases/tag/v1.0.0-beta).
2. Di Windows, klik ganda berkas `Quantum-Studio-Setup-1.0.0-beta.exe` dan ikuti wizard pemasangan.
3. Setelah instalasi selesai, buka aplikasi Quantum Studio langsung dari menu Start atau shortcut Desktop.

### Menjalankan dari Kode Sumber (Pengembang)
```bash
git clone https://github.com/Danuhadiana/quantum-studio.git
cd quantum-studio
npm install
npm run dev
```
Akses antarmuka desktop lokal melalui peramban pada `http://localhost:3000/`.

---

## Langkah 2: Mengenal Tata Letak Ruang Kerja (Workstation)

Quantum Studio dibagi menjadi empat area utama:
1. **Bilah Alat Sisi Kiri (Toolbar):** Tempat beralih antara Editor Kode, Timeline Video, dan Pustaka Media.
2. **Viewport Canvas (Tengah Atas):** Layar pratinjau video real-time 60 FPS. Mendukung rasio 16:9 Landscape dan 9:16 Portrait (Shorts, Reels, TikTok).
3. **Panel Editor Ganda (Tengah Bawah):** 
   * Tab **BrandIntroAnimation.jsx**: Monaco Code Editor untuk koding animasi video deklaratif.
   * Tab **Multi-Track Timeline**: Trek visual video, audio, dan layer subtitle.
4. **Hub Agen AI Sisi Kanan (Right Sidebar):** Kolom interaksi dengan asisten AI untuk pembuatan kode animasi, saran visual, dan pemantauan efisiensi token.

---

## Langkah 3: Membuat Animasi Video Pertama Anda

Mari membuat scene pembuka animasi sederhana menggunakan pustaka Remotion di panel editor kode:

1. Klik tab **BrandIntroAnimation.jsx** pada panel editor bawah.
2. Masukkan kode berikut:
   ```jsx
   import React from 'react';
   import { interpolate, spring, useCurrentFrame } from 'remotion';

   export const SceneIntro = ({ judul = "Quantum Studio" }) => {
     const frame = useCurrentFrame();
     const muncul = interpolate(frame, [0, 25], [0, 1]);
     const perbesar = spring({ frame, fps: 60, config: { damping: 12 } });

     return (
       <div className="w-full h-full bg-slate-950 flex items-center justify-center p-8">
         <h1 
           style={{ opacity: muncul, transform: `scale(${perbesar})` }}
           className="text-5xl font-black text-amber-400 tracking-tight"
         >
           {judul}
         </h1>
       </div>
     );
   };
   ```
3. Klik tombol **Play** pada Canvas Viewport. Anda akan melihat teks membesar secara halus dengan fisika pegas (spring physics) pada 60 FPS.

---

## Langkah 4: Beralih ke Format Video Vertikal (Shorts / Reels)

Jika Anda ingin membuat konten video untuk TikTok atau YouTube Shorts:
1. Temukan kontrol rasio aspek pada sudut kanan atas Viewport Canvas.
2. Klik tombol **9:16 Shorts**.
3. Canvas akan langsung menyesuaikan orientasi vertikal (1080x1920) secara otomatis tanpa perlu mengubah konfigurasi proyek secara manual.

---

## Langkah 5: Menambahkan Trek Audio dan Subtitle Otomatis

1. Beralih ke tab **Multi-Track Timeline** di panel bawah.
2. Tarik berkas audio suara latar Anda ke **Track 3: Audio**.
3. Pada Hub Agen AI di sisi kanan, pilih agen **Whisper**.
4. Ketik prompt: `Buatkan subtitle otomatis untuk narasi audio ini`.
5. AI akan memproses teks dan menyelaraskan penanda waktu (timecode) ke **Track 2: Subtitle**.

---

## Langkah 6: Mengekspor Hasil Video

1. Klik tombol **Export 4K Video** pada sudut kanan bawah area Viewport Canvas.
2. Pilih format keluaran yang diinginkan:
   * Format MP4 H.264 (standar web dan media sosial).
   * Format WebM (ringan untuk integrasi web).
   * Format Lossless Pro (tanpa penurunan kualitas).
3. Klik **Mulai Render**. Berkas video akan tersimpan di folder unduhan Anda.

---

## Pemecahan Masalah Umum

* **Canvas pratinjau hitam atau tidak bergerak:** Pastikan tombol Play telah aktif (tekan `Space` pada keyboard) dan durasi frame pada skrip animasi tidak bernilai 0.
* **Kunci API ditolak:** Buka menu **Settings** pada sudut kanan atas titlebar, dan pastikan kunci API Google Gemini atau OpenAI Anda berstatus aktif dan memiliki kuota yang mencukupi.
* **Ollama lokal tidak terhubung:** Pastikan perintah `ollama serve` atau `ollama run deepseek-r1` sedang berjalan pada terminal komputer Anda sebelum menghubungkan ke `http://localhost:11434`.
