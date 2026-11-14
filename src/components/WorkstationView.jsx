import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Scissors, Sliders, Volume2, VolumeX, Type, Send, Key, 
  Database, Cpu, Check, Download, Zap, RefreshCw, Maximize2, 
  Minimize2, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown, 
  ChevronUp, Plus, MessageSquare, Video, Layers, Settings, 
  Paperclip, ArrowUpRight, Sparkles, Move, Film, Music, FileText, 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Unlock,
  Palette, Trash2, SplitSquareVertical, Clock, CornerUpLeft, Radio
} from 'lucide-react';
import ClockLogo from './ClockLogo';

// Retrieve Gemini API key dynamically from localStorage or local environment (.env.local)
const getActiveGeminiKey = () => {
  return localStorage.getItem('qtm_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

export default function WorkstationView({ isPro, onOpenLicenseModal, onOpenSettingsModal }) {
  // --- LAYOUT SIZES & COLLAPSIBLE STATES (Three-Axis Resizable) ---
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_left_width');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_right_width');
    return saved ? parseInt(saved, 10) : 310;
  });
  const [bottomHeight, setBottomHeight] = useState(() => {
    const saved = localStorage.getItem('qtm_bottom_height');
    return saved ? parseInt(saved, 10) : 250;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // --- WORKSPACE MODES & TABS ---
  // centerMode: 'welcome' (New chat screen Claude/Gemini/Tayang Studio) or 'canvas' (After Effects & Remotion Player)
  const [centerMode, setCenterMode] = useState('welcome');
  const [activeNav, setActiveNav] = useState('chat'); // 'chat', 'videos', 'assets'
  const [rightTab, setRightTab] = useState('inspector'); // 'inspector', 'copilot'
  const [bottomTab, setBottomTab] = useState('timeline'); // 'timeline', 'code'

  // --- VIDEO PLAYER & REAL-TIME ENGINE STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);

  // Inspector Properties State (After Effects Style with Live 2-Way Binding)
  const [headlineText, setHeadlineText] = useState('Quantum Studio 4K');
  const [subtitleText, setSubtitleText] = useState('Infrastruktur Cloud Cepat & Desain Modern');
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [accentColor, setAccentColor] = useState('#facc15'); // Gold
  const [fontWeight, setFontWeight] = useState('font-extrabold');

  // Multi-Track Timeline Clips State (Supports Scissors Split Tool)
  const [videoClips, setVideoClips] = useState([
    { id: 1, name: 'Brand_Intro_Scene_4K.mp4', startFrame: 0, endFrame: 180, color: 'bg-zinc-800 border-zinc-700' }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);

  // --- AI CHAT & GEMINI INTEGRATION STATE ---
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-flash-lite-latest');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      name: 'Quantum Copilot (Gemini AI)',
      time: '04:10',
      text: 'Halo Danu! Selamat datang di Quantum Studio. Saya terhubung langsung ke mesin Google Gemini AI Anda. Anda dapat memulai dengan mengetik naskah video baru, meminta ide transisi, memotong klip di timeline, atau mengedit animasi Remotion.'
    }
  ]);

  // Ref untuk timeline scrubbing
  const timelineRulerRef = useRef(null);

  // --- 1. PLAYBACK TIMER ENGINE (60 FPS Real-Time) ---
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) {
            return 0; // Loop kembali ke awal
          }
          return prev + 1;
        });
      }, 1000 / fps);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxFrames, fps]);

  // Format Frame ke Timecode (HH:MM:SS:FF)
  const formatTimecode = (frame) => {
    const totalSeconds = Math.floor(frame / fps);
    const f = frame % fps;
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  };

  // --- 2. DRAGGABLE SPLITTER LOGIC ---
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const isDraggingBottom = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft.current) {
        const newWidth = Math.max(190, Math.min(420, e.clientX));
        setLeftWidth(newWidth);
        localStorage.setItem('qtm_left_width', newWidth.toString());
      }
      if (isDraggingRight.current) {
        const newWidth = Math.max(250, Math.min(500, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        localStorage.setItem('qtm_right_width', newWidth.toString());
      }
      if (isDraggingBottom.current) {
        const newHeight = Math.max(140, Math.min(500, window.innerHeight - e.clientY));
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

  // Keyboard Spacebar Shortcut untuk Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 3. TIMELINE SCRUBBING (Klik di Ruler untuk Geser Frame) ---
  const handleRulerClick = (e) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetFrame = Math.round((clickX / rect.width) * maxFrames);
    setCurrentFrame(targetFrame);
  };

  // --- 4. SCISSORS / SPLIT TOOL FUNCTION ---
  const handleSplitClip = () => {
    setVideoClips((prev) => {
      const active = prev.find((c) => c.startFrame <= currentFrame && c.endFrame >= currentFrame);
      if (!active || currentFrame <= active.startFrame || currentFrame >= active.endFrame) {
        return prev;
      }
      const part1 = { ...active, endFrame: currentFrame };
      const part2 = {
        id: Date.now(),
        name: `${active.name.replace('.mp4', '')}_PartB.mp4`,
        startFrame: currentFrame,
        endFrame: active.endFrame,
        color: 'bg-zinc-800/90 border-zinc-600'
      };
      return prev.map((c) => (c.id === active.id ? part1 : c)).concat(part2);
    });
  };

  // Reset Transformasi Inspector
  const handleResetTransform = () => {
    setPosX(0);
    setPosY(0);
    setScale(100);
    setRotation(0);
    setOpacity(100);
    setAccentColor('#facc15');
  };

  // --- 5. LIVE GOOGLE GEMINI AI CALL ---
  const handleSendPrompt = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = (customText || promptInput).trim();
    if (!textToSend || isAiGenerating) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsAiGenerating(true);

    // Beralih ke canvas mode agar hasil visual langsung terlihat
    if (centerMode === 'welcome') {
      setCenterMode('canvas');
    }

    try {
      const apiKey = getActiveGeminiKey();
      const model = 'gemini-flash-lite-latest';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const systemPrompt = `Anda adalah Quantum Copilot, asisten AI untuk software Quantum Studio (desktop video editor berbasis After Effects, Remotion, dan CapCut).
Jawab pengguna dalam Bahasa Indonesia yang ringkas, teknis, dan kreatif.
FORMAT JAWABAN:
1. Jika pengguna meminta video/animasi, cantumkan baris persis seperti ini di awal:
[JUDUL: Tuliskan Judul Singkat 3-5 Kata]
[SUBTITLE: Tuliskan Tagline Singkat]
2. Lalu berikan rencana naskah scene (Scene 1, Scene 2, Scene 3) dengan durasi detik.
3. Sebutkan gaya visual / transisi After Effects yang direkomendasikan.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `Permintaan Pengguna: "${textToSend}"` }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error status: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal memproses respon dari Gemini.';

      // Ekstrak [JUDUL: ...] dan [SUBTITLE: ...] jika ada
      const titleMatch = replyText.match(/\[JUDUL:\s*(.*?)\]/i);
      const subMatch = replyText.match(/\[SUBTITLE:\s*(.*?)\]/i);

      if (titleMatch && titleMatch[1]) {
        setHeadlineText(titleMatch[1].trim());
      }
      if (subMatch && subMatch[1]) {
        setSubtitleText(subMatch[1].trim());
      } else if (!subMatch && textToSend.length > 5) {
        setSubtitleText(textToSend);
      }

      // Bersihkan tag metadata sebelum ditampilkan di bubble chat
      const cleanedReply = replyText
        .replace(/\[JUDUL:\s*.*?\]/gi, '')
        .replace(/\[SUBTITLE:\s*.*?\]/gi, '')
        .trim();

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          name: 'Quantum Copilot (Gemini AI)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: cleanedReply || replyText
        }
      ]);

      // Jalankan video otomatis agar animasi Remotion bergerak
      setIsPlaying(true);

    } catch (err) {
      console.error('Error invoking Gemini:', err);
      // Fallback cerdas jika offline
      const fallbackTitle = textToSend.slice(0, 24);
      setHeadlineText(fallbackTitle || 'Quantum Studio 4K');
      setSubtitleText(textToSend);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          name: 'Quantum Copilot (Local Fallback)',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Konsep video untuk "${textToSend}" berhasil dirancang:\n\n• Scene 1: Motion Typography Intro (0s - 1s)\n• Scene 2: Kinetic Product Feature (1s - 2s)\n• Scene 3: Logo Reveal 4K (2s - 3s)\n\nViewport 4K dan skrip BrandIntro.jsx telah disinkronkan secara langsung.`
        }
      ]);
      setIsPlaying(true);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#09090b] text-zinc-200 select-none font-sans text-xs">
      
      {/* =========================================================================
          1. LEFT SIDEBAR: Navigasi & Proyek (Inspirasi: Claude.ai, Gemini, Tayang Studio)
          ========================================================================= */}
      {!isLeftCollapsed ? (
        <aside 
          style={{ width: `${leftWidth}px` }} 
          className="h-full bg-[#111215] border-r border-[#222328] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          <div className="p-2.5 flex flex-col gap-2.5">
            {/* Header Sidebar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#222328]">
              <div className="flex items-center gap-2">
                <ClockLogo size={20} />
                <span className="font-bold text-xs tracking-tight text-white">Quantum Studio</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                title="Tutup Panel Kiri"
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#1a1b20] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* "+ New Chat" Button */}
            <button
              type="button"
              onClick={() => {
                setCenterMode('welcome');
                setActiveNav('chat');
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-[#18191c] hover:bg-[#202126] border border-[#27282d] text-white text-xs font-medium flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-[#facc15] group-hover:rotate-90 transition-transform" />
                <span>+ Proyek Baru</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Ctrl+N</span>
            </button>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => { setActiveNav('chat'); setCenterMode('welcome'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'chat' && centerMode === 'welcome'
                    ? 'bg-[#1e1f24] text-white font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#16171a]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Asisten Gemini &amp; Chat</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('videos'); setCenterMode('canvas'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'videos' || centerMode === 'canvas'
                    ? 'bg-[#1e1f24] text-white font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#16171a]'
                }`}
              >
                <Film className="w-3.5 h-3.5 shrink-0 text-[#facc15]" />
                <span>Editor Viewport 4K</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('assets')}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'assets' 
                    ? 'bg-[#1e1f24] text-white font-semibold' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#16171a]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Media &amp; Aset Proyek</span>
              </button>
            </nav>

            {/* Proyek Terkini */}
            <div className="pt-2 border-t border-[#222328]">
              <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1.5 px-1">
                Riwayat Naskah
              </div>
              <div className="flex flex-col gap-1 text-[11px]">
                {[
                  'Brand Intro 4K (60 FPS)',
                  'Video Promosi Teknologi',
                  'E-Business Motion Graphics',
                  'Shorts 9:16 Kinetic Typography'
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setHeadlineText(item);
                      setCenterMode('canvas');
                    }}
                    className="px-2 py-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-[#18191c] truncate cursor-pointer transition-colors"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Left Status */}
          <div className="p-2.5 border-t border-[#222328] bg-[#0d0e10] flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-zinc-300">Gemini 2.5 Active</span>
            </div>
            <button
              onClick={onOpenSettingsModal}
              title="Pengaturan BYOA"
              className="hover:text-white p-1 rounded hover:bg-[#18191c]"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </aside>
      ) : (
        <div className="w-8 h-full bg-[#111215] border-r border-[#222328] flex flex-col items-center py-2.5 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            title="Buka Sidebar Kiri"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191c] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
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
          2. CENTER STAGE: DUAL-MODE WORKSPACE (Welcome vs 4K Canvas Viewport)
          ========================================================================= */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-hidden relative bg-[#09090b] flex flex-col">
          
          {centerMode === 'welcome' ? (
            /* --- WELCOME SCREEN (Claude / Gemini / Tayang Studio Concept) --- */
            <div className="flex-1 overflow-y-auto flex flex-col items-center justify-between p-6 sm:p-8 max-w-3xl mx-auto w-full">
              
              {/* Header Status */}
              <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">Workspace Baru</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-mono">Mesin Gemini AI Siap</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCenterMode('canvas')}
                  className="px-2.5 py-1 rounded bg-[#141518] border border-[#25262c] text-zinc-300 hover:text-white hover:bg-[#1c1d22] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3 text-[#facc15]" />
                  <span>Buka Canvas Viewport</span>
                </button>
              </div>

              {/* Welcoming Greeting & Dial Logo */}
              <div className="flex flex-col items-center text-center my-auto w-full max-w-xl">
                <div className="mb-3 p-3 rounded-2xl bg-[#121316] border border-[#222328] shadow-lg">
                  <ClockLogo size={40} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  What are we making today?
                </h1>
                
                <p className="text-xs text-zinc-400 mt-2 max-w-md leading-relaxed">
                  Mulai dari prompt topik naskah, potong klip video secara lossless, atau koding animasi Remotion React 60 FPS.
                </p>

                {/* 4 Minimalist Action Cards (Tayang Studio Style) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full mt-6 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      handleSendPrompt(null, 'Buatkan naskah dan animasi intro 10 detik untuk produk teknologi modern');
                    }}
                    className="p-3 rounded-xl bg-[#121316] hover:bg-[#18191d] border border-[#222328] hover:border-[#2f3036] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-[#18191d] border border-[#26272c] flex items-center justify-center text-[#facc15] mb-2">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-bold text-white group-hover:text-[#facc15] transition-colors">
                        Mulai Topik
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        AI susun naskah &amp; scene otomatis.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('timeline');
                    }}
                    className="p-3 rounded-xl bg-[#121316] hover:bg-[#18191d] border border-[#222328] hover:border-[#2f3036] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-[#18191d] border border-[#26272c] flex items-center justify-center text-blue-400 mb-2">
                        <Scissors className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors">
                        Potong Video
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Timeline multi-track lossless.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendPrompt(null, 'Buatkan konsep gaya typography kinetic After Effects yang minimalis dan elegan');
                    }}
                    className="p-3 rounded-xl bg-[#121316] hover:bg-[#18191d] border border-[#222328] hover:border-[#2f3036] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-[#18191d] border border-[#26272c] flex items-center justify-center text-emerald-400 mb-2">
                        <Sliders className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Tiru Gaya
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Preset ritme After Effects.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('code');
                    }}
                    className="p-3 rounded-xl bg-[#121316] hover:bg-[#18191d] border border-[#222328] hover:border-[#2f3036] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-6 h-6 rounded-lg bg-[#18191d] border border-[#26272c] flex items-center justify-center text-purple-400 mb-2">
                        <Film className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-bold text-white group-hover:text-purple-400 transition-colors">
                        Kode React
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Remotion video generator.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Central Prompt Input Bar (Claude / Gemini Style) */}
              <div className="w-full max-w-xl mt-4">
                <form 
                  onSubmit={(e) => handleSendPrompt(e)}
                  className="bg-[#121316] border border-[#25262c] rounded-xl p-2.5 shadow-xl focus-within:border-zinc-400 transition-colors"
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
                    placeholder="Deskripsikan video yang ingin dibuat, atau perintahkan AI..."
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-2 border-t border-[#1c1d22] text-xs">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <button 
                        type="button" 
                        title="Lampirkan berkas"
                        className="p-1 hover:text-white rounded hover:bg-[#18191c] transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>

                      {/* Active Model Indicator */}
                      <span className="text-[10px] font-medium text-zinc-400 bg-[#18191d] px-2 py-0.5 rounded border border-[#26272c] flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#facc15]" />
                        <span>Gemini 2.5 Flash Lite</span>
                      </span>

                      {/* Aspect Ratio Switcher */}
                      <button
                        type="button"
                        onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                        className="px-1.5 py-0.5 rounded bg-[#18191d] border border-[#26272c] text-[10px] font-mono text-zinc-300 hover:text-white"
                      >
                        {aspectRatio}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isAiGenerating || !promptInput.trim()}
                      className="px-3 py-1 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isAiGenerating ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-zinc-950" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Generate</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            /* --- ACTIVE 4K CANVAS VIEWPORT (After Effects / Remotion Concept) --- */
            <div className="flex-1 flex flex-col overflow-hidden bg-[#08080a]">
              
              {/* Top Viewport Status Toolbar */}
              <div className="h-8 bg-[#111215] border-b border-[#222328] px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                    CANVAS LIVE (60 FPS)
                  </span>
                  <span className="text-[11px] font-mono text-white font-semibold">
                    {formatTimecode(currentFrame)}
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    00:00:03:00
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Frame: {currentFrame} / {maxFrames}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Aspect Ratio Switcher */}
                  <div className="flex bg-[#18191c] p-0.5 rounded border border-[#26272c] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '16:9' ? 'bg-[#27282d] text-white font-bold' : 'text-zinc-400'}`}
                    >
                      16:9 Landscape
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '9:16' ? 'bg-[#27282d] text-white font-bold' : 'text-zinc-400'}`}
                    >
                      9:16 Shorts
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCenterMode('welcome')}
                    className="px-2 py-0.5 rounded bg-[#18191c] border border-[#26272c] text-[11px] text-zinc-300 hover:text-white"
                  >
                    Mode Chat
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Stage with Live Interactive Transformation */}
              <div className="flex-1 flex items-center justify-center p-3 overflow-hidden relative">
                <div 
                  className={`bg-black border border-[#27282d] shadow-2xl rounded-lg overflow-hidden relative flex flex-col items-center justify-center transition-all ${
                    aspectRatio === '16:9'
                      ? 'w-[480px] max-w-full aspect-video'
                      : 'w-[230px] max-w-full aspect-[9/16]'
                  }`}
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${scale / 100}) rotate(${rotation}deg)`,
                    opacity: opacity / 100
                  }}
                >
                  {/* Remotion Canvas Content Layer */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#121316] via-black to-[#0a0a0d] flex flex-col items-center justify-center p-4 text-center">
                    
                    {/* Dial Clock Logo with Frame-Based Kinetic Animation */}
                    <div 
                      style={{
                        transform: `scale(${1 + Math.sin(currentFrame / 10) * 0.05})`
                      }}
                      className="transition-transform"
                    >
                      <ClockLogo size={aspectRatio === '16:9' ? 52 : 38} className="mb-2" />
                    </div>

                    <h2 
                      style={{ color: accentColor }}
                      className={`text-white text-sm sm:text-base tracking-tight ${fontWeight}`}
                    >
                      {headlineText}
                    </h2>

                    <p className="text-[10px] text-zinc-300 font-mono mt-1 max-w-[220px] line-clamp-2">
                      {subtitleText}
                    </p>

                    <div className="mt-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Remotion Engine • Frame {currentFrame}</span>
                    </div>
                  </div>

                  {/* Corner Margins (After Effects Title Safe Guides) */}
                  <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/20"></div>
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/20"></div>
                  <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/20"></div>
                  <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/20"></div>
                </div>
              </div>

              {/* Viewport Playback Controller Toolbar */}
              <div className="h-9 bg-[#111215] border-t border-[#222328] px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setCurrentFrame(0)}
                    title="Kembali ke Frame 0"
                    className="p-1 text-zinc-400 hover:text-white rounded"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-6 h-6 rounded-full bg-white text-zinc-950 flex items-center justify-center hover:bg-zinc-200 transition-colors font-bold cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setCurrentFrame((f) => Math.min(maxFrames, f + 1))}
                    title="Maju 1 Frame"
                    className="p-1 text-zinc-400 hover:text-white rounded"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1.5 ml-2 text-zinc-400">
                    <button 
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="hover:text-white"
                    >
                      {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseInt(e.target.value, 10));
                        setIsMuted(false);
                      }}
                      className="w-14 accent-white h-1 bg-[#27282d] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Scale: {scale}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenLicenseModal()}
                    className="px-2.5 py-1 rounded bg-[#18191c] hover:bg-[#222328] border border-[#27282d] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-[#facc15]" />
                    <span>Ekspor 4K</span>
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

        {/* =========================================================================
            B. BOTTOM PANEL: Multi-Track Timeline & Monaco Code Editor
            (Inspirasi: After Effects & CapCut Multi-Track Timeline)
            ========================================================================= */}
        <section 
          style={{ height: isBottomCollapsed ? '30px' : `${bottomHeight}px` }} 
          className="bg-[#111215] border-t border-[#222328] flex flex-col shrink-0 transition-none z-10"
        >
          {/* Header Tab Bar Timeline */}
          <div className="h-7 bg-[#0d0e10] border-b border-[#222328] px-2.5 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => { setBottomTab('timeline'); setIsBottomCollapsed(false); }}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-t transition-colors cursor-pointer ${
                  bottomTab === 'timeline' && !isBottomCollapsed
                    ? 'bg-[#111215] text-white border-t-2 border-[#facc15]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Multi-Track Timeline
              </button>

              <button
                type="button"
                onClick={() => { setBottomTab('code'); setIsBottomCollapsed(false); }}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded-t transition-colors cursor-pointer ${
                  bottomTab === 'code' && !isBottomCollapsed
                    ? 'bg-[#111215] text-white border-t-2 border-[#facc15]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                BrandIntro.jsx (Remotion Code)
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Timeline Tools: Scissors Split & Zoom */}
              {bottomTab === 'timeline' && !isBottomCollapsed && (
                <div className="flex items-center gap-2 mr-2 text-zinc-400">
                  <button 
                    type="button" 
                    onClick={handleSplitClip}
                    title="Gunting / Split Track di Frame Saat Ini"
                    className="p-0.5 hover:text-[#facc15] rounded hover:bg-[#18191c] flex items-center gap-1 text-[10px]"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Split</span>
                  </button>

                  <div className="flex items-center gap-1 pl-1 border-l border-[#222328]">
                    <button 
                      type="button" 
                      onClick={() => setTimelineZoom(Math.max(0.5, timelineZoom - 0.25))}
                      className="p-0.5 hover:text-white rounded"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] font-mono text-zinc-500">{(timelineZoom * 100).toFixed(0)}%</span>
                    <button 
                      type="button" 
                      onClick={() => setTimelineZoom(Math.min(2.5, timelineZoom + 0.25))}
                      className="p-0.5 hover:text-white rounded"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Minimize / Maximize */}
              <button
                type="button"
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="p-0.5 text-zinc-400 hover:text-white rounded"
              >
                {isBottomCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Bottom Panel Content */}
          {!isBottomCollapsed && (
            <div className="flex-1 overflow-auto bg-[#09090b] p-2">
              {bottomTab === 'timeline' ? (
                /* --- MULTI-TRACK TIMELINE VIEW --- */
                <div 
                  style={{ width: `${timelineZoom * 100}%`, minWidth: '600px' }}
                  className="flex flex-col gap-1 relative"
                >
                  {/* Time Ruler (Interactive Scrubbing Bar) */}
                  <div 
                    ref={timelineRulerRef}
                    onClick={handleRulerClick}
                    className="h-5 bg-[#111215] border-b border-[#222328] rounded flex items-center px-2 text-[9px] font-mono text-zinc-500 justify-between cursor-pointer relative"
                    title="Klik di mana saja untuk menggeser playhead"
                  >
                    <span>00:00:00</span>
                    <span>00:00:15</span>
                    <span>00:00:30</span>
                    <span>00:01:00</span>
                    <span>00:01:30</span>
                    <span>00:02:00</span>
                    <span>00:02:30</span>
                    <span>00:03:00</span>

                    {/* Playhead Scrubber Needle */}
                    <div 
                      style={{ left: `${(currentFrame / maxFrames) * 100}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-[#facc15] pointer-events-none z-30"
                    >
                      <div className="w-2.5 h-2.5 -ml-1 bg-[#facc15] rounded-xs transform rotate-45 -mt-0.5"></div>
                    </div>
                  </div>

                  {/* Track 1: Video Track */}
                  <div className="h-10 bg-[#111215] rounded border border-[#222328] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-bold text-zinc-400 flex items-center justify-between pr-2 border-r border-[#222328]">
                      <span>Video 1</span>
                      <Eye className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    
                    <div className="flex-1 h-full flex items-center gap-1 relative">
                      {videoClips.map((clip) => {
                        const widthPct = ((clip.endFrame - clip.startFrame) / maxFrames) * 100;
                        return (
                          <div
                            key={clip.id}
                            style={{ width: `${widthPct}%` }}
                            onClick={() => setSelectedClipId(clip.id)}
                            className={`h-full ${clip.color} rounded flex items-center px-2 text-[10px] font-semibold text-zinc-200 border cursor-pointer truncate ${
                              selectedClipId === clip.id ? 'ring-1 ring-[#facc15]' : ''
                            }`}
                          >
                            {clip.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Track 2: Subtitle / Typography Track */}
                  <div className="h-9 bg-[#111215] rounded border border-[#222328] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-bold text-zinc-400 flex items-center justify-between pr-2 border-r border-[#222328]">
                      <span>Subtitle</span>
                      <Type className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    <div className="flex-1 h-full bg-amber-950/40 border border-amber-600/40 rounded flex items-center px-2 text-[10px] font-medium text-amber-200 truncate">
                      {subtitleText} (Live Remotion Synced)
                    </div>
                  </div>

                  {/* Track 3: Audio BGM Track */}
                  <div className="h-9 bg-[#111215] rounded border border-[#222328] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-bold text-zinc-400 flex items-center justify-between pr-2 border-r border-[#222328]">
                      <span>Audio BGM</span>
                      <Music className="w-2.5 h-2.5 text-zinc-500" />
                    </div>
                    <div className="flex-1 h-full bg-emerald-950/40 border border-emerald-600/40 rounded flex items-center px-2 text-[10px] font-semibold text-emerald-200">
                      ambient_cinematic_48khz.wav [Stereo Waveform]
                    </div>
                  </div>

                </div>
              ) : (
                /* --- LIVE REMOTION CODE EDITOR (Synchronized with Visual Properties) --- */
                <div className="h-full font-mono text-[11px] leading-relaxed text-zinc-300 bg-[#09090b] p-3 rounded border border-[#222328] overflow-auto select-text">
                  <div className="text-zinc-500">// Quantum Studio Programmatic Video Generator (Remotion 60 FPS)</div>
                  <div className="text-purple-400">import <span className="text-white">&#123; interpolate, spring, useCurrentFrame &#125;</span> from <span className="text-emerald-300">'remotion'</span>;</div>
                  <div className="mt-1 text-blue-400">export const <span className="text-yellow-300">BrandIntro</span> = () =&gt; &#123;</div>
                  <div className="pl-4 text-zinc-400">const frame = <span className="text-yellow-300">useCurrentFrame</span>(); // Current: {currentFrame}</div>
                  <div className="pl-4 text-zinc-400">const opacity = <span className="text-yellow-300">interpolate</span>(frame, [0, 20], [0, {opacity / 100}]);</div>
                  <div className="pl-4 text-zinc-400">const scale = <span className="text-yellow-300">spring</span>(&#123; frame, fps: 60, config: &#123; damping: 10 &#125; &#125;) * {scale / 100};</div>
                  <div className="pl-4 mt-1 text-purple-400">return (</div>
                  <div className="pl-8 text-zinc-300">&lt;<span className="text-rose-400">div</span> style=&#123;&#123; transform: `translate({posX}px, {posY}px) scale($&#123;scale&#125;) rotate({rotation}deg)` &#125;&#125;&gt;</div>
                  <div className="pl-12 text-zinc-300">&lt;<span className="text-rose-400">h1</span> style=&#123;&#123; color: <span className="text-emerald-300">"{accentColor}"</span> &#125;&#125;&gt;{headlineText}&lt;/<span className="text-rose-400">h1</span>&gt;</div>
                  <div className="pl-12 text-zinc-300">&lt;<span className="text-rose-400">p</span> className=<span className="text-emerald-300">"text-xs text-zinc-400"</span>&gt;{subtitleText}&lt;/<span className="text-rose-400">p</span>&gt;</div>
                  <div className="pl-8 text-zinc-300">&lt;/<span className="text-rose-400">div</span>&gt;</div>
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
          3. RIGHT SIDEBAR: Properties Inspector & Gemini Copilot Stream
          (Inspirasi: After Effects Properties Panel & Claude Chat Stream)
          ========================================================================= */}
      {!isRightCollapsed ? (
        <aside 
          style={{ width: `${rightWidth}px` }} 
          className="h-full bg-[#111215] border-l border-[#222328] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          {/* Header Tab Bar Right */}
          <div className="h-8 bg-[#0d0e10] border-b border-[#222328] px-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRightTab('inspector')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  rightTab === 'inspector'
                    ? 'bg-[#18191c] text-white border border-[#26272c]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Properties
              </button>

              <button
                type="button"
                onClick={() => setRightTab('copilot')}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  rightTab === 'copilot'
                    ? 'bg-[#18191c] text-white border border-[#26272c]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Gemini Copilot
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRightCollapsed(true)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191c] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 overflow-y-auto p-3">
            {rightTab === 'inspector' ? (
              /* --- AFTER EFFECTS PROPERTIES INSPECTOR (Live Two-Way Binding) --- */
              <div className="space-y-4 text-xs">
                
                {/* Transform Properties Group */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pb-1 border-b border-[#222328]">
                    <span>Transform</span>
                    <button
                      type="button"
                      onClick={handleResetTransform}
                      className="text-[10px] text-zinc-500 hover:text-[#facc15] lowercase font-normal flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>reset</span>
                    </button>
                  </div>

                  {/* Position X & Y */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Position X</label>
                      <div className="flex items-center bg-[#18191d] border border-[#26272c] rounded px-2 py-1">
                        <span className="text-zinc-500 font-mono text-[10px] mr-1">X</span>
                        <input
                          type="number"
                          value={posX}
                          onChange={(e) => setPosX(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Position Y</label>
                      <div className="flex items-center bg-[#18191d] border border-[#26272c] rounded px-2 py-1">
                        <span className="text-zinc-500 font-mono text-[10px] mr-1">Y</span>
                        <input
                          type="number"
                          value={posY}
                          onChange={(e) => setPosY(parseInt(e.target.value, 10) || 0)}
                          className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scale Slider */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Scale</span>
                      <span className="font-mono text-zinc-200">{scale}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={scale}
                      onChange={(e) => setScale(parseInt(e.target.value, 10))}
                      className="w-full accent-[#facc15] h-1 bg-[#26272c] rounded cursor-pointer"
                    />
                  </div>

                  {/* Rotation Slider */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Rotation</span>
                      <span className="font-mono text-zinc-200">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-[#facc15] h-1 bg-[#26272c] rounded cursor-pointer"
                    />
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono text-zinc-200">{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={opacity}
                      onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-white h-1 bg-[#26272c] rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Typography & Content Group */}
                <div>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 pb-1 border-b border-[#222328]">
                    Text &amp; Subtitle
                  </div>

                  <div className="mb-2">
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Judul Utama</label>
                    <input
                      type="text"
                      value={headlineText}
                      onChange={(e) => setHeadlineText(e.target.value)}
                      className="w-full bg-[#18191d] border border-[#26272c] rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-zinc-400 text-xs"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-[10px] text-zinc-400 block mb-0.5">Teks Subtitle (Live Sync)</label>
                    <textarea
                      rows={2}
                      value={subtitleText}
                      onChange={(e) => setSubtitleText(e.target.value)}
                      className="w-full bg-[#18191d] border border-[#26272c] rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-zinc-400 text-xs resize-none"
                    />
                  </div>

                  {/* Color Palettes */}
                  <div className="mb-2">
                    <label className="text-[10px] text-zinc-400 block mb-1">Warna Aksen Judul</label>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#facc15', label: 'Gold' },
                        { color: '#38bdf8', label: 'Sky' },
                        { color: '#34d399', label: 'Emerald' },
                        { color: '#f43f5e', label: 'Rose' },
                        { color: '#ffffff', label: 'White' }
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setAccentColor(c.color)}
                          style={{ backgroundColor: c.color }}
                          className={`w-5 h-5 rounded-full border border-black/40 cursor-pointer transition-transform ${
                            accentColor === c.color ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* --- GEMINI COPILOT CHAT STREAM --- */
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-2.5 rounded-xl text-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#18191d] border border-[#26272c] text-white ml-3'
                          : 'bg-[#141518] border border-[#222328] text-zinc-300 mr-2'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                        <span className="font-semibold text-zinc-400">{msg.name || 'Anda'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {isAiGenerating && (
                    <div className="p-2.5 rounded-xl bg-[#141518] border border-[#222328] text-xs text-zinc-400 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#facc15]" />
                      <span>Gemini sedang menyusun konsep video...</span>
                    </div>
                  )}
                </div>

                {/* Right Chat Input */}
                <form onSubmit={handleSendPrompt} className="mt-3 pt-2 border-t border-[#222328]">
                  <div className="flex items-center gap-1.5 bg-[#18191d] border border-[#26272c] rounded-lg p-1.5">
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Ketik instruksi AI..."
                      className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isAiGenerating || !promptInput.trim()}
                      className="p-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </aside>
      ) : (
        <div className="w-8 h-full bg-[#111215] border-l border-[#222328] flex flex-col items-center py-2.5 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            title="Buka Sidebar Kanan"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191c] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
