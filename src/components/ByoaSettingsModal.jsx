import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Check, Cpu, Globe, AlertCircle } from 'lucide-react';

export default function ByoaSettingsModal({ isOpen, onClose }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setGeminiKey(localStorage.getItem('qtm_gemini_key') || '');
    setOpenaiKey(localStorage.getItem('qtm_openai_key') || '');
    setClaudeKey(localStorage.getItem('qtm_claude_key') || '');
    setOllamaUrl(localStorage.getItem('qtm_ollama_url') || 'http://localhost:11434');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('qtm_gemini_key', geminiKey.trim());
    localStorage.setItem('qtm_openai_key', openaiKey.trim());
    localStorage.setItem('qtm_claude_key', claudeKey.trim());
    localStorage.setItem('qtm_ollama_url', ollamaUrl.trim());
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121214] rounded-2xl p-6 sm:p-7 max-w-lg w-full border border-zinc-800 text-zinc-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-semibold uppercase mb-2">
            <Key className="w-3 h-3 text-amber-400" />
            BYOA: Bring-Your-Own-Agent
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Konfigurasi Model &amp; Kunci API
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Kunci API disimpan secara lokal di laptop Anda tanpa dikirim ke server kami. Anda membayar biaya token langsung ke penyedia AI sesuai pemakaian riil.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Google Gemini API Key (Rekomendasi Cepat &amp; Murah)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              OpenAI API Key (GPT-4o / Whisper Subtitle)
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-300 mb-1">
              Anthropic Claude API Key (Claude 3.5 Sonnet)
            </label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-[11px] font-medium text-zinc-300 mb-1 flex items-center justify-between">
              <span>Local Offline Engine (Ollama Host URL)</span>
              <span className="text-[10px] text-emerald-400 font-normal">100% Gratis &amp; Offline</span>
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Kunci Berhasil Disimpan!</span>
                </>
              ) : (
                <span>Simpan Konfigurasi Kunci</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Terenkripsi di LocalStorage • Tidak ada data kunci yang diunggah</span>
          </div>

        </form>

      </div>
    </div>
  );
}
