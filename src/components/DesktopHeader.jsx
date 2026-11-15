import React, { useState } from 'react';
import { 
  Minus, Square, X, ShieldCheck, 
  Settings, RefreshCw, Cpu, Film, Terminal,
  ChevronDown, HelpCircle, HardDrive, Download,
  Layers, Scissors, Play, Pause, ExternalLink, Code
} from 'lucide-react';
import ClockLogo from './ClockLogo';
import UpdateNotificationPill from './UpdateNotificationPill';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  activeTab, 
  onSelectTab,
  onImportMedia,
  onSplitClip,
  onTogglePlay,
  projectTitle = "BrandIntro_4K_60FPS.qtm",
  setProjectTitle
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'file', 'edit', 'composition', 'view', 'help'

  const triggerCheckUpdate = () => {
    window.dispatchEvent(new CustomEvent('qtm:trigger-test-update'));
  };

  const handleMenuClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  return (
    <header className="h-9 bg-[#09090b] border-b border-[#1c1d22] flex items-center justify-between px-3 select-none text-xs text-zinc-300 shrink-0 z-40 font-sans">
      
      {/* 1. LEFT: WINDOW DOTS + BRAND QUANTUM STUDIO (CLOCK LOGO) + QUICK MENUS */}
      <div className="flex items-center gap-3">
        {/* Custom Window Dots */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#1c1d22]">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-rose-500 transition-colors cursor-pointer" title="Tutup"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-amber-500 transition-colors cursor-pointer" title="Perkecil"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-emerald-500 transition-colors cursor-pointer" title="Perbesar"></div>
        </div>

        {/* Brand Logo with Clock Icon (Quantum Studio) */}
        <div 
          onClick={() => { onSelectTab('player'); handleCloseMenu(); }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <ClockLogo size={18} />
          <span className="font-extrabold text-[12.5px] tracking-tight text-white">
            Quantum<span className="text-[#facc15] font-light">Studio</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerCheckUpdate();
            }}
            title="Klik untuk memeriksa pembaruan versi software"
            className="text-[10px] font-mono text-zinc-400 hover:text-white bg-[#121316] hover:bg-[#1a1b20] px-1.5 py-0.2 rounded border border-[#23242a] transition-colors cursor-pointer"
          >
            v1.0.1
          </button>
        </div>

        {/* Studio Menus (File, Edit, Composition, Timeline, View, Help) */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-medium text-zinc-400 relative">
          
          {/* FILE MENU */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('file')}
              className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'file' ? 'bg-[#181920] text-white' : 'hover:text-white hover:bg-[#121316]'}`}
            >
              File
            </button>
            {openMenu === 'file' && (
              <div 
                onMouseLeave={handleCloseMenu}
                className="absolute left-0 top-full mt-1 w-52 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
              >
                <button 
                  onClick={() => { onImportMedia && onImportMedia(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-[#facc15] flex justify-between"
                >
                  <span>Import Media (Foto/Video)...</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+I</span>
                </button>
                <button 
                  onClick={() => { onSelectTab('export'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-[#facc15] flex justify-between"
                >
                  <span>Export 4K Video...</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+E</span>
                </button>
                <div className="my-1 border-t border-[#1e1f26]"></div>
                <button 
                  onClick={() => { onSelectTab('settings'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-[#facc15]"
                >
                  Preferences (Pengaturan)...
                </button>
              </div>
            )}
          </div>

          {/* EDIT MENU */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('edit')}
              className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'edit' ? 'bg-[#181920] text-white' : 'hover:text-white hover:bg-[#121316]'}`}
            >
              Edit
            </button>
            {openMenu === 'edit' && (
              <div 
                onMouseLeave={handleCloseMenu}
                className="absolute left-0 top-full mt-1 w-52 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
              >
                <button 
                  onClick={() => { onSplitClip && onSplitClip(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-[#facc15] flex justify-between"
                >
                  <span>Split Clip (Cut Frame)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+B</span>
                </button>
                <button 
                  onClick={() => { onTogglePlay && onTogglePlay(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-[#facc15] flex justify-between"
                >
                  <span>Play / Pause</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Space</span>
                </button>
              </div>
            )}
          </div>

          {/* QUICK TAB SWITCHERS */}
          <button
            onClick={() => onSelectTab('player')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'player' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#121316]'}`}
          >
            Composition
          </button>

          <button
            onClick={() => onSelectTab('code')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'code' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#121316]'}`}
          >
            Script
          </button>

          <button
            onClick={() => onSelectTab('aihub')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'aihub' ? 'text-[#facc15] bg-[#14151a]' : 'hover:text-white hover:bg-[#121316]'}`}
          >
            Multi-AI Hub
          </button>

          <button
            onClick={() => onSelectTab('export')}
            className={`px-2 py-0.5 rounded transition-colors ${activeTab === 'export' ? 'text-white bg-[#14151a]' : 'hover:text-white hover:bg-[#121316]'}`}
          >
            Render Queue
          </button>

          <button
            onClick={triggerCheckUpdate}
            className="px-2 py-0.5 rounded text-zinc-400 hover:text-[#facc15] hover:bg-[#121316] transition-colors"
          >
            Cek Update
          </button>

        </div>
      </div>

      {/* 2. CENTER: CURRENT COMPOSITION / PROJECT INFO & FLASH UPDATE PILL */}
      <div className="flex items-center gap-2">
        <UpdateNotificationPill currentVersion="1.0.1" />

        <div className="hidden lg:flex items-center gap-2 text-[10.5px] font-mono text-zinc-400 bg-[#121316] px-2.5 py-0.5 rounded border border-[#1e1f25]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-zinc-200">{projectTitle}</span>
          <span className="text-zinc-500">(60 FPS Remotion)</span>
        </div>
      </div>

      {/* 3. RIGHT: PRO STATUS, EXPORT BUTTON & PREFERENCES */}
      <div className="flex items-center gap-2">
        
        {/* Pro Status */}
        {isPro ? (
          <button
            onClick={() => onSelectTab('license')}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#102418] border border-emerald-600/40 text-emerald-400 font-bold text-[10.5px] hover:bg-[#163321] transition-colors cursor-pointer"
            title="Status Lisensi Pro Seumur Hidup"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PRO LIFETIME</span>
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('license')}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#181920] hover:bg-[#23242c] border border-[#272832] text-zinc-200 font-semibold text-[10.5px] transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
            <span>Aktivasi Pro</span>
          </button>
        )}

        {/* Multi-AI Hub Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab('aihub')}
          title="Buka Halaman Multi-AI Hub (Gemini, Claude, GPT, DeepSeek, Ollama)"
          className={`p-1.5 rounded bg-[#121316] border text-zinc-300 transition-colors cursor-pointer ${
            activeTab === 'aihub' ? 'border-[#facc15] text-[#facc15]' : 'border-[#23242a] hover:bg-[#1a1b20]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
        </button>

        {/* Settings Full-Page Shortcut */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          title="Buka Pengaturan Studio (Preferences)"
          className={`p-1.5 rounded bg-[#121316] border text-zinc-300 transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'border-[#facc15] text-[#facc15]' : 'border-[#23242a] hover:bg-[#1a1b20]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Export Queue Button */}
        <button
          type="button"
          onClick={() => onSelectTab('export')}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#facc15] hover:bg-[#fde047] text-zinc-950 font-extrabold text-[11px] shadow transition-all active:scale-95 cursor-pointer ml-1"
        >
          <Download className="w-3 h-3 stroke-[2.5]" />
          <span>Export 4K</span>
        </button>

      </div>

    </header>
  );
}
