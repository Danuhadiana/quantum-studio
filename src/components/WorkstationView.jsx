import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Scissors, Sliders, Volume2, Type, Send, Key, 
  Database, Cpu, Check, Download, Zap, RefreshCw, Maximize2, 
  Minimize2, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown, 
  ChevronUp, Plus, MessageSquare, Video, Layers, Settings, 
  Paperclip, ArrowUpRight, Sparkles, Move, Film, Music, FileText, 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import ClockLogo from './ClockLogo';

export default function WorkstationView({ isPro, onOpenLicenseModal, onOpenSettingsModal }) {
  // --- LAYOUT SIZES & COLLAPSIBLE STATES (Three-Axis Resizable) ---
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_left_width');
    return saved ? parseInt(saved, 10) : 260;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_right_width');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [bottomHeight, setBottomHeight] = useState(() => {
    const saved = localStorage.getItem('qtm_bottom_height');
    return saved ? parseInt(saved, 10) : 260;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // --- WORKSPACE MODES & TABS ---
  // centerMode: 'welcome' (New chat screen Claude/Gemini style) or 'canvas' (Player After Effects/CapCut)
  const [centerMode, setCenterMode] = useState('welcome');
  const [activeNav, setActiveNav] = useState('chat'); // 'chat', 'videos', 'assets', 'settings'
  const [rightTab, setRightTab] = useState('inspector'); // 'inspector', 'copilot'
  const [bottomTab, setBottomTab] = useState('timeline'); // 'timeline', 'code'

  // --- VIDEO PLAYER & TIMELINE STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [currentTime, setCurrentTime] = useState('00:01:24:18');
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [volume, setVolume] = useState(85);

  // Inspector Properties State (After Effects Style)
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(100);
  const [opacity, setOpacity] = useState(100);
  const [subtitleText, setSubtitleText] = useState('Infrastruktur Cloud Cepat & Desain Modern');

  // --- AI CHAT STATE (Claude / Gemini Style) ---
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      name: 'Quantum Copilot',
      time: '04:10',
      text: 'Halo Danu! Selamat datang di Quantum Studio. Anda dapat memulai dengan mengetik naskah video baru, mengimpor klip untuk dipotong secara lossless, atau menulis animasi kode React/Remotion.'
    }
  ]);

  // --- DRAGGABLE SPLITTER REFS & LOGIC ---
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const isDraggingBottom = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft.current) {
        const newWidth = Math.max(200, Math.min(440, e.clientX));
        setLeftWidth(newWidth);
        localStorage.setItem('qtm_left_width', newWidth.toString());
      }
      if (isDraggingRight.current) {
        const newWidth = Math.max(260, Math.min(540, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        localStorage.setItem('qtm_right_width', newWidth.toString());
      }
      if (isDraggingBottom.current) {
        const newHeight = Math.max(160, Math.min(550, window.innerHeight - e.clientY));
        setBottomHeight(newHeight);
        localStorage.setItem('qtm_bottom_height', newHeight.toString());
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      isDraggingBottom.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleStartDragLeft = (e) => {
    e.preventDefault();
    isDraggingLeft.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleStartDragRight = (e) => {
    e.preventDefault();
    isDraggingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleStartDragBottom = (e) => {
    e.preventDefault();
    isDraggingBottom.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // Chat Submission Handler
  const handleSendPrompt = (e) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    const userText = promptInput.trim();
    const newMsg = {
      id: Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: userText
    };

    setChatMessages(prev => [...prev, newMsg]);
    setPromptInput('');

    // Switch to active canvas if user asked for a video or script
    if (centerMode === 'welcome') {
      setCenterMode('canvas');
    }

    // Copilot response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'agent',
        name: 'Quantum Copilot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Perintah diterima: "${userText}". Skrip animasi BrandIntroAnimation.jsx telah disinkronkan ke Viewport 4K dan Timeline Multi-Track (Hemat 1.250 token via Local Semantic Cache).`
      }]);
    }, 500);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#09090b] text-neutral-200 select-none font-sans">
      
      {/* =========================================================================
          1. LEFT SIDEBAR: Navigasi, Project History, dan "+ New Chat"
          (Inspirasi: Claude.ai Image 2, Gemini Image 3, Tayang Studio Image 4)
          ========================================================================= */}
      {!isLeftCollapsed ? (
        <aside 
          style={{ width: `${leftWidth}px` }} 
          className="h-full bg-[#121216] border-r border-[#222226] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          {/* Top Section */}
          <div className="p-3 flex flex-col gap-3">
            {/* Sidebar Header & Collapse Button */}
            <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
              <div className="flex items-center gap-2">
                <ClockLogo size={22} />
                <span className="font-extrabold text-sm tracking-tight text-white">Quantum Studio</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                title="Tutup Panel Kiri"
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#1f1f24] transition-colors cursor-pointer"
                aria-label="Tutup panel kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* "+ New Chat" Primary Action Button */}
            <button
              type="button"
              onClick={() => {
                setCenterMode('welcome');
                setActiveNav('chat');
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-white text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#facc15] group-hover:rotate-90 transition-transform" />
                <span>Proyek Baru / Chat</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">Ctrl+N</span>
            </button>

            {/* Navigation Modes */}
            <nav className="flex flex-col gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setActiveNav('chat'); setCenterMode('welcome'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                  activeNav === 'chat' && centerMode === 'welcome'
                    ? 'bg-[#222228] text-white font-semibold' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#18181c]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Chat &amp; Asisten AI</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('videos'); setCenterMode('canvas'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                  activeNav === 'videos' || centerMode === 'canvas'
                    ? 'bg-[#222228] text-white font-semibold' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#18181c]'
                }`}
              >
                <Film className="w-3.5 h-3.5 shrink-0" />
                <span>Timeline &amp; Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('assets')}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                  activeNav === 'assets' 
                    ? 'bg-[#222228] text-white font-semibold' 
                    : 'text-neutral-400 hover:text-white hover:bg-[#18181c]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Aset &amp; Media Pool</span>
              </button>
            </nav>

            {/* Recent History Header */}
            <div className="pt-2 border-t border-[#222226]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2 px-1">
                Riwayat Proyek Terbaru
              </div>

              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[calc(100vh-360px)]">
                {[
                  { name: 'Brand Intro 4K 60FPS', time: '10 menit lalu', active: true },
                  { name: 'E-Business vs E-Commerce', time: 'Kemarin' },
                  { name: 'Whisper Subtitle Indo', time: '12 Nov' },
                  { name: 'Shorts 9:16 Kinetic Typography', time: '10 Nov' },
                  { name: 'Binaural Beats Spectrum', time: '8 Nov' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCenterMode('canvas')}
                    className={`w-full px-2 py-1.5 rounded text-left text-xs transition-colors truncate cursor-pointer ${
                      item.active && centerMode === 'canvas'
                        ? 'bg-[#1e1e24] text-white font-medium'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#18181c]'
                    }`}
                  >
                    <div className="truncate">{item.name}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{item.time}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Profile Bar */}
          <div className="p-3 border-t border-[#222226] flex items-center justify-between text-xs text-neutral-400 bg-[#0e0e12]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-white">
                D
              </div>
              <div className="truncate">
                <div className="text-white text-xs font-semibold leading-none truncate">Danu Hadiana</div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">{isPro ? 'Pro Perpetual' : 'Free Local'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenSettingsModal}
              title="Pengaturan"
              className="p-1 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      ) : (
        /* Collapsed Icon Rail */
        <div className="w-10 bg-[#121216] border-r border-[#222226] flex flex-col items-center justify-between py-3 z-20 shrink-0">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLeftCollapsed(false)}
              title="Buka Sidebar Kiri"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <ClockLogo size={20} />
            <button
              type="button"
              onClick={() => { setCenterMode('welcome'); setActiveNav('chat'); }}
              title="Proyek Baru"
              className="p-1.5 rounded bg-[#18181c] border border-[#27272a] text-[#facc15] hover:text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCenterMode('canvas')}
              title="Canvas & Timeline"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <Film className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Left Resizer Drag Handle */}
      {!isLeftCollapsed && (
        <div
          onMouseDown={handleStartDragLeft}
          className="w-1 bg-transparent hover:bg-[#facc15]/40 transition-colors resizer-x shrink-0 z-30"
          title="Tarik untuk mengubah lebar panel kiri"
        />
      )}

      {/* =========================================================================
          2. CENTER STAGE & BOTTOM PANEL (Flex Column)
          ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* -----------------------------------------------------------------------
            A. CENTER CONTENT AREA: Welcome Screen vs 4K Viewport Player
            ----------------------------------------------------------------------- */}
        <main className="flex-1 overflow-hidden relative bg-[#09090b] flex flex-col">
          
          {centerMode === 'welcome' ? (
            /* --- WELCOME SCREEN: NEW CHAT MODE (Inspired by Claude/Gemini/Tayang Studio) --- */
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-between p-6 sm:p-10 max-w-4xl mx-auto w-full">
              
              {/* Header Navigation Bar */}
              <div className="w-full flex items-center justify-between text-xs text-neutral-400 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">Proyek Baru</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-500 font-mono">Belum ada video terlampir</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCenterMode('canvas')}
                  className="px-2.5 py-1 rounded bg-[#121216] border border-[#27272a] text-neutral-300 hover:text-white hover:bg-[#18181c] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>Buka Canvas Player Langsung</span>
                </button>
              </div>

              {/* Welcoming Greeting & Logo */}
              <div className="flex flex-col items-center text-center my-auto w-full max-w-2xl">
                <div className="mb-4 p-3 rounded-2xl bg-[#121216] border border-[#27272a] shadow-lg">
                  <ClockLogo size={42} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  What are we creating today?
                </h1>
                
                <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg leading-relaxed">
                  Mulai dari prompt ide naskah, potong klip video lokal tanpa render ulang, atau koding animasi React/Remotion secara deklaratif.
                </p>

                {/* 3 Minimalist Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mt-8 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setPromptInput('Buatkan naskah dan animasi intro 10 detik untuk produk teknologi dengan rasio 9:16 Shorts');
                    }}
                    className="p-4 rounded-xl bg-[#121216] hover:bg-[#18181c] border border-[#222226] hover:border-[#27272a] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-[#18181c] border border-[#27272a] flex items-center justify-center text-[#facc15] mb-2.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#facc15] transition-colors">
                        Mulai dari Topik
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                        Copilot menyusun naskah, struktur scene, dan subtitle otomatis.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('timeline');
                    }}
                    className="p-4 rounded-xl bg-[#121216] hover:bg-[#18181c] border border-[#222226] hover:border-[#27272a] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-[#18181c] border border-[#27272a] flex items-center justify-center text-blue-400 mb-2.5">
                        <Scissors className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Remix &amp; Potong Video
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                        Impor klip MP4 lokal untuk potongan instan tanpa render ulang FFmpeg.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('code');
                    }}
                    className="p-4 rounded-xl bg-[#121216] hover:bg-[#18181c] border border-[#222226] hover:border-[#27272a] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-7 h-7 rounded-lg bg-[#18181c] border border-[#27272a] flex items-center justify-center text-emerald-400 mb-2.5">
                        <Film className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Animasi Remotion
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                        Koding skrip video terprogram React dengan canvas 60 FPS real-time.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Central Prompt Input Box (Claude / Gemini Style) */}
              <div className="w-full max-w-2xl mt-6">
                <form 
                  onSubmit={handleSendPrompt}
                  className="bg-[#121216] border border-[#27272a] rounded-2xl p-3 shadow-xl focus-within:border-neutral-500 transition-colors"
                >
                  <textarea
                    rows={2}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt();
                      }
                    }}
                    placeholder="Deskripsikan video yang ingin dibuat, atau ketik @ untuk memilih aset..."
                    className="w-full bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#1e1e24] text-xs">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <button 
                        type="button" 
                        title="Lampirkan berkas media"
                        className="p-1 hover:text-white rounded hover:bg-[#18181c] transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      {/* Model Selector Pill */}
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-[#18181c] border border-[#27272a] text-neutral-300 text-[11px] font-medium rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (BYOA)</option>
                        <option value="deepseek-r1-local">DeepSeek-R1 (Ollama Lokal)</option>
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="gpt-4o">OpenAI GPT-4o</option>
                      </select>

                      {/* Aspect Ratio Chip */}
                      <button
                        type="button"
                        onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                        className="px-2 py-1 rounded-lg bg-[#18181c] border border-[#27272a] text-[11px] font-mono text-neutral-300 hover:text-white cursor-pointer"
                      >
                        {aspectRatio}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!promptInput.trim()}
                      className="w-7 h-7 rounded-lg bg-[#facc15] hover:bg-[#eab308] disabled:bg-neutral-800 disabled:text-neutral-600 text-black flex items-center justify-center transition-all cursor-pointer font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
                <div className="text-[10px] text-center text-neutral-500 mt-2">
                  Quantum Studio beroperasi lokal di komputer Anda • Token saver memangkas konsumsi hingga 90%
                </div>
              </div>

            </div>
          ) : (
            /* --- ACTIVE 4K CANVAS VIEWPORT MODE (Inspired by Remotion, After Effects, CapCut Image 5, 7, 8) --- */
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0d]">
              
              {/* Top Viewport Status Toolbar */}
              <div className="h-9 bg-[#121216] border-b border-[#222226] px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    CANVAS READY (60 FPS)
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {currentTime}
                  </span>
                  <span className="text-neutral-600">/</span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    00:03:00:00
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Aspect Ratio Switcher */}
                  <div className="flex bg-[#18181c] p-0.5 rounded-md border border-[#27272a] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '16:9' ? 'bg-[#27272a] text-white font-bold' : 'text-neutral-400'}`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '9:16' ? 'bg-[#27272a] text-white font-bold' : 'text-neutral-400'}`}
                    >
                      9:16 Shorts
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCenterMode('welcome')}
                    className="px-2 py-0.5 rounded bg-[#18181c] border border-[#27272a] text-[11px] text-neutral-300 hover:text-white"
                  >
                    Tampilan Chat
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Stage */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                <div 
                  className={`bg-black border border-[#27272a] shadow-2xl rounded-xl overflow-hidden relative flex flex-col items-center justify-center transition-all ${
                    aspectRatio === '16:9'
                      ? 'w-[520px] max-w-full aspect-video'
                      : 'w-[260px] max-w-full aspect-[9/16]'
                  }`}
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${scale / 100})`,
                    opacity: opacity / 100
                  }}
                >
                  {/* Simulated Remotion Canvas Content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 flex flex-col items-center justify-center p-6 text-center">
                    <ClockLogo size={aspectRatio === '16:9' ? 56 : 42} className="mb-3" />
                    <h2 className="text-white font-extrabold text-base sm:text-lg tracking-tight">
                      Quantum Studio 4K
                    </h2>
                    <p className="text-[11px] text-[#facc15] font-mono mt-1 max-w-[200px]">
                      {subtitleText}
                    </p>
                    <div className="mt-4 px-2 py-0.5 rounded bg-white/10 border border-white/20 text-[9px] font-mono text-neutral-300">
                      Remotion Engine • 60 FPS
                    </div>
                  </div>

                  {/* Canvas Corner Markers (After Effects Visual Safe Margins) */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/30"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/30"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/30"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/30"></div>
                </div>
              </div>

              {/* Viewport Playback Controller Toolbar */}
              <div className="h-10 bg-[#121216] border-t border-[#222226] px-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setCurrentTime('00:00:00:00')}
                    title="Awal (Frame 0)"
                    className="p-1 text-neutral-400 hover:text-white rounded"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors font-bold"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  <button 
                    type="button"
                    title="Maju 1 Frame"
                    className="p-1 text-neutral-400 hover:text-white rounded"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 ml-3 text-neutral-400">
                    <Volume2 className="w-3.5 h-3.5" />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                      className="w-16 accent-white h-1 bg-[#27272a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-neutral-400">
                    Scale: {scale}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenLicenseModal()}
                    className="px-3 py-1 rounded bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-[#facc15]" />
                    <span>Ekspor 4K Video</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Horizontal Resizer Drag Handle for Bottom Panel */}
        {!isBottomCollapsed && (
          <div
            onMouseDown={handleStartDragBottom}
            className="h-1 bg-transparent hover:bg-[#facc15]/40 transition-colors resizer-y shrink-0 z-30"
            title="Tarik untuk mengubah tinggi timeline / editor"
          />
        )}

        {/* -----------------------------------------------------------------------
            B. BOTTOM PANEL: Multi-Track Timeline & Monaco Code Editor
            (Inspirasi: After Effects & CapCut Multi-Track Timeline Image 7, 8)
            ----------------------------------------------------------------------- */}
        <section 
          style={{ height: isBottomCollapsed ? '32px' : `${bottomHeight}px` }} 
          className="bg-[#121216] border-t border-[#222226] flex flex-col shrink-0 transition-none z-10"
        >
          {/* Bottom Panel Tab Header */}
          <div className="h-8 bg-[#0e0e12] border-b border-[#222226] px-3 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setBottomTab('timeline'); setIsBottomCollapsed(false); }}
                className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${
                  bottomTab === 'timeline' && !isBottomCollapsed
                    ? 'bg-[#121216] text-white border-t-2 border-[#facc15]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Multi-Track Timeline
              </button>

              <button
                type="button"
                onClick={() => { setBottomTab('code'); setIsBottomCollapsed(false); }}
                className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors cursor-pointer ${
                  bottomTab === 'code' && !isBottomCollapsed
                    ? 'bg-[#121216] text-white border-t-2 border-[#facc15]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                BrandIntroAnimation.jsx
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Timeline Razor & Zoom Tools */}
              {bottomTab === 'timeline' && !isBottomCollapsed && (
                <div className="flex items-center gap-2 mr-3 text-neutral-400">
                  <button type="button" title="Razor Cut Tool (Split)" className="p-1 hover:text-white rounded hover:bg-[#18181c]">
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" title="Zoom Out" onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))} className="p-1 hover:text-white rounded hover:bg-[#18181c]">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-neutral-500">{(timelineZoom * 100).toFixed(0)}%</span>
                  <button type="button" title="Zoom In" onClick={() => setTimelineZoom(Math.min(2.5, timelineZoom + 0.25))} className="p-1 hover:text-white rounded hover:bg-[#18181c]">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Minimize / Maximize Toggle */}
              <button
                type="button"
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="p-1 text-neutral-400 hover:text-white rounded"
                title={isBottomCollapsed ? "Tampilkan Panel Bawah" : "Sembunyikan Panel Bawah"}
              >
                {isBottomCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Bottom Panel Content Body */}
          {!isBottomCollapsed && (
            <div className="flex-1 overflow-auto bg-[#0a0a0d] p-2">
              {bottomTab === 'timeline' ? (
                /* --- MULTI-TRACK TIMELINE VIEW (CapCut / After Effects Style) --- */
                <div className="flex flex-col gap-1.5 min-w-[700px]">
                  
                  {/* Time Ruler Bar */}
                  <div className="h-5 bg-[#121216] border-b border-[#222226] rounded flex items-center px-2 text-[9px] font-mono text-neutral-500 justify-between">
                    <span>00:00:00</span>
                    <span>00:00:30</span>
                    <span>00:01:00</span>
                    <span>00:01:30</span>
                    <span>00:02:00</span>
                    <span>00:02:30</span>
                    <span>00:03:00</span>
                  </div>

                  {/* Track 1: Video Track */}
                  <div className="h-12 bg-[#121216] rounded-md border border-[#222226] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-24 shrink-0 text-[10px] font-bold text-neutral-400 flex items-center justify-between pr-2 border-r border-[#222226]">
                      <span>Video 1</span>
                      <Eye className="w-3 h-3 text-neutral-500" />
                    </div>
                    <div className="flex-1 h-full bg-blue-950/60 border border-blue-600/40 rounded flex items-center px-3 text-xs font-semibold text-blue-200">
                      intro_scene_4k.mp4 [Lossless Cut]
                    </div>
                  </div>

                  {/* Track 2: Subtitle Track (Whisper AI) */}
                  <div className="h-10 bg-[#121216] rounded-md border border-[#222226] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-24 shrink-0 text-[10px] font-bold text-neutral-400 flex items-center justify-between pr-2 border-r border-[#222226]">
                      <span>Subtitle</span>
                      <Type className="w-3 h-3 text-neutral-500" />
                    </div>
                    <div className="flex-1 h-full bg-amber-950/50 border border-amber-600/40 rounded flex items-center px-3 text-[11px] font-medium text-amber-200 truncate">
                      {subtitleText} (Whisper AI Synced)
                    </div>
                  </div>

                  {/* Track 3: Audio Track (Waveform) */}
                  <div className="h-12 bg-[#121216] rounded-md border border-[#222226] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-24 shrink-0 text-[10px] font-bold text-neutral-400 flex items-center justify-between pr-2 border-r border-[#222226]">
                      <span>Audio BGM</span>
                      <Music className="w-3 h-3 text-neutral-500" />
                    </div>
                    <div className="flex-1 h-full bg-emerald-950/60 border border-emerald-600/40 rounded flex items-center px-3 text-xs font-semibold text-emerald-200">
                      lofi_chill_beats_master.wav [Stereo 48kHz]
                    </div>
                  </div>

                </div>
              ) : (
                /* --- MONACO CODE EDITOR (React / Remotion JSX) --- */
                <div className="h-full font-mono text-xs leading-relaxed text-neutral-300 bg-[#09090b] p-3 rounded border border-[#222226] overflow-auto">
                  <div className="text-neutral-500">// Quantum Studio Programmatic Video Generator (Remotion 60 FPS)</div>
                  <div className="text-purple-400">import <span className="text-white">&#123; interpolate, spring, useCurrentFrame &#125;</span> from <span className="text-emerald-300">'remotion'</span>;</div>
                  <div className="mt-2 text-blue-400">export const <span className="text-yellow-300">BrandIntro</span> = (&#123; title = <span className="text-emerald-300">"Quantum Studio"</span> &#125;) =&gt; &#123;</div>
                  <div className="pl-4 text-neutral-400">const frame = <span className="text-yellow-300">useCurrentFrame</span>();</div>
                  <div className="pl-4 text-neutral-400">const opacity = <span className="text-yellow-300">interpolate</span>(frame, [0, 20], [0, 1]);</div>
                  <div className="pl-4 text-neutral-400">const scale = <span className="text-yellow-300">spring</span>(&#123; frame, fps: 60, config: &#123; damping: 10 &#125; &#125;);</div>
                  <div className="pl-4 mt-1 text-purple-400">return (</div>
                  <div className="pl-8 text-neutral-300">&lt;<span className="text-rose-400">div</span> style=&#123;&#123; opacity, transform: `scale($&#123;scale&#125;)` &#125;&#125;&gt;</div>
                  <div className="pl-12 text-neutral-300">&lt;<span className="text-rose-400">h1</span> className=<span className="text-emerald-300">"text-4xl font-black text-white"</span>&gt;&#123;title&#125;&lt;/<span className="text-rose-400">h1</span>&gt;</div>
                  <div className="pl-8 text-neutral-300">&lt;/<span className="text-rose-400">div</span>&gt;</div>
                  <div className="pl-4 text-purple-400">);</div>
                  <div className="text-blue-400">&#125;;</div>
                </div>
              )}
            </div>
          )}
        </section>

      </div>

      {/* Right Resizer Drag Handle */}
      {!isRightCollapsed && (
        <div
          onMouseDown={handleStartDragRight}
          className="w-1 bg-transparent hover:bg-[#facc15]/40 transition-colors resizer-x shrink-0 z-30"
          title="Tarik untuk mengubah lebar panel kanan"
        />
      )}

      {/* =========================================================================
          3. RIGHT SIDEBAR: Inspector Properties & AI Copilot Chat
          (Inspirasi: After Effects & CapCut Properties Panel Image 7, 8)
          ========================================================================= */}
      {!isRightCollapsed ? (
        <aside 
          style={{ width: `${rightWidth}px` }} 
          className="h-full bg-[#121216] border-l border-[#222226] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          {/* Right Header with Tabs */}
          <div className="h-9 bg-[#0e0e12] border-b border-[#222226] px-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRightTab('inspector')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  rightTab === 'inspector'
                    ? 'bg-[#18181c] text-white border border-[#27272a]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Properties
              </button>

              <button
                type="button"
                onClick={() => setRightTab('copilot')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  rightTab === 'copilot'
                    ? 'bg-[#18181c] text-white border border-[#27272a]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                AI Copilot
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRightCollapsed(true)}
              title="Tutup Panel Kanan"
              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Tutup panel kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Body Content */}
          <div className="flex-1 overflow-y-auto p-3 text-xs text-neutral-300">
            {rightTab === 'inspector' ? (
              /* --- INSPECTOR PROPERTIES (After Effects / CapCut Style) --- */
              <div className="space-y-4">
                
                {/* Element Header */}
                <div className="p-2.5 rounded-lg bg-[#18181c] border border-[#27272a]">
                  <div className="text-[10px] text-neutral-500 font-mono uppercase">Layer Aktif</div>
                  <div className="font-bold text-white mt-0.5 truncate">BrandIntro_Title_Layer</div>
                  <div className="text-[10px] text-[#facc15] font-mono mt-0.5">Remotion SVG Vector</div>
                </div>

                {/* Transform Section */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Transform</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono">Position X:</span>
                      <input 
                        type="number" 
                        value={posX} 
                        onChange={(e) => setPosX(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#18181c] border border-[#27272a] rounded px-2 py-1 text-white font-mono text-xs mt-0.5" 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 font-mono">Position Y:</span>
                      <input 
                        type="number" 
                        value={posY} 
                        onChange={(e) => setPosY(parseInt(e.target.value, 10) || 0)}
                        className="w-full bg-[#18181c] border border-[#27272a] rounded px-2 py-1 text-white font-mono text-xs mt-0.5" 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Scale:</span>
                      <span className="font-mono">{scale}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={20} 
                      max={200} 
                      value={scale} 
                      onChange={(e) => setScale(parseInt(e.target.value, 10))}
                      className="w-full accent-white h-1 bg-[#27272a] rounded cursor-pointer" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-neutral-400 mb-0.5">
                      <span>Opacity:</span>
                      <span className="font-mono">{opacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={100} 
                      value={opacity} 
                      onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-white h-1 bg-[#27272a] rounded cursor-pointer" 
                    />
                  </div>
                </div>

                {/* Subtitle Text Content Editor */}
                <div className="space-y-1.5 pt-2 border-t border-[#222226]">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Teks Subtitle</div>
                  <textarea
                    rows={2}
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="w-full bg-[#18181c] border border-[#27272a] rounded-lg p-2 text-xs text-white focus:outline-none resize-none"
                  />
                  <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                    <span>Otomatis disinkronkan ke video</span>
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                </div>

                {/* Video Effects Accordion */}
                <div className="space-y-2 pt-2 border-t border-[#222226]">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Efek &amp; Filter</div>
                  <div className="space-y-1 text-xs">
                    <div className="p-2 rounded bg-[#18181c] border border-[#27272a] flex items-center justify-between">
                      <span>GPU Motion Blur</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Aktif</span>
                    </div>
                    <div className="p-2 rounded bg-[#18181c] border border-[#27272a] flex items-center justify-between">
                      <span>Color Grade Matrix</span>
                      <span className="text-[10px] font-mono text-neutral-400">Film Lut 01</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* --- AI COPILOT CHAT STREAM (Claude / Gemini Style) --- */
              <div className="h-full flex flex-col justify-between">
                
                {/* Chat History Messages */}
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#18181c] border-[#27272a] ml-4 text-white'
                          : 'bg-[#0e0e12] border-[#222226] mr-2 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1 font-mono">
                        <span className="font-bold text-neutral-400">{msg.name || 'Anda'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Copilot Input Box */}
                <div className="pt-2 border-t border-[#222226] mt-2">
                  <div className="p-2 rounded-xl bg-[#18181c] border border-[#27272a] flex items-center gap-2">
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendPrompt();
                        }
                      }}
                      placeholder="Minta agen perbarui video..."
                      className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendPrompt()}
                      className="p-1 rounded bg-[#facc15] text-black hover:bg-[#eab308] cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-1 flex items-center justify-between">
                    <span>BYOA: {selectedModel}</span>
                    <span className="text-emerald-400 font-mono">Cache Aktif</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </aside>
      ) : (
        /* Collapsed Right Icon Rail */
        <div className="w-10 bg-[#121216] border-l border-[#222226] flex flex-col items-center justify-between py-3 z-20 shrink-0">
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRightCollapsed(false)}
              title="Buka Sidebar Kanan"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setIsRightCollapsed(false); setRightTab('inspector'); }}
              title="Inspector Properti"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => { setIsRightCollapsed(false); setRightTab('copilot'); }}
              title="AI Copilot"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
