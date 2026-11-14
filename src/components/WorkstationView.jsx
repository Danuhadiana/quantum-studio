import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Scissors, Sliders, Volume2, VolumeX, Type, Send, Key, 
  Database, Cpu, Check, Download, Zap, RefreshCw, Maximize2, 
  Minimize2, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown, 
  ChevronUp, Plus, MessageSquare, Video, Layers, Settings, 
  Paperclip, ArrowUpRight, Sparkles, Move, Film, Music, FileText, 
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Unlock,
  Palette, Trash2, SplitSquareVertical, Clock, CornerUpLeft, Radio,
  Upload, Image, AlignLeft, Sparkle
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
    return saved ? parseInt(saved, 10) : 240;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // --- WORKSPACE MODES & TABS ---
  const [centerMode, setCenterMode] = useState('welcome'); // 'welcome' | 'canvas'
  const [activeNav, setActiveNav] = useState('chat'); // 'chat' | 'videos' | 'assets'
  const [rightTab, setRightTab] = useState('inspector'); // 'inspector' | 'copilot'
  const [bottomTab, setBottomTab] = useState('timeline'); // 'timeline' | 'code'

  // --- ACTIVE INSPECTOR LAYER (Media vs Text vs Composition) ---
  const [activeLayer, setActiveLayer] = useState('media'); // 'media' | 'text'

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
  const [textColor, setTextColor] = useState('#ffffff'); // Default clean white (tidak mencolok)
  const [showLogoOnCanvas, setShowLogoOnCanvas] = useState(true);

  // --- VIDEO PLAYER & REAL-TIME ENGINE STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);

  // Multi-Track Timeline Clips State
  const [videoClips, setVideoClips] = useState([
    { id: 1, name: 'Brand_Intro_4K.mp4', startFrame: 0, endFrame: 180, color: 'bg-zinc-800 border-zinc-700' }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);

  // --- AI CHAT & GEMINI INTEGRATION STATE (KOSONGKAN DULU RIWAYAT CHAT) ---
  const [promptInput, setPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // Bersih / kosongan saat awal dibuka

  // Ref untuk timeline scrubbing
  const timelineRulerRef = useRef(null);

  // --- 1. MEDIA UPLOAD HANDLER (Gambar atau Video) ---
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

    // Update klip di timeline agar sesuai file yang di-upload
    setVideoClips([
      {
        id: Date.now(),
        name: file.name,
        startFrame: 0,
        endFrame: maxFrames,
        color: 'bg-zinc-800 border-zinc-700'
      }
    ]);

    // Buka canvas dan aktifkan layer media di inspector
    setCenterMode('canvas');
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
        const newWidth = Math.max(190, Math.min(400, e.clientX));
        setLeftWidth(newWidth);
        localStorage.setItem('qtm_left_width', newWidth.toString());
      }
      if (isDraggingRight.current) {
        const newWidth = Math.max(250, Math.min(480, window.innerWidth - e.clientX));
        setRightWidth(newWidth);
        localStorage.setItem('qtm_right_width', newWidth.toString());
      }
      if (isDraggingBottom.current) {
        const newHeight = Math.max(130, Math.min(450, window.innerHeight - e.clientY));
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

  // --- 4. TIMELINE SCRUBBING & SCISSORS ---
  const handleRulerClick = (e) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetFrame = Math.round((clickX / rect.width) * maxFrames);
    setCurrentFrame(targetFrame);
  };

  const handleSplitClip = () => {
    setVideoClips((prev) => {
      const active = prev.find((c) => c.startFrame <= currentFrame && c.endFrame >= currentFrame);
      if (!active || currentFrame <= active.startFrame || currentFrame >= active.endFrame) {
        return prev;
      }
      const part1 = { ...active, endFrame: currentFrame };
      const part2 = {
        id: Date.now(),
        name: `${active.name.replace(/\.[^/.]+$/, '')}_PartB`,
        startFrame: currentFrame,
        endFrame: active.endFrame,
        color: 'bg-zinc-800/90 border-zinc-600'
      };
      return prev.map((c) => (c.id === active.id ? part1 : c)).concat(part2);
    });
  };

  // Reset Transformasi Inspector
  const handleResetMediaTransform = () => {
    setMediaPosX(0);
    setMediaPosY(0);
    setMediaScale(100);
    setMediaRotation(0);
    setMediaOpacity(100);
    setMediaFilter('none');
  };

  const handleResetTextTransform = () => {
    setTextPosX(0);
    setTextPosY(0);
    setTextScale(100);
    setTextOpacity(100);
    setTextColor('#ffffff');
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

    if (centerMode === 'welcome') {
      setCenterMode('canvas');
    }

    try {
      const apiKey = getActiveGeminiKey();
      const model = 'gemini-flash-lite-latest';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const systemPrompt = `Anda adalah Quantum Copilot untuk video editor Quantum Studio.
Berikan respon ringkas dan teknis dalam Bahasa Indonesia.
Jika pengguna meminta video atau animasi, berikan:
[JUDUL: Judul Singkat 3-5 Kata]
[SUBTITLE: Tagline Singkat]
Lalu 3 poin alur adegan (Scene 1, Scene 2, Scene 3).`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `Permintaan: "${textToSend}"` }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Gagal memproses respon AI.';

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

      setIsPlaying(true);

    } catch (err) {
      console.error('Error invoking Gemini:', err);
      const fallbackTitle = textToSend.slice(0, 24);
      setHeadlineText(fallbackTitle || 'Quantum Studio 4K');
      setSubtitleText(textToSend);

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          name: 'Quantum Copilot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Konsep untuk "${textToSend}" telah disinkronkan ke Canvas Viewport.`
        }
      ]);
      setIsPlaying(true);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#09090b] text-zinc-300 select-none font-sans text-xs">
      
      {/* Hidden File Input untuk Media (Gambar atau Video) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleMediaFileChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* =========================================================================
          1. LEFT SIDEBAR: Navigasi & Proyek (Minimalis Monokrom Bersih)
          ========================================================================= */}
      {!isLeftCollapsed ? (
        <aside 
          style={{ width: `${leftWidth}px` }} 
          className="h-full bg-[#111215] border-r border-[#202126] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          <div className="p-2.5 flex flex-col gap-2">
            {/* Header Sidebar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#202126]">
              <div className="flex items-center gap-2">
                <ClockLogo size={18} />
                <span className="font-semibold text-xs tracking-tight text-white">Quantum Studio</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                title="Tutup Panel Kiri"
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191d] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* "+ New Project" Button */}
            <button
              type="button"
              onClick={() => {
                setCenterMode('welcome');
                setActiveNav('chat');
              }}
              className="w-full py-1.5 px-2.5 rounded-md bg-[#16171b] hover:bg-[#1e1f24] border border-[#26272c] text-white text-xs font-medium flex items-center justify-between transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
                <span>+ Proyek Baru</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Ctrl+N</span>
            </button>

            {/* Quick Upload Media Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-1.5 px-2.5 rounded-md bg-[#16171b] hover:bg-[#1e1f24] border border-[#26272c] text-zinc-200 text-xs font-medium flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Upload Gambar / Video</span>
              </div>
              <span className="text-[10px] text-zinc-500">File</span>
            </button>

            {/* Navigation Links */}
            <nav className="flex flex-col gap-0.5 text-xs font-medium pt-1">
              <button
                type="button"
                onClick={() => { setActiveNav('chat'); setCenterMode('welcome'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'chat' && centerMode === 'welcome'
                    ? 'bg-[#1b1c21] text-white font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#151619]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Chat Asisten AI</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveNav('videos'); setCenterMode('canvas'); }}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'videos' || centerMode === 'canvas'
                    ? 'bg-[#1b1c21] text-white font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#151619]'
                }`}
              >
                <Film className="w-3.5 h-3.5 shrink-0 text-zinc-300" />
                <span>Canvas Viewport</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav('assets')}
                className={`w-full px-2.5 py-1.5 rounded-md flex items-center gap-2 text-left transition-colors cursor-pointer ${
                  activeNav === 'assets' 
                    ? 'bg-[#1b1c21] text-white font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-[#151619]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Media &amp; Aset</span>
              </button>
            </nav>

            {/* Active Media Status Info */}
            {uploadedMedia && (
              <div className="p-2 rounded bg-[#16171b] border border-[#26272c] mt-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Media Aktif</span>
                  <button 
                    onClick={handleClearMedia}
                    className="text-zinc-500 hover:text-rose-400"
                    title="Hapus media"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="text-[11px] text-zinc-200 truncate font-mono">
                  {uploadedMedia.name}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                  Format: {uploadedMedia.type}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Left Status */}
          <div className="p-2 border-t border-[#202126] bg-[#0c0d10] flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
              <span className="font-mono text-zinc-300">Gemini 2.5 Active</span>
            </div>
            <button
              onClick={onOpenSettingsModal}
              title="Pengaturan Kunci API"
              className="hover:text-white p-1 rounded hover:bg-[#18191d]"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </aside>
      ) : (
        <div className="w-7 h-full bg-[#111215] border-r border-[#202126] flex flex-col items-center py-2 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setIsLeftCollapsed(false)}
            title="Buka Sidebar Kiri"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191d] cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Left Resizer Drag Handle */}
      {!isLeftCollapsed && (
        <div
          onMouseDown={handleStartDragLeft}
          className="w-1 bg-transparent hover:bg-zinc-600 transition-colors resizer-x shrink-0 z-30"
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
              
              {/* Header Status Bar */}
              <div className="w-full flex items-center justify-between text-xs text-zinc-400 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-200 font-medium">Workspace Baru</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 font-mono">
                    {uploadedMedia ? `File: ${uploadedMedia.name}` : 'Belum ada media terunggah'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCenterMode('canvas')}
                  className="px-2.5 py-1 rounded bg-[#131417] border border-[#222328] text-zinc-300 hover:text-white hover:bg-[#18191d] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3 h-3 text-zinc-400" />
                  <span>Buka Canvas Viewport</span>
                </button>
              </div>

              {/* Welcoming Greeting & Dial Logo */}
              <div className="flex flex-col items-center text-center my-auto w-full max-w-xl">
                <div className="mb-3 p-2.5 rounded-xl bg-[#121316] border border-[#202126] shadow-sm">
                  <ClockLogo size={36} />
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  What are we making today?
                </h1>
                
                <p className="text-xs text-zinc-400 mt-1.5 max-w-md leading-relaxed">
                  Unggah gambar atau video untuk diedit, generate naskah dengan Gemini AI, atau tulis animasi kode Remotion React.
                </p>

                {/* 4 Minimalist Action Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mt-6 text-left">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-lg bg-[#121316] hover:bg-[#16171b] border border-[#202126] hover:border-[#2b2c32] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-5 h-5 rounded bg-[#18191d] border border-[#24252a] flex items-center justify-center text-zinc-300 mb-2">
                        <Upload className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-semibold text-white">
                        Upload Media
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Gambar atau video lokal.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleSendPrompt(null, 'Buatkan konsep animasi intro video 10 detik bertema teknologi modern');
                    }}
                    className="p-3 rounded-lg bg-[#121316] hover:bg-[#16171b] border border-[#202126] hover:border-[#2b2c32] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-5 h-5 rounded bg-[#18191d] border border-[#24252a] flex items-center justify-center text-zinc-300 mb-2">
                        <Sparkles className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-semibold text-white">
                        Prompt AI
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Gemini buat naskah scene.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('timeline');
                    }}
                    className="p-3 rounded-lg bg-[#121316] hover:bg-[#16171b] border border-[#202126] hover:border-[#2b2c32] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-5 h-5 rounded bg-[#18191d] border border-[#24252a] flex items-center justify-center text-zinc-300 mb-2">
                        <Scissors className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-semibold text-white">
                        Potong Video
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Timeline split &amp; trim.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCenterMode('canvas');
                      setBottomTab('code');
                    }}
                    className="p-3 rounded-lg bg-[#121316] hover:bg-[#16171b] border border-[#202126] hover:border-[#2b2c32] transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-5 h-5 rounded bg-[#18191d] border border-[#24252a] flex items-center justify-center text-zinc-300 mb-2">
                        <Film className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-semibold text-white">
                        Kode React
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Remotion video script.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Central Prompt Input Bar (Claude / Gemini Style) */}
              <div className="w-full max-w-xl mt-4">
                <form 
                  onSubmit={(e) => handleSendPrompt(e)}
                  className="bg-[#121316] border border-[#222328] rounded-xl p-2 shadow-lg focus-within:border-zinc-500 transition-colors"
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
                    placeholder="Ketik instruksi video, atau upload gambar/video untuk diedit..."
                    className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="flex items-center justify-between pt-1.5 border-t border-[#1a1b20] text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload gambar atau video lokal"
                        className="p-1 hover:text-white rounded hover:bg-[#18191d] transition-colors flex items-center gap-1 text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Upload</span>
                      </button>

                      <span className="text-[10px] font-medium text-zinc-400 bg-[#16171a] px-2 py-0.5 rounded border border-[#222328] flex items-center gap-1">
                        <span>Gemini 2.5 Active</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setAspectRatio(aspectRatio === '16:9' ? '9:16' : '16:9')}
                        className="px-1.5 py-0.5 rounded bg-[#16171a] border border-[#222328] text-[10px] font-mono text-zinc-300 hover:text-white"
                      >
                        {aspectRatio}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isAiGenerating || !promptInput.trim()}
                      className="px-3 py-1 rounded bg-zinc-200 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
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
            /* --- ACTIVE CANVAS VIEWPORT (Gambar / Video Upload + Teks + Remotion) --- */
            <div className="flex-1 flex flex-col overflow-hidden bg-[#070709]">
              
              {/* Top Viewport Status Toolbar */}
              <div className="h-8 bg-[#111215] border-b border-[#202126] px-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-zinc-400 bg-[#16171b] px-1.5 py-0.2 rounded border border-[#24252a]">
                    CANVAS (60 FPS)
                  </span>
                  <span className="text-[11px] font-mono text-white font-medium">
                    {formatTimecode(currentFrame)}
                  </span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    00:00:03:00
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Upload Media Button in Canvas Header */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2 py-0.5 rounded bg-[#16171b] border border-[#24252a] text-[10px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadedMedia ? 'Ganti Media' : 'Upload Media'}</span>
                  </button>

                  {/* Aspect Ratio Switcher */}
                  <div className="flex bg-[#16171b] p-0.5 rounded border border-[#24252a] text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('16:9')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '16:9' ? 'bg-[#222328] text-white font-semibold' : 'text-zinc-400'}`}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      className={`px-2 py-0.5 rounded ${aspectRatio === '9:16' ? 'bg-[#222328] text-white font-semibold' : 'text-zinc-400'}`}
                    >
                      9:16
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCenterMode('welcome')}
                    className="px-2 py-0.5 rounded bg-[#16171b] border border-[#24252a] text-[11px] text-zinc-400 hover:text-white"
                  >
                    Chat
                  </button>
                </div>
              </div>

              {/* Viewport Canvas Stage */}
              <div className="flex-1 flex items-center justify-center p-3 overflow-hidden relative">
                <div 
                  className={`bg-black border border-[#24252a] shadow-xl rounded-md overflow-hidden relative flex items-center justify-center transition-all ${
                    aspectRatio === '16:9'
                      ? 'w-[480px] max-w-full aspect-video'
                      : 'w-[230px] max-w-full aspect-[9/16]'
                  }`}
                >
                  {/* LAYER 1: UPLOADED MEDIA (GAMBAR ATAU VIDEO) ATAU DEFAULT CANVAS */}
                  {uploadedMedia ? (
                    <div 
                      className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                      style={{
                        opacity: mediaOpacity / 100,
                        filter: mediaFilter === 'grayscale' ? 'grayscale(100%)' :
                                mediaFilter === 'sepia' ? 'sepia(80%)' :
                                mediaFilter === 'dim' ? 'brightness(60%)' :
                                mediaFilter === 'contrast' ? 'contrast(130%)' : 'none'
                      }}
                    >
                      {uploadedMedia.type === 'video' ? (
                        <video
                          ref={videoElementRef}
                          src={uploadedMedia.url}
                          className="max-w-none transition-transform w-full h-full object-cover"
                          style={{
                            transform: `translate(${mediaPosX}px, ${mediaPosY}px) scale(${mediaScale / 100}) rotate(${mediaRotation}deg)`
                          }}
                          loop
                          muted={isMuted}
                          playsInline
                        />
                      ) : (
                        <img
                          src={uploadedMedia.url}
                          alt={uploadedMedia.name}
                          className="max-w-none transition-transform select-none object-contain max-h-full"
                          style={{
                            transform: `translate(${mediaPosX}px, ${mediaPosY}px) scale(${mediaScale / 100}) rotate(${mediaRotation}deg)`
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    /* Default Minimalist Clean Composition (Tidak Mencolok) */
                    <div className="absolute inset-0 bg-[#0d0e11] flex flex-col items-center justify-center p-4 text-center">
                      {showLogoOnCanvas && (
                        <div 
                          style={{
                            transform: `scale(${1 + Math.sin(currentFrame / 10) * 0.03})`
                          }}
                          className="transition-transform"
                        >
                          <ClockLogo size={aspectRatio === '16:9' ? 44 : 34} className="mb-2" />
                        </div>
                      )}
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {currentFrame === 0 ? 'Klik "Upload Media" untuk memuat Gambar / Video Anda' : `Timeline Frame ${currentFrame}`}
                      </div>
                    </div>
                  )}

                  {/* LAYER 2: TEXT OVERLAY (JUDUL & SUBTITLE KUSTOM ATAU HASIL AI) */}
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
                    style={{
                      transform: `translate(${textPosX}px, ${textPosY}px) scale(${textScale / 100})`,
                      opacity: textOpacity / 100
                    }}
                  >
                    <h2 
                      style={{ color: textColor }}
                      className={`tracking-tight drop-shadow-md transition-colors ${
                        aspectRatio === '16:9' ? 'text-sm sm:text-base font-bold' : 'text-xs sm:text-sm font-bold'
                      }`}
                    >
                      {headlineText}
                    </h2>

                    {subtitleText && (
                      <p className="text-[10px] text-zinc-300 font-mono mt-1 max-w-[240px] drop-shadow-sm line-clamp-2">
                        {subtitleText}
                      </p>
                    )}
                  </div>

                  {/* Corner Margins (After Effects Safe Margins - Halus) */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20"></div>
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20"></div>
                </div>
              </div>

              {/* Viewport Playback Controller Toolbar */}
              <div className="h-8 bg-[#111215] border-t border-[#202126] px-3 flex items-center justify-between text-xs">
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
                    className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-950 flex items-center justify-center hover:bg-white transition-colors font-bold cursor-pointer"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
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
                      {isMuted ? <VolumeX className="w-3 h-3 text-zinc-400" /> : <Volume2 className="w-3 h-3" />}
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
                      className="w-12 accent-zinc-300 h-1 bg-[#222328] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenLicenseModal()}
                    className="px-2 py-0.5 rounded bg-[#16171b] hover:bg-[#1e1f24] border border-[#26272c] text-zinc-200 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-zinc-400" />
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
            className="h-1 bg-transparent hover:bg-zinc-600 transition-colors resizer-y shrink-0 z-30"
            title="Tarik untuk mengubah tinggi timeline / editor"
          />
        )}

        {/* =========================================================================
            B. BOTTOM PANEL: Multi-Track Timeline & Monaco Code Editor
            ========================================================================= */}
        <section 
          style={{ height: isBottomCollapsed ? '28px' : `${bottomHeight}px` }} 
          className="bg-[#111215] border-t border-[#202126] flex flex-col shrink-0 transition-none z-10"
        >
          {/* Header Tab Bar Timeline */}
          <div className="h-7 bg-[#0c0d0f] border-b border-[#202126] px-2.5 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setBottomTab('timeline'); setIsBottomCollapsed(false); }}
                className={`px-2.5 py-0.5 text-xs font-medium rounded-t transition-colors cursor-pointer ${
                  bottomTab === 'timeline' && !isBottomCollapsed
                    ? 'bg-[#111215] text-white border-t border-zinc-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Multi-Track Timeline
              </button>

              <button
                type="button"
                onClick={() => { setBottomTab('code'); setIsBottomCollapsed(false); }}
                className={`px-2.5 py-0.5 text-xs font-medium rounded-t transition-colors cursor-pointer ${
                  bottomTab === 'code' && !isBottomCollapsed
                    ? 'bg-[#111215] text-white border-t border-zinc-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Remotion Code Editor
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Scissors Split & Zoom */}
              {bottomTab === 'timeline' && !isBottomCollapsed && (
                <div className="flex items-center gap-2 mr-2 text-zinc-400">
                  <button 
                    type="button" 
                    onClick={handleSplitClip}
                    title="Gunting / Split Track di Frame Saat Ini"
                    className="p-0.5 hover:text-white rounded hover:bg-[#18191d] flex items-center gap-1 text-[10px]"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Split</span>
                  </button>

                  <div className="flex items-center gap-1 pl-1 border-l border-[#202126]">
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
                {isBottomCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Bottom Panel Content */}
          {!isBottomCollapsed && (
            <div className="flex-1 overflow-auto bg-[#08080a] p-2">
              {bottomTab === 'timeline' ? (
                /* --- MULTI-TRACK TIMELINE VIEW --- */
                <div 
                  style={{ width: `${timelineZoom * 100}%`, minWidth: '550px' }}
                  className="flex flex-col gap-1 relative"
                >
                  {/* Time Ruler (Interactive Scrubbing Bar) */}
                  <div 
                    ref={timelineRulerRef}
                    onClick={handleRulerClick}
                    className="h-5 bg-[#111215] border-b border-[#202126] rounded flex items-center px-2 text-[9px] font-mono text-zinc-500 justify-between cursor-pointer relative"
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
                      <div className="w-2 h-2 -ml-0.8 bg-[#facc15] rounded-xs transform rotate-45 -mt-0.5"></div>
                    </div>
                  </div>

                  {/* Track 1: Media Track (Gambar atau Video) */}
                  <div className="h-9 bg-[#111215] rounded border border-[#202126] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-medium text-zinc-400 flex items-center justify-between pr-2 border-r border-[#202126]">
                      <span>Media</span>
                      {uploadedMedia?.type === 'video' ? <Film className="w-2.5 h-2.5" /> : <Image className="w-2.5 h-2.5" />}
                    </div>
                    
                    <div className="flex-1 h-full flex items-center gap-1 relative">
                      {videoClips.map((clip) => {
                        const widthPct = ((clip.endFrame - clip.startFrame) / maxFrames) * 100;
                        return (
                          <div
                            key={clip.id}
                            style={{ width: `${widthPct}%` }}
                            onClick={() => {
                              setSelectedClipId(clip.id);
                              setActiveLayer('media');
                            }}
                            className={`h-full ${clip.color} rounded flex items-center px-2 text-[10px] text-zinc-300 border cursor-pointer truncate ${
                              selectedClipId === clip.id ? 'ring-1 ring-zinc-400' : ''
                            }`}
                          >
                            {uploadedMedia ? uploadedMedia.name : clip.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Track 2: Typography / Text Overlay Track */}
                  <div className="h-8 bg-[#111215] rounded border border-[#202126] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-medium text-zinc-400 flex items-center justify-between pr-2 border-r border-[#202126]">
                      <span>Teks Overlay</span>
                      <Type className="w-2.5 h-2.5" />
                    </div>
                    <div 
                      onClick={() => setActiveLayer('text')}
                      className="flex-1 h-full bg-[#18191d] border border-[#26272c] rounded flex items-center px-2 text-[10px] text-zinc-300 truncate cursor-pointer hover:border-zinc-500"
                    >
                      {headlineText} — {subtitleText}
                    </div>
                  </div>

                  {/* Track 3: Audio BGM Track */}
                  <div className="h-8 bg-[#111215] rounded border border-[#202126] p-1 flex items-center gap-2 relative overflow-hidden">
                    <div className="w-20 shrink-0 text-[10px] font-medium text-zinc-400 flex items-center justify-between pr-2 border-r border-[#202126]">
                      <span>Audio BGM</span>
                      <Music className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex-1 h-full bg-[#16171b] border border-[#222328] rounded flex items-center px-2 text-[10px] text-zinc-400">
                      ambient_cinematic_48khz.wav [Stereo Waveform]
                    </div>
                  </div>

                </div>
              ) : (
                /* --- LIVE REMOTION CODE EDITOR (Synchronized with Visual Properties) --- */
                <div className="h-full font-mono text-[11px] leading-relaxed text-zinc-300 bg-[#09090b] p-3 rounded border border-[#202126] overflow-auto select-text">
                  <div className="text-zinc-500">// Quantum Studio Programmatic Video Generator (Remotion 60 FPS)</div>
                  <div className="text-purple-400">import <span className="text-white">&#123; interpolate, spring, useCurrentFrame &#125;</span> from <span className="text-emerald-300">'remotion'</span>;</div>
                  <div className="mt-1 text-blue-400">export const <span className="text-yellow-300">BrandIntro</span> = () =&gt; &#123;</div>
                  <div className="pl-4 text-zinc-400">const frame = <span className="text-yellow-300">useCurrentFrame</span>(); // Current: {currentFrame}</div>
                  <div className="pl-4 text-zinc-400">const opacity = <span className="text-yellow-300">interpolate</span>(frame, [0, 20], [0, {textOpacity / 100}]);</div>
                  <div className="pl-4 text-zinc-400">const scale = <span className="text-yellow-300">spring</span>(&#123; frame, fps: 60, config: &#123; damping: 10 &#125; &#125;) * {textScale / 100};</div>
                  <div className="pl-4 mt-1 text-purple-400">return (</div>
                  <div className="pl-8 text-zinc-300">&lt;<span className="text-rose-400">div</span> style=&#123;&#123; transform: `translate({textPosX}px, {textPosY}px) scale($&#123;scale&#125;)` &#125;&#125;&gt;</div>
                  <div className="pl-12 text-zinc-300">&lt;<span className="text-rose-400">h1</span> style=&#123;&#123; color: <span className="text-emerald-300">"{textColor}"</span> &#125;&#125;&gt;{headlineText}&lt;/<span className="text-rose-400">h1</span>&gt;</div>
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
          className="w-1 bg-transparent hover:bg-zinc-600 transition-colors resizer-x shrink-0 z-30"
          title="Tarik untuk mengubah lebar panel kanan"
        />
      )}

      {/* =========================================================================
          3. RIGHT SIDEBAR: Properties Inspector & Gemini Copilot Stream
          ========================================================================= */}
      {!isRightCollapsed ? (
        <aside 
          style={{ width: `${rightWidth}px` }} 
          className="h-full bg-[#111215] border-l border-[#202126] flex flex-col justify-between shrink-0 transition-none z-20"
        >
          {/* Header Tab Bar Right */}
          <div className="h-7 bg-[#0c0d0f] border-b border-[#202126] px-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRightTab('inspector')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  rightTab === 'inspector'
                    ? 'bg-[#18191d] text-white border border-[#26272c]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Properties
              </button>

              <button
                type="button"
                onClick={() => setRightTab('copilot')}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  rightTab === 'copilot'
                    ? 'bg-[#18191d] text-white border border-[#26272c]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Gemini Copilot
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRightCollapsed(true)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191d] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Panel Body */}
          <div className="flex-1 overflow-y-auto p-2.5">
            {rightTab === 'inspector' ? (
              /* --- PROPERTIES INSPECTOR (Layer Media Upload vs Layer Teks) --- */
              <div className="space-y-3.5 text-xs">
                
                {/* Sub-Tabs: Pilih Objek yang Diedit */}
                <div className="flex bg-[#16171b] p-0.5 rounded border border-[#222328] text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveLayer('media')}
                    className={`flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all ${
                      activeLayer === 'media'
                        ? 'bg-[#222328] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Image className="w-3 h-3" />
                    <span>Media (File)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLayer('text')}
                    className={`flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all ${
                      activeLayer === 'text'
                        ? 'bg-[#222328] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Type className="w-3 h-3" />
                    <span>Teks Overlay</span>
                  </button>
                </div>

                {/* --- A. JIKA LAYER MEDIA AKTIF (GAMBAR / VIDEO UPLOAD) --- */}
                {activeLayer === 'media' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-[#202126]">
                      <span>Media Transform</span>
                      <button
                        type="button"
                        onClick={handleResetMediaTransform}
                        className="text-zinc-500 hover:text-zinc-200 lowercase font-normal flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>reset</span>
                      </button>
                    </div>

                    {/* Upload / Ganti Berkas Button */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-2 bg-[#18191d] hover:bg-[#202126] border border-[#26272c] rounded text-[11px] text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-zinc-400" />
                        <span>{uploadedMedia ? 'Ganti File' : 'Upload Gambar / Video'}</span>
                      </button>

                      {uploadedMedia && (
                        <button
                          type="button"
                          onClick={handleClearMedia}
                          title="Hapus media dari canvas"
                          className="px-2 bg-[#18191d] hover:bg-rose-950/40 border border-[#26272c] hover:border-rose-800/40 text-zinc-400 hover:text-rose-300 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Position X & Y */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Posisi X</label>
                        <div className="flex items-center bg-[#16171b] border border-[#222328] rounded px-2 py-1">
                          <span className="text-zinc-500 font-mono text-[10px] mr-1">X</span>
                          <input
                            type="number"
                            value={mediaPosX}
                            onChange={(e) => setMediaPosX(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Posisi Y</label>
                        <div className="flex items-center bg-[#16171b] border border-[#222328] rounded px-2 py-1">
                          <span className="text-zinc-500 font-mono text-[10px] mr-1">Y</span>
                          <input
                            type="number"
                            value={mediaPosY}
                            onChange={(e) => setMediaPosY(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Scale Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Skala Media (Zoom)</span>
                        <span className="font-mono text-zinc-200">{mediaScale}%</span>
                      </div>
                      <input
                        type="range"
                        min={20}
                        max={300}
                        value={mediaScale}
                        onChange={(e) => setMediaScale(parseInt(e.target.value, 10))}
                        className="w-full accent-zinc-300 h-1 bg-[#222328] rounded cursor-pointer"
                      />
                    </div>

                    {/* Media Rotation Slider */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Rotasi</span>
                        <span className="font-mono text-zinc-200">{mediaRotation}°</span>
                      </div>
                      <input
                        type="range"
                        min={-180}
                        max={180}
                        value={mediaRotation}
                        onChange={(e) => setMediaRotation(parseInt(e.target.value, 10))}
                        className="w-full accent-zinc-300 h-1 bg-[#222328] rounded cursor-pointer"
                      />
                    </div>

                    {/* Media Opacity */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Opasitas</span>
                        <span className="font-mono text-zinc-200">{mediaOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={mediaOpacity}
                        onChange={(e) => setMediaOpacity(parseInt(e.target.value, 10))}
                        className="w-full accent-zinc-300 h-1 bg-[#222328] rounded cursor-pointer"
                      />
                    </div>

                    {/* Filter Presets */}
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Filter Media</label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { id: 'none', label: 'Normal' },
                          { id: 'dim', label: 'Gelap' },
                          { id: 'contrast', label: 'Kontras' },
                          { id: 'grayscale', label: 'B&W' }
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setMediaFilter(f.id)}
                            className={`py-1 text-[10px] rounded border transition-all ${
                              mediaFilter === f.id
                                ? 'bg-[#222328] border-zinc-500 text-white font-medium'
                                : 'bg-[#16171b] border-[#222328] text-zinc-400 hover:text-white'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- B. JIKA LAYER TEKS AKTIF (JUDUL & SUBTITLE) --- */}
                {activeLayer === 'text' && (
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider pb-1 border-b border-[#202126]">
                      <span>Pengaturan Teks</span>
                      <button
                        type="button"
                        onClick={handleResetTextTransform}
                        className="text-zinc-500 hover:text-zinc-200 lowercase font-normal flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>reset</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Judul Utama</label>
                      <input
                        type="text"
                        value={headlineText}
                        onChange={(e) => setHeadlineText(e.target.value)}
                        className="w-full bg-[#16171b] border border-[#222328] rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-zinc-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-0.5">Teks Subtitle / Caption</label>
                      <textarea
                        rows={2}
                        value={subtitleText}
                        onChange={(e) => setSubtitleText(e.target.value)}
                        className="w-full bg-[#16171b] border border-[#222328] rounded px-2.5 py-1 text-white text-xs focus:outline-none focus:border-zinc-500 resize-none"
                      />
                    </div>

                    {/* Position X & Y Teks */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Teks Posisi X</label>
                        <div className="flex items-center bg-[#16171b] border border-[#222328] rounded px-2 py-1">
                          <span className="text-zinc-500 font-mono text-[10px] mr-1">X</span>
                          <input
                            type="number"
                            value={textPosX}
                            onChange={(e) => setTextPosX(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-0.5">Teks Posisi Y</label>
                        <div className="flex items-center bg-[#16171b] border border-[#222328] rounded px-2 py-1">
                          <span className="text-zinc-500 font-mono text-[10px] mr-1">Y</span>
                          <input
                            type="number"
                            value={textPosY}
                            onChange={(e) => setTextPosY(parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ukuran Teks Scale */}
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Ukuran Teks</span>
                        <span className="font-mono text-zinc-200">{textScale}%</span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={200}
                        value={textScale}
                        onChange={(e) => setTextScale(parseInt(e.target.value, 10))}
                        className="w-full accent-zinc-300 h-1 bg-[#222328] rounded cursor-pointer"
                      />
                    </div>

                    {/* Warna Teks (Monokrom Bersih, Tidak Norak) */}
                    <div>
                      <label className="text-[10px] text-zinc-400 block mb-1">Warna Teks</label>
                      <div className="flex items-center gap-2">
                        {[
                          { color: '#ffffff', label: 'Putih' },
                          { color: '#d4d4d8', label: 'Zinc Terang' },
                          { color: '#a1a1aa', label: 'Abu-abu' },
                          { color: '#facc15', label: 'Emas Lembut' }
                        ].map((c) => (
                          <button
                            key={c.color}
                            type="button"
                            onClick={() => setTextColor(c.color)}
                            style={{ backgroundColor: c.color }}
                            className={`w-4 h-4 rounded-full border border-black/50 cursor-pointer transition-transform ${
                              textColor === c.color ? 'scale-125 ring-2 ring-zinc-400' : 'opacity-80 hover:opacity-100'
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* --- GEMINI COPILOT CHAT STREAM (KOSONGAN BERSIH) --- */
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                  {chatMessages.length === 0 ? (
                    /* Tampilan Bersih Saat Chat Masih Kosong */
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-zinc-500">
                      <MessageSquare className="w-6 h-6 mb-2 stroke-1 text-zinc-600" />
                      <div className="text-xs font-medium text-zinc-400">Ruang Chat Kosong</div>
                      <p className="text-[10px] text-zinc-500 mt-1 max-w-[190px]">
                        Ketik instruksi di bawah untuk generate ide naskah atau mengedit video secara otomatis.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-lg text-xs ${
                          msg.sender === 'user'
                            ? 'bg-[#18191d] border border-[#24252a] text-white ml-2'
                            : 'bg-[#131417] border border-[#1f2025] text-zinc-300 mr-2'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                          <span className="font-medium text-zinc-400">{msg.name || 'Anda'}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className="whitespace-pre-line leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    ))
                  )}

                  {isAiGenerating && (
                    <div className="p-2 rounded bg-[#131417] border border-[#1f2025] text-xs text-zinc-400 flex items-center gap-2">
                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                      <span>Gemini sedang menyusun respon...</span>
                    </div>
                  )}
                </div>

                {/* Right Chat Input */}
                <form onSubmit={handleSendPrompt} className="mt-2 pt-2 border-t border-[#202126]">
                  <div className="flex items-center gap-1.5 bg-[#16171b] border border-[#222328] rounded p-1">
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="Perintahkan Gemini AI..."
                      className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none px-1"
                    />
                    <button
                      type="submit"
                      disabled={isAiGenerating || !promptInput.trim()}
                      className="p-1 rounded bg-zinc-200 hover:bg-white text-zinc-950 disabled:opacity-40"
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
        <div className="w-7 h-full bg-[#111215] border-l border-[#202126] flex flex-col items-center py-2 shrink-0 z-20">
          <button
            type="button"
            onClick={() => setIsRightCollapsed(false)}
            title="Buka Sidebar Kanan"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-[#18191d] cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
