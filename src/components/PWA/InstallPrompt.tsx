import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {deferredPrompt && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-300 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-4">
          <p className="text-gray-700">
            Install this app for a better experience.
          </p>
          <button
            onClick={handleInstallClick}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Install
          </button>
        </div>
      )}
      {/* Temporary button for manual testing */}
      {deferredPrompt && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-20 left-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Manual Install
        </button>
      )}
      {/* Debug button - always visible */}
      <div className="fixed bottom-36 left-4 bg-yellow-100 border border-yellow-300 p-4 rounded-lg shadow-lg z-50">
        <p className="text-gray-700 mb-2">
          PWA Install Status: {deferredPrompt ? "Ready to install" : "Not ready"}
        </p>
        <button
          onClick={() => console.log("Install prompt status:", deferredPrompt ? "Available" : "Not available")}
          className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none"
        >
          Check Install Status
        </button>
      </div>
    </>
  );
};

export default InstallPrompt;
