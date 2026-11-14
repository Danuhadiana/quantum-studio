import React, { useState, useEffect } from 'react';
import DesktopHeader from './components/DesktopHeader';
import WorkstationView from './components/WorkstationView';
import LicenseModal from './components/LicenseModal';
import ByoaSettingsModal from './components/ByoaSettingsModal';

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0d14] text-slate-100 overflow-hidden font-sans">
      
      {/* 1. TOP DESKTOP TITLEBAR / HEADER */}
      <DesktopHeader
        isPro={isPro}
        licenseKey={licenseKey}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. MAIN STUDIO WORKSTATION VIEW (4-PILLARS) */}
      <WorkstationView
        isPro={isPro}
        onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* 3. IN-APP PURCHASE & LICENSE ACTIVATION MODAL */}
      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onActivateSuccess={handleActivateSuccess}
      />

      {/* 4. BYOA SETTINGS MODAL */}
      <ByoaSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

    </div>
  );
}
