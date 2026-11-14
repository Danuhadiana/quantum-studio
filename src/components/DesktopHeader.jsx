import React from 'react';
import { 
  Sparkles, Key, Lock, Minus, Square, X, ShieldCheck, 
  HelpCircle, Settings, Laptop, Layers 
} from 'lucide-react';

export default function DesktopHeader({ 
  isPro, 
  licenseKey, 
  onOpenLicenseModal, 
  onOpenSettingsModal 
}) {
  return (
    <header className="h-10 bg-[#0d121d] border-b border-studio-border flex items-center justify-between px-3 select-none text-xs">
      
      {/* Left: Window Menu & Brand */}
      <div className="flex items-center gap-3">
        {/* Custom Window Dots */}
        <div className="flex items-center gap-1.5 pr-2 border-r border-studio-border">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer"></div>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#ff5429] flex items-center justify-center font-black text-[10px] text-white">
            Q
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            quantum<span className="text-[#ff5429]">.</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 bg-studio-panel px-1.5 py-0.5 rounded border border-studio-border">
            v1.0.0-beta
          </span>
        </div>

        {/* Studio Quick Menus */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 text-[11px] font-medium ml-2">
          <span className="hover:text-white cursor-pointer transition-colors">File</span>
          <span className="hover:text-white cursor-pointer transition-colors">Edit</span>
          <span className="hover:text-white cursor-pointer transition-colors">Timeline</span>
          <span className="hover:text-white cursor-pointer transition-colors">Agent</span>
          <span className="hover:text-white cursor-pointer transition-colors">Export</span>
        </div>
      </div>

      {/* Right: License Status & Actions */}
      <div className="flex items-center gap-2">
        
        {/* License Pill Indicator */}
        {isPro ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-[10px]">
            <ShieldCheck className="w-3 h-3" />
            <span>PRO LIFETIME ACTIVE</span>
          </div>
        ) : (
          <button
            onClick={onOpenLicenseModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-950/50 hover:bg-orange-900/60 border border-[#ff5429]/40 text-[#ff5429] font-bold text-[10px] transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#ff5429]" />
            <span>Upgrade to Pro</span>
          </button>
        )}

        {/* Settings BYOA */}
        <button
          onClick={onOpenSettingsModal}
          title="Konfigurasi API Key & Local Ollama"
          className="p-1.5 rounded-lg bg-studio-panel hover:bg-slate-800 text-slate-300 border border-studio-border transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Window Controls */}
        <div className="flex items-center text-slate-400 pl-2 border-l border-studio-border">
          <button className="p-1 hover:text-white hover:bg-slate-800 rounded">
            <Minus className="w-3 h-3" />
          </button>
          <button className="p-1 hover:text-white hover:bg-slate-800 rounded">
            <Square className="w-2.5 h-2.5" />
          </button>
          <button className="p-1 hover:text-rose-400 hover:bg-rose-950/40 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>

      </div>

    </header>
  );
}
