import React, { useState } from 'react';
import { 
  Minus, Square, X, ShieldCheck, 
  Settings, RefreshCw, Cpu, Film, Terminal,
  ChevronDown, HelpCircle, HardDrive, Download,
  Layers, Scissors, Play, Pause, ExternalLink, Code
} from 'lucide-react';
import ClockLogo from './ClockLogo';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  activeTab, 
  onSelectTab,
  onImportMedia,
  onSplitClip,
  onTogglePlay,
  projectTitle = "Untitled Project",
  setProjectTitle
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'file', 'edit', 'view', 'help'

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
    <header className="h-8 bg-[#09090b] border-b border-[#1c1d22] flex items-center justify-between px-3 select-none text-xs text-zinc-300 shrink-0 z-40 font-sans">
      
      {/* 1. LEFT: MINIMALIST CLOCK LOGO + BRAND + INTEGRATED SINGLE MENU (NO MAC DOTS, NO VERSION) */}
      <div className="flex items-center gap-3">
        {/* Brand Logo with Minimalist Clock Icon */}
        <div 
          onClick={() => { onSelectTab('player'); handleCloseMenu(); }}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <ClockLogo size={16} />
          <span className="font-bold text-[12px] tracking-tight text-white">
            Quantum<span className="text-zinc-400 font-normal">Studio</span>
          </span>
        </div>

        {/* Integrated Studio Menu Dropdown (Clean, Like CapCut & Remotion) */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 relative">
          
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
                className="absolute left-0 top-full mt-1 w-48 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
              >
                <button 
                  onClick={() => { onImportMedia && onImportMedia(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white flex justify-between"
                >
                  <span>Import Media...</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+I</span>
                </button>
                <button 
                  onClick={() => { onSelectTab('export'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white flex justify-between"
                >
                  <span>Export Video...</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+E</span>
                </button>
                <div className="my-1 border-t border-[#1e1f26]"></div>
                <button 
                  onClick={() => { onSelectTab('settings'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white"
                >
                  Preferences...
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
                className="absolute left-0 top-full mt-1 w-48 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
              >
                <button 
                  onClick={() => { onSplitClip && onSplitClip(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white flex justify-between"
                >
                  <span>Split Clip (Cut)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Ctrl+B</span>
                </button>
                <button 
                  onClick={() => { onTogglePlay && onTogglePlay(); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white flex justify-between"
                >
                  <span>Play / Pause</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Space</span>
                </button>
              </div>
            )}
          </div>

          {/* VIEW MENU */}
          <div className="relative">
            <button
              onClick={() => handleMenuClick('view')}
              className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'view' ? 'bg-[#181920] text-white' : 'hover:text-white hover:bg-[#121316]'}`}
            >
              View
            </button>
            {openMenu === 'view' && (
              <div 
                onMouseLeave={handleCloseMenu}
                className="absolute left-0 top-full mt-1 w-44 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-[11.5px] z-50 text-zinc-200"
              >
                <button 
                  onClick={() => { onSelectTab('player'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white"
                >
                  Studio Viewport
                </button>
                <button 
                  onClick={() => { onSelectTab('code'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white"
                >
                  Script Editor (TSX)
                </button>
                <button 
                  onClick={() => { onSelectTab('aihub'); handleCloseMenu(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b1d24] hover:text-white"
                >
                  Multi-AI Hub
                </button>
              </div>
            )}
          </div>

          {/* Single Menu Action: Cek Update */}
          <button
            onClick={triggerCheckUpdate}
            className="px-2 py-0.5 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors"
          >
            Cek Update
          </button>
        </div>

        {/* Subtle Save Status */}
        <span className="text-[10px] text-zinc-500 font-mono hidden xl:inline">
          Tersimpan
        </span>
      </div>

      {/* 2. CENTER: CLEAN EDITABLE PROJECT TITLE ONLY (NO BRAND INTRO 4K, NO GREEN DOTS) */}
      <div className="flex items-center">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle && setProjectTitle(e.target.value)}
          placeholder="Untitled Project"
          className="bg-transparent text-center text-xs font-medium text-zinc-300 hover:text-white focus:text-white focus:bg-[#14151a] px-2 py-0.5 rounded border border-transparent focus:border-[#222329] focus:outline-none transition-colors w-48 sm:w-64 truncate"
        />
      </div>

      {/* 3. RIGHT: ESSENTIAL NAVIGATION PILLS, SETTINGS, EXPORT BUTTON & WINDOW CONTROLS */}
      <div className="flex items-center gap-2">
        
        {/* Clean Mode Switcher: Studio | AI Hub */}
        <div className="flex items-center bg-[#131417] p-0.5 rounded border border-[#1f2026] text-[10.5px]">
          <button
            onClick={() => onSelectTab('player')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'player' ? 'bg-[#1e2028] text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => onSelectTab('aihub')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'aihub' ? 'bg-[#1e2028] text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-white'
            }`}
          >
            AI Hub
          </button>
        </div>

        {/* Pro Status */}
        {isPro ? (
          <button
            onClick={() => onSelectTab('license')}
            className="px-2 py-0.5 rounded bg-[#102418] border border-emerald-600/30 text-emerald-400 font-bold text-[10px] hover:bg-[#163321] transition-colors cursor-pointer"
            title="Status Lisensi Pro Seumur Hidup"
          >
            PRO
          </button>
        ) : (
          <button
            onClick={() => onSelectTab('license')}
            className="px-2 py-0.5 rounded bg-[#16171b] hover:bg-[#202128] border border-[#272832] text-zinc-300 text-[10.5px] transition-colors cursor-pointer"
          >
            Pro
          </button>
        )}

        {/* Settings Icon */}
        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          title="Pengaturan Studio (Preferences)"
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            activeTab === 'settings' ? 'bg-[#1e2028] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* DEDICATED EXPORT BUTTON (CLEAN "Export" TEXT, NO "4K", OPENS EXPORT STUDIO) */}
        <button
          type="button"
          onClick={() => onSelectTab('export')}
          className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ml-1 ${
            activeTab === 'export'
              ? 'bg-zinc-200 text-zinc-950 font-bold shadow'
              : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
          }`}
          title="Buka Ruang Konfigurasi Ekspor Video"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Export</span>
        </button>

        {/* Standard Windows Controls */}
        <div className="flex items-center ml-2 border-l border-[#202126] pl-2 gap-1.5 text-zinc-500">
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
