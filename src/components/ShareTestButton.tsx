import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareDebugPanel } from './ShareDebugPanel';
import { shareToWhatsApp } from '@/utils/sharing';
import { ShareablePhoto } from '@/utils/sharing/types';
import { toast } from '@/hooks/use-toast';

// Test photo for debugging
const TEST_PHOTO: ShareablePhoto = {
  id: 'test-photo-1',
  title: 'Test Saree Photo',
  imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0b22b12d2ea?w=800&h=1200&fit=crop',
  price: 1299,
  description: 'Beautiful test saree for sharing functionality testing'
};

export const ShareTestButton: React.FC = () => {
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleTestShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);
    try {
      await shareToWhatsApp(TEST_PHOTO);
    } catch (error) {
      console.error('Test share failed:', error);
      toast({
        title: "Test share failed",
        description: "Check the debug panel for details",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Only show in development or when debug mode is enabled
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDebugPanel(true)}
          className="bg-blue-500 text-white hover:bg-blue-600"
        >
          Debug Share
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleTestShare}
          disabled={isSharing}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          {isSharing ? 'Sharing...' : 'Test Share'}
        </Button>
      </div>
      
      <ShareDebugPanel 
        isOpen={showDebugPanel} 
        onClose={() => setShowDebugPanel(false)} 
      />
    </>
  );
};