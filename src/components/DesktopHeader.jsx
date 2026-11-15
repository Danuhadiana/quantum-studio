import React from 'react';
import { 
  Key, Minus, Square, X, ShieldCheck, 
  Settings, HelpCircle, HardDrive, RefreshCw,
  Cpu, Film, Terminal, Sparkles
} from 'lucide-react';
import ClockLogo from './ClockLogo';
import UpdateNotificationPill from './UpdateNotificationPill';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  activeTab, 
  onSelectTab 
}) {
  const triggerCheckUpdate = () => {
    window.dispatchEvent(new CustomEvent('qtm:trigger-test-update'));
  };

  return (
    <header className="h-9 bg-[#09090b] border-b border-[#1c1d22] flex items-center justify-between px-3 select-none text-xs text-zinc-300 shrink-0 z-30">
      
      {/* Left: Window Dots & Brand & Menus */}
      <div className="flex items-center gap-3">
        {/* Custom Window Dots */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#1c1d22]">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-rose-500 transition-colors cursor-pointer" title="Tutup"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-amber-500 transition-colors cursor-pointer" title="Perkecil"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-emerald-500 transition-colors cursor-pointer" title="Perbesar"></div>
        </div>

        {/* Brand Logo with Clock Icon (Minimalist After Effects Dark Gold) */}
        <div 
          onClick={() => onSelectTab && onSelectTab('player')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <ClockLogo size={18} />
          <span className="font-extrabold text-[12px] tracking-tight text-white">
            Quantum<span className="text-amber-400 font-light">Studio</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerCheckUpdate();
            }}
            title="Klik untuk memeriksa pembaruan versi"
            className="text-[10px] font-mono text-zinc-400 hover:text-white bg-[#121316] hover:bg-[#1a1b20] px-1.5 py-0.2 rounded border border-[#23242a] transition-colors cursor-pointer"
          >
            v1.0.1
          </button>
        </div>

        {/* VS Code / After Effects Quick Menus */}
        <div className="hidden md:flex items-center gap-1 text-zinc-400 text-[11px] font-medium ml-2">
          <button
            onClick={() => onSelectTab && onSelectTab('player')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'player' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#14151a]'}`}
          >
            Composition
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('code')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'code' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#14151a]'}`}
          >
            Script
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('aihub')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'aihub' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#14151a]'}`}
          >
            Multi-AI Hub
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('export')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'export' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#14151a]'}`}
          >
            Render Queue
          </button>
          <button
            onClick={() => onSelectTab && onSelectTab('settings')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'settings' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#14151a]'}`}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* Center: Current Composition Info & Live Flash Update Pill */}
      <div className="flex items-center gap-2">
        <UpdateNotificationPill currentVersion="1.0.1" />
        
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-400 bg-[#121316] px-2.5 py-0.5 rounded border border-[#1e1f25]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-200">BrandIntro_4K.tsx</span>
          <span className="text-zinc-500">(60 FPS Remotion)</span>
        </div>
      </div>

      {/* Right: License Status & Navigation Buttons (Zero Modal) */}
      <div className="flex items-center gap-2">
        
        {/* License Pill */}
        {isPro ? (
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('license')}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#121316] border border-emerald-500/30 text-emerald-400 font-bold text-[10px] hover:bg-[#18191f] transition-colors cursor-pointer"
            title="Lihat Detail Lisensi Pro Seumur Hidup"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PRO LIFETIME</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('license')}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#14151a] hover:bg-[#1f2026] border border-[#23242a] text-zinc-200 font-semibold text-[10px] transition-colors cursor-pointer"
            title="Buka Halaman Aktivasi Pro"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Aktivasi Pro</span>
          </button>
        )}

        {/* Multi-AI Hub Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('aihub')}
          title="Buka Halaman Multi-AI &amp; BYOA Engine"
          className={`p-1.5 rounded bg-[#121316] border text-zinc-300 transition-colors cursor-pointer ${activeTab === 'aihub' ? 'border-amber-400 text-amber-400' : 'border-[#23242a] hover:bg-[#1a1b20]'}`}
          aria-label="Multi-AI Hub"
        >
          <Cpu className="w-3.5 h-3.5" />
        </button>

        {/* Settings Full-Page Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab && onSelectTab('settings')}
          title="Buka Pengaturan Studio (VS Code Preferences)"
          className={`p-1.5 rounded bg-[#121316] border text-zinc-300 transition-colors cursor-pointer ${activeTab === 'settings' ? 'border-amber-400 text-amber-400' : 'border-[#23242a] hover:bg-[#1a1b20]'}`}
          aria-label="Pengaturan"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

      </div>

    </header>
  );
}
