import React, { useState } from 'react';
import { 
  Minus, Square, X, ShieldCheck, 
  Settings, RefreshCw, Cpu, Film, Terminal,
  ChevronDown, HelpCircle, HardDrive, Download,
  Layers, Scissors, Play, Pause, ExternalLink
} from 'lucide-react';
import UpdateNotificationPill from './UpdateNotificationPill';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  activeTab, 
  onSelectTab,
  onImportMedia,
  onSplitClip,
  onTogglePlay,
  projectTitle = "Quantum Studio - Project 1",
  setProjectTitle
}) {
  const [openMenu, setOpenMenu] = useState(false);

  const triggerCheckUpdate = () => {
    window.dispatchEvent(new CustomEvent('qtm:trigger-test-update'));
  };

  return (
    <header className="h-9 bg-[#111215] border-b border-[#202126] flex items-center justify-between px-3 select-none text-xs text-zinc-300 shrink-0 z-40 font-sans">
      
      {/* 1. LEFT: CAPCUT LOGO + MENU DROPDOWN + AUTO-SAVE STATUS */}
      <div className="flex items-center gap-3">
        {/* Brand Icon (CapCut / Quantum Style) */}
        <div 
          onClick={() => onSelectTab('player')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-5 h-5 rounded-md bg-[#00e5ff] text-zinc-950 flex items-center justify-center font-black text-[12px] shadow-sm">
            Q
          </div>
          <span className="font-extrabold text-[12.5px] tracking-tight text-white">
            CapCut<span className="text-[#00e5ff] font-light">Pro</span>
          </span>
        </div>

        {/* Menu Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(!openMenu)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#1a1b20] hover:bg-[#24252c] border border-[#2c2d36] text-[11px] text-zinc-200 transition-colors cursor-pointer"
          >
            <span>Menu</span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {openMenu && (
            <div 
              onMouseLeave={() => setOpenMenu(false)}
              className="absolute left-0 top-full mt-1 w-52 bg-[#18191e] border border-[#2b2c36] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
            >
              <button 
                onClick={() => { onImportMedia && onImportMedia(); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff] flex justify-between"
              >
                <span>Import File Media...</span>
                <span className="text-[10px] text-zinc-500 font-mono">Ctrl+I</span>
              </button>
              <button 
                onClick={() => { onSelectTab('export'); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff] flex justify-between"
              >
                <span>Export Video 4K...</span>
                <span className="text-[10px] text-zinc-500 font-mono">Ctrl+E</span>
              </button>
              <div className="my-1 border-t border-[#262730]"></div>
              <button 
                onClick={() => { onSelectTab('aihub'); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff]"
              >
                Multi-AI Hub (BYOA)
              </button>
              <button 
                onClick={() => { onSelectTab('settings'); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff]"
              >
                Preferences (Pengaturan)
              </button>
              <button 
                onClick={() => { onSelectTab('license'); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff]"
              >
                Lisensi &amp; Akun Pro
              </button>
              <div className="my-1 border-t border-[#262730]"></div>
              <button 
                onClick={() => { triggerCheckUpdate(); setOpenMenu(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#252732] hover:text-[#00e5ff]"
              >
                Cek Pembaruan Versi...
              </button>
            </div>
          )}
        </div>

        {/* Auto Save Status */}
        <span className="text-[10.5px] text-zinc-500 hidden sm:inline-block font-mono">
          Auto save local at 18:30:29
        </span>
      </div>

      {/* 2. CENTER: PROJECT TITLE */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle && setProjectTitle(e.target.value)}
          className="bg-transparent text-center text-xs font-medium text-zinc-300 hover:text-white focus:text-white focus:bg-[#1a1b20] px-2 py-0.5 rounded border border-transparent focus:border-[#2b2c36] focus:outline-none transition-colors"
        />
        <UpdateNotificationPill currentVersion="1.0.1" />
      </div>

      {/* 3. RIGHT: SHORTCUT, PRO STATUS, EXPORT BUTTON, WINDOW CONTROLS */}
      <div className="flex items-center gap-2">
        
        {/* Layout Presets */}
        <button
          onClick={() => onSelectTab('aihub')}
          title="Multi-AI Hub (Gemini, Claude, GPT, DeepSeek, Ollama)"
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeTab === 'aihub' ? 'bg-[#22242c] text-[#00e5ff]' : 'hover:bg-[#1a1b20] text-zinc-400 hover:text-white'}`}
        >
          AI Studio
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          title="Preferences & Settings"
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#22242c] text-[#00e5ff]' : 'hover:bg-[#1a1b20] text-zinc-400 hover:text-white'}`}
        >
          Settings
        </button>

        {/* Pro Badge */}
        {isPro ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#102418] border border-emerald-600/40 text-emerald-400 font-bold text-[10.5px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>PRO</span>
          </div>
        ) : (
          <button
            onClick={() => onSelectTab('license')}
            className="px-2 py-0.5 rounded bg-[#2b2210] hover:bg-[#3d3016] border border-amber-500/40 text-amber-300 font-bold text-[10.5px] transition-colors"
          >
            Upgrade Pro
          </button>
        )}

        {/* EXPORT BUTTON (CapCut Signature Bright Cyan Button) */}
        <button
          onClick={() => onSelectTab('export')}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00e5ff] hover:bg-[#33ebff] text-zinc-950 font-extrabold text-[11.5px] shadow-md transition-all active:scale-95 cursor-pointer ml-1"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Export</span>
        </button>

        {/* Window Control Dots */}
        <div className="flex items-center ml-2 border-l border-[#262730] pl-2 gap-1.5 text-zinc-500">
          <div className="w-3 h-3 flex items-center justify-center hover:text-white cursor-pointer" title="Minimize">
            <Minus className="w-3 h-3" />
          </div>
          <div className="w-3 h-3 flex items-center justify-center hover:text-white cursor-pointer" title="Maximize">
            <Square className="w-2.5 h-2.5" />
          </div>
          <div className="w-3 h-3 flex items-center justify-center hover:text-rose-400 cursor-pointer" title="Close">
            <X className="w-3 h-3" />
          </div>
        </div>

      </div>

    </header>
  );
}
