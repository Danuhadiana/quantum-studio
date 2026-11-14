# Panduan BYOA: Bring-Your-Own-Agent dan Model AI Lokal

Dokumen ini menjelaskan cara kerja model Bring-Your-Own-Agent (BYOA), panduan menghubungkan kunci API eksternal, setup model bahasa lokal (Ollama), dan mekanisme efisiensi biaya token hingga 92% menggunakan cache semantik lokal.

---

## Apa itu Konsep BYOA?

Pada software konvensional, pengguna biasanya diwajibkan membayar biaya langganan bulanan tetap ($20 hingga $100 per bulan) untuk mengakses fitur kecerdasan buatan, terlepas dari apakah fitur tersebut sering digunakan atau tidak.

Quantum Studio menerapkan prinsip **BYOA (Bring-Your-Own-Agent)**:
1. Pengguna memasang kunci API milik mereka sendiri langsung ke software.
2. Biaya pemrosesan token dibayarkan langsung ke penyedia model (Google, OpenAI, Anthropic) dengan sistem bayar sesuai pemakaian riil (pay-as-you-go).
3. Pengguna yang memiliki komputer dengan GPU memadai juga dapat menjalankan model lokal 100% gratis dan offline tanpa internet menggunakan Ollama.

---

## Keuntungan Finansial Model BYOA

Sebagai contoh perbandingan biaya:
* **Sistem Langganan SaaS:** Pengguna membayar $20 per bulan untuk ChatGPT Plus, $20 untuk Claude Pro, dan $10 untuk GitHub Copilot (Total ~$50 atau ~Rp 800.000 per bulan).
* **Sistem Quantum Studio BYOA:** Jika Anda menggunakan Google Gemini 2.0 Flash atau Claude API untuk menghasilkan 50 skrip video dan 200 baris kode per minggu, total biaya token API yang Anda keluarkan umumnya hanya berkisar antara Rp 10.000 hingga Rp 35.000 per bulan.

---

## Panduan Pemasangan Kunci API

Buka jendela konfigurasi dengan mengklik ikon **Settings** pada titlebar desktop, atau tekan pintasan keyboard `Ctrl + K` (Windows/Linux) atau `Cmd + K` (macOS).

### 1. Google Gemini API (Rekomendasi Cepat dan Hemat)
1. Kunjungi portal Google AI Studio di `https://aistudio.google.com/`.
2. Masuk menggunakan akun Google Anda dan klik tombol **Get API Key**.
3. Buat kunci API baru dan salin teks kunci yang berawalan `AIzaSy...`.
4. Tempelkan kunci tersebut pada kolom **Google Gemini API Key** di Quantum Studio.
5. Klik **Simpan Konfigurasi Kunci API**.

### 2. OpenAI API (GPT-4o dan Whisper Subtitle)
1. Kunjungi platform OpenAI di `https://platform.openai.com/api-keys`.
2. Masuk ke akun Anda dan buat secret key baru (berawalan `sk-proj-...`).
3. Tempelkan pada kolom **OpenAI API Key** di Quantum Studio.
4. Kunci ini digunakan oleh agen koding dan modul transkripsi audio Whisper.

### 3. Anthropic Claude API (Claude 3.5 Sonnet)
1. Kunjungi konsol Anthropic di `https://console.anthropic.com/settings/keys`.
2. Buat API key baru (berawalan `sk-ant-...`).
3. Tempelkan pada kolom **Anthropic Claude API Key** di Quantum Studio.

---

## Menjalankan Model AI Lokal Secara Offline (Ollama)

Jika Anda ingin bekerja tanpa koneksi internet atau memiliki data sensitif yang tidak boleh keluar dari komputer Anda:

### Langkah Setup Ollama
1. Unduh dan pasang Ollama dari situs resmi `https://ollama.com/`.
2. Buka terminal komputer Anda dan jalankan perintah:
   ```bash
   # Menjalankan model penalaran DeepSeek R1
   ollama run deepseek-r1:8b

   # Atau model Llama 3
   ollama run llama3:8b
   ```
3. Di Quantum Studio, buka menu **Settings** dan pastikan kolom **Local Offline Engine (Ollama Host URL)** terisi nilai default:
   ```text
   http://localhost:11434
   ```
4. Quantum Studio akan mendeteksi instance lokal Ollama secara otomatis. Anda kini dapat memerintahkan agen AI untuk menulis kode dan skrip video tanpa kuota internet.

---

## Cara Kerja Caching Semantik Lokal

Quantum Studio dilengkapi mesin penyimpanan sementara (semantic cache) yang bekerja pada tingkat lokal:

```text
[Input Prompt Pengguna]
         │
         ▼
[Cek Kemiripan Semantik di SQLite Lokal]
   ├── Jika Ditemukan (Cache Hit):
   │     └── Ambil respon dari memori lokal (Waktu: 15ms, Biaya Token: Rp 0)
   └── Jika Baru (Cache Miss):
         └── Teruskan ke API eksternal -> Simpan hasil ke cache lokal
```

* **Deduplikasi Konteks:** Jika Anda mengubah warna atau ukuran teks pada scene yang sama, sistem tidak mengirimkan ulang keseluruhan berkas proyek ke API. Hanya perubahan (diff) yang dikirimkan.
* **Penghematan Nyata:** Pada pengujian alur kerja editing harian, teknologi ini terbukti memangkas pemborosan token hingga 92%. Pengguna dapat memantau angka penghematan token ini secara langsung pada bilah **Token Saver** di sidebar kanan.

---

## Jaminan Keamanan dan Privasi Kunci API

1. Seluruh kunci API yang dimasukkan disimpan secara lokal di `localStorage` peramban desktop pengguna.
2. Kunci API hanya digunakan saat melakukan pemanggilan langsung dari komputer pengguna ke endpoint resmi penyedia model (misal `api.anthropic.com` atau `generativelanguage.googleapis.com`).
3. Quantum Studio tidak memiliki server proksi perantara dan tidak mengumpulkan telemetri data kunci pengguna.
