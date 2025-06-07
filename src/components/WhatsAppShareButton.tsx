
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shareToWhatsApp, type ShareablePhoto } from '@/utils/whatsappShare';

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
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onClick) {
      onClick(e);
    }
    
    await shareToWhatsApp(photo);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleShare}
        className={`bg-[#25D366]/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#25D366] ${className}`}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-white" />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`bg-[#25D366] hover:bg-[#1DB954] text-white border-[#25D366] hover:border-[#1DB954] ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Share on WhatsApp
    </Button>
  );
};

export default WhatsAppShareButton;
