import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const CustomInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show the banner on the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setIsVisible(true);
      localStorage.setItem('hasVisited', 'true');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCloseInstructions = () => {
    setShowInstructions(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-4 text-center z-50">
        <p className="mb-2">Install our app for a better experience!</p>
        <button
          onClick={handleInstallClick}
          className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none"
        >
          Install
        </button>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white"
        >
          &times;
        </button>
      </div>
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">How to Install</h3>
            <p className="mb-4">
              To install the app, open your browser's menu and select "Add to Home Screen".
            </p>
            <button
              onClick={handleCloseInstructions}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomInstallBanner;
