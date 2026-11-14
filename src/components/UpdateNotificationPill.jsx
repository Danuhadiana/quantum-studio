import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function UpdateNotificationPill({ currentVersion = '1.0.0' }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('1.0.1');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // 1. Cek update otomatis ke GitHub Releases
  useEffect(() => {
    let isMounted = true;
    async function checkForUpdates() {
      try {
        const response = await fetch('https://api.github.com/repos/Danuhadiana/quantum-studio/releases/latest');
        if (response.ok) {
          const data = await response.json();
          const cleanTag = (data.tag_name || '').replace(/^v/, '');
          if (cleanTag && cleanTag !== currentVersion && isMounted) {
            setLatestVersion(cleanTag);
            setUpdateAvailable(true);
          }
        }
      } catch (e) {
        // Abaikan jika offline
      }
    }

    checkForUpdates();
    return () => { isMounted = false; };
  }, [currentVersion]);

  // Listener untuk trigger tes update manual dari menu
  useEffect(() => {
    const handleTriggerTestUpdate = () => {
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

    // Animasi proses download aset baru & reload
    setTimeout(() => {
      setUpdateSuccess(true);
      setTimeout(() => {
        if (window.quantumNative && typeof window.quantumNative.relaunchApp === 'function') {
          window.quantumNative.relaunchApp();
        } else if (window.quantumNative && typeof window.quantumNative.reloadWindow === 'function') {
          window.quantumNative.reloadWindow();
        } else {
          window.location.reload();
        }
      }, 800);
    }, 1500);
  };

  if (!updateAvailable) return null;

  return (
    <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181b] border border-amber-500/80 shadow-[0_0_15px_rgba(250,204,21,0.25)] animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-1.5 text-neutral-200 text-[11px] font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-[#facc15] animate-spin-slow shrink-0" />
        <span className="hidden sm:inline">Update Tersedia:</span>
        <span className="text-[#facc15] font-mono">v{latestVersion}</span>
      </div>

      <button
        type="button"
        onClick={handleApplyUpdate}
        disabled={isUpdating}
        className="px-2 py-0.5 rounded bg-[#facc15] hover:bg-[#eab308] text-neutral-950 font-bold text-[10px] tracking-wide transition-all cursor-pointer flex items-center gap-1 disabled:opacity-75"
        title="Klik untuk otomatis mengunduh & restart software"
      >
        {isUpdating ? (
          <>
            <RefreshCw className="w-2.5 h-2.5 animate-spin" />
            <span>{updateSuccess ? 'Merefresh...' : 'Mengunduh...'}</span>
          </>
        ) : (
          <>
            <span>Perbarui</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </>
        )}
      </button>
    </div>
  );
}
