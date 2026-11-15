import React, { useState } from 'react';
import { 
  Minus, Square, X, ShieldCheck, 
  Settings, RefreshCw, Cpu, Film, Terminal,
  ChevronDown, HelpCircle, HardDrive
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
  onTogglePlay
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'file', 'edit', 'image', 'layer', 'view', 'window', 'help'

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
    <div className="flex flex-col select-none shrink-0 z-40 bg-[#2b2b2b] text-[#dcdcdc] border-b border-[#1c1c1c]">
      
      {/* 1. TOP TITLEBAR & MAIN PHOTOSHOP MENU BAR */}
      <header className="h-7 bg-[#2b2b2b] flex items-center justify-between px-2 text-xs border-b border-[#202020]">
        
        {/* Left: Ps Logo & Menu List */}
        <div className="flex items-center gap-1">
          {/* Ps Icon (Photoshop Style Branding) */}
          <div 
            onClick={() => { onSelectTab('player'); handleCloseMenu(); }}
            className="w-5 h-5 rounded bg-[#001d34] border border-[#0094ff]/60 flex items-center justify-center text-[#00c8ff] font-black text-[11px] font-mono mr-1.5 cursor-pointer shadow-sm"
            title="Quantum Studio (Photoshop & Motion Edition)"
          >
            Ps
          </div>

          {/* Menus: File, Edit, Image, Layer, Type, Select, Filter, View, Window, Help */}
          <div className="flex items-center text-[11.5px] font-sans relative">
            
            {/* FILE MENU */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('file')}
                className={`px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors ${openMenu === 'file' ? 'bg-[#3879d9] text-white' : ''}`}
              >
                File
              </button>
              {openMenu === 'file' && (
                <div 
                  onMouseLeave={handleCloseMenu}
                  className="absolute left-0 top-full mt-0.5 w-56 bg-[#262626] border border-[#181818] rounded shadow-2xl py-1 text-[11.5px] z-50 text-[#dcdcdc]"
                >
                  <button 
                    onClick={() => { onImportMedia && onImportMedia(); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Import Media (Foto/Video)...</span>
                    <span className="text-[10px] text-zinc-400">Ctrl+O</span>
                  </button>
                  <button 
                    onClick={() => { onSelectTab('export'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Export Render 4K...</span>
                    <span className="text-[10px] text-zinc-400">Ctrl+M</span>
                  </button>
                  <div className="my-1 border-t border-[#383838]"></div>
                  <button 
                    onClick={() => { onSelectTab('settings'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Preferences (Pengaturan)...</span>
                    <span className="text-[10px] text-zinc-400">Ctrl+K</span>
                  </button>
                </div>
              )}
            </div>

            {/* EDIT MENU */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('edit')}
                className={`px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors ${openMenu === 'edit' ? 'bg-[#3879d9] text-white' : ''}`}
              >
                Edit
              </button>
              {openMenu === 'edit' && (
                <div 
                  onMouseLeave={handleCloseMenu}
                  className="absolute left-0 top-full mt-0.5 w-52 bg-[#262626] border border-[#181818] rounded shadow-2xl py-1 text-[11.5px] z-50 text-[#dcdcdc]"
                >
                  <button 
                    onClick={() => { onSplitClip && onSplitClip(); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Cut Frame (Split Clip)</span>
                    <span className="text-[10px] text-zinc-400">Ctrl+B</span>
                  </button>
                  <button 
                    onClick={() => { onTogglePlay && onTogglePlay(); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Play / Pause</span>
                    <span className="text-[10px] text-zinc-400">Space</span>
                  </button>
                </div>
              )}
            </div>

            {/* IMAGE MENU */}
            <button className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors">
              Image
            </button>

            {/* LAYER MENU */}
            <button className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors">
              Layer
            </button>

            {/* TYPE MENU */}
            <button className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors">
              Type
            </button>

            {/* SELECT MENU */}
            <button className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors">
              Select
            </button>

            {/* FILTER MENU */}
            <button className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors">
              Filter
            </button>

            {/* VIEW MENU */}
            <button 
              onClick={() => onSelectTab('player')}
              className="px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors"
            >
              View
            </button>

            {/* WINDOW MENU */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('window')}
                className={`px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors ${openMenu === 'window' ? 'bg-[#3879d9] text-white' : ''}`}
              >
                Window
              </button>
              {openMenu === 'window' && (
                <div 
                  onMouseLeave={handleCloseMenu}
                  className="absolute left-0 top-full mt-0.5 w-48 bg-[#262626] border border-[#181818] rounded shadow-2xl py-1 text-[11.5px] z-50 text-[#dcdcdc]"
                >
                  <button 
                    onClick={() => { onSelectTab('player'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>✓ Timeline &amp; Canvas</span>
                  </button>
                  <button 
                    onClick={() => { onSelectTab('aihub'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Multi-AI Engine Hub</span>
                  </button>
                  <button 
                    onClick={() => { onSelectTab('export'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Render Queue</span>
                  </button>
                  <button 
                    onClick={() => { onSelectTab('license'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white flex justify-between"
                  >
                    <span>Account &amp; Lisensi</span>
                  </button>
                </div>
              )}
            </div>

            {/* HELP MENU */}
            <div className="relative">
              <button
                onClick={() => handleMenuClick('help')}
                className={`px-2 py-0.5 rounded-sm hover:bg-[#3879d9] hover:text-white transition-colors ${openMenu === 'help' ? 'bg-[#3879d9] text-white' : ''}`}
              >
                Help
              </button>
              {openMenu === 'help' && (
                <div 
                  onMouseLeave={handleCloseMenu}
                  className="absolute left-0 top-full mt-0.5 w-52 bg-[#262626] border border-[#181818] rounded shadow-2xl py-1 text-[11.5px] z-50 text-[#dcdcdc]"
                >
                  <button 
                    onClick={() => { triggerCheckUpdate(); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white"
                  >
                    Cek Pembaruan Versi...
                  </button>
                  <button 
                    onClick={() => { onSelectTab('license'); handleCloseMenu(); }}
                    className="w-full text-left px-3 py-1 hover:bg-[#3879d9] hover:text-white"
                  >
                    Tentang Lisensi Quantum Studio
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: Workspace Switcher (Essentials) & Window Controls */}
        <div className="flex items-center gap-2">
          
          <UpdateNotificationPill currentVersion="1.0.1" />

          {/* Workspace Presets (Photoshop Essentials Style) */}
          <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#383838] px-2 py-0.5 rounded text-[10.5px]">
            <button
              onClick={() => onSelectTab('player')}
              className={`px-1.5 py-0.2 rounded transition-colors ${activeTab === 'player' ? 'bg-[#3879d9] text-white font-medium' : 'hover:text-white'}`}
            >
              Essentials
            </button>
            <button
              onClick={() => onSelectTab('aihub')}
              className={`px-1.5 py-0.2 rounded transition-colors ${activeTab === 'aihub' ? 'bg-[#3879d9] text-white font-medium' : 'hover:text-white'}`}
            >
              AI Hub
            </button>
            <button
              onClick={() => onSelectTab('export')}
              className={`px-1.5 py-0.2 rounded transition-colors ${activeTab === 'export' ? 'bg-[#3879d9] text-white font-medium' : 'hover:text-white'}`}
            >
              Queue
            </button>
          </div>

          {/* Pro Status */}
          {isPro ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2b1a] border border-emerald-600/40 text-emerald-400 font-bold text-[10px] rounded">
              <ShieldCheck className="w-3 h-3" />
              <span>PRO</span>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('license')}
              className="px-2 py-0.5 bg-[#332b1a] hover:bg-[#4a3e26] border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded transition-colors"
            >
              Beli Pro
            </button>
          )}

          {/* Window Control Buttons */}
          <div className="flex items-center ml-2 border-l border-[#3a3a3a] pl-2 gap-1 text-zinc-400">
            <div className="w-3.5 h-3.5 flex items-center justify-center hover:text-white cursor-pointer" title="Minimize">
              <Minus className="w-3 h-3" />
            </div>
            <div className="w-3.5 h-3.5 flex items-center justify-center hover:text-white cursor-pointer" title="Maximize">
              <Square className="w-2.5 h-2.5" />
            </div>
            <div className="w-3.5 h-3.5 flex items-center justify-center hover:text-rose-400 cursor-pointer" title="Close">
              <X className="w-3 h-3" />
            </div>
          </div>

        </div>

      </header>

      {/* 2. PHOTOSHOP OPTIONS BAR (SUB-HEADER UNDER MENU) */}
      <div className="h-6 bg-[#323232] border-b border-[#202020] px-2 flex items-center justify-between text-[11px] text-[#b4b4b4]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className="text-zinc-400">Feather:</span>
            <span className="bg-[#262626] border border-[#3e3e3e] px-1.5 py-0.2 rounded text-white">0 px</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className="text-zinc-400">Anti-alias:</span>
            <input type="checkbox" defaultChecked className="accent-[#3879d9]" />
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className="text-zinc-400">Style:</span>
            <span className="bg-[#262626] border border-[#3e3e3e] px-1.5 py-0.2 rounded text-white">Normal</span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className="text-zinc-400">Mode:</span>
            <span className="bg-[#262626] border border-[#3e3e3e] px-1.5 py-0.2 rounded text-amber-400 font-semibold">Motion Video (60 FPS)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10.5px] font-mono text-zinc-400">
          <span>Target: <strong className="text-white">1920 × 1080 (16:9)</strong></span>
          <span className="text-zinc-600">|</span>
          <span>GPU Render: <strong className="text-emerald-400">Active</strong></span>
        </div>
      </div>

    </div>
  );
}
