import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
  Sliders, MessageSquare, Send, Sparkles, RefreshCw, Scissors,
  Layers, Plus, Trash2, Eye, EyeOff, Lock, Unlock,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ZoomIn, ZoomOut,
  Folder, Film, Music, FileText, CornerUpLeft, Radio, SplitSquareVertical,
  Upload, Image, AlignLeft, Sparkle, Terminal, Settings, ShieldCheck,
  Cpu, Activity, Check, Code, Layout, Palette, Move, Crop, Type,
  Pipette, Paintbrush, Eraser, Hand, Search, Square, Diamond, Clock
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
  // --- PHOTOSHOP ACTIVE TOOL ---
  // 'move' | 'marquee' | 'razor' | 'text' | 'brush' | 'eraser' | 'hand' | 'zoom'
  const [activeTool, setActiveTool] = useState('move');

  // --- RIGHT PANEL DOCK TABS ---
  // Top: 'color' | 'swatches'
  const [topRightTab, setTopRightTab] = useState('color');
  // Bottom: 'layers' | 'adjustments' | 'properties'
  const [bottomRightTab, setBottomRightTab] = useState('layers');

  // Color Swatches (Photoshop Style RGB Sliders)
  const [colorR, setColorR] = useState(255);
  const [colorG, setColorG] = useState(255);
  const [colorB, setColorB] = useState(255);
  const [foregroundColor, setForegroundColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#000000');

  // Sync RGB to Hex
  const handleRgbChange = (r, g, b) => {
    setColorR(r);
    setColorG(g);
    setColorB(b);
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    setForegroundColor(hex);
  };

  // --- BOTTOM TIMELINE DOCK TABS ---
  // 'timeline' | 'minibridge'
  const [bottomDockTab, setBottomDockTab] = useState('timeline');
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(true);
  const [timelineHeight, setTimelineHeight] = useState(230);

  // --- CANVAS & MEDIA STATE (PURE BLACK CANVAS DEFAULT) ---
  // "layarnya begitu hitam saja, jangan ada langsung gambar"
  const [uploadedMedia, setUploadedMedia] = useState(null); // { type: 'image' | 'video', url: string, name: string }
  const fileInputRef = useRef(null);
  const videoElementRef = useRef(null);

  // Layer Visibility & Locks
  const [mediaVisible, setMediaVisible] = useState(true);
  const [textVisible, setTextVisible] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState(100);
  const [layerFill, setLayerFill] = useState(100);
  const [blendMode, setBlendMode] = useState('normal');

  // Transform Properties untuk Objek Canvas
  const [mediaPosX, setMediaPosX] = useState(0);
  const [mediaPosY, setMediaPosY] = useState(0);
  const [mediaScale, setMediaScale] = useState(100);
  const [mediaRotation, setMediaRotation] = useState(0);
  const [mediaOpacity, setMediaOpacity] = useState(100);
  const [mediaFilter, setMediaFilter] = useState('none'); // 'none' | 'dim' | 'contrast' | 'grayscale' | 'invert'

  // Text Overlay State
  const [customText, setCustomText] = useState('');
  const [textPosX, setTextPosX] = useState(0);
  const [textPosY, setTextPosY] = useState(0);
  const [textScale, setTextScale] = useState(100);

  // --- TIMELINE PLAYHEAD, SLIDE & FRAME ENGINE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [timelineZoom, setTimelineZoom] = useState(100); // 100% to 300%

  // Multi-Track Timeline Clips State
  const [clips, setClips] = useState([
    {
      id: 1,
      name: 'Video_Layer_Track_1',
      startFrame: 0,
      endFrame: 180,
      speed: 1.0,
      fadeIn: 0,
      fadeOut: 0,
      color: 'bg-[#3c424d] border-[#555d6b]'
    }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);
  const [keyframePoints, setKeyframePoints] = useState([0, 90, 180]); // Keyframe marker diamonds
  const [showFrameDetailModal, setShowFrameDetailModal] = useState(true); // Panel detail frame di timeline

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

  // --- 1. MEDIA IMPORT HANDLER ---
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
        color: 'bg-[#2d4059] border-[#435e82]'
      }
    ]);

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

  // --- 2. 60 FPS REAL-TIME PLAYBACK TIMER ---
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= maxFrames) {
            return 0; // Loop kembali ke frame 0
          }
          return prev + 1;
        });
      }, 1000 / fps);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, maxFrames, fps]);

  // Video element sync
  useEffect(() => {
    if (videoElementRef.current && uploadedMedia?.type === 'video') {
      if (isPlaying) {
        videoElementRef.current.play().catch(() => {});
      } else {
        videoElementRef.current.pause();
      }
    }
  }, [isPlaying, uploadedMedia]);

  // --- 3. SLIDE FRAME (DRAGGABLE SCRUBBER) ---
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

  // --- 4. CUT FRAME (RAZOR / SPLIT CLIP PADA PLAYHEAD) ---
  const handleCutFrameAtPlayhead = () => {
    const targetClip = clips.find(
      (c) => c.id === selectedClipId && currentFrame > c.startFrame && currentFrame < c.endFrame
    );
    if (!targetClip) {
      // Jika klip yang dipilih tidak pas, coba potong klip apapun di bawah playhead
      const anyClip = clips.find((c) => currentFrame > c.startFrame && currentFrame < c.endFrame);
      if (!anyClip) return;
      executeSplit(anyClip);
      return;
    }
    executeSplit(targetClip);
  };

  const executeSplit = (clipToSplit) => {
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
        color: 'bg-[#40354a] border-[#625272]'
      };
      return [...updated, newPart];
    });

    // Otomatis tandai titik keyframe cut
    if (!keyframePoints.includes(splitPoint)) {
      setKeyframePoints((prev) => [...prev, splitPoint].sort((a, b) => a - b));
    }
  };

  // --- 5. EDIT FRAME SECARA DETAIL ---
  const handleTrimClipStart = (clipId, newStart) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, startFrame: Math.max(0, Math.min(newStart, c.endFrame - 5)) } : c))
    );
  };

  const handleTrimClipEnd = (clipId, newEnd) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, endFrame: Math.min(maxFrames, Math.max(newEnd, c.startFrame + 5)) } : c))
    );
  };

  const handleSetClipSpeed = (clipId, speed) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, speed } : c)));
  };

  const handleToggleKeyframeAtCurrent = () => {
    if (keyframePoints.includes(currentFrame)) {
      setKeyframePoints((prev) => prev.filter((f) => f !== currentFrame));
    } else {
      setKeyframePoints((prev) => [...prev, currentFrame].sort((a, b) => a - b));
    }
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
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] text-[#dcdcdc] overflow-hidden select-none font-sans">
      
      {/* 1. MAIN WORKSPACE ROW (TOOL PALETTE + BLACK CANVAS + RIGHT DOCKS) */}
      <div className="flex-1 w-full flex overflow-hidden">
        
        {/* --- PHOTOSHOP LEFT VERTICAL TOOL PALETTE (2-COLUMN CS6 STYLE) --- */}
        <aside className="w-12 bg-[#262626] border-r border-[#1c1c1c] flex flex-col items-center py-2 shrink-0 z-30 select-none shadow-md">
          {/* Tool Icons Grid */}
          <div className="grid grid-cols-2 gap-1 px-1">
            
            {/* Move Tool (V) */}
            <button
              onClick={() => setActiveTool('move')}
              title="Move Tool (V)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'move' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            {/* Marquee Tool (M) */}
            <button
              onClick={() => setActiveTool('marquee')}
              title="Rectangular Marquee Tool (M)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'marquee' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Square className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>

            {/* Razor / Split Frame Tool (C) */}
            <button
              onClick={() => {
                setActiveTool('razor');
                handleCutFrameAtPlayhead();
              }}
              title="Cut Frame / Razor Split Tool (C)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'razor' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>

            {/* Crop Tool */}
            <button
              onClick={() => setActiveTool('crop')}
              title="Crop Tool (C)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'crop' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
            </button>

            {/* Eyedropper (I) */}
            <button
              onClick={() => setActiveTool('eyedropper')}
              title="Eyedropper Tool (I)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'eyedropper' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Pipette className="w-3.5 h-3.5" />
            </button>

            {/* Brush Tool (B) */}
            <button
              onClick={() => setActiveTool('brush')}
              title="Brush Tool (B)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'brush' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
            </button>

            {/* Eraser Tool (E) */}
            <button
              onClick={() => setActiveTool('eraser')}
              title="Eraser Tool (E)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'eraser' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>

            {/* Type / Text Tool (T) */}
            <button
              onClick={() => {
                setActiveTool('text');
                const userT = prompt('Masukkan teks layer:', customText || 'Teks Animasi Quantum');
                if (userT !== null) setCustomText(userT);
              }}
              title="Horizontal Type Tool (T)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'text' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
            </button>

            {/* Import Media File Tool */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Import Media (Foto/Video) ke Canvas"
              className="w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 text-amber-400 hover:text-amber-200 hover:bg-[#333333] transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Hand Tool (H) */}
            <button
              onClick={() => setActiveTool('hand')}
              title="Hand Tool (H)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'hand' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Tool (Z) */}
            <button
              onClick={() => setActiveTool('zoom')}
              title="Zoom Tool (Z)"
              className={`w-4.5 h-4.5 rounded-sm flex items-center justify-center p-0.5 transition-colors cursor-pointer ${
                activeTool === 'zoom' ? 'bg-[#3879d9] text-white' : 'text-zinc-400 hover:text-white hover:bg-[#333333]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </button>

          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleMediaFileChange}
            accept="image/*,video/*"
            className="hidden"
          />

          {/* Foreground & Background Color Chips (Photoshop Swatch) */}
          <div className="mt-auto mb-2 relative w-7 h-7">
            {/* Background Color Chip */}
            <div
              style={{ backgroundColor: backgroundColor }}
              className="absolute right-0 bottom-0 w-4.5 h-4.5 border border-[#444444] rounded-xs shadow cursor-pointer"
              title="Background Color (Hitam)"
            />
            {/* Foreground Color Chip */}
            <div
              style={{ backgroundColor: foregroundColor }}
              className="absolute left-0 top-0 w-4.5 h-4.5 border border-[#555555] rounded-xs shadow cursor-pointer z-10"
              title="Foreground Color (Putih)"
            />
          </div>
        </aside>

        {/* --- CENTER WORKSPACE: PURE BLACK CANVAS VIEWPORT --- */}
        {/* "layarnya begitu hitam saja, jangan ada lanusng gambar" */}
        <main className="flex-1 h-full flex flex-col bg-[#1e1e1e] overflow-hidden relative">
          
          {/* Viewport Frame Header Tabs */}
          <div className="h-6 bg-[#262626] border-b border-[#1c1c1c] flex items-center px-2 text-[11px] text-zinc-400 justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-zinc-200 font-semibold">Untitled-1 @ 100% (RGB/8#)</span>
              <span className="text-[10px] text-zinc-500 font-mono">1920 × 1080 (16:9)</span>
            </div>
            <div className="font-mono text-[10px] text-zinc-400">
              Frame: <strong className="text-amber-400">{currentFrame}</strong> / {maxFrames} ({formatTimecode(currentFrame)})
            </div>
          </div>

          {/* Canvas Working Field */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden bg-[#1e1e1e] relative">
            
            {/* PURE BLACK CANVAS RECTANGLE (HITAM POLOS SESUAI PERMINTAAN USER) */}
            <div
              className="aspect-video w-full max-w-4xl max-h-[82%] bg-[#000000] border border-[#333333] shadow-2xl relative overflow-hidden flex items-center justify-center transition-all"
              style={{
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }}
            >
              {/* Center Screen: Hanya Hitam Polos Tanpa Gambar Acak / Template default */}
              
              {/* JIKA USER MENGUNGGAH MEDIA BARULAH MEDIA TAMPIL */}
              {uploadedMedia && mediaVisible && (
                <div
                  style={{
                    transform: `translate(${mediaPosX}px, ${mediaPosY}px) scale(${mediaScale / 100}) rotate(${mediaRotation}deg)`,
                    opacity: (mediaOpacity / 100) * (layerOpacity / 100),
                    filter:
                      mediaFilter === 'dim' ? 'brightness(0.6)' :
                      mediaFilter === 'contrast' ? 'contrast(1.4)' :
                      mediaFilter === 'grayscale' ? 'grayscale(1)' :
                      mediaFilter === 'invert' ? 'invert(1)' : 'none'
                  }}
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-75"
                >
                  {uploadedMedia.type === 'video' ? (
                    <video
                      ref={videoElementRef}
                      src={uploadedMedia.url}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={uploadedMedia.url}
                      alt="Uploaded File"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}

              {/* JIKA USER MENAMBAHKAN TEKS BARULAH TEKS MUNCUL */}
              {customText && textVisible && (
                <div
                  style={{
                    transform: `translate(${textPosX}px, ${textPosY}px) scale(${textScale / 100})`,
                    color: foregroundColor
                  }}
                  className="absolute z-20 text-center font-bold px-4 pointer-events-none drop-shadow-lg"
                >
                  <div className="text-2xl font-black">{customText}</div>
                </div>
              )}

              {/* Faint Center Crosshair Guide (Photoshop Center Guide) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
                <div className="w-8 h-px bg-white"></div>
                <div className="h-8 w-px bg-white absolute"></div>
              </div>
            </div>

          </div>

        </main>

        {/* --- PHOTOSHOP RIGHT DOCKED PANELS (COLOR, ADJUSTMENTS, LAYERS) --- */}
        <aside className="w-64 bg-[#2b2b2b] border-l border-[#1c1c1c] flex flex-col shrink-0 text-xs select-none shadow-md z-30">
          
          {/* PANEL 1 (TOP): COLOR & SWATCHES */}
          <div className="border-b border-[#202020] flex flex-col shrink-0">
            <div className="h-6 bg-[#262626] border-b border-[#1c1c1c] px-2 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTopRightTab('color')}
                  className={`font-semibold ${topRightTab === 'color' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Color
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={() => setTopRightTab('swatches')}
                  className={`font-semibold ${topRightTab === 'swatches' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Swatches
                </button>
              </div>
            </div>

            {topRightTab === 'color' ? (
              <div className="p-2.5 space-y-2 text-[11px]">
                {/* RGB Sliders (Photoshop Style) */}
                <div className="space-y-1.5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-3 text-red-400 font-bold">R</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={colorR}
                      onChange={(e) => handleRgbChange(parseInt(e.target.value, 10), colorG, colorB)}
                      className="flex-1 accent-red-500 h-1 bg-[#1a1a1a] rounded"
                    />
                    <span className="w-6 text-right text-zinc-300">{colorR}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 text-emerald-400 font-bold">G</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={colorG}
                      onChange={(e) => handleRgbChange(colorR, parseInt(e.target.value, 10), colorB)}
                      className="flex-1 accent-emerald-500 h-1 bg-[#1a1a1a] rounded"
                    />
                    <span className="w-6 text-right text-zinc-300">{colorG}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-3 text-blue-400 font-bold">B</span>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={colorB}
                      onChange={(e) => handleRgbChange(colorR, colorG, parseInt(e.target.value, 10))}
                      className="flex-1 accent-blue-500 h-1 bg-[#1a1a1a] rounded"
                    />
                    <span className="w-6 text-right text-zinc-300">{colorB}</span>
                  </div>
                </div>

                {/* Color Spectrum Ramp */}
                <div
                  className="h-3 w-full rounded-xs border border-[#444444]"
                  style={{
                    background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'
                  }}
                />
              </div>
            ) : (
              <div className="p-2.5 grid grid-cols-6 gap-1">
                {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#888888', '#facc15', '#e11d48', '#10b981'].map((c) => (
                  <div
                    key={c}
                    onClick={() => setForegroundColor(c)}
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded-xs border border-[#444444] cursor-pointer hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            )}
          </div>

          {/* PANEL 2 (MIDDLE): ADJUSTMENTS */}
          <div className="border-b border-[#202020] p-2 space-y-1.5 shrink-0">
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Adjustments
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMediaFilter('none')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${mediaFilter === 'none' ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-400 hover:text-white'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setMediaFilter('grayscale')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${mediaFilter === 'grayscale' ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-400 hover:text-white'}`}
              >
                B&amp;W
              </button>
              <button
                onClick={() => setMediaFilter('dim')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${mediaFilter === 'dim' ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-400 hover:text-white'}`}
              >
                Dim
              </button>
              <button
                onClick={() => setMediaFilter('contrast')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${mediaFilter === 'contrast' ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-400 hover:text-white'}`}
              >
                Contrast
              </button>
              <button
                onClick={() => setMediaFilter('invert')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${mediaFilter === 'invert' ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-400 hover:text-white'}`}
              >
                Invert
              </button>
            </div>
          </div>

          {/* PANEL 3 (BOTTOM): LAYERS & OPACITY DOCK */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="h-6 bg-[#262626] border-b border-[#1c1c1c] px-2 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
              <span className="font-semibold text-white">Layers</span>
              <span className="text-[10px] text-zinc-500 font-mono">Channels | Paths</span>
            </div>

            {/* Blend Mode & Opacity Sliders */}
            <div className="p-2 border-b border-[#202020] space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value)}
                  className="bg-[#202020] border border-[#3e3e3e] rounded px-1.5 py-0.5 text-zinc-300 text-[10.5px]"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                </select>

                <div className="flex items-center gap-1 font-mono text-[10.5px]">
                  <span className="text-zinc-400">Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layerOpacity}
                    onChange={(e) => setLayerOpacity(parseInt(e.target.value, 10))}
                    className="w-14 accent-[#3879d9]"
                  />
                  <span className="w-6 text-right text-white">{layerOpacity}%</span>
                </div>
              </div>
            </div>

            {/* Layer Items List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 text-xs">
              
              {/* Layer 1: Uploaded Media */}
              {uploadedMedia && (
                <div className="p-1.5 rounded bg-[#202020] border border-[#383838] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMediaVisible(!mediaVisible)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {mediaVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                    </button>
                    <div className="w-5 h-5 bg-black border border-zinc-700 flex items-center justify-center text-[9px] font-mono">
                      {uploadedMedia.type === 'video' ? 'MP4' : 'IMG'}
                    </div>
                    <span className="font-mono text-zinc-200 text-[11px] truncate max-w-[120px]">
                      {uploadedMedia.name}
                    </span>
                  </div>
                  <button onClick={handleClearMedia} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Layer 2: Text Layer */}
              {customText && (
                <div className="p-1.5 rounded bg-[#202020] border border-[#383838] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTextVisible(!textVisible)}
                      className="text-zinc-400 hover:text-white"
                    >
                      {textVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                    </button>
                    <div className="w-5 h-5 bg-[#181818] border border-zinc-700 flex items-center justify-center font-bold text-amber-400 text-[10px]">
                      T
                    </div>
                    <span className="font-mono text-zinc-200 text-[11px] truncate max-w-[120px]">
                      {customText}
                    </span>
                  </div>
                  <button onClick={() => setCustomText('')} className="text-zinc-500 hover:text-rose-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Layer 3: Solid Black Background Layer (Selalu Ada) */}
              <div className="p-1.5 rounded bg-[#1e1e1e] border border-[#2b2b2b] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                  <div className="w-5 h-5 bg-black border border-zinc-700 flex items-center justify-center"></div>
                  <span className="font-mono text-zinc-400 text-[11px]">
                    Background (Black Solid)
                  </span>
                </div>
                <Lock className="w-3 h-3 text-zinc-600" />
              </div>

            </div>

            {/* Bottom Layer Action Icons */}
            <div className="h-6 bg-[#262626] border-t border-[#1c1c1c] px-2 flex items-center justify-end gap-2 text-zinc-400 text-[11px] shrink-0">
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Create New Layer / Import Media"
                className="hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleClearMedia}
                title="Delete Layer"
                className="hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* 2. FUNCTIONAL BOTTOM BAR: TIMELINE, SLIDE FRAME, CUT FRAME, EDIT FRAME DETAIL */}
      {/* "lalu bar dbawahnya fungsikan, agar saya bisa slide frae nya, cut framenya, edit frame nya secara detail" */}
      <footer
        style={{ height: isTimelineExpanded ? `${timelineHeight}px` : '26px' }}
        className="bg-[#262626] border-t border-[#1a1a1a] flex flex-col shrink-0 select-none z-40 transition-all duration-150"
      >
        {/* TIMELINE TITLE TAB BAR (Photoshop / Premiere Style) */}
        <div className="h-6 bg-[#2b2b2b] border-b border-[#1c1c1c] px-2 flex items-center justify-between text-[11px] text-[#b0b0b0] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBottomDockTab('timeline'); setIsTimelineExpanded(true); }}
              className={`font-semibold flex items-center gap-1 ${bottomDockTab === 'timeline' ? 'text-white border-b-2 border-[#3879d9]' : 'hover:text-white'}`}
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span>Timeline</span>
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => { setBottomDockTab('minibridge'); setIsTimelineExpanded(true); }}
              className={`font-semibold ${bottomDockTab === 'minibridge' ? 'text-white border-b-2 border-[#3879d9]' : 'hover:text-white'}`}
            >
              Mini Bridge (Assets)
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10.5px]">
            {/* Direct Frame Input (Bisa Ketik Frame Langsung) */}
            <div className="flex items-center gap-1">
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
                className="w-11 bg-[#1a1a1a] border border-[#3e3e3e] px-1 py-0.2 rounded text-white text-center font-bold"
              />
              <span>/ {maxFrames}</span>
            </div>

            <span className="text-zinc-600">|</span>
            <span className="text-amber-400 font-bold">{formatTimecode(currentFrame)}</span>

            <button
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
              className="p-0.5 hover:text-white"
              title={isTimelineExpanded ? 'Minimize Timeline' : 'Expand Timeline'}
            >
              {isTimelineExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {isTimelineExpanded && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#202020]">
            
            {/* TIMELINE TOOLBAR (PLAY, PAUSE, SLIDE, CUT, STEP, KEYFRAME) */}
            <div className="h-7 bg-[#262626] border-b border-[#1c1c1c] px-2 flex items-center justify-between text-xs shrink-0">
              
              {/* Transport Buttons */}
              <div className="flex items-center gap-1">
                {/* Go to Start */}
                <button
                  onClick={() => setCurrentFrame(0)}
                  className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white cursor-pointer"
                  title="Ke Awal (Frame 0)"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                {/* Step -1 Frame */}
                <button
                  onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
                  className="px-1.5 py-0.5 rounded bg-[#202020] hover:bg-[#333333] border border-[#3a3a3a] text-[10.5px] font-mono cursor-pointer"
                  title="Mundur 1 Frame (-1f)"
                >
                  -1f
                </button>

                {/* PLAY / PAUSE BUTTON */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2.5 py-0.5 rounded bg-[#3879d9] hover:bg-[#4a8df0] text-white font-bold flex items-center gap-1 cursor-pointer shadow-sm text-[11px]"
                >
                  {isPlaying ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                {/* Step +1 Frame */}
                <button
                  onClick={() => setCurrentFrame((prev) => Math.min(maxFrames, prev + 1))}
                  className="px-1.5 py-0.5 rounded bg-[#202020] hover:bg-[#333333] border border-[#3a3a3a] text-[10.5px] font-mono cursor-pointer"
                  title="Maju 1 Frame (+1f)"
                >
                  +1f
                </button>

                {/* Go to End */}
                <button
                  onClick={() => setCurrentFrame(maxFrames)}
                  className="p-1 rounded hover:bg-[#333333] text-zinc-300 hover:text-white cursor-pointer"
                  title="Ke Akhir (Frame 180)"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-[#3e3e3e] mx-1"></div>

                {/* --- CUT FRAME BUTTON (GUNTING CLIP PADA PLAYHEAD) --- */}
                <button
                  onClick={handleCutFrameAtPlayhead}
                  className="px-2 py-0.5 rounded bg-[#2d3238] hover:bg-[#3d4550] border border-[#4d5663] text-white font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Cut Frame (Pisahkan Clip pada Posisi Playhead) [C / Ctrl+B]"
                >
                  <Scissors className="w-3 h-3 text-amber-400" />
                  <span>Cut Frame</span>
                </button>

                {/* --- ADD / REMOVE KEYFRAME BUTTON --- */}
                <button
                  onClick={handleToggleKeyframeAtCurrent}
                  className={`px-2 py-0.5 rounded border text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors ${
                    keyframePoints.includes(currentFrame)
                      ? 'bg-amber-950/70 border-amber-600 text-amber-300 font-bold'
                      : 'bg-[#202020] border-[#3a3a3a] text-zinc-300 hover:text-white'
                  }`}
                  title="Toggle Keyframe pada Frame Ini"
                >
                  <Diamond className="w-2.5 h-2.5 fill-current" />
                  <span>{keyframePoints.includes(currentFrame) ? 'Keyframe Aktif' : '+ Keyframe'}</span>
                </button>
              </div>

              {/* Right Toolbar: Zoom & Frame Detail Toggle */}
              <div className="flex items-center gap-2 font-mono text-[10.5px] text-zinc-400">
                <span>Zoom:</span>
                <input
                  type="range"
                  min="50"
                  max="250"
                  value={timelineZoom}
                  onChange={(e) => setTimelineZoom(parseInt(e.target.value, 10))}
                  className="w-16 accent-[#3879d9]"
                />
                <button
                  onClick={() => setShowFrameDetailModal(!showFrameDetailModal)}
                  className={`px-1.5 py-0.5 rounded border text-[10.5px] font-sans ${showFrameDetailModal ? 'bg-[#3879d9] text-white border-[#3879d9]' : 'border-[#3a3a3a] text-zinc-300 hover:text-white'}`}
                >
                  Detail Frame
                </button>
              </div>

            </div>

            {/* TIMELINE RULER & CLIPS TRACK AREA */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* TRACK HEADERS (LEFT) */}
              <div className="w-36 bg-[#232323] border-r border-[#1c1c1c] flex flex-col shrink-0 text-[10.5px] font-mono text-zinc-400 divide-y divide-[#1c1c1c]">
                <div className="h-6 px-2 flex items-center justify-between bg-[#282828] text-zinc-300 font-sans font-semibold">
                  <span>Track ID</span>
                  <span>M / S</span>
                </div>
                <div className="h-10 px-2 flex items-center justify-between bg-[#232323]">
                  <span>V1: Video Layer</span>
                  <div className="flex gap-1 text-[9px]">
                    <span className="px-1 bg-[#1a1a1a] rounded text-zinc-400">V</span>
                    <span className="px-1 bg-[#1a1a1a] rounded text-emerald-400">●</span>
                  </div>
                </div>
                <div className="h-9 px-2 flex items-center justify-between bg-[#232323]">
                  <span>T1: Text Overlay</span>
                  <div className="flex gap-1 text-[9px]">
                    <span className="px-1 bg-[#1a1a1a] rounded text-amber-400">T</span>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE TRACK TIMELINE (SCRUBBING & CLIPS) */}
              <div className="flex-1 flex flex-col overflow-x-auto relative bg-[#181818]">
                
                {/* TIMELINE RULER (DENGAN DRAGGABLE PLAYHEAD SCRUBBER) */}
                <div
                  ref={timelineRulerRef}
                  onClick={handleTimelineScrub}
                  className="h-6 bg-[#252525] border-b border-[#1c1c1c] relative cursor-pointer select-none shrink-0"
                >
                  {/* Keyframe Markers on Ruler */}
                  {keyframePoints.map((kf) => (
                    <div
                      key={kf}
                      style={{ left: `${(kf / maxFrames) * 100}%` }}
                      className="absolute top-1 -ml-1 text-amber-400 pointer-events-none"
                      title={`Keyframe pada frame ${kf}`}
                    >
                      <Diamond className="w-2 h-2 fill-amber-400" />
                    </div>
                  ))}

                  {/* DRAGGABLE PLAYHEAD */}
                  <div
                    style={{ left: `${(currentFrame / maxFrames) * 100}%` }}
                    onMouseDown={handleStartPlayheadDrag}
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30 cursor-ew-resize"
                  >
                    <div className="w-3 h-3 bg-amber-400 rotate-45 -ml-1.25 -mt-1 shadow-md hover:scale-125 transition-transform"></div>
                  </div>

                  {/* Frame Ticks (0, 30, 60, 90, 120, 150, 180) */}
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

                {/* CLIPS RENDERING TRACKS */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  
                  {/* Track 1: Video Clips (Bisa Dipotong & Di-trim) */}
                  <div className="h-10 bg-[#1c1c1c] border border-[#2b2b2b] rounded-sm relative flex items-center px-1">
                    {clips.map((c) => {
                      const leftPct = (c.startFrame / maxFrames) * 100;
                      const widthPct = ((c.endFrame - c.startFrame) / maxFrames) * 100;
                      const isSelected = c.id === selectedClipId;

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedClipId(c.id)}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`
                          }}
                          className={`absolute h-8 rounded-sm border text-[10px] font-mono flex items-center justify-between px-1.5 cursor-pointer shadow transition-all ${
                            c.color
                          } ${isSelected ? 'ring-2 ring-amber-400 text-white' : 'text-zinc-300'}`}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const newS = Math.max(0, currentFrame);
                              handleTrimClipStart(c.id, newS);
                            }}
                            title="Tarik / Klik untuk Set In-Point ke Playhead"
                            className="w-1.5 h-full bg-amber-400/80 -ml-1 cursor-col-resize hover:bg-amber-300"
                          />

                          <span className="truncate">{c.name} ({c.endFrame - c.startFrame}f)</span>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const newE = Math.min(maxFrames, currentFrame);
                              handleTrimClipEnd(c.id, newE);
                            }}
                            title="Tarik / Klik untuk Set Out-Point ke Playhead"
                            className="w-1.5 h-full bg-amber-400/80 -mr-1 cursor-col-resize hover:bg-amber-300"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Track 2: Text Overlay Track */}
                  <div className="h-9 bg-[#1c1c1c] border border-[#2b2b2b] rounded-sm relative flex items-center px-2">
                    {customText ? (
                      <div className="h-6 w-full rounded-sm bg-[#4a3b2c] border border-amber-600/60 text-[10.5px] text-amber-200 font-mono flex items-center px-2 truncate">
                        Teks: "{customText}" (Frame 0 - 180)
                      </div>
                    ) : (
                      <div className="text-[10px] text-zinc-600 italic">
                        Pilih Tool Type (T) di sebelah kiri untuk menambahkan teks ke timeline
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* --- SUB-PANEL EDIT FRAME DETAIL SECARA DETAIL --- */}
              {showFrameDetailModal && selectedClip && (
                <div className="w-56 bg-[#242424] border-l border-[#1c1c1c] p-2 flex flex-col shrink-0 text-[11px] font-sans space-y-2">
                  <div className="flex items-center justify-between border-b border-[#333333] pb-1">
                    <span className="font-bold text-white uppercase text-[10px] tracking-wider">
                      Detail Frame Clip
                    </span>
                    <span className="font-mono text-amber-400 text-[10px]">{selectedClip.name}</span>
                  </div>

                  {/* In-Point (Start Frame) */}
                  <div className="flex items-center justify-between font-mono text-[10.5px]">
                    <span className="text-zinc-400">In-Point:</span>
                    <input
                      type="number"
                      min="0"
                      max={selectedClip.endFrame - 1}
                      value={selectedClip.startFrame}
                      onChange={(e) => handleTrimClipStart(selectedClip.id, parseInt(e.target.value, 10))}
                      className="w-14 bg-[#181818] border border-[#3e3e3e] px-1 py-0.5 rounded text-white text-right"
                    />
                  </div>

                  {/* Out-Point (End Frame) */}
                  <div className="flex items-center justify-between font-mono text-[10.5px]">
                    <span className="text-zinc-400">Out-Point:</span>
                    <input
                      type="number"
                      min={selectedClip.startFrame + 1}
                      max={maxFrames}
                      value={selectedClip.endFrame}
                      onChange={(e) => handleTrimClipEnd(selectedClip.id, parseInt(e.target.value, 10))}
                      className="w-14 bg-[#181818] border border-[#3e3e3e] px-1 py-0.5 rounded text-white text-right"
                    />
                  </div>

                  {/* Total Frame Duration */}
                  <div className="flex items-center justify-between text-zinc-400 text-[10.5px]">
                    <span>Durasi:</span>
                    <span className="font-mono text-white">
                      {selectedClip.endFrame - selectedClip.startFrame} frames (
                      {((selectedClip.endFrame - selectedClip.startFrame) / fps).toFixed(2)}s)
                    </span>
                  </div>

                  {/* Playback Speed */}
                  <div className="flex items-center justify-between text-zinc-400 text-[10.5px]">
                    <span>Speed:</span>
                    <select
                      value={selectedClip.speed || 1.0}
                      onChange={(e) => handleSetClipSpeed(selectedClip.id, parseFloat(e.target.value))}
                      className="bg-[#181818] border border-[#3e3e3e] rounded px-1 py-0.5 text-white font-mono"
                    >
                      <option value="0.5">0.5x (Slow)</option>
                      <option value="1.0">1.0x (Normal)</option>
                      <option value="1.5">1.5x (Fast)</option>
                      <option value="2.0">2.0x (Double)</option>
                    </select>
                  </div>

                  {/* Set In/Out to Playhead Shortcuts */}
                  <div className="pt-1 border-t border-[#333333] flex gap-1">
                    <button
                      onClick={() => handleTrimClipStart(selectedClip.id, currentFrame)}
                      className="flex-1 py-0.5 rounded bg-[#1c1c1c] hover:bg-[#333333] border border-[#383838] text-[9.5px] font-mono text-zinc-300"
                    >
                      Set In [
                    </button>
                    <button
                      onClick={() => handleTrimClipEnd(selectedClip.id, currentFrame)}
                      className="flex-1 py-0.5 rounded bg-[#1c1c1c] hover:bg-[#333333] border border-[#383838] text-[9.5px] font-mono text-zinc-300"
                    >
                      Set Out ]
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </footer>

      {/* 3. VERY BOTTOM STATUS BAR */}
      <div className="h-[20px] bg-[#1a1a1a] border-t border-[#141414] px-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Doc: 1920x1080 (16:9)</span>
          <span>Scratch: 45.2M / 1.2G</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Photoshop &amp; Motion Studio v1.0.1</span>
          <span className="text-amber-400 font-bold">60 FPS Engine</span>
        </div>
      </div>

    </div>
  );
}
