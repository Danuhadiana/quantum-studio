import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Key, Check, Zap, Sparkles, CreditCard, 
  ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Lock, 
  Laptop, HardDrive, Film, Award, Cpu
} from 'lucide-react';

export default function LicenseView({ isPro, licenseKey, onActivateSuccess, onSwitchToPlayer }) {
  const [activeTab, setActiveTab] = useState('activate'); // 'activate' or 'purchase'
  const [keyInput, setKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form Pembelian Baru Langsung di Halaman (Zero Popup)
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('pro_lifetime'); // 'pro_lifetime' | 'pro_annual'
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const handleVerifyKey = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMessage('Silakan masukkan nomor serial lisensi resmi Anda.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsVerifying(false);
      const cleaned = keyInput.trim().toUpperCase();
      if (cleaned.startsWith('QTM-PRO-') || cleaned.length >= 10) {
        setSuccessMessage('Lisensi Pro Berhasil Diaktifkan Seumur Hidup!');
        localStorage.setItem('qtm_license_status', 'pro');
        localStorage.setItem('qtm_license_key', cleaned);
        if (onActivateSuccess) onActivateSuccess(cleaned);
      } else {
        setErrorMessage('Format serial key tidak valid. Contoh resmi: QTM-PRO-XXXX-XXXX');
      }
    }, 900);
  };

  const handleSimulatePurchase = (e) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setErrorMessage('Lengkapi Nama dan Nomor WhatsApp aktif untuk pengiriman serial key.');
      return;
    }

    setIsProcessingOrder(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsProcessingOrder(false);
      const generatedKey = `QTM-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setSuccessMessage(`Pembayaran Terverifikasi! Lisensi Anda: ${generatedKey}`);
      localStorage.setItem('qtm_license_status', 'pro');
      localStorage.setItem('qtm_license_key', generatedKey);
      if (onActivateSuccess) onActivateSuccess(generatedKey);
    }, 1200);
  };

  return (
    <div className="h-full w-full bg-[#0c0d10] text-zinc-100 flex flex-col overflow-y-auto selection:bg-amber-400/20">
      
      {/* 1. TOP HEADER */}
      <div className="p-6 border-b border-[#1c1d22] bg-[#0f1013] shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30 text-amber-300">
                Pusat Lisensi &amp; Akun Studio
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Halaman Penuh (Bebas Popup Mengambang)
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Status &amp; Aktivasi Lisensi Quantum Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Kelola status kepemilikan lisensi komersial seumur hidup (Lifetime) atau aktivasi serial key baru.
            </p>
          </div>

          {onSwitchToPlayer && (
            <button
              onClick={onSwitchToPlayer}
              className="px-3.5 py-2 rounded-lg bg-[#18191d] hover:bg-[#222328] border border-[#27282e] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Kembali ke Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-6 space-y-6 flex-1">
        
        {/* 2. STATUS CARD SAAT INI */}
        <div className="p-6 rounded-2xl bg-[#121317] border border-[#202126] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider uppercase flex items-center gap-1.5 ${
                isPro 
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400' 
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              }`}>
                {isPro ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                {isPro ? 'LISENSI PRO AKTIF (LIFETIME)' : 'FREE COMMUNITY TIER'}
              </span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              {isPro ? 'Quantum Studio Pro Unlimited Edition' : 'Versi Gratis Komunitas (Free Plan)'}
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              {isPro
                ? `Terdaftar secara resmi dengan serial key ${licenseKey || 'QTM-PRO-LIFETIME'}. Anda memiliki akses penuh ke rendering 4K 60FPS tanpa watermark dan multi-LLM routing tanpa batas.`
                : 'Versi gratis memiliki watermark pada rendering resolusi di atas 1080p dan batas antrean render frame. Tingkatkan ke Pro Lifetime untuk kepemilikan permanen tanpa biaya langganan bulanan.'}
            </p>
          </div>

          <div className="p-4 bg-[#0c0d10] border border-[#1e1f24] rounded-xl text-xs font-mono space-y-1.5 shrink-0 min-w-[220px]">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Metadata Lisensi</div>
            <div className="text-zinc-300 flex justify-between">
              <span className="text-zinc-500">Device ID:</span>
              <span>QTM-WIN-982</span>
            </div>
            <div className="text-zinc-300 flex justify-between">
              <span className="text-zinc-500">Status Node:</span>
              <span className={isPro ? 'text-emerald-400' : 'text-zinc-400'}>{isPro ? 'Terverifikasi' : 'Belum Aktivasi'}</span>
            </div>
            <div className="text-zinc-300 flex justify-between">
              <span className="text-zinc-500">Masa Berlaku:</span>
              <span className="text-amber-400">{isPro ? 'Seumur Hidup' : 'Selamanya'}</span>
            </div>
          </div>
        </div>

        {/* 3. TAB NAVIGASI DALAM HALAMAN (AKTIVASI KEY VS BELI BARU) */}
        <div className="flex items-center gap-2 border-b border-[#1c1d22] pb-1 text-xs">
          <button
            onClick={() => setActiveTab('activate')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === 'activate'
                ? 'bg-[#121317] text-white border-t-2 border-amber-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Aktivasi Serial Key Resmi
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === 'purchase'
                ? 'bg-[#121317] text-white border-t-2 border-amber-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Beli Lisensi Baru (QRIS / Midtrans / WhatsApp)
          </button>
        </div>

        {/* NOTIFIKASI SUKSES / ERROR */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: FORM AKTIVASI SERIAL KEY */}
        {activeTab === 'activate' && (
          <div className="p-6 rounded-2xl bg-[#121317] border border-[#202126] space-y-4 max-w-xl">
            <div>
              <h3 className="text-sm font-bold text-white">Masukkan Serial Key Lisensi</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Ketikkan kode lisensi yang Anda peroleh melalui email konfirmasi pembelian atau invoice resmi.
              </p>
            </div>

            <form onSubmit={handleVerifyKey} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-300">Serial Key Lisensi (Format: QTM-PRO-XXXX-XXXX):</label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="QTM-PRO-ABCD-1234"
                    className="w-full px-3.5 py-2.5 bg-[#0c0d10] border border-[#222328] rounded-lg text-white font-mono text-xs placeholder-zinc-600 focus:outline-none focus:border-amber-400 uppercase tracking-wider"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" /> : <Key className="w-4 h-4" />}
                <span>{isVerifying ? 'Memvalidasi Lisensi...' : 'Aktifkan Lisensi Pro Sekarang'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FORM PEMBELIAN LISENSI BARU */}
        {activeTab === 'purchase' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Pilihan Paket */}
            <div className="p-6 rounded-2xl bg-[#121317] border border-[#202126] space-y-4">
              <h3 className="text-sm font-bold text-white">Pilih Paket Lisensi</h3>
              
              <div
                onClick={() => setSelectedPlan('pro_lifetime')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedPlan === 'pro_lifetime'
                    ? 'bg-[#181920] border-amber-400/60 shadow-lg'
                    : 'bg-[#0e0f13] border-[#222328] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">Pro Lifetime Edition</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-zinc-950 text-[10px] font-bold">TERPOPULER</span>
                </div>
                <div className="text-lg font-extrabold text-amber-400 mb-2">Rp 499.000 <span className="text-xs text-zinc-500 font-normal">/ sekali bayar</span></div>
                <p className="text-[11px] text-zinc-400">Kepemilikan seumur hidup, bebas update versi minor dan major, 4K rendering tanpa watermark.</p>
              </div>

              <div
                onClick={() => setSelectedPlan('pro_annual')}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedPlan === 'pro_annual'
                    ? 'bg-[#181920] border-amber-400/60 shadow-lg'
                    : 'bg-[#0e0f13] border-[#222328] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-sm">Pro Annual Pass</span>
                  <span className="text-[10px] text-zinc-500 font-mono">1 TAHUN</span>
                </div>
                <div className="text-lg font-extrabold text-white mb-2">Rp 249.000 <span className="text-xs text-zinc-500 font-normal">/ tahun</span></div>
                <p className="text-[11px] text-zinc-400">Akses Pro selama 12 bulan penuh dengan dukungan teknis prioritas.</p>
              </div>
            </div>

            {/* Form Data Pembeli */}
            <div className="p-6 rounded-2xl bg-[#121317] border border-[#202126] space-y-4">
              <h3 className="text-sm font-bold text-white">Data Pembeli &amp; Checkout</h3>
              
              <form onSubmit={handleSimulatePurchase} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300">Nama Lengkap:</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full px-3 py-2 bg-[#0c0d10] border border-[#222328] rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300">Email untuk Penerimaan Invoice:</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="nama@domain.com"
                    className="w-full px-3 py-2 bg-[#0c0d10] border border-[#222328] rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-300">Nomor WhatsApp (Pengiriman Serial Key Cepat):</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-[#0c0d10] border border-[#222328] rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessingOrder}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-4"
                >
                  {isProcessingOrder ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" /> : <CreditCard className="w-4 h-4" />}
                  <span>{isProcessingOrder ? 'Memproses Pesanan...' : 'Bayar Sekarang (QRIS / Instant)'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 4. PERBANDINGAN FITUR (TABEL RESMI) */}
        <div className="p-6 rounded-2xl bg-[#121317] border border-[#202126] space-y-4">
          <h3 className="text-sm font-bold text-white">Perbandingan Kemampuan Edisi</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#202126] text-zinc-400 font-mono text-[11px]">
                  <th className="py-2.5 pr-4">Fitur Studio</th>
                  <th className="py-2.5 px-4">Free Community</th>
                  <th className="py-2.5 px-4 text-amber-400">Pro Lifetime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1d22] text-zinc-300">
                <tr>
                  <td className="py-2.5 pr-4 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Resolusi Rendering Maksimal</span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">1080p (Watermarked di atasnya)</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">4K UHD 60 FPS (Bebas Watermark)</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Multi-LLM BYOA Engine</span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-400">Gemini &amp; Ollama</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">Semua AI (Gemini, Claude, GPT, DeepSeek, Groq)</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Akselerasi GPU WebCodecs</span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">Standar CPU</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">Akselerasi Perangkat Keras Penuh</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Hak Lisensi Komersial</span>
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">Non-Komersial / Pribadi</td>
                  <td className="py-2.5 px-4 text-emerald-400 font-bold">Komersial Penuh (Monetisasi &amp; Klien)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
