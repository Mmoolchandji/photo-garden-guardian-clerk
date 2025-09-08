import { Camera, CameraResultType, CameraSource, Photo, GalleryPhoto } from '@capacitor/camera';
import { isCapacitorApp } from '@/utils/sharing/deviceDetection';
import { useToast } from '@/hooks/use-toast';

interface NativeCameraOptions {
  allowMultiple?: boolean;
  source?: 'camera' | 'gallery' | 'prompt';
}

export const useNativeCamera = () => {
  const { toast } = useToast();

  const takePicture = async (options: NativeCameraOptions = {}): Promise<Photo | GalleryPhoto[] | null> => {
    if (!isCapacitorApp()) {
      toast({
        title: "Native camera not available",
        description: "Please use the web upload option",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { allowMultiple = false, source = 'prompt' } = options;

      // Convert source to CameraSource
      let cameraSource: CameraSource;
      switch (source) {
        case 'camera':
          cameraSource = CameraSource.Camera;
          break;
        case 'gallery':
          cameraSource = CameraSource.Photos;
          break;
        default:
          cameraSource = CameraSource.Prompt;
      }

      if (allowMultiple) {
        const photos = await Camera.pickImages({
          quality: 90,
          limit: 10,
        });
        return photos.photos;
      } else {
        const photo = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: cameraSource,
        });
        return photo;
      }
    } catch (error) {
      console.error('Native camera error:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const checkPermissions = async () => {
    if (!isCapacitorApp()) return false;

    try {
      const permissions = await Camera.checkPermissions();
      console.log('Current permissions:', permissions);
      return permissions.camera === 'granted' && permissions.photos === 'granted';
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const requestPermissions = async () => {
    if (!isCapacitorApp()) return false;

    try {
      console.log('Requesting camera and photos permissions...');
      const permissions = await Camera.requestPermissions({
        permissions: ['camera', 'photos']
      });
      console.log('Permission request result:', permissions);
      
      const granted = permissions.camera === 'granted' && permissions.photos === 'granted';
      
      if (!granted) {
        toast({
          title: "Permissions Required",
          description: "Camera and photo access are needed for full functionality. Please enable them in your device settings.",
          variant: "destructive"
        });
      }
      
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request permissions. Please check your device settings.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    takePicture,
    checkPermissions,
    requestPermissions,
    isNativeAvailable: isCapacitorApp()
  };
};