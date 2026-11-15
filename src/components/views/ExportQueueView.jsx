import React, { useState } from 'react';
import { 
  Film, Play, Check, RefreshCw, FolderOpen, Download, 
  Trash2, HardDrive, Clock, ArrowRight, Layers, Cpu, AlertCircle,
  FileVideo, Settings, Sparkles, Monitor, Disc
} from 'lucide-react';

export default function ExportQueueView({ isPro, onSwitchToPlayer }) {
  // Export Settings States
  const [fileName, setFileName] = useState('Quantum_Project_Render.mp4');
  const [exportPath, setExportPath] = useState('C:\\Users\\USER\\Videos\\QuantumStudio');
  const [resolutionPreset, setResolutionPreset] = useState('4k'); // '4k', '1080p', 'shorts', '720p'
  const [codec, setCodec] = useState('h264'); // 'h264', 'hevc', 'webm', 'prores'
  const [bitrateMode, setBitrateMode] = useState('high'); // 'standard', 'high', 'master'
  const [audioCodec, setAudioCodec] = useState('aac_320'); // 'aac_320', 'aac_192', 'pcm'
  
  // Render Execution States
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedFrame, setRenderedFrame] = useState(0);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const totalFrames = 180;

  const [queue, setQueue] = useState([
    {
      id: 'job-1',
      name: 'BrandIntro_Scene_Master.mp4',
      path: 'C:\\Users\\USER\\Videos\\QuantumStudio\\BrandIntro_Scene_Master.mp4',
      preset: '4K UHD (3840×2160) @ 60 FPS',
      codec: 'H.264 High Profile (45 Mbps)',
      status: 'completed',
      size: '14.2 MB',
      time: '18 detik yang lalu',
      frames: '180 / 180 frames'
    }
  ]);

  const presetDetails = {
    '4k': { name: '4K UHD (3840 × 2160)', fps: '60 FPS', ratio: '16:9', estSize: '18.4 MB' },
    '1080p': { name: 'Full HD (1920 × 1080)', fps: '60 FPS', ratio: '16:9', estSize: '9.2 MB' },
    'shorts': { name: 'Vertical (1080 × 1920)', fps: '60 FPS', ratio: '9:16', estSize: '8.8 MB' },
    '720p': { name: 'HD (1280 × 720)', fps: '30 FPS', ratio: '16:9', estSize: '4.1 MB' }
  };

  const handleStartRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(0);
    setRenderedFrame(0);
    setRenderSuccess(false);

    const interval = setInterval(() => {
      setRenderedFrame((prev) => {
        const next = prev + 12;
        const pct = Math.min(100, Math.round((next / totalFrames) * 100));
        setRenderProgress(pct);

        if (next >= totalFrames) {
          clearInterval(interval);
          setIsRendering(false);
          setRenderSuccess(true);
          
          const currentPreset = presetDetails[resolutionPreset];
          const newJob = {
            id: `job-${Date.now()}`,
            name: fileName,
            path: `${exportPath}\\${fileName}`,
            preset: `${currentPreset.name} @ ${currentPreset.fps}`,
            codec: codec === 'h264' ? 'H.264 AVC' : codec === 'hevc' ? 'H.265 HEVC' : codec === 'webm' ? 'VP9 WebM' : 'Apple ProRes 422',
            status: 'completed',
            size: currentPreset.estSize,
            time: 'Baru saja',
            frames: '180 / 180 frames'
          };
          setQueue((prevQ) => [newJob, ...prevQ]);
          return totalFrames;
        }
        return next;
      });
    }, 150);
  };

  const handleSelectFolder = () => {
    // In Electron environment, invoke folder dialog or notify user
    const simulatedPath = 'C:\\Users\\USER\\Videos\\QuantumStudio';
    setExportPath(simulatedPath);
  };

  const handleDeleteHistory = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="h-full w-full bg-[#0c0d10] text-zinc-100 flex flex-col overflow-y-auto selection:bg-zinc-700">
      
      {/* 1. TOP HEADER (CLEAN & PROFESSIONAL) */}
      <div className="p-5 border-b border-[#1c1d22] bg-[#0f1013] shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                Export Studio
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Remotion Chromium Headless • FFmpeg Hardware Encoder
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Ekspor Video
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tentukan parameter resolusi, format berkas, codec, dan folder penyimpanan sebelum merender video.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onSwitchToPlayer && (
              <button
                onClick={onSwitchToPlayer}
                className="px-3.5 py-1.5 rounded-lg bg-[#18191d] hover:bg-[#222328] border border-[#27282e] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Kembali ke Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN EXPORT WORKSPACE */}
      <div className="max-w-6xl mx-auto w-full p-5 flex-1 flex flex-col lg:flex-row gap-5 text-xs">
        
        {/* LEFT COLUMN: EXPORT CONFIGURATION (TEMPAT PENGATURAN SENDIRI) */}
        <div className="flex-1 space-y-4">
          
          {/* Card 1: Nama Berkas & Lokasi Output */}
          <div className="p-4 rounded-xl bg-[#121317] border border-[#202126] space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <FileVideo className="w-4 h-4 text-zinc-400" />
              <span>Berkas &amp; Lokasi Penyimpanan</span>
            </h2>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nama Berkas Video:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#23242b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                  placeholder="Nama_Video_Output.mp4"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Folder Tujuan Ekspor:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={exportPath}
                    onChange={(e) => setExportPath(e.target.value)}
                    className="flex-1 bg-[#09090b] border border-[#23242b] rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 font-mono text-[11px]"
                  />
                  <button
                    onClick={handleSelectFolder}
                    className="px-3 py-1.5 rounded-lg bg-[#1a1b22] hover:bg-[#252630] border border-[#282933] text-zinc-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Telusuri</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Preset Resolusi & Rasio Aspek */}
          <div className="p-4 rounded-xl bg-[#121317] border border-[#202126] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-zinc-400" />
              <span>Resolusi &amp; Frame Rate</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: '4k', label: '4K UHD (Master)', res: '3840 × 2160', fps: '60 FPS', ratio: '16:9' },
                { id: '1080p', label: 'Full HD (Web / YouTube)', res: '1920 × 1080', fps: '60 FPS', ratio: '16:9' },
                { id: 'shorts', label: 'Shorts / TikTok / Reels', res: '1080 × 1920', fps: '60 FPS', ratio: '9:16' },
                { id: '720p', label: 'HD Kompak', res: '1280 × 720', fps: '30 FPS', ratio: '16:9' }
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => setResolutionPreset(p.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    resolutionPreset === p.id
                      ? 'bg-[#1b1c24] border-zinc-400 text-white shadow-sm'
                      : 'bg-[#0d0e11] border-[#222328] hover:border-zinc-700 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-zinc-200">{p.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">{p.ratio}</span>
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-400">{p.res} • {p.fps}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Format Kontainer & Codec Video */}
          <div className="p-4 rounded-xl bg-[#121317] border border-[#202126] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Disc className="w-4 h-4 text-zinc-400" />
              <span>Format &amp; Codec Video</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Codec Video:</label>
                <select
                  value={codec}
                  onChange={(e) => setCodec(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#23242b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="h264">H.264 / AVC (Kompatibel Universal)</option>
                  <option value="hevc">H.265 / HEVC (Kompresi Efisien)</option>
                  <option value="webm">WebM / VP9 (Format Web Ringan)</option>
                  <option value="prores">Apple ProRes 422 (Editing Master)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Tingkat Bitrate (Kualitas):</label>
                <select
                  value={bitrateMode}
                  onChange={(e) => setBitrateMode(e.target.value)}
                  className="w-full bg-[#09090b] border border-[#23242b] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="standard">Standar (16 Mbps VBR)</option>
                  <option value="high">Tinggi (35 Mbps VBR - Rekomendasi)</option>
                  <option value="master">Master Studio (55 Mbps VBR)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1c1d22] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Pengaturan Audio: AAC Stereo 320 kbps (48 kHz)</span>
              <span className="font-mono text-zinc-500">Hardware Accel: MFT NVENC / QuickSync</span>
            </div>
          </div>

          {/* Action Button: Mulai Ekspor Video (Tidak langsung render, tapi tombol eksplisit) */}
          <div className="pt-2">
            <button
              onClick={handleStartRender}
              disabled={isRendering}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Sedang Merender Video ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Mulai Ekspor Video</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: PROGRESS MONITOR & HISTORY */}
        <div className="w-full lg:w-96 space-y-4">
          
          {/* Card 4: Ringkasan & Status Ekspor Aktif */}
          <div className="p-4 rounded-xl bg-[#121317] border border-[#202126] space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              <span>Status &amp; Estimasi Proyek</span>
            </h2>

            {/* Info Summary Table */}
            <div className="space-y-1.5 font-mono text-[11px] bg-[#09090b] p-3 rounded-lg border border-[#1e1f25]">
              <div className="flex justify-between">
                <span className="text-zinc-500">Durasi Proyek:</span>
                <span className="text-zinc-200">00:00:03:00 (180 frame)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Resolusi Terpilih:</span>
                <span className="text-zinc-200">{presetDetails[resolutionPreset].name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Frame Rate:</span>
                <span className="text-zinc-200">{presetDetails[resolutionPreset].fps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estimasi Ukuran:</span>
                <span className="text-emerald-400 font-semibold">{presetDetails[resolutionPreset].estSize}</span>
              </div>
            </div>

            {/* Live Progress Bar when rendering */}
            {isRendering && (
              <div className="space-y-2 pt-2 border-t border-[#1c1d22]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Rendering Frame...</span>
                  <span className="font-mono text-zinc-200">{renderProgress}% ({renderedFrame}/{totalFrames}f)</span>
                </div>
                <div className="w-full bg-[#09090b] h-2 rounded-full overflow-hidden border border-[#222328]">
                  <div
                    className="bg-zinc-200 h-full transition-all duration-150"
                    style={{ width: `${renderProgress}%` }}
                  ></div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
                  <span>Remotion Chromium Engine</span>
                  <span>Hardware MFT</span>
                </div>
              </div>
            )}

            {renderSuccess && !isRendering && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-400 text-xs">
                <Check className="w-4 h-4 shrink-0" />
                <span>Video berhasil diekspor ke folder tujuan!</span>
              </div>
            )}
          </div>

          {/* Card 5: Riwayat Berkas Ekspor Selesai */}
          <div className="p-4 rounded-xl bg-[#121317] border border-[#202126] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1c1d22] pb-2">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">
                Riwayat Selesai ({queue.length})
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono">Tersimpan</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-[#0d0e11] rounded-lg border border-[#202126] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded bg-[#18191d] border border-zinc-800 flex items-center justify-center shrink-0">
                      <Film className="w-3.5 h-3.5 text-zinc-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate text-xs">{item.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500 truncate">
                        {item.size} • {item.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => alert(`Membuka folder berkas:\n${item.path}`)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Buka Folder"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Hapus dari Riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
