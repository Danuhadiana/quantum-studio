import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
  Sliders, MessageSquare, Send, Sparkles, RefreshCw, Scissors,
  Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut,
  Folder, Film, Music, FileText, CornerUpLeft, Radio, SplitSquareVertical,
  Upload, Image, AlignLeft, Sparkle, Terminal, Settings, ShieldCheck,
  Cpu, Activity, Check, Code, Layout, Palette, Move, Crop, Type,
  Pipette, Paintbrush, Eraser, Hand, Search, Square, Diamond, Clock,
  Mic, Magnet, RotateCw, Wand2, Video, Sun, Contrast, Gauge, Copy,
  Snowflake, CheckSquare
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
  // --- 1. RESIZABLE PANELS STATE ---
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
    return saved ? parseInt(saved, 10) : 250;
  });

  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Left Sidebar Mode: 'assets' | 'code' | 'ai'
  const [leftSideMode, setLeftSideMode] = useState('assets');

  // Right Inspector Tab: 'transform' | 'filters' | 'text' | 'audio'
  const [inspectorTab, setInspectorTab] = useState('transform');

  // Bottom Timeline Tab: 'timeline' | 'console'
  const [bottomTab, setBottomTab] = useState('timeline');

  // --- 2. UPLOADED MEDIA & LIVE CANVAS STATE ---
  // "layarnya begitu hitam saja, jangan ada langsung gambar"
  const [uploadedMedia, setUploadedMedia] = useState(null); // { type: 'image' | 'video', url: string, name: string }
  const fileInputRef = useRef(null);
  const videoElementRef = useRef(null);

  // Transforms (After Effects & Photoshop Style)
  const [zoomScale, setZoomScale] = useState(100); // 10% to 250%
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState('normal');

  // Filters & Adjustments
  const [activeFilter, setActiveFilter] = useState('none'); // 'none', 'dim', 'contrast', 'grayscale', 'invert'
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [saturation, setSaturation] = useState(0); // -100 to 100

  // Typography / Text Layer
  const [customText, setCustomText] = useState('');
  const [textScale, setTextScale] = useState(100);
  const [textColor, setTextColor] = useState('#ffffff');
  const [textVisible, setTextVisible] = useState(true);

  // --- 3. VIDEO ENGINE & TIMELINE SCRUBBING STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9' or '9:16'
  const [canvasZoom, setCanvasZoom] = useState('fit');
  const [timelineZoom, setTimelineZoom] = useState(100); // 50% to 200%
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  // Multi-Track Timeline Clips
  const [clips, setClips] = useState([
    {
      id: 1,
      name: 'Main_Video_Track.mp4',
      startFrame: 0,
      endFrame: 180,
      speed: 1.0,
      fadeIn: 0,
      fadeOut: 0,
      color: 'bg-[#1e2330] border-[#00e5ff]/50'
    }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);
  const [keyframePoints, setKeyframePoints] = useState([0, 90, 180]); // Keyframe diamond markers

  // Sub-panel Frame Detail Drawer
  const [showFrameDetail, setShowFrameDetail] = useState(true);

  // --- 4. RIGHT-CLICK CONTEXT MENU (KLIK KANAN FRAME / CLIP) ---
  const [contextMenu, setContextMenu] = useState(null); // { visible: bool, x: num, y: num, clipId: num }

  // --- 5. INTEGRATED VS CODE & REMOTION SCRIPT EDITOR ---
  const [remotionCode, setRemotionCode] = useState(`import { Composition, interpolate, spring, useCurrentFrame } from 'remotion';

export const BrandIntro = ({ title = "Quantum Studio 4K" }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps: 60, config: { damping: 12, mass: 0.8 } });

  return (
    <div style={{ opacity, transform: \`scale(\${scale})\` }} className="flex flex-col items-center justify-center h-full w-full bg-black text-white">
      <h1 className="text-5xl font-black tracking-tight">{title}</h1>
      <p className="text-zinc-400 mt-2 text-base">Next-Gen Programmatic Video Engine</p>
    </div>
  );
};`);

  // AI Script Assistant State
  const [promptInput, setPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const timelineRulerRef = useRef(null);
  const isDraggingPlayhead = useRef(false);

  // Format Timecode: HH:MM:SS:FF
  const formatTimecode = (frame) => {
    const totalSeconds = Math.floor(frame / fps);
    const f = frame % fps;
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  };

  // 60 FPS Real-Time Playback Engine
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) return 0;
          return prev + 1;
        });
      }, 1000 / fps);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxFrames, fps]);

  // Video Element sync with isPlaying
  useEffect(() => {
    if (videoElementRef.current && uploadedMedia?.type === 'video') {
      if (isPlaying) {
        videoElementRef.current.play().catch(() => {});
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [isPlaying, uploadedMedia]);

  // Keyboard Shortcuts (Space, Ctrl+B, Del, Left/Right Arrows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in text inputs or textareas
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.ctrlKey && e.code === 'KeyB') {
        e.preventDefault();
        handleSplitClipAtPlayhead();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        handleDeleteClip(selectedClipId);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentFrame((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentFrame((prev) => Math.min(maxFrames, prev + 1));
      } else if (e.code === 'KeyI') {
        fileInputRef.current?.click();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, currentFrame]);

  // Close Context Menu on Global Click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Media Import Handler
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

    setClips([
      {
        id: Date.now(),
        name: file.name,
        startFrame: 0,
        endFrame: maxFrames,
        speed: 1.0,
        fadeIn: 0,
        fadeOut: 0,
        color: 'bg-[#1b2533] border-[#00e5ff]/50'
      }
    ]);

    setIsPlaying(false);
  };

  const handleClearMedia = () => {
    if (uploadedMedia?.url) {
      URL.revokeObjectURL(uploadedMedia.url);
    }
    setUploadedMedia(null);
    setPosX(0);
    setPosY(0);
    setZoomScale(100);
    setRotation(0);
    setOpacity(100);
    setActiveFilter('none');
  };

  // --- TIMELINE SCRUBBING (SLIDE FRAME) ---
  const handleTimelineScrub = (e) => {
    if (!timelineRulerRef.current) return;
    const rect = timelineRulerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const fraction = clickX / rect.width;
    const targetFrame = Math.round(fraction * maxFrames);
    setCurrentFrame(targetFrame);
  };

  const handleStartPlayheadDrag = (e) => {
    e.preventDefault();
    isDraggingPlayhead.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMove = (moveEvent) => {
      if (!isDraggingPlayhead.current || !timelineRulerRef.current) return;
      const rect = timelineRulerRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width));
      const fraction = clickX / rect.width;
      const targetFrame = Math.round(fraction * maxFrames);
      setCurrentFrame(targetFrame);
    };

    const onUp = () => {
      isDraggingPlayhead.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // --- CUT / SPLIT CLIP AT PLAYHEAD ---
  const handleSplitClipAtPlayhead = () => {
    const targetClip = clips.find(
      (c) => c.id === selectedClipId && currentFrame > c.startFrame && currentFrame < c.endFrame
    );
    if (!targetClip) {
      const anyClip = clips.find((c) => currentFrame > c.startFrame && currentFrame < c.endFrame);
      if (!anyClip) return;
      executeCut(anyClip);
      return;
    }
    executeCut(targetClip);
  };

  const executeCut = (clipToSplit) => {
    const originalEnd = clipToSplit.endFrame;
    const splitPoint = currentFrame;

    setClips((prev) => {
      const updated = prev.map((c) =>
        c.id === clipToSplit.id
          ? { ...c, endFrame: splitPoint, name: `${c.name.replace(/ \(Part \d+\)/, '')} (Part 1)` }
          : c
      );
      const newPart = {
        id: Date.now(),
        name: `${clipToSplit.name.replace(/ \(Part \d+\)/, '')} (Part 2)`,
        startFrame: splitPoint,
        endFrame: originalEnd,
        speed: clipToSplit.speed || 1.0,
        fadeIn: 0,
        fadeOut: 0,
        color: 'bg-[#291628] border-fuchsia-500/50'
      };
      return [...updated, newPart];
    });

    if (!keyframePoints.includes(splitPoint)) {
      setKeyframePoints((prev) => [...prev, splitPoint].sort((a, b) => a - b));
    }
  };

  // Delete Clip
  const handleDeleteClip = (clipId) => {
    if (clips.length <= 1) {
      alert('Minimal harus ada 1 klip pada timeline.');
      return;
    }
    setClips((prev) => prev.filter((c) => c.id !== clipId));
    setSelectedClipId(clips[0]?.id || 1);
  };

  // Duplicate Clip
  const handleDuplicateClip = (clipId) => {
    const target = clips.find((c) => c.id === clipId);
    if (!target) return;
    const newClip = {
      ...target,
      id: Date.now(),
      name: `${target.name} (Copy)`
    };
    setClips((prev) => [...prev, newClip]);
  };

  // Trim Start & End
  const handleTrimStart = (clipId, newStart) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, startFrame: Math.max(0, Math.min(newStart, c.endFrame - 5)) } : c))
    );
  };

  const handleTrimEnd = (clipId, newEnd) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, endFrame: Math.min(maxFrames, Math.max(newEnd, c.startFrame + 5)) } : c))
    );
  };

  // Set Speed
  const handleSetSpeed = (clipId, speed) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, speed } : c)));
  };

  // Toggle Keyframe at current playhead
  const handleToggleKeyframe = () => {
    if (keyframePoints.includes(currentFrame)) {
      setKeyframePoints((prev) => prev.filter((f) => f !== currentFrame));
    } else {
      setKeyframePoints((prev) => [...prev, currentFrame].sort((a, b) => a - b));
    }
  };

  // --- RIGHT CLICK ON CLIP HANDLER ---
  const handleClipContextMenu = (e, clipId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClipId(clipId);
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      clipId: clipId
    });
  };

  // Apply VS Code Remotion Code to Live Canvas
  const handleApplyCodeToCanvas = () => {
    const match = remotionCode.match(/title\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      setCustomText(match[1]);
    }
    alert('Kode Remotion berhasil disinkronkan ke Player Viewport!');
  };

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  // Render Full-Page Views (Zero Modal) jika tab selain player aktif
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

  return (
    <div className="h-full w-full flex flex-col bg-[#09090b] text-[#e1e2e6] overflow-hidden select-none font-sans">
      
      {/* 1. TOP MAIN ROW (ACTIVITY BAR + LEFT ASSETS/VS CODE + CENTER BLACK CANVAS + RIGHT INSPECTOR) */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* --- 1A. VS CODE ACTIVITY BAR (44px FAR LEFT) --- */}
        <aside className="w-11 h-full bg-[#09090b] border-r border-[#1c1d22] flex flex-col items-center py-2 justify-between shrink-0 z-30 select-none">
          {/* Top Activity Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => setActiveTab('player')}
              title="Composition / Player (After Effects & Remotion)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'player' ? 'bg-[#1e2028] text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('code')}
              title="Remotion Script Editor (VS Code TSX)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'code' ? 'bg-[#1e2028] text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <Code className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              title="AI Motion Studio Copilot (Chat)"
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                activeTab === 'copilot' ? 'bg-[#1e2028] text-white border border-zinc-700' : 'text-zinc-500 hover:text-zinc-200 hover:bg-[#121316]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('aihub')}
              title="Multi-AI Hub (BYOA Engine)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('export')}
              title="Export Studio"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Activity Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              onClick={() => setActiveTab('license')}
              title="Akun &amp; Lisensi Pro"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              title="Preferences (Pengaturan)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-[#121316] transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* --- 1B. LEFT COLLAPSIBLE SIDEBAR: ASSETS & INTEGRATED VS CODE --- */}
        {!isLeftCollapsed ? (
          <aside
            style={{ width: `${leftWidth}px` }}
            className="h-full bg-[#0d0e12] border-r border-[#1c1d22] flex flex-col shrink-0 select-none overflow-hidden z-20"
          >
            {/* Left Header Switcher (Assets vs VS Code vs AI) */}
            <div className="h-8 bg-[#111215] border-b border-[#1c1d22] px-2 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <button
                  onClick={() => setLeftSideMode('assets')}
                  className={`px-2 py-0.5 rounded transition-colors ${leftSideMode === 'assets' ? 'bg-[#1c1d24] text-white' : 'hover:text-white'}`}
                >
                  Media &amp; Files
                </button>
                <button
                  onClick={() => setLeftSideMode('code')}
                  className={`px-2 py-0.5 rounded transition-colors ${leftSideMode === 'code' ? 'bg-[#1c1d24] text-white font-medium' : 'hover:text-white'}`}
                >
                  VS Code
                </button>
              </div>

              <button
                onClick={() => setIsLeftCollapsed(true)}
                className="p-1 rounded hover:bg-[#18191f] text-zinc-500 hover:text-white cursor-pointer"
                title="Tutup Panel"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Left Content Body */}
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* MODE 1: MEDIA & ASSETS */}
              {leftSideMode === 'assets' && (
                <div className="p-3 space-y-3 flex-1 overflow-y-auto text-xs">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                  />

                  {/* Import Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 bg-[#181920] hover:bg-[#22242c] border border-[#272832] rounded-lg text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Import Media (Foto/Video)</span>
                  </button>

                  {/* Active Media Card */}
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Media di Kanvas
                    </div>
                    {uploadedMedia ? (
                      <div className="p-2.5 rounded-lg bg-[#14151a] border border-[#23242c] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-zinc-200 text-[11px] truncate max-w-[170px]">
                            {uploadedMedia.name}
                          </span>
                          <button
                            onClick={handleClearMedia}
                            className="text-zinc-500 hover:text-rose-400"
                            title="Hapus Media"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Format: {uploadedMedia.type.toUpperCase()} • Ready
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-dashed border-[#222329] text-center text-zinc-500 text-[11px]">
                        Kanvas saat ini hitam polos bersih. Klik import di atas untuk memuat file media.
                      </div>
                    )}
                  </div>

                  {/* Quick Text Generator */}
                  <div className="space-y-1 pt-2 border-t border-[#1c1d22]">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      Lapisan Teks
                    </div>
                    <button
                      onClick={() => {
                        const val = prompt('Ketik teks untuk ditampilkan di kanvas:', customText || 'Quantum Studio 4K');
                        if (val !== null) setCustomText(val);
                      }}
                      className="w-full py-1.5 px-2 bg-[#14151a] hover:bg-[#1e1f26] border border-[#23242c] rounded-md text-zinc-300 text-left flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="truncate">{customText || '+ Tambah Teks ke Kanvas'}</span>
                      <Type className="w-3.5 h-3.5 text-zinc-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: INTEGRATED VS CODE & REMOTION CODE EDITOR */}
              {leftSideMode === 'code' && (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0d10]">
                  {/* File Tab & Sync Button */}
                  <div className="h-7 bg-[#141519] border-b border-[#1c1d22] px-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] text-zinc-300 font-medium flex items-center gap-1">
                      <FileText className="w-3 h-3 text-zinc-400" />
                      <span>BrandIntro.tsx</span>
                    </span>

                    <button
                      onClick={handleApplyCodeToCanvas}
                      className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-white text-zinc-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sinkronkan kode ini ke player kanvas"
                    >
                      <RefreshCw className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>Run Sync</span>
                    </button>
                  </div>

                  {/* Code Editor with Line Numbers */}
                  <div className="flex-1 flex overflow-hidden">
                    <div className="w-7 bg-[#101114] text-zinc-600 font-mono text-[10.5px] py-2 text-right pr-1.5 select-none border-r border-[#1c1d22]">
                      {Array.from({ length: 22 }).map((_, i) => (
                        <div key={i} className="leading-5">{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={remotionCode}
                      onChange={(e) => setRemotionCode(e.target.value)}
                      spellCheck="false"
                      className="flex-1 p-2 bg-transparent text-[10.5px] font-mono text-zinc-200 focus:outline-none resize-none leading-5 selection:bg-zinc-700"
                    />
                  </div>
                </div>
              )}

            </div>
          </aside>
        ) : (
          <div className="w-7 h-full bg-[#09090b] border-r border-[#1c1d22] flex flex-col items-center py-2 shrink-0 z-20">
            <button
              onClick={() => setIsLeftCollapsed(false)}
              title="Buka Panel Kiri"
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-[#121316] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* --- 1C. CENTER WORKSPACE: PURE BLACK CANVAS VIEWPORT --- */}
        <main className="flex-1 h-full flex flex-col bg-[#07080a] overflow-hidden relative">
          
          {/* Top Canvas Header Bar */}
          <div className="h-8 bg-[#09090b] border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-200 font-bold text-[11px]">
                Composition.tsx (Preview)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                3840 × 2160 UHD • 60 FPS
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="bg-[#121316] border border-[#222328] rounded px-2 py-0.5 text-zinc-200 focus:outline-none"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Shorts / Reels</option>
              </select>

              <select
                value={canvasZoom}
                onChange={(e) => setCanvasZoom(e.target.value)}
                className="bg-[#121316] border border-[#222328] rounded px-2 py-0.5 text-zinc-200 focus:outline-none"
              >
                <option value="fit">Fit</option>
                <option value="50">50%</option>
                <option value="100">100%</option>
              </select>
            </div>
          </div>

          {/* Canvas Working Viewport: PURE BLACK CANVAS DEFAULT */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative bg-[#060709]">
            <div
              className={`bg-[#000000] border border-[#1e1f26] shadow-2xl relative overflow-hidden flex items-center justify-center transition-all ${
                aspectRatio === '16:9' ? 'aspect-video w-full max-w-4xl max-h-[82%]' : 'aspect-[9/16] h-full max-h-[88%]'
              }`}
              style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.85)' }}
            >
              {/* JIKA USER MENGUNGGAH MEDIA BARULAH MEDIA TAMPIL */}
              {uploadedMedia && (
                <div
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${zoomScale / 100}) rotate(${rotation}deg)`,
                    opacity: opacity / 100,
                    filter:
                      activeFilter === 'dim' ? 'brightness(0.6)' :
                      activeFilter === 'contrast' ? 'contrast(1.4)' :
                      activeFilter === 'grayscale' ? 'grayscale(1)' :
                      activeFilter === 'invert' ? 'invert(1)' : 'none'
                  }}
                  className="w-full h-full flex items-center justify-center transition-transform duration-75"
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
                    <img src={uploadedMedia.url} alt="Media" className="w-full h-full object-contain" />
                  )}
                </div>
              )}

              {/* JIKA USER MEMASUKKAN TEKS BARULAH MUNCUL */}
              {customText && textVisible && (
                <div
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${textScale / 100})`,
                    color: textColor
                  }}
                  className="absolute z-20 text-center font-bold px-4 pointer-events-none drop-shadow-lg"
                >
                  <h2 className="text-2xl font-black">{customText}</h2>
                </div>
              )}

              {/* Faint Center Guides */}
              <div className="absolute inset-4 border border-zinc-900/30 pointer-events-none"></div>
            </div>
          </div>

          {/* Transport Bar Below Canvas */}
          <div className="h-8 bg-[#09090b] border-t border-[#1c1d22] px-3 flex items-center justify-between text-xs shrink-0 select-none">
            {/* Left Transport Buttons */}
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
                className="px-3 py-1 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold flex items-center gap-1 cursor-pointer text-[11px] shadow-sm transition-colors"
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-zinc-950" /> : <Play className="w-3 h-3 fill-zinc-950" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setCurrentFrame(maxFrames)}
                className="p-1 rounded hover:bg-[#16171d] text-zinc-400 hover:text-white"
                title="Forward (Frame 180)"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSplitClipAtPlayhead}
                className="p-1.5 rounded hover:bg-[#16171d] text-zinc-400 hover:text-white transition-colors ml-2"
                title="Cut Frame (Split Clip) [Ctrl+B]"
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timecode & Frame Readout */}
            <div className="font-mono text-zinc-300 text-[11px] flex items-center gap-2">
              <span className="text-zinc-100 font-semibold">{formatTimecode(currentFrame)}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{formatTimecode(maxFrames)}</span>
              <span className="px-1.5 py-0.2 rounded bg-[#14151a] border border-[#202126] text-[10px] text-zinc-400">
                60 FPS
              </span>
            </div>
          </div>

        </main>

        {/* --- 1D. RIGHT COLLAPSIBLE SIDEBAR: AFTER EFFECTS & PHOTOSHOP INSPECTOR --- */}
        {!isRightCollapsed ? (
          <aside
            style={{ width: `${rightWidth}px` }}
            className="h-full bg-[#0d0e12] border-l border-[#1c1d22] flex flex-col shrink-0 select-none overflow-hidden text-xs z-20"
          >
            {/* Header Right Sidebar */}
            <div className="h-8 bg-[#111215] border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <span className="font-bold text-white text-[10px] uppercase tracking-wider">
                Inspector Properti
              </span>
              <button
                onClick={() => setIsRightCollapsed(true)}
                className="p-1 rounded hover:bg-[#18191f] text-zinc-500 hover:text-white cursor-pointer"
                title="Tutup Inspector"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sub-tabs: Transform, Filters, Typography, Speed */}
            <div className="h-7 bg-[#09090b] border-b border-[#1c1d22] flex items-center px-2 gap-1 text-[11px] text-zinc-400 shrink-0">
              <button
                onClick={() => setInspectorTab('transform')}
                className={`px-2 py-0.5 rounded transition-colors ${inspectorTab === 'transform' ? 'bg-[#1b1c24] text-white font-medium' : 'hover:text-white'}`}
              >
                Transform
              </button>
              <button
                onClick={() => setInspectorTab('filters')}
                className={`px-2 py-0.5 rounded transition-colors ${inspectorTab === 'filters' ? 'bg-[#1b1c24] text-white font-medium' : 'hover:text-white'}`}
              >
                Filters
              </button>
              <button
                onClick={() => setInspectorTab('text')}
                className={`px-2 py-0.5 rounded transition-colors ${inspectorTab === 'text' ? 'bg-[#1b1c24] text-white font-medium' : 'hover:text-white'}`}
              >
                Text
              </button>
              <button
                onClick={() => setInspectorTab('speed')}
                className={`px-2 py-0.5 rounded transition-colors ${inspectorTab === 'speed' ? 'bg-[#1b1c24] text-white font-medium' : 'hover:text-white'}`}
              >
                Speed
              </button>
            </div>

            {/* Inspector Controls Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              
              {/* TAB 1: TRANSFORM CONTROLS */}
              {inspectorTab === 'transform' && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Scale (Zoom):</span>
                      <span className="font-mono text-white">{zoomScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="250"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Position X (px):</span>
                      <span className="font-mono text-white">{posX} px</span>
                    </div>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={posX}
                      onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Position Y (px):</span>
                      <span className="font-mono text-white">{posY} px</span>
                    </div>
                    <input
                      type="range"
                      min="-300"
                      max="300"
                      value={posY}
                      onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Rotation:</span>
                      <span className="font-mono text-white">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Opacity:</span>
                      <span className="font-mono text-white">{opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FILTERS & COLOR ADJUSTMENTS */}
              {inspectorTab === 'filters' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400 font-semibold">Filter Visual:</label>
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {['none', 'dim', 'contrast', 'grayscale', 'invert'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFilter(f)}
                          className={`p-1.5 rounded border text-[10.5px] uppercase font-mono transition-colors ${
                            activeFilter === f ? 'bg-[#1b1c24] border-zinc-400 text-white font-bold' : 'border-[#23242c] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TYPOGRAPHY / TEXT OVERLAY */}
              {inspectorTab === 'text' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Teks Judul di Kanvas:</label>
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Masukkan teks..."
                      className="w-full p-2 bg-[#09090b] border border-[#222328] rounded text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Ukuran Teks:</span>
                      <span className="font-mono text-white">{textScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={textScale}
                      onChange={(e) => setTextScale(parseInt(e.target.value, 10))}
                      className="w-full accent-zinc-200"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: SPEED CONTROLS */}
              {inspectorTab === 'speed' && (
                <div className="space-y-3">
                  <div className="text-[11px] text-zinc-400 font-semibold">Kecepatan Putar Klip Aktif:</div>
                  <div className="flex gap-1.5 font-mono">
                    {[0.5, 1.0, 2.0, 4.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSetSpeed(selectedClipId, s)}
                        className={`flex-1 py-1 rounded text-xs border transition-colors ${
                          selectedClip.speed === s ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100' : 'border-[#23242c] text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
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

      </div>

      {/* 2. ENHANCED BOTTOM TIMELINE (CAPCUT MULTI-TRACK + DETAILED FRAME EDITING + CONTEXT MENU) */}
      {/* "hanya bagan bagian frame nya ajah diperdetail di permudah disitunya, masimalkan fungsi frame nya dan bisa di edit klik kanan juga secara detail" */}
      <footer
        style={{ height: `${bottomHeight}px` }}
        className="bg-[#0b0c0f] border-t border-[#1c1d22] flex flex-col shrink-0 select-none overflow-hidden z-30"
      >
        {/* TIMELINE ACTION TOOLBAR */}
        <div className="h-8 bg-[#0e0f13] border-b border-[#1c1d22] px-3 flex items-center justify-between text-xs shrink-0">
          
          {/* Left Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Cut / Split Button */}
            <button
              onClick={handleSplitClipAtPlayhead}
              className="px-2 py-0.5 rounded bg-[#181920] hover:bg-[#22242c] border border-[#272832] text-zinc-200 hover:text-white flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Cut Frame (Split Clip pada Posisi Playhead) [Ctrl+B]"
            >
              <Scissors className="w-3.5 h-3.5 text-zinc-300" />
              <span>Split</span>
            </button>

            {/* Delete Clip */}
            <button
              onClick={() => handleDeleteClip(selectedClipId)}
              className="p-1 rounded hover:bg-[#181920] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Hapus Klip [Del]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Duplicate Clip */}
            <button
              onClick={() => handleDuplicateClip(selectedClipId)}
              className="p-1 rounded hover:bg-[#181920] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Duplikasi Klip"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#202126] mx-1"></div>

            {/* Step -1 Frame */}
            <button
              onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
              className="px-1.5 py-0.5 rounded bg-[#14151a] border border-[#202126] text-[10.5px] font-mono hover:bg-[#1c1d24] cursor-pointer"
              title="Mundur Tepat 1 Frame (-1f)"
            >
              -1f
            </button>

            {/* Step +1 Frame */}
            <button
              onClick={() => setCurrentFrame((prev) => Math.min(maxFrames, prev + 1))}
              className="px-1.5 py-0.5 rounded bg-[#14151a] border border-[#202126] text-[10.5px] font-mono hover:bg-[#1c1d24] cursor-pointer"
              title="Maju Tepat 1 Frame (+1f)"
            >
              +1f
            </button>

            {/* Keyframe Toggle */}
            <button
              onClick={handleToggleKeyframe}
              className={`px-2 py-0.5 rounded border text-[10.5px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                keyframePoints.includes(currentFrame)
                  ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                  : 'bg-[#14151a] border-[#202126] text-zinc-400 hover:text-white'
              }`}
              title="Tambah / Hapus Keyframe pada Frame Aktif"
            >
              <Diamond className="w-2.5 h-2.5 fill-current" />
              <span>{keyframePoints.includes(currentFrame) ? 'Keyframe Aktif' : '+ Keyframe'}</span>
            </button>
          </div>

          {/* Center Direct Frame Number Input */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span>Frame:</span>
            <input
              type="number"
              min="0"
              max={maxFrames}
              value={currentFrame}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setCurrentFrame(Math.max(0, Math.min(val, maxFrames)));
              }}
              className="w-12 bg-[#09090b] border border-[#222328] px-1.5 py-0.5 rounded text-white text-center font-bold"
            />
            <span>/ {maxFrames}</span>
            <span className="text-zinc-200 font-bold">({formatTimecode(currentFrame)})</span>
          </div>

          {/* Right Controls: Timeline Zoom & Drawer Toggle */}
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono">
            <span>Zoom:</span>
            <input
              type="range"
              min="50"
              max="200"
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseInt(e.target.value, 10))}
              className="w-16 accent-zinc-200"
            />
            <button
              onClick={() => setShowFrameDetail(!showFrameDetail)}
              className={`px-2 py-0.5 rounded border text-[10.5px] font-sans ${
                showFrameDetail ? 'bg-[#1e2028] text-white border-zinc-600' : 'border-[#202126] text-zinc-400 hover:text-white'
              }`}
            >
              Detail Frame
            </button>
          </div>

        </div>

        {/* TIMELINE RULER & MULTI-TRACKS CONTAINER */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* TRACK HEADERS (LEFT) */}
          <div className="w-28 bg-[#0d0e12] border-r border-[#1c1d22] flex flex-col shrink-0 text-[10px] font-mono text-zinc-400 divide-y divide-[#1c1d22]">
            <div className="h-6 px-2 flex items-center justify-between bg-[#111215] text-zinc-300 font-sans font-semibold">
              <span>Track</span>
              <span>M / S</span>
            </div>
            <div className="h-12 px-2 flex items-center justify-between">
              <span>V1 (Video)</span>
              <span className="text-emerald-400">●</span>
            </div>
            <div className="h-8 px-2 flex items-center justify-between">
              <span>T1 (Teks)</span>
              <span className="text-amber-400">T</span>
            </div>
            <div className="h-8 px-2 flex items-center justify-between">
              <span>A1 (Audio)</span>
              <span className="text-cyan-400">♫</span>
            </div>
          </div>

          {/* MAIN INTERACTIVE TIMELINE (SCRUBBING & CLIPS) */}
          <div className="flex-1 flex flex-col overflow-x-auto relative bg-[#090a0d]">
            
            {/* TIME RULER WITH DRAGGABLE PLAYHEAD */}
            <div
              ref={timelineRulerRef}
              onClick={handleTimelineScrub}
              className="h-6 bg-[#111215] border-b border-[#1c1d22] relative cursor-pointer select-none shrink-0"
            >
              {/* Keyframe Diamonds on Ruler */}
              {keyframePoints.map((kf) => (
                <div
                  key={kf}
                  style={{ left: `${(kf / maxFrames) * 100}%` }}
                  className="absolute top-1 -ml-1 text-[#facc15] pointer-events-none"
                  title={`Keyframe pada frame ${kf}`}
                >
                  <Diamond className="w-2 h-2 fill-current" />
                </div>
              ))}

              {/* Draggable Playhead Scrubber */}
              <div
                style={{ left: `${(currentFrame / maxFrames) * 100}%` }}
                onMouseDown={handleStartPlayheadDrag}
                className="absolute top-0 bottom-0 w-0.5 bg-[#facc15] z-30 cursor-ew-resize"
              >
                <div className="w-3 h-3 bg-[#facc15] rotate-45 -ml-1.25 -mt-1 shadow-md hover:scale-125 transition-transform"></div>
              </div>

              {/* Ruler Frame Ticks */}
              <div className="flex justify-between px-3 text-[9px] font-mono text-zinc-500 pt-1 pointer-events-none">
                <span>0f</span>
                <span>30f (0.5s)</span>
                <span>60f (1s)</span>
                <span>90f (1.5s)</span>
                <span>120f (2s)</span>
                <span>150f (2.5s)</span>
                <span>180f (3s)</span>
              </div>
            </div>

            {/* TRACKS LANES */}
            <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
              
              {/* TRACK 1: VIDEO / FILMSTRIP CLIPS */}
              <div className="h-12 bg-[#0e0f13] border border-[#1c1d22] rounded relative flex items-center px-1">
                {clips.map((c) => {
                  const leftPct = (c.startFrame / maxFrames) * 100;
                  const widthPct = ((c.endFrame - c.startFrame) / maxFrames) * 100;
                  const isSelected = c.id === selectedClipId;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClipId(c.id)}
                      onContextMenu={(e) => handleClipContextMenu(e, c.id)}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className={`absolute h-10 rounded border flex items-center justify-between px-1.5 cursor-pointer shadow-sm transition-all ${
                        c.color
                      } ${isSelected ? 'ring-2 ring-zinc-300 text-white' : 'text-zinc-300'}`}
                      title="Klik untuk memilih. Klik kanan untuk opsi edit detail."
                    >
                      {/* Left Trim Handle */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTrimStart(c.id, currentFrame);
                        }}
                        title="Tarik / Klik untuk Set In-Point ke Playhead"
                        className="w-1.5 h-full bg-zinc-300/80 -ml-1 cursor-col-resize hover:bg-white"
                      />

                      <div className="flex items-center gap-1.5 truncate">
                        <Film className="w-3 h-3 text-zinc-300 shrink-0" />
                        <span className="truncate text-[10px] font-mono">{c.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">({c.endFrame - c.startFrame}f)</span>
                      </div>

                      {/* Right Trim Handle */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTrimEnd(c.id, currentFrame);
                        }}
                        title="Tarik / Klik untuk Set Out-Point ke Playhead"
                        className="w-1.5 h-full bg-zinc-300/80 -mr-1 cursor-col-resize hover:bg-white"
                      />
                    </div>
                  );
                })}
              </div>

              {/* TRACK 2: TEXT OVERLAYS */}
              <div className="h-8 bg-[#0e0f13] border border-[#1c1d22] rounded relative flex items-center px-2">
                {customText ? (
                  <div className="h-6 w-full rounded bg-[#2c2012] border border-amber-600/50 text-[10px] text-amber-200 font-mono flex items-center px-2 truncate">
                    Teks: "{customText}"
                  </div>
                ) : (
                  <div className="text-[10px] text-zinc-600 italic">
                    Gunakan tool teks di panel kiri untuk memasukkan layer teks ke timeline
                  </div>
                )}
              </div>

              {/* TRACK 3: AUDIO WAVEFORM */}
              <div className="h-8 bg-[#0e0f13] border border-[#1c1d22] rounded relative flex items-center px-2">
                <div className="h-6 w-4/5 rounded bg-[#10242b] border border-cyan-800/50 text-[10px] text-cyan-200 font-mono flex items-center px-2 justify-between">
                  <span>Background_Soundtrack_Stereo.wav (Speed: {selectedClip.speed}x)</span>
                  <span className="text-[9px] text-zinc-400">180 frames</span>
                </div>
              </div>

            </div>

          </div>

          {/* SUB-PANEL EDIT FRAME DETAIL DRAWER (KANAN TIMELINE) */}
          {showFrameDetail && selectedClip && (
            <div className="w-56 bg-[#0e0f13] border-l border-[#1c1d22] p-2.5 flex flex-col shrink-0 text-[11px] font-sans space-y-2">
              <div className="flex items-center justify-between border-b border-[#1c1d22] pb-1">
                <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                  Detail Frame Klip
                </span>
                <span className="font-mono text-zinc-300 text-[10px] truncate max-w-[90px]">
                  {selectedClip.name}
                </span>
              </div>

              {/* In-Point */}
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-zinc-400">In-Point:</span>
                <input
                  type="number"
                  min="0"
                  max={selectedClip.endFrame - 1}
                  value={selectedClip.startFrame}
                  onChange={(e) => handleTrimStart(selectedClip.id, parseInt(e.target.value, 10))}
                  className="w-14 bg-[#09090b] border border-[#222328] px-1 py-0.5 rounded text-white text-right"
                />
              </div>

              {/* Out-Point */}
              <div className="flex items-center justify-between font-mono text-[10.5px]">
                <span className="text-zinc-400">Out-Point:</span>
                <input
                  type="number"
                  min={selectedClip.startFrame + 1}
                  max={maxFrames}
                  value={selectedClip.endFrame}
                  onChange={(e) => handleTrimEnd(selectedClip.id, parseInt(e.target.value, 10))}
                  className="w-14 bg-[#09090b] border border-[#222328] px-1 py-0.5 rounded text-white text-right"
                />
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between text-zinc-400 text-[10.5px]">
                <span>Durasi:</span>
                <span className="font-mono text-white">
                  {selectedClip.endFrame - selectedClip.startFrame} frames ({((selectedClip.endFrame - selectedClip.startFrame) / fps).toFixed(2)}s)
                </span>
              </div>

              {/* Speed Buttons */}
              <div className="flex items-center justify-between text-zinc-400 text-[10.5px]">
                <span>Speed:</span>
                <div className="flex gap-1 font-mono">
                  {[0.5, 1.0, 2.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSetSpeed(selectedClip.id, s)}
                      className={`px-1.5 py-0.2 rounded text-[10px] border transition-colors ${
                        selectedClip.speed === s ? 'bg-zinc-100 text-zinc-950 font-bold border-zinc-100' : 'border-[#222328] text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Set In / Set Out to Playhead */}
              <div className="pt-1.5 border-t border-[#1c1d22] flex gap-1">
                <button
                  onClick={() => handleTrimStart(selectedClip.id, currentFrame)}
                  className="flex-1 py-0.5 rounded bg-[#14151a] hover:bg-[#1f2026] border border-[#202126] text-[10px] font-mono text-zinc-300"
                  title="Set In-Point ke Playhead"
                >
                  Set In [
                </button>
                <button
                  onClick={() => handleTrimEnd(selectedClip.id, currentFrame)}
                  className="flex-1 py-0.5 rounded bg-[#14151a] hover:bg-[#1f2026] border border-[#202126] text-[10px] font-mono text-zinc-300"
                  title="Set Out-Point ke Playhead"
                >
                  Set Out ]
                </button>
              </div>
            </div>
          )}

        </div>

      </footer>

      {/* --- 3. CUSTOM RIGHT-CLICK CONTEXT MENU POPUP AT MOUSE COORDINATES --- */}
      {/* "dan bisa di edit klik kanan juga secara detail" */}
      {contextMenu && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-52 bg-[#121317] border border-[#222329] rounded-lg shadow-2xl py-1 text-xs text-zinc-200 select-none animate-in fade-in duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-[10px] font-mono text-zinc-500 uppercase border-b border-[#1c1d22]">
            Opsi Klip: {clips.find(c => c.id === contextMenu.clipId)?.name}
          </div>

          <button
            onClick={() => {
              handleSplitClipAtPlayhead();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1c1d24] hover:text-white flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-zinc-300" />
              <span>Potong pada Playhead</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Ctrl+B</span>
          </button>

          <button
            onClick={() => {
              handleDuplicateClip(contextMenu.clipId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1c1d24] hover:text-white flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              <span>Duplikasi Klip</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Ctrl+D</span>
          </button>

          <div className="my-1 border-t border-[#1c1d22]"></div>

          <button
            onClick={() => {
              handleTrimStart(contextMenu.clipId, currentFrame);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1c1d24] hover:text-white flex items-center gap-1.5"
          >
            <span>Set In-Point ke Playhead</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">[</span>
          </button>

          <button
            onClick={() => {
              handleTrimEnd(contextMenu.clipId, currentFrame);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1c1d24] hover:text-white flex items-center gap-1.5"
          >
            <span>Set Out-Point ke Playhead</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-auto">]</span>
          </button>

          <button
            onClick={() => {
              handleToggleKeyframe();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#1c1d24] hover:text-white flex items-center gap-1.5"
          >
            <Diamond className="w-3.5 h-3.5 text-zinc-300" />
            <span>Tambah / Hapus Keyframe</span>
          </button>

          <div className="my-1 border-t border-[#1c1d22]"></div>

          <div className="px-3 py-1 text-[10px] text-zinc-500">Ubah Kecepatan (Speed):</div>
          <div className="flex px-2 pb-1 gap-1">
            {[0.5, 1.0, 2.0, 4.0].map((s) => (
              <button
                key={s}
                onClick={() => {
                  handleSetSpeed(contextMenu.clipId, s);
                  setContextMenu(null);
                }}
                className="flex-1 py-0.5 rounded bg-[#181920] hover:bg-[#252732] border border-[#23242c] text-[10px] font-mono text-zinc-300"
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="my-1 border-t border-[#1c1d22]"></div>

          <button
            onClick={() => {
              handleDeleteClip(contextMenu.clipId);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-rose-950/60 text-rose-400 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Klip (Delete)</span>
          </button>
        </div>
      )}

      {/* 4. VERY BOTTOM STATUS BAR */}
      <div className="h-[20px] bg-[#09090b] border-t border-[#1c1d22] px-3 flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            git: main
          </span>
          <span>0 Errors</span>
          <span>0 Warnings</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Remotion v3.3</span>
          <span className="text-zinc-300 font-mono">60 FPS Engine</span>
          <span>UTF-8</span>
        </div>
      </div>

    </div>
  );
}
