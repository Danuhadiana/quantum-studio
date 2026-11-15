import React, { useState, useEffect, useCallback } from 'react';
import DesktopHeader from './components/DesktopHeader';
import WorkstationView from './components/WorkstationView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  // Active Main Tab: 'player' | 'code' | 'copilot' | 'aihub' | 'settings' | 'license' | 'export'
  const [activeTab, setActiveTab] = useState('player');
  const [projectTitle, setProjectTitle] = useState(() => {
    return localStorage.getItem('qtm_current_project_title') || 'Untitled Project';
  });
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  useEffect(() => {
    const savedStatus = localStorage.getItem('qtm_license_status');
    const savedKey = localStorage.getItem('qtm_license_key');
    if (savedStatus === 'pro' && savedKey) {
      setIsPro(true);
      setLicenseKey(savedKey);
    }
  }, []);

  const handleActivateSuccess = (key) => {
    setIsPro(true);
    setLicenseKey(key);
    showToast(`Lisensi Pro Berhasil Diaktifkan! Serial: ${key}`);
  };

  const handleUpdateProjectTitle = (newTitle) => {
    setProjectTitle(newTitle);
    localStorage.setItem('qtm_current_project_title', newTitle);
  };

  const handleSaveProject = useCallback(() => {
    localStorage.setItem('qtm_current_project_title', projectTitle);
    localStorage.setItem(`qtm_project_${projectTitle}`, JSON.stringify({
      title: projectTitle,
      savedAt: new Date().toISOString()
    }));
    showToast(`Proyek "${projectTitle}" berhasil disimpan!`);
  }, [projectTitle, showToast]);

  const handleSaveProjectAs = useCallback(() => {
    const newTitle = window.prompt('Masukkan nama proyek baru untuk Save As:', projectTitle);
    if (newTitle && newTitle.trim()) {
      const trimmed = newTitle.trim();
      setProjectTitle(trimmed);
      localStorage.setItem('qtm_current_project_title', trimmed);
      localStorage.setItem(`qtm_project_${trimmed}`, JSON.stringify({
        title: trimmed,
        savedAt: new Date().toISOString()
      }));
      showToast(`Proyek berhasil disimpan sebagai "${trimmed}"!`);
    }
  }, [projectTitle, showToast]);

  const handleNewProject = useCallback(() => {
    if (window.confirm('Buat proyek baru? Pastikan proyek saat ini telah disimpan.')) {
      setProjectTitle('Untitled Project');
      localStorage.setItem('qtm_current_project_title', 'Untitled Project');
      setActiveTab('player');
      showToast('Proyek baru kosong berhasil dibuat.');
    }
  }, [showToast]);

  const handleOpenProject = useCallback(() => {
    const targetTitle = window.prompt('Buka nama proyek:', projectTitle);
    if (targetTitle && targetTitle.trim()) {
      const trimmed = targetTitle.trim();
      setProjectTitle(trimmed);
      localStorage.setItem('qtm_current_project_title', trimmed);
      showToast(`Proyek "${trimmed}" siap diedit.`);
    }
  }, [projectTitle, showToast]);

  // Global Keyboard Shortcuts (Ctrl+S, Ctrl+Shift+S, Ctrl+N, Ctrl+O)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleSaveProjectAs();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveProject();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        handleNewProject();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        handleOpenProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveProject, handleSaveProjectAs, handleNewProject, handleOpenProject]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden font-sans select-none relative">
      
      {/* 1. TOP DESKTOP TITLEBAR / HEADER (VS Code Menu + Status + Cek Update) */}
      <DesktopHeader
        isPro={isPro}
        licenseKey={licenseKey}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        projectTitle={projectTitle}
        setProjectTitle={handleUpdateProjectTitle}
        onSaveProject={handleSaveProject}
        onSaveProjectAs={handleSaveProjectAs}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
        showToast={showToast}
      />

      {/* 2. MAIN WORKSTATION VIEW (VS Code Activity Bar + Tabs + Remotion Studio Engine) */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <WorkstationView
          isPro={isPro}
          licenseKey={licenseKey}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onActivateSuccess={handleActivateSuccess}
          projectTitle={projectTitle}
          onSaveProject={handleSaveProject}
        />
      </div>

      {/* 3. SLEEK FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14151a] border border-zinc-700/80 text-white px-3.5 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
