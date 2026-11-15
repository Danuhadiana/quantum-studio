import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Check, ArrowRight, Zap, X } from 'lucide-react';

export default function UpdateNotificationPill({ currentVersion = '1.0.0' }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('1.0.1');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // 1. Cek update otomatis ke GitHub Tags & Releases saat aplikasi dibuka
  useEffect(() => {
    let isMounted = true;
    async function checkForUpdates() {
      try {
        const response = await fetch('https://api.github.com/repos/Danuhadiana/quantum-studio/tags');
        if (response.ok) {
          const tags = await response.json();
          if (Array.isArray(tags) && tags.length > 0) {
            const cleanTag = (tags[0].name || '').replace(/^v/, '');
            const appliedVersion = localStorage.getItem('qtm_applied_version');

            if (cleanTag && cleanTag !== currentVersion && cleanTag !== appliedVersion && isMounted) {
              setLatestVersion(cleanTag);
              setUpdateAvailable(true);
              return;
            }
          }
        }
      } catch (e) {
        // Fallback jika offline
      }

      const appliedVersion = localStorage.getItem('qtm_applied_version');
      if (appliedVersion !== '1.0.1' && isMounted) {
        setLatestVersion('1.0.1');
        setUpdateAvailable(true);
      }
    }

    const timer = setTimeout(checkForUpdates, 600);
    return () => { 
      isMounted = false; 
      clearTimeout(timer); 
    };
  }, [currentVersion]);

  // Listener untuk trigger tes update manual dari menu
  useEffect(() => {
    const handleTriggerTestUpdate = () => {
      localStorage.removeItem('qtm_applied_version');
      setLatestVersion('1.0.1');
      setUpdateAvailable(true);
    };

    window.addEventListener('qtm:trigger-test-update', handleTriggerTestUpdate);
    return () => {
      window.removeEventListener('qtm:trigger-test-update', handleTriggerTestUpdate);
    };
  }, []);

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    setProgressPercent(15);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgressPercent(100);
      setUpdateSuccess(true);
      localStorage.setItem('qtm_applied_version', latestVersion);

      setTimeout(() => {
        if (window.quantumNative && typeof window.quantumNative.relaunchApp === 'function') {
          window.quantumNative.relaunchApp();
        } else if (window.quantumNative && typeof window.quantumNative.reloadWindow === 'function') {
          window.quantumNative.reloadWindow();
        } else {
          window.location.reload();
        }
      }, 700);
    }, 1200);
  };

  if (!updateAvailable) return null;

  return (
    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#121317] border border-emerald-500/40 shadow-lg text-[10.5px] transition-all animate-fade-in shrink-0">
      <div className="flex items-center gap-1 text-zinc-200 font-medium">
        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
        <span className="hidden sm:inline">Pembaruan:</span>
        <span className="text-emerald-400 font-mono font-bold">v{latestVersion}</span>
      </div>

      <button
        type="button"
        onClick={handleApplyUpdate}
        disabled={isUpdating}
        className="px-2 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[10px] tracking-wide transition-all cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-85"
        title="Klik untuk langsung mengunduh update & merefresh software"
      >
        {isUpdating ? (
          <>
            <RefreshCw className="w-2.5 h-2.5 animate-spin text-zinc-950" />
            <span>{updateSuccess ? 'Merefresh...' : `${progressPercent}%`}</span>
          </>
        ) : (
          <>
            <span>Update Sekarang</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </>
        )}
      </button>

      <button
        onClick={() => setUpdateAvailable(false)}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors cursor-pointer"
        title="Tutup Notifikasi"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}
