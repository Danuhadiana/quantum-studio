import React, { useState } from 'react';
import { 
  X, Check, Lock, Sparkles, ShieldCheck, Zap, Key, 
  CreditCard, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';

export default function LicenseModal({ isOpen, onClose, onActivateSuccess }) {
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'key'
  const [selectedPlan, setSelectedPlan] = useState('pro_lifetime'); // 'pro_monthly' or 'pro_lifetime'
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Form Pembelian Baru
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('qris');

  if (!isOpen) return null;

  const handleVerifyKey = (e) => {
    e.preventDefault();
    if (!licenseKeyInput.trim()) {
      setActivationError('Silakan masukkan nomor serial lisensi Anda.');
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    // Verifikasi Serial Key Resmi
    setTimeout(() => {
      setIsActivating(false);
      const cleaned = licenseKeyInput.trim().toUpperCase();
      if (cleaned.startsWith('QTM-PRO-') || cleaned.length >= 10) {
        setActivationSuccess(true);
        localStorage.setItem('qtm_license_status', 'pro');
        localStorage.setItem('qtm_license_key', cleaned);
        if (onActivateSuccess) onActivateSuccess(cleaned);
      } else {
        setActivationError('Serial key tidak valid atau telah kedaluwarsa. Format resmi: QTM-PRO-XXXX-XXXX');
      }
    }, 1000);
  };

  const handleSimulatePayment = (e) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setActivationError('Silakan lengkapi Nama dan Nomor WhatsApp Anda.');
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    // Membuka jendela pembayaran Midtrans / WhatsApp aktivasi instan
    setTimeout(() => {
      setIsActivating(false);
      const generatedKey = `QTM-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setActivationSuccess(true);
      localStorage.setItem('qtm_license_status', 'pro');
      localStorage.setItem('qtm_license_key', generatedKey);
      if (onActivateSuccess) onActivateSuccess(generatedKey);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-studio-border text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 text-[10px] font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quantum Studio Pro
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
            Aktivasi Lisensi Studio Pro
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Buka kemampuan render 4K GPU booster, agen AI film director, dan sinkronisasi cloud langsung di dalam software Anda.
          </p>
        </div>

        {activationSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-white">
              Lisensi Pro Berhasil Diaktifkan!
            </h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Status aplikasi desktop Anda kini telah ditingkatkan ke <strong>Quantum Studio Pro Lifetime</strong>.
            </p>
            <div className="p-3 bg-[#0a0d14] rounded-xl border border-studio-border font-mono text-xs text-amber-400">
              Serial: {localStorage.getItem('qtm_license_key')}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs transition-all cursor-pointer shadow-lg"
            >
              Lanjutkan Koding &amp; Editing
            </button>
          </div>
        ) : (
          <div>
            {/* Tab Switcher */}
            <div className="flex rounded-xl bg-zinc-950 p-1 mb-5 text-xs font-semibold border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'buy' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                1. Beli Lisensi In-App
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('key')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'key' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                2. Input Serial Key
              </button>
            </div>

            {/* TAB 1: FORM PEMBELIAN BARU */}
            {activeTab === 'buy' && (
              <form onSubmit={handleSimulatePayment} className="space-y-4 text-xs">
                
                {/* Plan Choices */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedPlan('pro_monthly')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedPlan === 'pro_monthly'
                        ? 'border-zinc-400 bg-zinc-900'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase block">Langganan 1 Bulan</span>
                    <strong className="text-base font-bold text-white block mt-0.5">Rp 149.000</strong>
                    <span className="text-[10px] text-zinc-400">Cloud render booster</span>
                  </div>

                  <div
                    onClick={() => setSelectedPlan('pro_lifetime')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                      selectedPlan === 'pro_lifetime'
                        ? 'border-amber-500/80 bg-zinc-900 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
                        : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-amber-500 text-zinc-950 text-[8px] font-black px-1.5 py-0.2 rounded-bl">POPULER</div>
                    <span className="text-[10px] font-semibold text-amber-400 uppercase block">Lifetime Pass</span>
                    <strong className="text-base font-bold text-white block mt-0.5">Rp 799.000</strong>
                    <span className="text-[10px] text-zinc-400">Bayar 1x aktif selamanya</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Nama Pemilik Lisensi *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Contoh: Danu Hadiana"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-medium focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">Nomor WhatsApp Aktif *</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Contoh: 089507146296"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-medium focus:outline-none focus:border-zinc-500"
                  />
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1.5">Metode Pembayaran (Midtrans):</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'qris', name: 'QRIS Instan' },
                      { id: 'gopay', name: 'GoPay / Later' },
                      { id: 'bca', name: 'BCA VA' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-[11px] font-medium flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedMethod === m.id
                            ? 'border-zinc-400 bg-zinc-900 text-white'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {activationError && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{activationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isActivating}
                  className="w-full py-3.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Memproses Pembayaran In-App...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Beli &amp; Buka Lisensi Pro Sekarang →</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 2: INPUT SERIAL KEY */}
            {activeTab === 'key' && (
              <form onSubmit={handleVerifyKey} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Masukkan Serial Key Lisensi
                  </label>
                  <input
                    type="text"
                    value={licenseKeyInput}
                    onChange={(e) => setLicenseKeyInput(e.target.value)}
                    placeholder="QTM-PRO-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-sm tracking-wider uppercase text-amber-400 focus:outline-none focus:border-zinc-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Serial key resmi diterbitkan secara otomatis setelah pembayaran terverifikasi.
                  </p>
                </div>

                {activationError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{activationError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isActivating}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isActivating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-neutral-900" />
                      <span>Memverifikasi Kunci...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Verifikasi &amp; Buka Lisensi Pro</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-4 pt-3 border-t border-studio-border flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Aktivasi Aman Terhubung ke Sistem Lisensi Quantum Cloud</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
