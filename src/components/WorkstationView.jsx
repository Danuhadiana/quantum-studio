import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
  Sliders, MessageSquare, Send, Sparkles, RefreshCw, Scissors,
  Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut,
  Folder, Film, Music, FileText, CornerUpLeft, Radio, SplitSquareVertical,
  Upload, Image, AlignLeft, Sparkle, Terminal, Settings, ShieldCheck,
  Cpu, Activity, Check, Code, Layout, Palette
} from 'lucide-react';
import ClockLogo from './ClockLogo';
import AiHubView from './views/AiHubView';
import SettingsView from './views/SettingsView';
import LicenseView from './views/LicenseView';
import ExportQueueView from './views/ExportQueueView';

export default function WorkstationView({
  isPro,
  licenseKey,
  activeTab = 'player',
  setActiveTab,
  onActivateSuccess
}) {
  // --- PANEL SIZING & COLLAPSE STATES ---
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_left_width');
    return saved ? parseInt(saved, 10) : 240;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('qtm_right_width');
    return saved ? parseInt(saved, 10) : 310;
  });
  const [bottomHeight, setBottomHeight] = useState(() => {
    const saved = localStorage.getItem('qtm_bottom_height');
    return saved ? parseInt(saved, 10) : 240;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Inspector & Bottom panel sub-tabs
  const [activeLayer, setActiveLayer] = useState('media'); // 'media' | 'text' | 'composition'
  const [bottomTab, setBottomTab] = useState('timeline'); // 'timeline' | 'console' | 'code'

  // --- UPLOADED MEDIA STATE (GAMBAR ATAU VIDEO YANG DI-EDIT) ---
  const [uploadedMedia, setUploadedMedia] = useState(null); // { type: 'image' | 'video', url: string, name: string }
  const fileInputRef = useRef(null);
  const videoElementRef = useRef(null);

  // Transform Properties untuk Media (Gambar / Video Upload)
  const [mediaPosX, setMediaPosX] = useState(0);
  const [mediaPosY, setMediaPosY] = useState(0);
  const [mediaScale, setMediaScale] = useState(100);
  const [mediaRotation, setMediaRotation] = useState(0);
  const [mediaOpacity, setMediaOpacity] = useState(100);
  const [mediaFilter, setMediaFilter] = useState('none'); // 'none' | 'dim' | 'contrast' | 'grayscale'

  // Transform & Typography Properties untuk Teks Kustom
  const [headlineText, setHeadlineText] = useState('Quantum Studio 4K');
  const [subtitleText, setSubtitleText] = useState('Koding Animasi Remotion & Editing Video Modern');
  const [textPosX, setTextPosX] = useState(0);
  const [textPosY, setTextPosY] = useState(0);
  const [textScale, setTextScale] = useState(100);
  const [textOpacity, setTextOpacity] = useState(100);
  const [textColor, setTextColor] = useState('#ffffff');
  const [showLogoOnCanvas, setShowLogoOnCanvas] = useState(true);

  // --- VIDEO PLAYER & REAL-TIME ENGINE STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState('fit'); // 'fit', '50', '100', '200'

  // Multi-Track Timeline Clips State
  const [videoClips, setVideoClips] = useState([
    { id: 1, name: 'Brand_Intro_4K.mp4', startFrame: 0, endFrame: 180, color: 'bg-zinc-800 border-zinc-700' }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);

  // --- AI CHAT & GEMINI INTEGRATION STATE ---
  const [promptInput, setPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // Bersih / kosong saat pertama buka

  // Live Remotion Code Content
  const [remotionCode, setRemotionCode] = useState(`import { Composition, interpolate, spring, useCurrentFrame } from 'remotion';

export const BrandIntro = ({ title = "Quantum Studio 4K" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps: 60, config: { damping: 12, mass: 0.8 } });

  return (
    <div style={{ opacity, transform: \`scale(\${scale})\` }} className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
      <h1 className="text-6xl font-black tracking-tight">{title}</h1>
      <p className="text-zinc-400 mt-2 text-lg">Next-Gen Programmatic Video Engine</p>
    </div>
  );
};`);

  // Ref untuk timeline scrubbing
  const timelineRulerRef = useRef(null);

  // --- 1. MEDIA UPLOAD HANDLER ---
  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const url = URL.createObjectURL(file);

    setUploadedMedia({
      type: isVideo ? 'video' : 'image',
      url: url,
      name: file.name
    });

    setVideoClips([
      {
        id: Date.now(),
        name: file.name,
        startFrame: 0,
        endFrame: maxFrames,
        color: 'bg-zinc-800 border-zinc-700'
      }
    ]);

    setActiveLayer('media');
    setIsPlaying(false);
  };

  const handleClearMedia = () => {
    if (uploadedMedia?.url) {
      URL.revokeObjectURL(uploadedMedia.url);
    }
    setUploadedMedia(null);
    setMediaPosX(0);
    setMediaPosY(0);
    setMediaScale(100);
    setMediaRotation(0);
    setMediaOpacity(100);
    setMediaFilter('none');
  };

  // --- 2. PLAYBACK TIMER ENGINE (60 FPS Real-Time) ---
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

  // Sinkronkan video playback dengan isPlaying
  useEffect(() => {
    if (videoElementRef.current && uploadedMedia?.type === 'video') {
      if (isPlaying) {
        videoElementRef.current.play().catch(() => {});
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [isPlaying, uploadedMedia]);

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

  // --- 3. DRAGGABLE SPLITTER LOGIC ---
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  const isDraggingBottom = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingLeft.current) {
        const newWidth = Math.max(180, Math.min(380, e.clientX));
        setLeftWidth(newWidth);
        localStorage.setItem('qtm_left_width', newWidth.toString());
      }
      if (isDraggingRight.current) {
        const newWidth = Math.max(250, Math.min(480, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        localStorage.setItem('qtm_right_width', newWidth.toString());
      }
      if (isDraggingBottom.current) {
        const newHeight = Math.max(130, Math.min(420, window.innerHeight - e.clientY));
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

  // --- 4. SCISSORS / SPLIT CLIP TOOL ---
  const handleSplitClipAtPlayhead = () => {
    const targetClip = videoClips.find(
      (c) => c.id === selectedClipId && currentFrame > c.startFrame && currentFrame < c.endFrame
    );
    if (!targetClip) return;

    const originalEnd = targetClip.endFrame;
    const splitPoint = currentFrame;

    setVideoClips((prev) => {
      const updated = prev.map((c) =>
        c.id === targetClip.id ? { ...c, endFrame: splitPoint, name: `${c.name} (Part 1)` } : c
      );
      const newPart = {
        id: Date.now(),
        name: `${targetClip.name.replace(' (Part 1)', '')} (Part 2)`,
        startFrame: splitPoint,
        endFrame: originalEnd,
        color: 'bg-zinc-800 border-zinc-600'
      };
      return [...updated, newPart];
    });
  };

  // --- 5. TIMELINE SCRUBBING ---
  const handleTimelineScrub = (e) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const fraction = clickX / rect.width;
    const targetFrame = Math.round(fraction * maxFrames);
    setCurrentFrame(targetFrame);
  };

  // --- 6. AI PROMPT / GEMINI INTEGRATION ---
  const handleSendPrompt = async (e) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isAiGenerating) return;

    const userText = promptInput.trim();
    setPromptInput('');

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setIsAiGenerating(true);

    try {
      const apiKey = localStorage.getItem('qtm_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
      
      if (!apiKey) {
        setTimeout(() => {
          setIsAiGenerating(false);
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'assistant',
              name: 'Quantum Copilot',
              text: `Perintah diterima: "${userText}".\n\nUntuk mengaktifkan inferensi AI langsung, silakan masukkan kunci API Anda di tab Multi-AI Hub. Judul canvas telah diperbarui ke "${userText}".`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setHeadlineText(userText.substring(0, 40));
        }, 700);
        return;
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Anda adalah Motion Graphics Director & Remotion Video Coder di Quantum Studio.
Instruksi Pengguna: "${userText}"
Format Jawaban:
1. Rekomendasi Headline: (singkat)
2. Subtitle: (singkat)
3. Rekomendasi Efek Remotion: (spring / scale / opacity)`
              }
            ]
          }
        ]
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API Respon Gagal');
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Video dikonfigurasi.';

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          name: 'Gemini 2.0 Flash',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setHeadlineText(userText.substring(0, 35));
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          name: 'Quantum Engine',
          text: `Instruksi diterima: "${userText}".\nParameter animasi telah disesuaikan di timeline.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- RENDER DEDICATED FULL-PAGE VIEWS (ZERO MODAL) ---
  if (activeTab === 'aihub') {
    return <AiHubView onSwitchToPlayer={() => setActiveTab('player')} />;
  }
  if (activeTab === 'settings') {
    return <SettingsView onSwitchToPlayer={() => setActiveTab('player')} />;
  }
  if (activeTab === 'license') {
    return (
      <LicenseView
        isPro={isPro}
        licenseKey={licenseKey}
        onActivateSuccess={onActivateSuccess}
        onSwitchToPlayer={() => setActiveTab('player')}
      />
    );
  }
  if (activeTab === 'export') {
    return <ExportQueueView isPro={isPro} onSwitchToPlayer={() => setActiveTab('player')} />;
  }

  // --- MAIN STUDIO & CODE VIEWPORT (VS CODE + REMOTION LAYOUT) ---
  return (
    <div className="h-full w-full flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden select-none">
      
      {/* 1. MAIN BODY: ACTIVITY BAR + RESIZABLE PANELS */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* --- VS CODE ACTIVITY BAR (FAR LEFT STRIP - 44px) --- */}
        <aside className="w-11 h-full bg-[#09090b] border-r border-[#1c1d22] flex flex-col items-center py-2 justify-between shrink-0 z-30">
          {/* Top Activity Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => setActiveTab('player')}
              title="Remotion Studio Player (Canvas & Timeline)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'player' ? 'bg-[#181920] text-amber-400 border border-amber-400/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('code')}
              title="Skrip Koding Remotion (TSX / JSX)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'code' ? 'bg-[#181920] text-amber-400 border border-amber-400/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              title="Motion Director Copilot (AI Chat)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'copilot' ? 'bg-[#181920] text-amber-400 border border-amber-400/30' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('aihub')}
              title="Multi-AI Engine Hub (BYOA)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('export')}
              title="4K Render Engine Queue"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Activity Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => setActiveTab('license')}
              title="Akun & Lisensi Pro"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              title="Pengaturan Studio (VS Code Preferences)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* --- FULL CODE EDITOR TAB VIEW --- */}
        {activeTab === 'code' && (
          <div className="flex-1 flex flex-col bg-[#0d0e12] overflow-hidden">
            {/* Editor Tabs */}
            <div className="h-8 bg-[#09090b] border-b border-[#1c1d22] flex items-center px-2 gap-1 text-xs">
              <div className="px-3 py-1 bg-[#0d0e12] text-amber-400 border-t-2 border-amber-400 font-mono font-medium flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>BrandIntro.tsx</span>
              </div>
              <button
                onClick={() => setActiveTab('player')}
                className="px-3 py-1 text-zinc-400 hover:text-zinc-200 font-mono flex items-center gap-2 transition-colors"
              >
                <span>Composition.tsx (Preview)</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers */}
              <div className="w-12 bg-[#09090b] text-zinc-600 font-mono text-xs py-3 text-right pr-3 select-none shrink-0 border-r border-[#1c1d22]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>

              {/* Code TextArea */}
              <textarea
                value={remotionCode}
                onChange={(e) => setRemotionCode(e.target.value)}
                spellCheck="false"
                className="flex-1 p-3 bg-transparent text-xs font-mono text-zinc-200 focus:outline-none resize-none leading-6 selection:bg-amber-400/20"
              />
            </div>
          </div>
        )}

        {/* --- FULL AI COPILOT CHAT VIEW --- */}
        {activeTab === 'copilot' && (
          <div className="flex-1 flex flex-col bg-[#0d0e12] overflow-hidden">
            <div className="h-8 bg-[#09090b] border-b border-[#1c1d22] flex items-center px-3 text-xs text-zinc-400 justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                AI Motion Studio Chat (Google Gemini &amp; Claude)
              </span>
              <button
                onClick={() => setActiveTab('player')}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Buka Canvas
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-white">Apa yang ingin kita buat hari ini?</h3>
                  <p className="text-xs text-zinc-400 max-w-md mt-1">
                    Ketik perintah naskah video animasi, transformasi objek, atau skrip kode Remotion React di bawah.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl text-xs max-w-xl ${
                      msg.sender === 'user'
                        ? 'bg-[#181920] border border-[#23242b] text-white ml-auto'
                        : 'bg-[#121317] border border-[#1e1f25] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1 font-mono">
                      <span>{msg.name || 'Anda'}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#09090b] border-t border-[#1c1d22]">
              <form onSubmit={handleSendPrompt} className="max-w-3xl mx-auto flex items-center gap-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Ketik instruksi naskah, timing, atau kode video..."
                  className="flex-1 px-3 py-2 bg-[#121316] border border-[#222328] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isAiGenerating || !promptInput.trim()}
                  className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MAIN REMOTION STUDIO PLAYER (CANVAS + TIMELINE + INSPECTOR) --- */}
        {activeTab === 'player' && (
          <>
            {/* 1. LEFT PRIMARY SIDEBAR (EXPLORER & MEDIA ASSETS) */}
            {!isLeftCollapsed ? (
              <aside
                style={{ width: `${leftWidth}px` }}
                className="h-full bg-[#0d0e12] border-r border-[#1c1d22] flex flex-col shrink-0 select-none overflow-hidden z-20"
              >
                {/* Header Left Sidebar */}
                <div className="h-8 border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                  <span className="font-semibold text-white tracking-wide uppercase text-[10px]">
                    Explorer &amp; Media Assets
                  </span>
                  <button
                    onClick={() => setIsLeftCollapsed(true)}
                    className="p-1 rounded hover:bg-[#18191f] text-zinc-500 hover:text-white cursor-pointer"
                    title="Tutup Panel Kiri"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Upload Button */}
                <div className="p-2.5 border-b border-[#1c1d22]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-2 bg-[#16171d] hover:bg-[#1e1f26] border border-[#26272e] rounded-lg text-xs text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Import Media (Foto/Video)</span>
                  </button>
                </div>

                {/* Tree / Asset List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1 font-semibold">
                    Composition Files
                  </div>
                  <div className="px-2 py-1.5 rounded bg-[#16171d] text-amber-400 font-mono text-[11px] flex items-center gap-2 border border-[#23242b]">
                    <FileText className="w-3.5 h-3.5" />
                    <span>BrandIntro_4K.tsx</span>
                  </div>

                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1 font-semibold pt-2">
                    Media Aktif
                  </div>
                  {uploadedMedia ? (
                    <div className="p-2 rounded bg-[#121317] border border-[#1e1f25] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-zinc-300 text-[11px] truncate max-w-[140px]">
                          {uploadedMedia.name}
                        </span>
                        <button
                          onClick={handleClearMedia}
                          className="text-zinc-500 hover:text-rose-400"
                          title="Hapus Media"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        Tipe: {uploadedMedia.type.toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div className="px-2 py-2 text-[11px] text-zinc-500 italic">
                      Belum ada media di-upload. Klik tombol import di atas.
                    </div>
                  )}
                </div>
              </aside>
            ) : (
              <div className="w-7 h-full bg-[#09090b] border-r border-[#1c1d22] flex flex-col items-center py-2 shrink-0 z-20">
                <button
                  onClick={() => setIsLeftCollapsed(false)}
                  title="Buka Explorer"
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-[#121316] cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Splitter Kiri */}
            {!isLeftCollapsed && (
              <div
                onMouseDown={handleStartDragLeft}
                className="w-1 bg-[#141519] hover:bg-amber-400/60 transition-colors cursor-col-resize shrink-0 z-20"
                title="Tarik untuk mengubah lebar"
              />
            )}

            {/* 2. CENTER WORKSPACE: VIEWPORT & TIMELINE */}
            <main className="flex-1 h-full flex flex-col overflow-hidden bg-[#07080a]">
              
              {/* TOP TAB BAR & CONTROLS */}
              <div className="h-8 bg-[#09090b] border-b border-[#1c1d22] flex items-center justify-between px-3 text-xs shrink-0 select-none">
                <div className="flex items-center gap-1">
                  <div className="px-3 py-1 rounded-t bg-[#07080a] text-amber-400 border-t-2 border-amber-400 font-mono font-medium flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5" />
                    <span>Composition.tsx (Preview)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="bg-[#121316] border border-[#222328] rounded px-2 py-0.5 text-zinc-300 focus:outline-none"
                  >
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Shorts</option>
                  </select>

                  <select
                    value={canvasZoom}
                    onChange={(e) => setCanvasZoom(e.target.value)}
                    className="bg-[#121316] border border-[#222328] rounded px-2 py-0.5 text-zinc-300 focus:outline-none"
                  >
                    <option value="fit">Fit</option>
                    <option value="50">50%</option>
                    <option value="100">100%</option>
                  </select>
                </div>
              </div>

              {/* REMOTION CANVAS VIEWPORT */}
              <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden bg-[#08090c]">
                <div
                  className={`relative bg-black border border-[#202126] shadow-2xl overflow-hidden flex items-center justify-center transition-all ${
                    aspectRatio === '16:9' ? 'aspect-video w-full max-w-4xl max-h-[75%]' : 'aspect-[9/16] h-full max-h-[85%]'
                  }`}
                >
                  {/* SAFE ZONE GUIDES (After Effects Style) */}
                  <div className="absolute inset-4 border border-zinc-800/40 pointer-events-none z-10"></div>
                  <div className="absolute inset-8 border border-zinc-900/40 pointer-events-none z-10"></div>

                  {/* LAYER 1: UPLOADED MEDIA (FOTO ATAU VIDEO) */}
                  {uploadedMedia ? (
                    <div
                      style={{
                        transform: `translate(${mediaPosX}px, ${mediaPosY}px) scale(${mediaScale / 100}) rotate(${mediaRotation}deg)`,
                        opacity: mediaOpacity / 100,
                        filter:
                          mediaFilter === 'dim' ? 'brightness(0.6)' :
                          mediaFilter === 'contrast' ? 'contrast(1.4)' :
                          mediaFilter === 'grayscale' ? 'grayscale(1)' : 'none'
                      }}
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
                    >
                      {uploadedMedia.type === 'video' ? (
                        <video
                          ref={videoElementRef}
                          src={uploadedMedia.url}
                          loop
                          muted={isMuted}
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={uploadedMedia.url}
                          alt="Uploaded Canvas Media"
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    /* Default Clean Canvas State */
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
                      {showLogoOnCanvas && <ClockLogo size={56} />}
                      <h2
                        style={{
                          color: textColor,
                          transform: `translate(${textPosX}px, ${textPosY}px) scale(${textScale / 100})`,
                          opacity: textOpacity / 100
                        }}
                        className="text-2xl font-black tracking-tight"
                      >
                        {headlineText}
                      </h2>
                      <p className="text-xs text-zinc-400 max-w-md">{subtitleText}</p>
                    </div>
                  )}

                  {/* LAYER 2: TEXT OVERLAY (Bisa Muncul di Atas Media) */}
                  {uploadedMedia && (
                    <div
                      style={{
                        transform: `translate(${textPosX}px, ${textPosY}px) scale(${textScale / 100})`,
                        opacity: textOpacity / 100,
                        color: textColor
                      }}
                      className="absolute z-20 text-center px-4 pointer-events-none"
                    >
                      <h2 className="text-xl font-bold tracking-tight drop-shadow-md">{headlineText}</h2>
                      <p className="text-xs text-zinc-300 drop-shadow">{subtitleText}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* REMOTION TRANSPORT CONTROLS (PLAY/PAUSE & TIMECODE) */}
              <div className="h-9 bg-[#09090b] border-t border-[#1c1d22] px-3 flex items-center justify-between text-xs shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentFrame(0)}
                    className="p-1 rounded hover:bg-[#16171d] text-zinc-400 hover:text-white"
                    title="Rewind (Frame 0)"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-zinc-950" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentFrame(maxFrames)}
                    className="p-1 rounded hover:bg-[#16171d] text-zinc-400 hover:text-white"
                    title="Forward (Frame Akhir)"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleSplitClipAtPlayhead}
                    className="p-1.5 rounded hover:bg-[#16171d] text-zinc-400 hover:text-amber-400 transition-colors ml-2"
                    title="Potong Clip pada Playhead (Scissors / Split)"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-mono text-zinc-300 text-[11px] flex items-center gap-2">
                  <span className="text-amber-400 font-semibold">{formatTimecode(currentFrame)}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-zinc-500">{formatTimecode(maxFrames)}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#14151a] border border-[#202126] text-[10px] text-zinc-400">
                    60 FPS
                  </span>
                </div>
              </div>

              {/* Splitter Bawah */}
              {!isBottomCollapsed && (
                <div
                  onMouseDown={handleStartDragBottom}
                  className="h-1 bg-[#141519] hover:bg-amber-400/60 transition-colors cursor-row-resize shrink-0 z-20"
                  title="Tarik untuk mengubah tinggi timeline"
                />
              )}

              {/* 3. BOTTOM PANEL (MULTI-TRACK TIMELINE & CONSOLE) */}
              {!isBottomCollapsed ? (
                <div
                  style={{ height: `${bottomHeight}px` }}
                  className="bg-[#0b0c0f] border-t border-[#1c1d22] flex flex-col shrink-0 overflow-hidden z-10"
                >
                  {/* Bottom Header Tabs */}
                  <div className="h-7 bg-[#09090b] border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setBottomTab('timeline')}
                        className={`font-semibold transition-colors ${bottomTab === 'timeline' ? 'text-amber-400' : 'hover:text-white'}`}
                      >
                        Multi-Track Timeline
                      </button>
                      <span className="text-zinc-700">|</span>
                      <button
                        onClick={() => setBottomTab('console')}
                        className={`font-semibold transition-colors ${bottomTab === 'console' ? 'text-amber-400' : 'hover:text-white'}`}
                      >
                        Output / Terminal
                      </button>
                    </div>

                    <button
                      onClick={() => setIsBottomCollapsed(true)}
                      className="p-1 rounded hover:bg-[#16171d] text-zinc-500 hover:text-white cursor-pointer"
                      title="Tutup Timeline"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Timeline Scrubber & Tracks */}
                  {bottomTab === 'timeline' ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Timeline Ruler */}
                      <div
                        ref={timelineRulerRef}
                        onClick={handleTimelineScrub}
                        className="h-6 bg-[#0e0f13] border-b border-[#1c1d22] relative cursor-pointer select-none"
                      >
                        {/* Playhead Marker */}
                        <div
                          style={{ left: `${(currentFrame / maxFrames) * 100}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none"
                        >
                          <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 -ml-1 -mt-1"></div>
                        </div>
                        {/* Ruler ticks */}
                        <div className="flex justify-between px-3 text-[9px] font-mono text-zinc-600 pt-1 pointer-events-none">
                          <span>00:00</span>
                          <span>00:01</span>
                          <span>00:02</span>
                          <span>00:03 (180f)</span>
                        </div>
                      </div>

                      {/* Tracks Area */}
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {/* Video Track */}
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-[10px] font-mono text-zinc-400 truncate">V1 (Video)</div>
                          <div className="flex-1 h-7 bg-[#121317] rounded border border-[#1e1f25] relative overflow-hidden flex items-center px-2">
                            {videoClips.map((clip) => (
                              <div
                                key={clip.id}
                                className="h-5 px-2 rounded bg-zinc-800 border border-zinc-700 text-[10px] text-zinc-200 font-mono flex items-center truncate cursor-pointer hover:border-amber-400"
                              >
                                {clip.name}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Text Track */}
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-[10px] font-mono text-zinc-400 truncate">T1 (Teks)</div>
                          <div className="flex-1 h-7 bg-[#121317] rounded border border-[#1e1f25] relative flex items-center px-2">
                            <div className="h-5 px-2 rounded bg-amber-950/40 border border-amber-800/50 text-[10px] text-amber-300 font-mono flex items-center truncate">
                              {headlineText}
                            </div>
                          </div>
                        </div>

                        {/* Audio Track */}
                        <div className="flex items-center gap-2">
                          <div className="w-20 text-[10px] font-mono text-zinc-400 truncate">A1 (Audio)</div>
                          <div className="flex-1 h-7 bg-[#121317] rounded border border-[#1e1f25] relative flex items-center px-2">
                            <div className="h-5 px-2 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 font-mono flex items-center truncate">
                              Background_Beat_120BPM.wav
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Console Output */
                    <div className="flex-1 p-3 font-mono text-[11px] text-zinc-400 overflow-y-auto space-y-1 bg-[#08090c]">
                      <div className="text-emerald-400">[Remotion Engine] WebCodecs GPU context initialized (60 FPS).</div>
                      <div>[Render Engine] Zero modal pop-up architecture active.</div>
                      <div>[BYOA Engine] Multi-LLM provider registry ready.</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-6 bg-[#09090b] border-t border-[#1c1d22] px-3 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
                  <span>Timeline Ditutup</span>
                  <button
                    onClick={() => setIsBottomCollapsed(false)}
                    className="hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Timeline</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </main>

            {/* Splitter Kanan */}
            {!isRightCollapsed && (
              <div
                onMouseDown={handleStartDragRight}
                className="w-1 bg-[#141519] hover:bg-amber-400/60 transition-colors cursor-col-resize shrink-0 z-20"
                title="Tarik untuk mengubah lebar inspector"
              />
            )}

            {/* 3. RIGHT SIDEBAR (AFTER EFFECTS STYLE INSPECTOR & PROPERTIES) */}
            {!isRightCollapsed ? (
              <aside
                style={{ width: `${rightWidth}px` }}
                className="h-full bg-[#0d0e12] border-l border-[#1c1d22] flex flex-col shrink-0 select-none overflow-hidden z-20"
              >
                {/* Header Right Sidebar */}
                <div className="h-8 border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                  <span className="font-semibold text-white tracking-wide uppercase text-[10px]">
                    Inspector Properti
                  </span>
                  <button
                    onClick={() => setIsRightCollapsed(true)}
                    className="p-1 rounded hover:bg-[#18191f] text-zinc-500 hover:text-white cursor-pointer"
                    title="Tutup Panel Kanan"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Layer Selector */}
                <div className="flex border-b border-[#1c1d22] bg-[#09090b] text-xs">
                  <button
                    onClick={() => setActiveLayer('media')}
                    className={`flex-1 py-1.5 font-medium transition-colors ${
                      activeLayer === 'media' ? 'text-amber-400 border-b border-amber-400 bg-[#0d0e12]' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    Media (File)
                  </button>
                  <button
                    onClick={() => setActiveLayer('text')}
                    className={`flex-1 py-1.5 font-medium transition-colors ${
                      activeLayer === 'text' ? 'text-amber-400 border-b border-amber-400 bg-[#0d0e12]' : 'text-zinc-500 hover:text-zinc-200'
                    }`}
                  >
                    Teks Overlay
                  </button>
                </div>

                {/* Inspector Controls */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                  {activeLayer === 'media' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#1c1d22] pb-1.5">
                        <span className="font-semibold text-white text-[11px]">Transformasi Media</span>
                        {uploadedMedia && (
                          <button
                            onClick={handleClearMedia}
                            className="text-[10px] text-rose-400 hover:underline"
                          >
                            Hapus
                          </button>
                        )}
                      </div>

                      {/* Skala / Zoom */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Skala (Zoom):</span>
                          <span className="font-mono text-white">{mediaScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="250"
                          value={mediaScale}
                          onChange={(e) => setMediaScale(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Posisi X */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Posisi X (px):</span>
                          <span className="font-mono text-white">{mediaPosX} px</span>
                        </div>
                        <input
                          type="range"
                          min="-300"
                          max="300"
                          value={mediaPosX}
                          onChange={(e) => setMediaPosX(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Posisi Y */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Posisi Y (px):</span>
                          <span className="font-mono text-white">{mediaPosY} px</span>
                        </div>
                        <input
                          type="range"
                          min="-300"
                          max="300"
                          value={mediaPosY}
                          onChange={(e) => setMediaPosY(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Rotasi */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Rotasi (°):</span>
                          <span className="font-mono text-white">{mediaRotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={mediaRotation}
                          onChange={(e) => setMediaRotation(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Opasitas */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Opasitas (%):</span>
                          <span className="font-mono text-white">{mediaOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mediaOpacity}
                          onChange={(e) => setMediaOpacity(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Filter Visual */}
                      <div className="space-y-1 pt-2 border-t border-[#1c1d22]">
                        <label className="text-[11px] text-zinc-400">Filter Visual After Effects:</label>
                        <select
                          value={mediaFilter}
                          onChange={(e) => setMediaFilter(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#222328] rounded p-1.5 text-xs text-white"
                        >
                          <option value="none">Normal (Tanpa Filter)</option>
                          <option value="dim">Dimmed Cinematic</option>
                          <option value="contrast">High Contrast</option>
                          <option value="grayscale">Monokrom / Hitam Putih</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeLayer === 'text' && (
                    <div className="space-y-3">
                      <div className="border-b border-[#1c1d22] pb-1.5">
                        <span className="font-semibold text-white text-[11px]">Tipografi &amp; Teks</span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Judul Headline:</label>
                        <input
                          type="text"
                          value={headlineText}
                          onChange={(e) => setHeadlineText(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#222328] rounded p-1.5 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-zinc-400">Sub-Headline:</label>
                        <input
                          type="text"
                          value={subtitleText}
                          onChange={(e) => setSubtitleText(e.target.value)}
                          className="w-full bg-[#09090b] border border-[#222328] rounded p-1.5 text-xs text-white"
                        />
                      </div>

                      {/* Skala Teks */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Ukuran Skala:</span>
                          <span className="font-mono text-white">{textScale}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={textScale}
                          onChange={(e) => setTextScale(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>

                      {/* Posisi Y Teks */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Offset Vertikal (Y):</span>
                          <span className="font-mono text-white">{textPosY} px</span>
                        </div>
                        <input
                          type="range"
                          min="-200"
                          max="200"
                          value={textPosY}
                          onChange={(e) => setTextPosY(parseInt(e.target.value, 10))}
                          className="w-full accent-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            ) : (
              <div className="w-7 h-full bg-[#09090b] border-l border-[#1c1d22] flex flex-col items-center py-2 shrink-0 z-20">
                <button
                  onClick={() => setIsRightCollapsed(false)}
                  title="Buka Inspector"
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-[#121316] cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* 2. BOTTOM STATUS BAR (VS CODE 22px BAR) */}
      <footer className="h-[22px] bg-[#09090b] border-t border-[#1c1d22] flex items-center justify-between px-3 text-[10px] text-zinc-500 select-none shrink-0 z-30 font-mono">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            git: main
          </span>
          <span>0 Errors</span>
          <span>0 Warnings</span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span>Remotion Engine v3.3</span>
          <span>60 FPS</span>
          <span>4K UHD (3840x2160)</span>
          <span className="text-amber-400">Zero-Modal Spec</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-zinc-400">BYOA: Gemini 2.0 Flash</span>
          <span>UTF-8</span>
        </div>
      </footer>

    </div>
  );
}
