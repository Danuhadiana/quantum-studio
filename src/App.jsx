import React, { useState, useEffect } from 'react';
import DesktopHeader from './components/DesktopHeader';
import WorkstationView from './components/WorkstationView';

export default function App() {
  const [isPro, setIsPro] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  // Active Main Tab: 'player' | 'code' | 'copilot' | 'aihub' | 'settings' | 'license' | 'export'
  const [activeTab, setActiveTab] = useState('player');

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
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* 1. TOP DESKTOP TITLEBAR / HEADER (VS Code Menu + Status) */}
      <DesktopHeader
        isPro={isPro}
        licenseKey={licenseKey}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. MAIN WORKSTATION VIEW (VS Code Activity Bar + Tabs + Remotion Studio Engine) */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <WorkstationView
          isPro={isPro}
          licenseKey={licenseKey}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onActivateSuccess={handleActivateSuccess}
        />
      </div>

    </div>
  );
}
