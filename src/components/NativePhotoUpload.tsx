import { useState } from 'react';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { useMobileUX } from '@/hooks/useMobileUX';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Image, Upload } from 'lucide-react';
import { Photo, GalleryPhoto } from '@capacitor/camera';

interface NativePhotoUploadProps {
  onPhotosSelected: (photos: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const NativePhotoUpload = ({ 
  onPhotosSelected, 
  maxFiles = 10, 
  disabled = false 
}: NativePhotoUploadProps) => {
  const { takePicture, isNativeAvailable, checkPermissions, requestPermissions } = useNativeCamera();
  const { triggerLightHaptic } = useMobileUX();
  const [isLoading, setIsLoading] = useState(false);

  const convertPhotoToFile = async (photo: Photo | GalleryPhoto): Promise<File | null> => {
    try {
      if (!photo.webPath) return null;
      
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const fileName = `photo_${Date.now()}.${photo.format || 'jpg'}`;
      
      return new File([blob], fileName, { 
        type: `image/${photo.format || 'jpeg'}` 
      });
    } catch (error) {
      console.error('Error converting photo to file:', error);
      return null;
    }
  };

  const handleCameraCapture = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    triggerLightHaptic();

    try {
      // Check and request permissions
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          console.warn('Camera permissions denied');
          setIsLoading(false);
          return;
        }
      }

      const result = await takePicture({ 
        source: 'camera', 
        allowMultiple: false 
      });

      if (result && !Array.isArray(result)) {
        const file = await convertPhotoToFile(result);
        if (file) {
          onPhotosSelected([file]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGalleryPick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    triggerLightHaptic();

    try {
      const hasPermissions = await checkPermissions();
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          setIsLoading(false);
          return;
        }
      }

      const result = await takePicture({ 
        source: 'gallery', 
        allowMultiple: true 
      });

      if (result && Array.isArray(result)) {
        const files: File[] = [];
        for (const photo of result.slice(0, maxFiles)) {
          const file = await convertPhotoToFile(photo);
          if (file) files.push(file);
        }
        if (files.length > 0) {
          onPhotosSelected(files);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isNativeAvailable) {
    return null;
  }

  return (
    <Card className="border-2 border-dashed border-border/50">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center space-x-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Native Photo Upload</h3>
            <p className="text-sm text-muted-foreground">
              Use your device's camera or gallery
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleCameraCapture}
              disabled={disabled || isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
            
            <Button
              onClick={handleGalleryPick}
              disabled={disabled || isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Select from Gallery
            </Button>
          </div>
          
          {maxFiles > 1 && (
            <p className="text-xs text-muted-foreground">
              Select up to {maxFiles} photos
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NativePhotoUpload;