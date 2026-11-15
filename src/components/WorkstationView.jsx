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
  Mic, Magnet, RotateCw, Wand2, Video, Sun, Contrast, Gauge
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
  // --- 1. CAPCUT TOP-LEFT NAVIGATION TABS ---
  // 'code' | 'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transition' | 'filters'
  const [leftNavTab, setLeftNavTab] = useState('code');
  const [codeSubTab, setCodeSubTab] = useState('BrandIntro.tsx');

  // --- 2. RIGHT INSPECTOR TABS (AFTER EFFECTS / PHOTOSHOP / CAPCUT STYLE) ---
  // Top: 'video' | 'audio' | 'speed' | 'animate' | 'adjust'
  const [inspectorTab, setInspectorTab] = useState('video');
  // Video Sub-tabs: 'basic' | 'cutout' | 'mask' | 'canvas'
  const [videoSubTab, setVideoSubTab] = useState('basic');

  // --- 3. LIVE CANVAS & TRANSFORMS STATE ---
  const [uploadedMedia, setUploadedMedia] = useState(null); // { type: 'image' | 'video', url: string, name: string }
  const fileInputRef = useRef(null);
  const videoElementRef = useRef(null);

  // Position & Size Properties
  const [zoomScale, setZoomScale] = useState(100); // 10% to 200%
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [blendMode, setBlendMode] = useState('normal');

  // Filters & Effects Properties
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [activeFilterName, setActiveFilterName] = useState('90s'); // '90s', 'cinematic', 'bw', 'contrast', 'invert'
  const [filterStrength, setFilterStrength] = useState(50); // 0 to 100%
  const [effectsEnabled, setEffectsEnabled] = useState(false);
  const [effectName, setEffectName] = useState('Motion Blur');

  // Audio Properties
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [fadeInSeconds, setFadeInSeconds] = useState(0);
  const [fadeOutSeconds, setFadeOutSeconds] = useState(0);

  // Speed Properties
  const [clipSpeed, setClipSpeed] = useState(1.0); // 0.5x, 1x, 2x, 4x

  // Color Adjustment Properties (After Effects / Photoshop Lumetri)
  const [brightness, setBrightness] = useState(0); // -100 to 100
  const [contrast, setContrast] = useState(0); // -100 to 100
  const [saturation, setSaturation] = useState(0); // -100 to 100
  const [temperature, setTemperature] = useState(0); // -100 to 100

  // Text Overlay State
  const [headlineText, setHeadlineText] = useState('Quantum Studio 4K');
  const [subtitleText, setSubtitleText] = useState('Next-Gen Programmatic Video Engine');

  // --- 4. INTEGRATED VS CODE & REMOTION CODE EDITOR STATE ---
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

  // Apply VS Code code edits to live preview
  const handleApplyCodeToCanvas = () => {
    const match = remotionCode.match(/title\s*=\s*["']([^"']+)["']/);
    if (match && match[1]) {
      setHeadlineText(match[1]);
    }
    alert('Kode Remotion berhasil disinkronkan ke Player Viewport!');
  };

  // --- 5. TIMELINE SCRUBBING & FRAME ENGINE (CAPCUT MULTI-TRACK) ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const maxFrames = 180; // 3 detik @ 60 FPS
  const fps = 60;
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '9:16', '1:1'
  const [timelineZoom, setTimelineZoom] = useState(100); // 50 to 250%
  const [isSnapping, setIsSnapping] = useState(true);

  // Multi-Track Timeline Clips
  const [clips, setClips] = useState([
    {
      id: 1,
      name: 'CRST001334.mov',
      startFrame: 0,
      endFrame: 180,
      type: 'video',
      speed: 1.0,
      color: 'border-[#00e5ff]/50 bg-[#122830]'
    }
  ]);
  const [selectedClipId, setSelectedClipId] = useState(1);

  // Audio track state
  const [hasAudioTrack, setHasAudioTrack] = useState(true);

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

  // 60 FPS Timer Playback
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

  // Slide Frame Scrubber
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

  // Cut Frame / Split Clip at Playhead (CapCut Scissors Tool)
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
        type: clipToSplit.type,
        speed: clipToSplit.speed || 1.0,
        color: 'border-[#ff0055]/50 bg-[#29121c]'
      };
      return [...updated, newPart];
    });
  };

  // Delete Selected Clip
  const handleDeleteSelectedClip = () => {
    if (clips.length <= 1) {
      alert('Minimal harus ada 1 klip di timeline.');
      return;
    }
    setClips((prev) => prev.filter((c) => c.id !== selectedClipId));
    setSelectedClipId(clips[0]?.id || 1);
  };

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
        type: isVideo ? 'video' : 'image',
        speed: 1.0,
        color: 'border-[#00e5ff]/50 bg-[#122830]'
      }
    ]);

    setIsPlaying(false);
  };

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
    <div className="h-full w-full flex flex-col bg-[#0f1013] text-[#e1e2e6] overflow-hidden select-none font-sans">
      
      {/* 1. TOP HALF: 3-COLUMN CAPCUT DESKTOP WORKSPACE (LEFT ASSETS/CODE + CENTER PLAYER + RIGHT INSPECTOR) */}
      <div className="flex-1 w-full flex overflow-hidden border-b border-[#202126]">
        
        {/* --- 1A. TOP-LEFT PANEL: CAPCUT TABS & INTEGRATED VS CODE / MEDIA ASSETS --- */}
        <section className="w-[340px] xl:w-[380px] bg-[#141518] border-r border-[#202126] flex flex-col shrink-0 overflow-hidden">
          
          {/* Top Category Tabs: Media, Audio, Text, Stickers, Effects, Transition, Filters, Code */}
          <div className="h-9 bg-[#111215] border-b border-[#202126] flex items-center px-2 gap-1 overflow-x-auto text-xs text-zinc-400 shrink-0">
            <button
              onClick={() => setLeftNavTab('code')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'code' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>

            <button
              onClick={() => setLeftNavTab('media')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'media' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Media</span>
            </button>

            <button
              onClick={() => setLeftNavTab('audio')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'audio' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => setLeftNavTab('text')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'text' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>

            <button
              onClick={() => setLeftNavTab('effects')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'effects' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Effects</span>
            </button>

            <button
              onClick={() => setLeftNavTab('filters')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                leftNavTab === 'filters' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white hover:bg-[#1a1b20]'
              }`}
            >
              <Contrast className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* SUB-VIEW 1: INTEGRATED VS CODE & REMOTION EDITOR */}
            {leftNavTab === 'code' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-[#101114]">
                {/* File Tabs & Actions */}
                <div className="h-7 bg-[#16171b] border-b border-[#202126] px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCodeSubTab('BrandIntro.tsx')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${
                        codeSubTab === 'BrandIntro.tsx' ? 'bg-[#20222a] text-[#00e5ff]' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-[#00e5ff]" />
                      <span>BrandIntro.tsx</span>
                    </button>
                    <button
                      onClick={() => setCodeSubTab('Root.tsx')}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1 ${
                        codeSubTab === 'Root.tsx' ? 'bg-[#20222a] text-[#00e5ff]' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span>Root.tsx</span>
                    </button>
                  </div>

                  <button
                    onClick={handleApplyCodeToCanvas}
                    className="px-2 py-0.5 rounded bg-[#00e5ff] hover:bg-[#33ebff] text-zinc-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Run Sync</span>
                  </button>
                </div>

                {/* VS Code Editor Body with Line Numbers */}
                <div className="flex-1 flex overflow-hidden">
                  <div className="w-8 bg-[#131417] text-zinc-600 font-mono text-[11px] py-2 text-right pr-2 select-none border-r border-[#1c1d22]">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="leading-5">{i + 1}</div>
                    ))}
                  </div>

                  <textarea
                    value={remotionCode}
                    onChange={(e) => setRemotionCode(e.target.value)}
                    spellCheck="false"
                    className="flex-1 p-2 bg-transparent text-[11px] font-mono text-zinc-300 focus:outline-none resize-none leading-5 selection:bg-[#00e5ff]/20"
                  />
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: MEDIA ASSETS & CAPCUT CARDS GALLERY */}
            {leftNavTab === 'media' && (
              <div className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold text-white">Local</span>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-400 hover:text-white cursor-pointer">Library</span>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 bg-[#00e5ff] hover:bg-[#33ebff] text-zinc-950 font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Import</span>
                  </button>
                </div>

                {/* Media Cards Grid (Like CapCut Desktop) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Uploaded Media Card */}
                  {uploadedMedia && (
                    <div
                      onClick={() => {
                        setZoomScale(100);
                        alert(`Memuat media: ${uploadedMedia.name} ke kanvas`);
                      }}
                      className="group relative rounded-lg overflow-hidden border border-[#2b2c36] bg-[#1a1b20] hover:border-[#00e5ff] cursor-pointer transition-all aspect-video flex items-center justify-center"
                    >
                      {uploadedMedia.type === 'video' ? (
                        <video src={uploadedMedia.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={uploadedMedia.url} alt="Media" className="w-full h-full object-cover" />
                      )}
                      <span className="absolute bottom-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white">
                        00:30
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Plus className="w-5 h-5 text-[#00e5ff]" />
                      </div>
                    </div>
                  )}

                  {/* Stock Demo Cards */}
                  <div
                    onClick={() => {
                      setHeadlineText('Mountain Nature 4K');
                      alert('Memuat klip pegunungan ke kanvas');
                    }}
                    className="group relative rounded-lg overflow-hidden border border-[#2b2c36] bg-[#1a1b20] hover:border-[#00e5ff] cursor-pointer transition-all aspect-video flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-transparent"
                  >
                    <span className="text-[10px] font-mono font-medium text-white truncate">CRST001334.mov</span>
                    <span className="absolute top-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white">00:21</span>
                  </div>

                  <div
                    onClick={() => {
                      setHeadlineText('Ocean Waves 4K');
                      alert('Memuat klip ombak ke kanvas');
                    }}
                    className="group relative rounded-lg overflow-hidden border border-[#2b2c36] bg-[#1a1b20] hover:border-[#00e5ff] cursor-pointer transition-all aspect-video flex flex-col justify-end p-2 bg-gradient-to-t from-black/80 via-transparent"
                  >
                    <span className="text-[10px] font-mono font-medium text-white truncate">Ocean_Waves.mp4</span>
                    <span className="absolute top-1 right-1 px-1 rounded bg-black/70 text-[9px] font-mono text-white">00:39</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: TEXT PRESETS */}
            {leftNavTab === 'text' && (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                <div className="font-semibold text-white text-[11px] mb-2">Preset Teks Animasi:</div>
                <div
                  onClick={() => { setHeadlineText('Quantum Headline Pro'); }}
                  className="p-2.5 rounded bg-[#1b1c22] border border-[#262832] hover:border-[#00e5ff] cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-bold text-white">Default Title (Cyber)</span>
                  <Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
                </div>
                <div
                  onClick={() => { setHeadlineText('Lower Third News 4K'); }}
                  className="p-2.5 rounded bg-[#1b1c22] border border-[#262832] hover:border-[#00e5ff] cursor-pointer transition-all flex items-center justify-between"
                >
                  <span className="font-medium text-amber-400">Lower Third Banner</span>
                  <Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
                </div>
              </div>
            )}

            {/* SUB-VIEW 4: AUDIO TRACKS */}
            {leftNavTab === 'audio' && (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                <div className="font-semibold text-white text-[11px] mb-2">Audio &amp; Musik Latar:</div>
                <div
                  onClick={() => { setHasAudioTrack(true); alert('Menambahkan Audio_Track_Ambient.aac ke timeline'); }}
                  className="p-2.5 rounded bg-[#1b1c22] border border-[#262832] hover:border-[#00e5ff] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#00e5ff]" />
                    <div>
                      <div className="font-medium text-white">Audio.aac (120 BPM)</div>
                      <div className="text-[10px] text-zinc-500 font-mono">00:15 • Stereo HQ</div>
                    </div>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
                </div>
              </div>
            )}

            {/* SUB-VIEW 5: FILTERS & EFFECTS */}
            {(leftNavTab === 'effects' || leftNavTab === 'filters') && (
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-xs">
                <div className="font-semibold text-white text-[11px] mb-2">Pilihan Filter Visual:</div>
                <div className="grid grid-cols-2 gap-2">
                  {['90s', 'cinematic', 'bw', 'contrast', 'invert'].map((f) => (
                    <button
                      key={f}
                      onClick={() => { setActiveFilterName(f); setFilterEnabled(true); }}
                      className={`p-2 rounded border text-center transition-all ${
                        activeFilterName === f && filterEnabled
                          ? 'bg-[#1b252b] border-[#00e5ff] text-[#00e5ff] font-bold'
                          : 'bg-[#1b1c22] border-[#262832] text-zinc-300 hover:text-white'
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </section>

        {/* --- 1B. TOP-CENTER PANEL: CAPCUT PLAYER (CANVAS VIEWPORT) --- */}
        <main className="flex-1 h-full flex flex-col bg-[#0b0c0e] overflow-hidden relative">
          
          {/* Player Header Bar: Ratio Toggle & Fullscreen */}
          <div className="h-8 bg-[#111215] border-b border-[#202126] px-3 flex items-center justify-between text-xs text-zinc-400 shrink-0">
            <span className="font-bold text-white text-[11px] uppercase tracking-wider">
              Player Viewport
            </span>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="bg-[#18191e] border border-[#2b2c36] rounded px-2 py-0.5 text-zinc-200 focus:outline-none"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Shorts / TikTok</option>
                <option value="1:1">1:1 Square</option>
              </select>

              <button
                onClick={() => {
                  if (aspectRatio === '16:9') setAspectRatio('9:16');
                  else setAspectRatio('16:9');
                }}
                className="px-2 py-0.5 rounded bg-[#18191e] hover:bg-[#252732] border border-[#2b2c36] text-[10.5px] text-zinc-300"
              >
                Original
              </button>
            </div>
          </div>

          {/* Canvas Screen: PURE BLACK CANVAS DEFAULT */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative bg-[#09090b]">
            <div
              className={`bg-black border border-[#262730] shadow-2xl relative overflow-hidden flex items-center justify-center transition-all ${
                aspectRatio === '16:9' ? 'aspect-video w-full max-w-4xl max-h-[85%]' :
                aspectRatio === '9:16' ? 'aspect-[9/16] h-full max-h-[90%]' : 'aspect-square h-full max-h-[85%]'
              }`}
            >
              {/* JIKA USER MENGUNGGAH MEDIA BARULAH MEDIA MUNCUL DI PLAYER */}
              {uploadedMedia ? (
                <div
                  style={{
                    transform: `translate(${posX}px, ${posY}px) scale(${zoomScale / 100}) rotate(${rotation}deg)`,
                    opacity: opacity / 100,
                    filter: filterEnabled
                      ? (activeFilterName === '90s' ? `sepia(0.4) contrast(${1 + filterStrength / 100})` :
                         activeFilterName === 'bw' ? `grayscale(${filterStrength / 100})` :
                         activeFilterName === 'cinematic' ? `brightness(0.7) contrast(1.3)` :
                         activeFilterName === 'invert' ? `invert(${filterStrength / 100})` : 'none')
                      : 'none'
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
              ) : (
                /* Pure Black Canvas with Faint Resolution Label */
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
                  <div
                    style={{
                      transform: `translate(${posX}px, ${posY}px) scale(${zoomScale / 100}) rotate(${rotation}deg)`,
                      opacity: opacity / 100
                    }}
                    className="space-y-1"
                  >
                    <h2 className="text-2xl font-black text-white tracking-tight">{headlineText}</h2>
                    <p className="text-xs text-zinc-400">{subtitleText}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transport Bar Under Player */}
          <div className="h-8 bg-[#111215] border-t border-[#202126] px-3 flex items-center justify-between text-xs shrink-0 select-none">
            <div className="font-mono text-[11px] flex items-center gap-1.5">
              <span className="text-[#00e5ff] font-bold">{formatTimecode(currentFrame)}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">{formatTimecode(maxFrames)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentFrame(0)}
                className="p-1 rounded hover:bg-[#1a1b20] text-zinc-400 hover:text-white"
                title="Rewind"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-full bg-[#00e5ff] hover:bg-[#33ebff] text-zinc-950 flex items-center justify-center font-bold cursor-pointer shadow-sm transition-transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-zinc-950" /> : <Play className="w-3.5 h-3.5 fill-zinc-950 ml-0.5" />}
              </button>

              <button
                onClick={() => setCurrentFrame(maxFrames)}
                className="p-1 rounded hover:bg-[#1a1b20] text-zinc-400 hover:text-white"
                title="Forward"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded hover:bg-[#1a1b20] text-zinc-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <Maximize2 className="w-3.5 h-3.5 text-zinc-500 hover:text-white cursor-pointer" />
            </div>
          </div>

        </main>

        {/* --- 1C. TOP-RIGHT PANEL: CAPCUT / AFTER EFFECTS / PHOTOSHOP INSPECTOR --- */}
        <aside className="w-[310px] xl:w-[350px] bg-[#141518] border-l border-[#202126] flex flex-col shrink-0 overflow-hidden text-xs">
          
          {/* Top Category Tabs: Video, Audio, Speed, Animate, Adjust */}
          <div className="h-9 bg-[#111215] border-b border-[#202126] flex items-center px-2 gap-1 text-xs text-zinc-400 shrink-0">
            <button
              onClick={() => setInspectorTab('video')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                inspectorTab === 'video' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => setInspectorTab('audio')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                inspectorTab === 'audio' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white'
              }`}
            >
              Audio
            </button>
            <button
              onClick={() => setInspectorTab('speed')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                inspectorTab === 'speed' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white'
              }`}
            >
              Speed
            </button>
            <button
              onClick={() => setInspectorTab('adjust')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                inspectorTab === 'adjust' ? 'bg-[#20222a] text-[#00e5ff]' : 'hover:text-white'
              }`}
            >
              Adjust
            </button>
          </div>

          {/* Sub-tabs under Video: Basic, Cutout, Mask, Canvas */}
          {inspectorTab === 'video' && (
            <div className="h-7 bg-[#16171b] border-b border-[#202126] px-2 flex items-center gap-1.5 text-[11px] text-zinc-400 shrink-0">
              <button
                onClick={() => setVideoSubTab('basic')}
                className={`px-2 py-0.5 rounded ${videoSubTab === 'basic' ? 'bg-[#22242d] text-white font-medium' : 'hover:text-white'}`}
              >
                Basic
              </button>
              <button
                onClick={() => setVideoSubTab('cutout')}
                className={`px-2 py-0.5 rounded ${videoSubTab === 'cutout' ? 'bg-[#22242d] text-white font-medium' : 'hover:text-white'}`}
              >
                Cutout
              </button>
              <button
                onClick={() => setVideoSubTab('mask')}
                className={`px-2 py-0.5 rounded ${videoSubTab === 'mask' ? 'bg-[#22242d] text-white font-medium' : 'hover:text-white'}`}
              >
                Mask
              </button>
              <button
                onClick={() => setVideoSubTab('canvas')}
                className={`px-2 py-0.5 rounded ${videoSubTab === 'canvas' ? 'bg-[#22242d] text-white font-medium' : 'hover:text-white'}`}
              >
                Canvas
              </button>
            </div>
          )}

          {/* Inspector Content Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            
            {/* INSPECTOR TAB 1: VIDEO (BASIC) */}
            {inspectorTab === 'video' && videoSubTab === 'basic' && (
              <div className="space-y-4">
                
                {/* 1. Filters Section */}
                <div className="space-y-2 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-semibold text-white">
                      <input
                        type="checkbox"
                        checked={filterEnabled}
                        onChange={(e) => setFilterEnabled(e.target.checked)}
                        className="accent-[#00e5ff] rounded"
                      />
                      <span>Filters</span>
                    </label>
                    <span className="font-mono text-zinc-400 text-[11px]">{activeFilterName.toUpperCase()}</span>
                  </div>

                  {filterEnabled && (
                    <div className="space-y-1.5 pt-1 border-t border-[#23242c]">
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Strength:</span>
                        <span className="font-mono text-white">{filterStrength}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filterStrength}
                        onChange={(e) => setFilterStrength(parseInt(e.target.value, 10))}
                        className="w-full accent-[#00e5ff]"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Position & Size Section */}
                <div className="space-y-3 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                  <div className="font-semibold text-white">Position &amp; Size</div>

                  {/* Zoom / Scale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Zoom:</span>
                      <span className="font-mono text-white">{zoomScale}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="200"
                      value={zoomScale}
                      onChange={(e) => setZoomScale(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00e5ff]"
                    />
                  </div>

                  {/* Position X */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Position X (px):</span>
                      <span className="font-mono text-white">{posX} px</span>
                    </div>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={posX}
                      onChange={(e) => setPosX(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00e5ff]"
                    />
                  </div>

                  {/* Position Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Position Y (px):</span>
                      <span className="font-mono text-white">{posY} px</span>
                    </div>
                    <input
                      type="range"
                      min="-250"
                      max="250"
                      value={posY}
                      onChange={(e) => setPosY(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00e5ff]"
                    />
                  </div>

                  {/* Rotation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400">
                      <span>Rotate:</span>
                      <span className="font-mono text-white">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-[#00e5ff]"
                    />
                  </div>
                </div>

                {/* 3. Blend & Opacity Section */}
                <div className="space-y-2.5 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                  <div className="font-semibold text-white">Blend &amp; Opacity</div>

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
                      className="w-full accent-[#00e5ff]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Blend Mode:</span>
                    <select
                      value={blendMode}
                      onChange={(e) => setBlendMode(e.target.value)}
                      className="bg-[#101114] border border-[#2b2c36] rounded px-2 py-0.5 text-zinc-200"
                    >
                      <option value="normal">Normal</option>
                      <option value="multiply">Multiply</option>
                      <option value="screen">Screen</option>
                      <option value="overlay">Overlay</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* INSPECTOR TAB 2: AUDIO */}
            {inspectorTab === 'audio' && (
              <div className="space-y-3 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                <div className="font-semibold text-white">Audio Controls</div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Volume:</span>
                    <span className="font-mono text-white">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Fade In (detik):</span>
                    <span className="font-mono text-white">{fadeInSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={fadeInSeconds}
                    onChange={(e) => setFadeInSeconds(parseFloat(e.target.value))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>
              </div>
            )}

            {/* INSPECTOR TAB 3: SPEED */}
            {inspectorTab === 'speed' && (
              <div className="space-y-3 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                <div className="font-semibold text-white">Speed Controls</div>

                <div className="flex gap-1.5 font-mono">
                  {[0.5, 1.0, 2.0, 4.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setClipSpeed(s)}
                      className={`flex-1 py-1 rounded text-xs border ${
                        clipSpeed === s ? 'bg-[#00e5ff] text-zinc-950 font-bold border-[#00e5ff]' : 'border-[#2c2d38] text-zinc-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-zinc-400 flex justify-between pt-1">
                  <span>Durasi Terhitung:</span>
                  <span className="font-mono text-white">{(180 / (fps * clipSpeed)).toFixed(2)} detik</span>
                </div>
              </div>
            )}

            {/* INSPECTOR TAB 4: ADJUST (COLOR / LUMETRI) */}
            {inspectorTab === 'adjust' && (
              <div className="space-y-3 p-2.5 bg-[#18191e] rounded-lg border border-[#23242c]">
                <div className="font-semibold text-white">Color Adjustments</div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Brightness:</span>
                    <span className="font-mono text-white">{brightness}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Contrast:</span>
                    <span className="font-mono text-white">{contrast}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                    className="w-full accent-[#00e5ff]"
                  />
                </div>
              </div>
            )}

          </div>

        </aside>

      </div>

      {/* 2. BOTTOM HALF: CAPCUT DESKTOP MULTI-TRACK TIMELINE */}
      <footer className="h-60 bg-[#111215] flex flex-col shrink-0 select-none overflow-hidden">
        
        {/* TIMELINE TOOLBAR (SPLIT/CUT, DELETE, FREEZE, REVERSE, MIC, SNAPPING, ZOOM) */}
        <div className="h-9 bg-[#15161a] border-b border-[#202126] px-3 flex items-center justify-between text-xs shrink-0">
          
          {/* Left Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* CUT / SPLIT BUTTON */}
            <button
              onClick={handleSplitClipAtPlayhead}
              className="p-1.5 rounded hover:bg-[#22242d] text-zinc-300 hover:text-[#00e5ff] flex items-center gap-1 transition-colors cursor-pointer"
              title="Split Clip pada Playhead [Ctrl+B]"
            >
              <Scissors className="w-4 h-4 text-[#00e5ff]" />
              <span className="text-[11px] font-semibold hidden sm:inline">Split</span>
            </button>

            {/* DELETE BUTTON */}
            <button
              onClick={handleDeleteSelectedClip}
              className="p-1.5 rounded hover:bg-[#22242d] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Delete Clip [Del]"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-[#262730] mx-1"></div>

            {/* Step -1 Frame */}
            <button
              onClick={() => setCurrentFrame((prev) => Math.max(0, prev - 1))}
              className="px-1.5 py-0.5 rounded bg-[#1c1d22] text-[10px] font-mono hover:bg-[#262730] cursor-pointer"
              title="Mundur 1 Frame"
            >
              -1f
            </button>

            {/* Step +1 Frame */}
            <button
              onClick={() => setCurrentFrame((prev) => Math.min(maxFrames, prev + 1))}
              className="px-1.5 py-0.5 rounded bg-[#1c1d22] text-[10px] font-mono hover:bg-[#262730] cursor-pointer"
              title="Maju 1 Frame"
            >
              +1f
            </button>
          </div>

          {/* Center Playhead Frame Readout */}
          <div className="font-mono text-zinc-400 text-xs">
            <span className="text-white font-bold">{formatTimecode(currentFrame)}</span>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSnapping(!isSnapping)}
              className={`p-1.5 rounded transition-colors ${isSnapping ? 'text-[#00e5ff] bg-[#1a252b]' : 'text-zinc-500'}`}
              title="Toggle Snapping"
            >
              <Magnet className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-[#262730] mx-1"></div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
              <ZoomOut className="w-3 h-3" />
              <input
                type="range"
                min="50"
                max="200"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(parseInt(e.target.value, 10))}
                className="w-16 accent-[#00e5ff]"
              />
              <ZoomIn className="w-3 h-3" />
            </div>
          </div>

        </div>

        {/* MULTI-TRACK AREA WITH FILMSTRIP BLOCKS & AUDIO WAVEFORMS */}
        <div className="flex-1 flex flex-col overflow-x-auto relative bg-[#0e0f12]">
          
          {/* TIME RULER */}
          <div
            ref={timelineRulerRef}
            onClick={handleTimelineScrub}
            className="h-6 bg-[#16171b] border-b border-[#202126] relative cursor-pointer select-none shrink-0"
          >
            {/* Draggable Playhead Scrubber */}
            <div
              style={{ left: `${(currentFrame / maxFrames) * 100}%` }}
              onMouseDown={handleStartPlayheadDrag}
              className="absolute top-0 bottom-0 w-0.5 bg-white z-40 cursor-ew-resize"
            >
              <div className="w-3.5 h-3.5 bg-white rounded-full -ml-1.5 -mt-1 shadow-md hover:scale-125 transition-transform flex items-center justify-center">
                <span className="text-[7px] text-zinc-950 font-bold">0</span>
              </div>
            </div>

            {/* Time Ticks */}
            <div className="flex justify-between px-3 text-[9px] font-mono text-zinc-500 pt-1 pointer-events-none">
              <span>00:00</span>
              <span>00:10</span>
              <span>00:20</span>
              <span>00:30</span>
              <span>00:40</span>
              <span>00:50</span>
              <span>01:00</span>
              <span>01:10</span>
              <span>01:20</span>
            </div>
          </div>

          {/* TRACKS CONTAINER */}
          <div className="flex-1 p-2 space-y-2 overflow-y-auto">
            
            {/* TRACK 1: MAIN VIDEO / FILMSTRIP TRACK (CAPCUT STYLE) */}
            <div className="h-14 bg-[#141519] border border-[#22232a] rounded relative flex items-center px-1">
              {clips.map((c) => {
                const leftPct = (c.startFrame / maxFrames) * 100;
                const widthPct = ((c.endFrame - c.startFrame) / maxFrames) * 100;
                const isSelected = c.id === selectedClipId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClipId(c.id)}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className={`absolute h-12 rounded border flex flex-col justify-between p-1 cursor-pointer transition-all ${
                      c.color
                    } ${isSelected ? 'ring-2 ring-[#00e5ff] shadow-lg' : 'opacity-85'}`}
                  >
                    {/* Top Clip Info */}
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-zinc-200">
                      <span className="truncate">{c.name}</span>
                      <span className="text-[8.5px] text-[#00e5ff] font-bold">00:00:00</span>
                    </div>

                    {/* Faux Filmstrip Thumbnails inside the block */}
                    <div className="flex gap-1 overflow-hidden opacity-60">
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="h-5 w-8 bg-[#09151c] rounded-xs border border-cyan-800/40 shrink-0"></div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRACK 2: AUDIO WAVEFORM TRACK (BLUE CAPCUT TRACK) */}
            {hasAudioTrack && (
              <div className="h-9 bg-[#141519] border border-[#22232a] rounded relative flex items-center px-1">
                <div
                  style={{ width: '80%' }}
                  className="h-7 rounded bg-[#102a45] border border-[#1d4c78] px-2 flex items-center justify-between text-[10px] font-mono text-cyan-200"
                >
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3 h-3 text-[#00e5ff]" />
                    <span>Speed {clipSpeed}x Audio.aac</span>
                  </div>
                  <span className="text-[9px] text-zinc-400">00:00:15</span>
                </div>
              </div>
            )}

            {/* TRACK 3: TEXT OVERLAY TRACK */}
            <div className="h-8 bg-[#141519] border border-[#22232a] rounded relative flex items-center px-1">
              <div
                style={{ width: '60%' }}
                className="h-6 rounded bg-[#2e1d3b] border border-[#583373] px-2 flex items-center justify-between text-[10px] font-mono text-fuchsia-200"
              >
                <div className="flex items-center gap-1.5">
                  <Type className="w-3 h-3 text-fuchsia-400" />
                  <span>Text: {headlineText}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}
