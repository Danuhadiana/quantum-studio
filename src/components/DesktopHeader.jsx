import React from 'react';
import { 
  Key, Minus, Square, X, ShieldCheck, 
  Settings, HelpCircle, HardDrive, RefreshCw
} from 'lucide-react';
import ClockLogo from './ClockLogo';
import UpdateNotificationPill from './UpdateNotificationPill';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  onOpenLicenseModal, 
  onOpenSettingsModal 
}) {
  const triggerCheckUpdate = () => {
    window.dispatchEvent(new CustomEvent('qtm:trigger-test-update'));
  };

  return (
    <header className="h-10 bg-[#09090b] border-b border-[#222226] flex items-center justify-between px-3 select-none text-xs text-neutral-300">
      
      {/* Left: Window Menu & Brand */}
      <div className="flex items-center gap-3">
        {/* Custom Window Dots */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#222226]">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 hover:bg-rose-500 transition-colors cursor-pointer" title="Tutup"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 hover:bg-amber-500 transition-colors cursor-pointer" title="Perkecil"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-700 hover:bg-emerald-500 transition-colors cursor-pointer" title="Perbesar"></div>
        </div>

        {/* Brand Logo with Clock Icon (Kuning Menuju Gelap) */}
        <div className="flex items-center gap-2">
          <ClockLogo size={20} />
          <span className="font-extrabold text-[13px] tracking-tight text-white">
            Quantum<span className="text-[#facc15] font-light">Studio</span>
          </span>
          <button
            onClick={triggerCheckUpdate}
            title="Klik untuk memeriksa pembaruan versi"
            className="text-[10px] font-mono text-neutral-400 hover:text-white bg-[#121216] hover:bg-[#1c1c21] px-1.5 py-0.5 rounded border border-[#27272a] transition-colors cursor-pointer"
          >
            v1.0.0
          </button>
        </div>

        {/* Studio Quick Menus (After Effects / CapCut Desktop Style) */}
        <div className="hidden md:flex items-center gap-3 text-neutral-400 text-[11px] font-medium ml-2">
          <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]">File</span>
          <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]">Edit</span>
          <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]">Composition</span>
          <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]">Timeline</span>
          <span className="hover:text-white cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]">View</span>
          <span 
            onClick={triggerCheckUpdate}
            className="hover:text-[#facc15] cursor-pointer transition-colors px-1 py-0.5 rounded hover:bg-[#18181b]" 
            title="Periksa update versi software"
          >
            Cek Update
          </span>
        </div>
      </div>

      {/* Center: Current Project Info & Live Flash Update Pill */}
      <div className="flex items-center gap-2">
        <UpdateNotificationPill currentVersion="1.0.0" />
        
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-[#121216] px-3 py-1 rounded-md border border-[#222226]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-neutral-200">BrandIntro_4K_60FPS.qtm</span>
          <span className="text-neutral-500">(Tersimpan Lokal)</span>
        </div>
      </div>

      {/* Right: License Status & Actions */}
      <div className="flex items-center gap-2">
        
        {/* License Pill Indicator */}
        {isPro ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#121216] border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PRO LIFETIME</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLicenseModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-neutral-200 font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
            <span>Aktivasi Pro</span>
          </button>
        )}

        {/* Settings BYOA */}
        <button
          type="button"
          onClick={onOpenSettingsModal}
          title="Konfigurasi Kunci API (BYOA) & Ollama"
          className="p-1.5 rounded-md bg-[#121216] hover:bg-[#1f1f23] text-neutral-300 border border-[#27272a] transition-colors cursor-pointer"
          aria-label="Pengaturan API Keys"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Window Controls */}
        <div className="flex items-center text-neutral-400 pl-2 border-l border-[#222226]">
          <button className="p-1 hover:text-white hover:bg-[#18181b] rounded" aria-label="Minimize">
            <Minus className="w-3 h-3" />
          </button>
          <button className="p-1 hover:text-white hover:bg-[#18181b] rounded" aria-label="Maximize">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="p-1 hover:text-rose-400 hover:bg-[#18181b] rounded" aria-label="Close">
            <X className="w-3 h-3" />
          </button>
        </div>

      </div>

    </header>
  );
}
