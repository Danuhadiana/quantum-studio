import React, { useState } from 'react';
import { 
  Code2, Video, Layers, Terminal, Play, Pause, Scissors, 
  Sparkles, Sliders, Volume2, Type, Send, Key, Database,
  Cpu, Check, Download, Zap, RefreshCw, Maximize2, ShieldCheck
} from 'lucide-react';

export default function WorkstationView({ isPro, onOpenLicenseModal, onOpenSettingsModal }) {
  // Navigation tool
  const [activeTool, setActiveTool] = useState('code'); // 'code', 'timeline', 'media'
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [currentTime, setCurrentTime] = useState('00:01:24:18');

  // AI Agent Chat State
  const [activeAgent, setActiveAgent] = useState('motion'); // 'motion', 'code', 'whisper'
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      name: 'Motion Director AI',
      time: '01:10',
      text: 'Halo Danu! Semua modul Quantum Studio telah siap. Skrip animasi BrandIntroAnimation.jsx sudah terhubung ke Viewport 4K. Mau saya buatkan transisi logo atau subtitle Whisper otomatis?'
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setMessages(prev => [...prev, {
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    }]);
    setChatInput('');

    // Simulated Agent Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        sender: 'agent',
        name: activeAgent === 'motion' ? 'Motion Director AI' : (activeAgent === 'code' ? 'Code Architect' : 'Whisper Subtitle AI'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Perintah diterima: "${userText}". Kode animasi telah diperbarui di Editor dan disinkronkan ke Timeline Canvas (Hemat 1.250 token via Local Semantic Cache).`
      }]);
    }, 600);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#0a0d14] text-slate-200">
      
      {/* 1. LEFT NARROW TOOL STRIP */}
      <div className="w-12 bg-[#0d121d] border-r border-studio-border flex flex-col items-center justify-between py-3 select-none">
        <div className="space-y-3">
          <button
            onClick={() => setActiveTool('code')}
            title="Code & Scripting Editor"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'code'
                ? 'bg-[#ff5429] text-white shadow-[0_0_12px_rgba(255,84,41,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('timeline')}
            title="Video Timeline Studio"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'timeline'
                ? 'bg-[#ff5429] text-white shadow-[0_0_12px_rgba(255,84,41,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('media')}
            title="Asset & Media Pool"
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTool === 'media'
                ? 'bg-[#ff5429] text-white shadow-[0_0_12px_rgba(255,84,41,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={onOpenSettingsModal}
            title="API Keys (BYOA)"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CENTER WORKSTATION (VIEWPORT ATAS + EDITOR BAWAH) */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-studio-border">
        
        {/* VIEWPORT CANVAS (ATAS) */}
        <div className="h-[46%] bg-[#0f1422] border-b border-studio-border p-4 flex flex-col justify-between relative overflow-hidden">
          
          {/* Top Bar Viewport */}
          <div className="flex items-center justify-between text-xs z-10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                CANVAS ACTIVE (60 FPS)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{currentTime} / 00:03:00:00</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Aspect Ratio Switch */}
              <div className="flex rounded-lg bg-studio-panel border border-studio-border p-0.5 text-[11px] font-bold">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    aspectRatio === '16:9' ? 'bg-[#ff5429] text-white' : 'text-slate-400'
                  }`}
                >
                  16:9 Landscape
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    aspectRatio === '9:16' ? 'bg-[#ff5429] text-white' : 'text-slate-400'
                  }`}
                >
                  9:16 Shorts
                </button>
              </div>

              <span className="text-[10px] bg-studio-panel px-2 py-0.5 rounded border border-studio-border text-slate-400 font-mono">
                GPU ACCELERATED
              </span>
            </div>
          </div>

          {/* Canvas Display */}
          <div className="my-auto flex items-center justify-center relative">
            <div className={`transition-all duration-300 relative bg-neutral-950 rounded-xl border border-studio-border overflow-hidden flex flex-col justify-between p-4 shadow-2xl ${
              aspectRatio === '16:9' ? 'w-[460px] h-[210px]' : 'w-[140px] h-[210px]'
            }`}>
              {/* Animated Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff5429]/20 via-black to-amber-500/10 opacity-70"></div>
              
              <div className="relative z-10 flex justify-between text-[9px] font-mono text-slate-400">
                <span>4K RENDERING ENGINE</span>
                <span className="text-emerald-400">READY</span>
              </div>

              <div className="relative z-10 text-center my-auto">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center mb-1.5">
                  <Video className="w-5 h-5 text-[#ff5429]" />
                </div>
                <h5 className="font-extrabold text-white text-xs tracking-wide">
                  Quantum Brand Story 4K
                </h5>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Auto Remotion Motion Canvas
                </p>
              </div>

              {/* Subtitle Mockup */}
              <div className="relative z-10 bg-black/80 border border-white/10 px-2 py-0.5 rounded text-center mx-auto text-[10px] font-bold text-yellow-300">
                "Infrastruktur Cloud Cepat &amp; Desain Modern"
              </div>
            </div>
          </div>

          {/* Bottom Viewport Controls */}
          <div className="flex items-center justify-between text-xs pt-1 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-lg bg-[#ff5429] hover:bg-[#e0451d] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <button className="p-1 text-slate-400 hover:text-white">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLicenseModal}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Export 4K Video</span>
              </button>
            </div>
          </div>

        </div>

        {/* DUAL EDITOR: CODE VS TIMELINE (BAWAH) */}
        <div className="flex-1 bg-[#0a0d14] flex flex-col overflow-hidden">
          
          {/* Editor Header Bar */}
          <div className="h-8 bg-studio-panel border-b border-studio-border flex items-center justify-between px-3 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTool('code')}
                className={`px-3 py-1 text-[11px] font-bold rounded-t transition-all cursor-pointer ${
                  activeTool === 'code' ? 'bg-[#0a0d14] text-white border-t-2 border-[#ff5429]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                BrandIntroAnimation.jsx
              </button>
              <button
                onClick={() => setActiveTool('timeline')}
                className={`px-3 py-1 text-[11px] font-bold rounded-t transition-all cursor-pointer ${
                  activeTool === 'timeline' ? 'bg-[#0a0d14] text-white border-t-2 border-[#ff5429]' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Multi-Track Timeline
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>UTF-8</span>
              <span>React/Remotion</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
            {activeTool === 'code' ? (
              <div className="space-y-1 text-slate-300 leading-relaxed">
                <p><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-400">'react'</span>;</p>
                <p><span className="text-purple-400">import</span> &#123; interpolate, spring, useCurrentFrame &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'remotion'</span>;</p>
                <p className="pt-2 text-slate-500">// Quantum Studio Programmatic Video Generator</p>
                <p><span className="text-blue-400">export const</span> <span className="text-amber-400 font-bold">BrandIntro</span> = (&#123; title = <span className="text-emerald-400">"Quantum Studio"</span> &#125;) =&gt; &#123;</p>
                <p className="pl-4">const frame = <span className="text-blue-300">useCurrentFrame</span>();</p>
                <p className="pl-4">const opacity = <span className="text-blue-300">interpolate</span>(frame, [0, 20], [0, 1]);</p>
                <p className="pl-4">const scale = <span className="text-blue-300">spring</span>(&#123; frame, fps: 60, config: &#123; damping: 10 &#125; &#125;);</p>
                <p className="pl-4 pt-1"><span className="text-purple-400">return</span> (</p>
                <p className="pl-8">&lt;<span className="text-rose-400">div</span> style=&#123;&#123; opacity, transform: <span className="text-emerald-300">`scale($&#123;scale&#125;)`</span> &#125;&#125;&gt;</p>
                <p className="pl-12">&lt;<span className="text-rose-400">h1</span> className=<span className="text-emerald-400">"text-5xl font-black text-amber-400"</span>&gt;&#123;title&#125;&lt;/<span className="text-rose-400">h1</span>&gt;</p>
                <p className="pl-8">&lt;/<span className="text-rose-400">div</span>&gt;</p>
                <p className="pl-4">);</p>
                <p>&#125;;</p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-studio-border">
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center gap-1">
                      <Scissors className="w-3 h-3" /> Split Clip
                    </button>
                    <button className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                      Snap to Grid
                    </button>
                  </div>
                  <span className="text-slate-400 text-[10px]">Zoom: 100%</span>
                </div>

                {/* Tracks */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-[#111726] p-2 rounded-xl border border-studio-border">
                    <span className="w-16 text-[10px] text-slate-400">Track 1: Video</span>
                    <div className="flex-1 h-7 bg-emerald-950/60 border border-emerald-500/40 rounded-lg flex items-center px-3 text-emerald-300 text-[11px] font-mono">
                      ■ MainScene_4K.mp4 (00:00 - 01:24)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#111726] p-2 rounded-xl border border-studio-border">
                    <span className="w-16 text-[10px] text-slate-400">Track 2: Subtitle</span>
                    <div className="flex-1 h-7 bg-amber-950/60 border border-amber-500/40 rounded-lg flex items-center px-3 text-amber-300 text-[11px] font-mono">
                      ⚡ Whisper_ID_AutoSubtitles.srt
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#111726] p-2 rounded-xl border border-studio-border">
                    <span className="w-16 text-[10px] text-slate-400">Track 3: Audio</span>
                    <div className="flex-1 h-7 bg-blue-950/60 border border-blue-500/40 rounded-lg flex items-center px-3 text-blue-300 text-[11px] font-mono">
                      ♪ Cinematic_Bass_Drop_HQ.wav
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. RIGHT SIDEBAR: AI AGENT HUB (BYOA) */}
      <div className="w-80 bg-[#0d121d] flex flex-col justify-between select-none">
        
        {/* Agent Header */}
        <div className="p-3 border-b border-studio-border space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#ff5429]" />
              <span>AI Agent Hub</span>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              BYOA Active
            </span>
          </div>

          {/* Agent Switcher */}
          <div className="grid grid-cols-3 gap-1 bg-[#0a0d14] p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setActiveAgent('motion')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeAgent === 'motion' ? 'bg-[#ff5429] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Motion
            </button>
            <button
              onClick={() => setActiveAgent('code')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeAgent === 'code' ? 'bg-[#ff5429] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Coder
            </button>
            <button
              onClick={() => setActiveAgent('whisper')}
              className={`py-1 rounded-lg transition-all cursor-pointer ${
                activeAgent === 'whisper' ? 'bg-[#ff5429] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Whisper
            </button>
          </div>

          {/* Semantic Cache Savings Bar */}
          <div className="bg-[#111726] p-2 rounded-xl border border-studio-border text-[10px] text-slate-300 space-y-1">
            <div className="flex justify-between font-mono">
              <span>Token Saver:</span>
              <span className="text-emerald-400 font-bold">14.800 Token (~92%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="w-[92%] h-full bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs font-sans">
          {messages.map((m, idx) => (
            <div key={idx} className={`space-y-1 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="font-bold text-slate-300">{m.sender === 'user' ? 'Danu (You)' : m.name}</span>
                <span>• {m.time}</span>
              </div>
              <div className={`p-2.5 rounded-2xl inline-block max-w-[90%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#ff5429] text-white text-left font-medium rounded-tr-none'
                  : 'bg-[#111726] text-slate-200 border border-studio-border rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-studio-border">
          <div className="flex items-center gap-1.5 bg-[#0a0d14] border border-studio-border rounded-xl p-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Perintahkan agen atau minta kode..."
              className="flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="w-7 h-7 rounded-lg bg-[#ff5429] hover:bg-[#e0451d] text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>

    </div>
  );
}
