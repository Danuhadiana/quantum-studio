# Arsitektur Teknis Quantum Studio

Dokumen ini memaparkan rancangan arsitektur internal, pilihan tumpukan teknologi (tech stack), integrasi pipeline media, serta sistem keamanan dan lisensi pada Quantum Studio.

---

## 1. Tumpukan Teknologi Inti

Quantum Studio dirancang menggunakan arsitektur desktop modern berkinerja tinggi:

* **Desktop Shell:** Tauri 2.0 (Rust)
  * Menggunakan WebView2 pada Windows dan WebKit pada macOS/Linux.
  * Ukuran installer sangat ringkas (~18 MB) dibanding Electron (~150 MB).
  * Penggunaan memori RAM saat diam (idle) hanya berkisar antara 40 MB hingga 80 MB.
* **Frontend UI Framework:** React 18 dan Tailwind CSS
  * Komponen reaktif berbasis fungsi dan hook kustom.
  * Antarmuka studio dengan palet gelap kontras tinggi (Slate `#0a0d14` dan aksen oranye `#ff5429`).
* **Editor Kode:** Monaco Editor Engine
  * Penyorotan sintaks (syntax highlighting) untuk JavaScript, TypeScript, JSX, dan Python.
* **Engine Animasi Video:** Remotion Framework
  * Menghasilkan frame video secara terprogram dengan React komponen.
* **Engine Pemrosesan Media:** FFmpeg Native Binary
  * Pemotongan klip instan (lossless stream copy) tanpa encoding ulang CPU/GPU yang memakan waktu.

---

## 2. Diagram Arsitektur Sistem

```text
┌─────────────────────────────────────────────────────────────┐
│                    Quantum Studio UI                        │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ Monaco Editor  │  │  Canvas Player   │  │ AI Agent    │  │
│  │ (Code Engine)  │  │  (Remotion 60fps)│  │ Hub (BYOA)  │  │
│  └───────┬────────┘  └────────┬─────────┘  └──────┬──────┘  │
└──────────┼────────────────────┼───────────────────┼─────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│               Rust Native Core (Tauri 2.0)                  │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ Native FFmpeg  │  │ Semantic Cache   │  │ Local Secure│  │
│  │ Lossless Cut   │  │ (Context Dedupe) │  │ Storage     │  │
│  └────────────────┘  └──────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌──────────────────┐   ┌──────────────────┐  ┌────────────────┐
│ Sistem File      │   │ Model Eksternal  │  │ Midtrans       │
│ Lokal Komputer   │   │ (Gemini/Claude)  │  │ Gateway / API  │
└──────────────────┘   └──────────────────┘  └────────────────┘
```

---

## 3. Komponen Utama dan Tanggung Jawab

### A. Viewport Canvas dan Remotion Player
* Komponen pratinjau merender frame pada tingkat penyegaran (refresh rate) 60 frame per detik.
* Mendukung perubahan orientasi seketika antara format 16:9 Landscape (1920x1080) dan format 9:16 Portrait (1080x1920).
* Sinkronisasi penanda waktu (timecode) dengan format baku industri: `HH:MM:SS:FF`.

### B. Pipeline Pemotongan Lossless (FFmpeg Native)
Untuk memotong video berukuran besar (misal rekaman 4K 10 GB) tanpa menunggu proses render ulang:
* Quantum Studio memanggil instruksi FFmpeg stream copy:
  ```bash
  ffmpeg -ss [waktu_mulai] -to [waktu_selesai] -i input.mp4 -c copy output.mp4
  ```
* Proses pemotongan klip selesai dalam waktu kurang dari 500 milidetik karena paket data audio/video langsung disalin tanpa dekompresi piksel.

### C. Mesin Caching Semantik (Token Cost Optimization)
* Sebelum perintah pengguna dikirimkan ke model AI, teks dianalisis untuk menghasilkan hash semantik.
* Jika perintah berkaitan dengan modifikasi kecil pada scene yang sudah ada, hanya diff konteks yang dikirimkan.
* Berkas transkrip, frame audio, dan respon berulang disimpan di database lokal SQLite komputer pengguna.

### D. Sistem Pembelian dan Aktivasi Lisensi In-App
* **Model Dua Lapis (Dual-Tier Architecture):**
  1. **Core Open-Source (Gratis):** Seluruh fungsi lokal, koding Remotion, pemotongan video FFmpeg, dan model offline Ollama terbuka tanpa batasan waktu.
  2. **Pro Studio License:** Membuka fitur akselerasi Cloud Render 4K/60 FPS, sinkronisasi cloud, dan paket agen AI terarah.
* **Integrasi Pembayaran:**
  * Komponen `LicenseModal.jsx` berinteraksi dengan API backend `/api/create-transaction` yang terhubung ke Midtrans Snap.
  * Mendukung kanal pembayaran instan: QRIS Nasional, GoPay, dan Virtual Account bank lokal (BCA, Mandiri).
  * Status lisensi disimpan secara terverifikasi pada penyimpanan lokal komputer (`qtm_license_status`).

---

## 4. Keamanan dan Integritas Data

1. **Prinsip Sandboxing:** Aplikasi berjalan dalam sandbox izin terbatas melalui konfigurasi keamanan Tauri.
2. **Kunci Kredensial:** Seluruh kunci API eksternal disimpan pada penyimpanan privat pengguna dan tidak pernah dikirimkan ke repositori publik atau analitik pihak ketiga.
3. **Audit Bebas Slop:** Seluruh kode, komentar pengembang, dan teks antarmuka dibangun mengikuti aturan kebersihan kode antislop (tanpa komentar redundan, tanpa tanda pisah em dash, dan dengan kontras warna memenuhi standar WCAG AA).
