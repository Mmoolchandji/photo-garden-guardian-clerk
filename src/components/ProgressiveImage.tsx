
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
}

const ProgressiveImage = ({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className,
  onLoad
}: ProgressiveImageProps) => {
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState(false);

  useEffect(() => {
    // Preload high-res image
    const img = new Image();
    img.onload = () => setHighResLoaded(true);
    img.src = highQualitySrc;
  }, [highQualitySrc]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Low quality image (loads first) */}
      <img
        src={lowQualitySrc}
        alt={alt}
        onLoad={() => setLowResLoaded(true)}
        className={cn(
          "absolute inset-0 w-full h-full object-cover filter transition-all duration-500",
          lowResLoaded && !highResLoaded ? "blur-sm scale-110" : "opacity-0"
        )}
      />
      
      {/* High quality image (loads second) */}
      {highResLoaded && (
        <img
          src={highQualitySrc}
          alt={alt}
          onLoad={onLoad}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
        />
      )}
    </div>
  );
};

export default ProgressiveImage;
