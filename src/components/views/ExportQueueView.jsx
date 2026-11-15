import React, { useState } from 'react';
import { 
  Film, Play, Check, RefreshCw, FolderOpen, Download, 
  Trash2, HardDrive, Clock, ArrowRight, Layers, Cpu, AlertCircle
} from 'lucide-react';

export default function ExportQueueView({ isPro, onSwitchToPlayer }) {
  const [selectedPreset, setSelectedPreset] = useState('4k_master'); // '4k_master', 'shorts_reels', 'web_fast'
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderedFrame, setRenderedFrame] = useState(0);
  const totalFrames = 180;

  const [queue, setQueue] = useState([
    {
      id: 'job-1',
      name: 'BrandIntro_Scene_4K_Master.mp4',
      preset: '4K UHD (3840x2160) @ 60 FPS',
      codec: 'H.264 High Profile (45 Mbps)',
      status: 'completed',
      size: '14.2 MB',
      time: '18 detik yang lalu',
      frames: '180 / 180 frames'
    }
  ]);

  const handleStartRender = () => {
    if (isRendering) return;
    setIsRendering(true);
    setRenderProgress(0);
    setRenderedFrame(0);

    const interval = setInterval(() => {
      setRenderedFrame(prev => {
        const next = prev + 10;
        const pct = Math.min(100, Math.round((next / totalFrames) * 100));
        setRenderProgress(pct);

        if (next >= totalFrames) {
          clearInterval(interval);
          setIsRendering(false);
          const newJob = {
            id: `job-${Date.now()}`,
            name: selectedPreset === 'shorts_reels' ? 'Shorts_Vertical_916.mp4' : 'Quantum_Composition_Render.mp4',
            preset: selectedPreset === 'shorts_reels' ? 'Shorts / Reels (1080x1920) @ 60 FPS' : '4K UHD (3840x2160) @ 60 FPS',
            codec: 'H.264 High Profile',
            status: 'completed',
            size: '12.8 MB',
            time: 'Baru saja',
            frames: '180 / 180 frames'
          };
          setQueue(prevQ => [newJob, ...prevQ]);
          return totalFrames;
        }
        return next;
      });
    }, 180);
  };

  return (
    <div className="h-full w-full bg-[#0c0d10] text-zinc-100 flex flex-col overflow-y-auto selection:bg-amber-400/20">
      
      {/* 1. TOP HEADER */}
      <div className="p-6 border-b border-[#1c1d22] bg-[#0f1013] shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/30 text-emerald-400">
                Remotion Render Engine Queue
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Hardware Accelerated Export (Zero Modal)
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Antrean Ekspor &amp; Rendering Video 4K
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Render komposisi skrip Remotion dan media layer langsung menjadi berkas video MP4 atau WebM berkecepatan tinggi.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleStartRender}
              disabled={isRendering}
              className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isRendering ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950" />}
              <span>{isRendering ? 'Sedang Merender Frame...' : 'Mulai Render Komposisi'}</span>
            </button>
            {onSwitchToPlayer && (
              <button
                onClick={onSwitchToPlayer}
                className="px-3.5 py-2 rounded-lg bg-[#18191d] hover:bg-[#222328] border border-[#27282e] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buka Viewport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full p-6 space-y-6 flex-1 text-xs">
        
        {/* 2. LIVE RENDERING PROGRESS MONITOR */}
        {isRendering && (
          <div className="p-5 rounded-2xl bg-[#121317] border border-amber-400/40 space-y-3 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="font-bold text-white">Merender Komposisi Video 4K...</span>
              </div>
              <span className="font-mono text-amber-400 font-bold">{renderProgress}% ({renderedFrame}/{totalFrames} Frames)</span>
            </div>

            <div className="w-full bg-[#0c0d10] h-2 rounded-full overflow-hidden border border-[#222328]">
              <div
                className="bg-amber-400 h-full transition-all duration-200"
                style={{ width: `${renderProgress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
              <span>Engine: Remotion WebCodecs GPU</span>
              <span>Bitrate Rata-Rata: 45.2 Mbps</span>
              <span>Encoder: H.264 Hardware MFT</span>
            </div>
          </div>
        )}

        {/* 3. PRESET PENGATURAN EKSPOR */}
        <div className="p-5 rounded-2xl bg-[#121317] border border-[#202126] space-y-3">
          <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
            Pilihan Preset Resolusi &amp; Target Distribusi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              onClick={() => setSelectedPreset('4k_master')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedPreset === '4k_master'
                  ? 'bg-[#181920] border-amber-400/60 shadow-lg'
                  : 'bg-[#0d0e11] border-[#222328] hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-white mb-1">YouTube 4K UHD Master</div>
              <div className="text-[10px] font-mono text-amber-400 mb-2">3840 x 2160 @ 60 FPS (16:9)</div>
              <p className="text-[11px] text-zinc-400">Kualitas visual tanpa kompromi, optimal untuk layar monitor besar &amp; TV.</p>
            </div>

            <div
              onClick={() => setSelectedPreset('shorts_reels')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedPreset === 'shorts_reels'
                  ? 'bg-[#181920] border-amber-400/60 shadow-lg'
                  : 'bg-[#0d0e11] border-[#222328] hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-white mb-1">TikTok / Reels / Shorts</div>
              <div className="text-[10px] font-mono text-amber-400 mb-2">1080 x 1920 @ 60 FPS (9:16)</div>
              <p className="text-[11px] text-zinc-400">Rasio vertikal pas untuk feed media sosial smartphone.</p>
            </div>

            <div
              onClick={() => setSelectedPreset('web_fast')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedPreset === 'web_fast'
                  ? 'bg-[#181920] border-amber-400/60 shadow-lg'
                  : 'bg-[#0d0e11] border-[#222328] hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-white mb-1">Web Fast Sharing 1080p</div>
              <div className="text-[10px] font-mono text-amber-400 mb-2">1920 x 1080 @ 30 FPS (16:9)</div>
              <p className="text-[11px] text-zinc-400">Ukuran file sangat ringkas, cocok untuk preview cepat dan kirim chat.</p>
            </div>
          </div>
        </div>

        {/* 4. RIWAYAT BERKAS HASIL EXPORT */}
        <div className="p-5 rounded-2xl bg-[#121317] border border-[#202126] space-y-3">
          <div className="flex items-center justify-between border-b border-[#1c1d22] pb-2">
            <h2 className="text-sm font-bold text-white">Berkas Selesai Dirender ({queue.length})</h2>
            <span className="text-[10px] text-zinc-500 font-mono">Tersimpan di: C:/Users/USER/Videos/QuantumStudio/</span>
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-[#0d0e11] rounded-xl border border-[#202126] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#18191d] border border-zinc-800 flex items-center justify-center shrink-0">
                    <Film className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      {item.preset} • {item.codec} • {item.size}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
                    {item.status === 'completed' ? 'Selesai' : 'Proses'}
                  </span>
                  <button
                    onClick={() => alert(`Berkas tersimpan di: Videos/QuantumStudio/${item.name}`)}
                    className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Buka Folder"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
