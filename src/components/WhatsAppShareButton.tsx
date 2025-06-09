
import { MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shareToWhatsApp, type ShareablePhoto } from '@/utils/sharing';
import { useState } from 'react';

interface WhatsAppShareButtonProps {
  photo: ShareablePhoto;
  variant?: 'icon' | 'button';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const WhatsAppShareButton = ({ 
  photo, 
  variant = 'button', 
  className = '',
  onClick 
}: WhatsAppShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
    
    setIsSharing(true);
    
    try {
      await shareToWhatsApp(photo);
    } finally {
      setIsSharing(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`bg-[#25D366]/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#25D366] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        aria-label="Share on WhatsApp"
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        ) : (
          <MessageCircle className="h-4 w-4 text-white" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isSharing}
      className={`bg-[#25D366] hover:bg-[#1DB954] text-white border-[#25D366] hover:border-[#1DB954] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isSharing ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageCircle className="h-4 w-4 mr-2" />
      )}
      {isSharing ? 'Preparing...' : 'Share on WhatsApp'}
    </Button>
  );
};

export default WhatsAppShareButton;
