# Quantum Studio (Desktop App) 🚀
> **The All-in-One Open-Source Desktop Studio for Code, Motion Video, and Multi-AI BYOA Engine.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)](https://github.com/Danuhadiana/quantum-studio)
[![Architecture](https://img.shields.io/badge/Architecture-Tauri%202.0%20%2F%20React%20%2F%20Vite-orange)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Beta%20v1.0.0-green)](https://github.com/Danuhadiana/quantum-studio/releases)

---

## 💡 Apa itu Quantum Studio?

**Quantum Studio** adalah aplikasi desktop modern yang menggabungkan kekuatan **Code Editor (seperti VS Code)**, **Timeline Video Multi-Track (seperti Premiere/CapCut)**, dan **Hub Multi-AI (BYOA - Bring-Your-Own-Agent)** ke dalam satu antarmuka desktop yang ringan (~18 MB).

Aplikasi ini bersifat **Open-Source** untuk pemakaian inti lokal, dan menyediakan fitur **In-App Purchase** untuk mengaktifkan akselerasi Cloud GPU Render serta agen AI spesialis.

---

## ⚡ 4 Pilar Fitur Utama

### 1. Monaco Code & Script Engine
* Menulis skrip animasi dan video terprogram secara deklaratif (menggunakan React & Remotion).
* Syntax highlighting bawaan, linting, dan editor berbasis engine resmi VS Code.
* AI-driven code generator: minta AI membuat animasi komponen dan langsung muncul di canvas.

### 2. Multi-Track Video Timeline Studio
* Track video, audio waveform, auto-subtitle Whisper (Bahasa Indonesia & Multi-bahasa), dan overlay visual.
* **Lossless Cut & Trim:** Potong klip video dalam hitungan milidetik via FFmpeg native tanpa render ulang yang lama.
* Canvas Viewport responsif: Beralih instan antara format horizontal (16:9 Landscape) dan vertikal (9:16 Shorts/Reels/TikTok).

### 3. Multi-AI Agent Hub (BYOA: Bring-Your-Own-Agent)
* **Bawa Kunci API Anda Sendiri:** Sambungkan Google Gemini 2.0 Flash, OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, atau Groq API.
* **100% Offline Mode (Ollama):** Sambungkan ke model lokal seperti DeepSeek-R1 atau Llama 3 tanpa memerlukan koneksi internet.
* Kunci API tersimpan aman di local storage komputer Anda.

### 4. Semantic Caching (Hemat Biaya Token Hingga 10x - 100x)
* Deduplikasi konteks lokal dan caching semantik untuk mencegah pemborosan token API pada prompt atau aset yang mirip.
* Monitor penghematan token secara real-time di sidebar aplikasi.

---

## 💳 Model Lisensi & Pembelian In-App

* **Gratis Diunduh & Open-Source:** Siapapun bisa mengunduh file installer `.exe` / `.dmg` atau mengkloning kode sumber secara gratis.
* **In-App Pro Upgrade:** Pengguna yang membutuhkan fitur akselerasi Cloud Render 4K/60fps, prebuilt film director agents, dan team sync dapat membeli lisensi Pro langsung dari dalam software desktop via **Midtrans Gateway** (QRIS, GoPay, BCA Virtual Account, Mandiri VA) atau memasukkan serial key resmi (`QTM-PRO-XXXX-XXXX`).

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### Prasyarat
* [Node.js](https://nodejs.org/) v18+ atau v20+
* Git

### Langkah Instalasi
```bash
# 1. Kloning repositori ini
git clone https://github.com/Danuhadiana/quantum-studio.git

# 2. Masuk ke direktori
cd quantum-studio

# 3. Pasang dependensi
npm install

# 4. Jalankan aplikasi dalam mode dev desktop
npm run dev
```
Aplikasi akan terbuka pada `http://localhost:3000/`.

---

## 📦 Membuat File Installer Desktop

Untuk mengompilasi aplikasi menjadi file executable mandiri (`.exe` untuk Windows, `.dmg` untuk macOS):

```bash
# Kompilasi aset frontend
npm run build
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**. Bebas digunakan, dimodifikasi, dan dikembangkan untuk komunitas.

Dibuat dengan ❤️ oleh **[Danu Hadiana / Quantum Studio](https://github.com/Danuhadiana)**.
