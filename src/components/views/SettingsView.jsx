import React, { useState, useEffect } from 'react';
import { 
  Sliders, Monitor, Cpu, Keyboard, Database, 
  Check, Save, RefreshCw, ArrowRight, ShieldCheck, Moon, Laptop
} from 'lucide-react';

export default function SettingsView({ onSwitchToPlayer }) {
  const [activeSection, setActiveSection] = useState('editor'); // 'editor', 'remotion', 'hardware', 'shortcuts', 'storage'
  
  // Settings States
  const [fontSize, setFontSize] = useState('13');
  const [autosaveInterval, setAutosaveInterval] = useState('10');
  const [defaultFps, setDefaultFps] = useState('60');
  const [defaultResolution, setDefaultResolution] = useState('4k');
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFontSize(localStorage.getItem('qtm_set_font_size') || '13');
    setAutosaveInterval(localStorage.getItem('qtm_set_autosave') || '10');
    setDefaultFps(localStorage.getItem('qtm_set_fps') || '60');
    setDefaultResolution(localStorage.getItem('qtm_set_res') || '4k');
    setGpuAcceleration(localStorage.getItem('qtm_set_gpu') !== 'false');
  }, []);

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('qtm_set_font_size', fontSize);
    localStorage.setItem('qtm_set_autosave', autosaveInterval);
    localStorage.setItem('qtm_set_fps', defaultFps);
    localStorage.setItem('qtm_set_res', defaultResolution);
    localStorage.setItem('qtm_set_gpu', String(gpuAcceleration));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearCache = () => {
    if (window.confirm('Bersihkan cache rendering sementara dan riwayat sesi? (Kunci API dan Lisensi tidak akan terhapus)')) {
      sessionStorage.clear();
      alert('Cache rendering lokal telah dibersihkan.');
    }
  };

  return (
    <div className="h-full w-full bg-[#0c0d10] text-zinc-100 flex flex-col overflow-y-auto selection:bg-zinc-700">
      
      {/* 1. TOP HEADER (CLEAN & PROFESSIONAL MONOCHROME) */}
      <div className="p-5 border-b border-[#1c1d22] bg-[#0f1013] shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                Preferences
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Studio Configuration
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Pengaturan Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sesuaikan preferensi editor skrip, resolusi master default, akselerasi GPU, dan pintasan keyboard.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
            </button>
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

      <div className="max-w-5xl mx-auto w-full p-5 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* 2. SIDEBAR SUB-NAVIGASI PREFERENCES (MONOCHROME & MINIMALIST) */}
        <div className="w-full md:w-56 shrink-0 space-y-1 text-xs">
          <button
            onClick={() => setActiveSection('editor')}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'editor' ? 'bg-[#1b1c24] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
            }`}
          >
            <Laptop className="w-4 h-4 text-zinc-400" />
            <span>Editor &amp; Tampilan</span>
          </button>
          
          <button
            onClick={() => setActiveSection('remotion')}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'remotion' ? 'bg-[#1b1c24] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
            }`}
          >
            <Monitor className="w-4 h-4 text-zinc-400" />
            <span>Remotion Render Engine</span>
          </button>
          
          <button
            onClick={() => setActiveSection('hardware')}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'hardware' ? 'bg-[#1b1c24] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
            }`}
          >
            <Cpu className="w-4 h-4 text-zinc-400" />
            <span>GPU &amp; Perangkat Keras</span>
          </button>

          <button
            onClick={() => setActiveSection('shortcuts')}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'shortcuts' ? 'bg-[#1b1c24] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
            }`}
          >
            <Keyboard className="w-4 h-4 text-zinc-400" />
            <span>Pintasan Keyboard</span>
          </button>

          <button
            onClick={() => setActiveSection('storage')}
            className={`w-full px-3 py-2 rounded-lg text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeSection === 'storage' ? 'bg-[#1b1c24] text-white font-semibold' : 'text-zinc-400 hover:text-white hover:bg-[#14151a]'
            }`}
          >
            <Database className="w-4 h-4 text-zinc-400" />
            <span>Cache &amp; Penyimpanan</span>
          </button>
        </div>

        {/* 3. SECTION CONTENT */}
        <div className="flex-1 space-y-4 text-xs">
          
          {/* SECTION 1: EDITOR & TAMPILAN */}
          {activeSection === 'editor' && (
            <div className="p-5 rounded-xl bg-[#121317] border border-[#202126] space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
                Editor &amp; Tampilan Visual
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Ukuran Font Editor Kode</div>
                    <div className="text-[11px] text-zinc-500">Ukuran font teks editor skrip animasi Remotion</div>
                  </div>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="bg-[#09090b] border border-[#222328] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="12">12 px (Kompak)</option>
                    <option value="13">13 px (Default)</option>
                    <option value="14">14 px (Sedang)</option>
                    <option value="16">16 px (Besar)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-[#1c1d22] pt-3">
                  <div>
                    <div className="font-semibold text-white">Interval Simpan Otomatis (Auto-Save)</div>
                    <div className="text-[11px] text-zinc-500">Frekuensi sinkronisasi posisi objek canvas ke penyimpanan lokal</div>
                  </div>
                  <select
                    value={autosaveInterval}
                    onChange={(e) => setAutosaveInterval(e.target.value)}
                    className="bg-[#09090b] border border-[#222328] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="5">Setiap 5 Detik</option>
                    <option value="10">Setiap 10 Detik (Disarankan)</option>
                    <option value="30">Setiap 30 Detik</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-[#1c1d22] pt-3">
                  <div>
                    <div className="font-semibold text-white">Tema Antarmuka Studio</div>
                    <div className="text-[11px] text-zinc-500">Skema warna monokrom studio minimalis</div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-[#09090b] border border-[#222328] text-zinc-300 font-mono text-[11px]">
                    Dark Monochrome Studio (#09090b)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: REMOTION ENGINE */}
          {activeSection === 'remotion' && (
            <div className="p-5 rounded-xl bg-[#121317] border border-[#202126] space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
                Remotion Render Engine Defaults
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Default Frame Rate (FPS)</div>
                    <div className="text-[11px] text-zinc-500">Kecepatan frame animasi untuk proyek baru</div>
                  </div>
                  <select
                    value={defaultFps}
                    onChange={(e) => setDefaultFps(e.target.value)}
                    className="bg-[#09090b] border border-[#222328] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="60">60 FPS (Ultra Smooth &amp; Modern)</option>
                    <option value="30">30 FPS (Standar Video Online)</option>
                    <option value="24">24 FPS (Sinematik Film)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-[#1c1d22] pt-3">
                  <div>
                    <div className="font-semibold text-white">Resolusi Master Default</div>
                    <div className="text-[11px] text-zinc-500">Rasio aspek dan resolusi canvas viewport</div>
                  </div>
                  <select
                    value={defaultResolution}
                    onChange={(e) => setDefaultResolution(e.target.value)}
                    className="bg-[#09090b] border border-[#222328] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="4k">3840 × 2160 (4K UHD 16:9)</option>
                    <option value="1080p">1920 × 1080 (Full HD 16:9)</option>
                    <option value="shorts">1080 × 1920 (9:16 TikTok / Reels)</option>
                    <option value="square">1080 × 1080 (1:1 Square Feed)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: HARDWARE & GPU */}
          {activeSection === 'hardware' && (
            <div className="p-5 rounded-xl bg-[#121317] border border-[#202126] space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
                Akselerasi Perangkat Keras GPU &amp; WebCodecs
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Hardware Video Acceleration</div>
                    <div className="text-[11px] text-zinc-500">Menggunakan GPU (DirectX / Vulkan) untuk decoding dan rendering frame video</div>
                  </div>
                  <button
                    onClick={() => setGpuAcceleration(!gpuAcceleration)}
                    className={`px-3 py-1 rounded font-mono text-[11px] font-bold transition-colors cursor-pointer ${
                      gpuAcceleration ? 'bg-zinc-800 border border-zinc-600 text-zinc-200' : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                    }`}
                  >
                    {gpuAcceleration ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: SHORTCUTS */}
          {activeSection === 'shortcuts' && (
            <div className="p-5 rounded-xl bg-[#121317] border border-[#202126] space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
                Daftar Pintasan Keyboard Studio
              </h2>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Play / Pause Timeline</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Spasi (Space)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Potong Clip pada Playhead (Split / Scissors)</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Ctrl + B</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Buka Jendela Ekspor Video</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Ctrl + E</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Impor Media (Foto / Video)</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Ctrl + I</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Simpan Konfigurasi &amp; Posisi Objek</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Ctrl + S</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#1c1d22]">
                  <span className="text-zinc-400 font-sans">Mundur 1 Frame / Maju 1 Frame</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">← / →</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-400 font-sans">Reset Playhead ke Awal (Rewind)</span>
                  <span className="px-2 py-0.5 rounded bg-[#09090b] border border-[#222328] text-zinc-300">Home</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: STORAGE & CACHE */}
          {activeSection === 'storage' && (
            <div className="p-5 rounded-xl bg-[#121317] border border-[#202126] space-y-4">
              <h2 className="text-sm font-bold text-white border-b border-[#1c1d22] pb-2">
                Manajemen Cache &amp; Reset
              </h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Bersihkan Cache Rendering Sementara</div>
                    <div className="text-[11px] text-zinc-500">Membersihkan frame cache di memori tanpa menghapus kunci API atau lisensi</div>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1.5 rounded-lg bg-[#1c1417] hover:bg-[#25191d] border border-rose-900/40 text-rose-300 text-xs transition-colors cursor-pointer"
                  >
                    Bersihkan Cache
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
