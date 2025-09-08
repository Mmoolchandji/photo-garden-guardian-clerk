import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { useNativeCamera } from '@/hooks/useNativeCamera';
import { isCapacitorApp } from '@/utils/sharing/deviceDetection';

export const PermissionStatus = () => {
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [photosPermission, setPhotosPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const { checkPermissions, requestPermissions, isNativeAvailable } = useNativeCamera();

  const checkCurrentPermissions = async () => {
    if (!isNativeAvailable) return;
    
    try {
      // Check current permission status
      const hasPermissions = await checkPermissions();
      
      // For now, we'll show granted/denied based on the check result
      // In a real app, you'd want to check individual permissions
      if (hasPermissions) {
        setCameraPermission('granted');
        setPhotosPermission('granted');
      } else {
        setCameraPermission('prompt');
        setPhotosPermission('prompt');
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
      setCameraPermission('denied');
      setPhotosPermission('denied');
    }
  };

  const handleRequestPermissions = async () => {
    setCameraPermission('checking');
    setPhotosPermission('checking');
    
    const granted = await requestPermissions();
    
    if (granted) {
      setCameraPermission('granted');
      setPhotosPermission('granted');
    } else {
      setCameraPermission('denied');
      setPhotosPermission('denied');
    }
  };

  useEffect(() => {
    if (isCapacitorApp()) {
      checkCurrentPermissions();
    }
  }, [isNativeAvailable]);

  if (!isCapacitorApp()) {
    return null;
  }

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      default:
        return <Badge variant="outline">Not Requested</Badge>;
    }
  };

  const allPermissionsGranted = cameraPermission === 'granted' && photosPermission === 'granted';
  const anyPermissionDenied = cameraPermission === 'denied' || photosPermission === 'denied';

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Camera & Photos Permissions
        </CardTitle>
        <CardDescription>
          Enable camera and photo access for the best experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>Camera Access</span>
            </div>
            {getPermissionBadge(cameraPermission)}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span>Photo Gallery Access</span>
            </div>
            {getPermissionBadge(photosPermission)}
          </div>

          {!allPermissionsGranted && (
            <div className="pt-3">
              <Button 
                onClick={handleRequestPermissions}
                disabled={cameraPermission === 'checking' || photosPermission === 'checking'}
                className="w-full"
              >
                {cameraPermission === 'checking' || photosPermission === 'checking' 
                  ? 'Checking Permissions...' 
                  : 'Request Permissions'
                }
              </Button>
              
              {anyPermissionDenied && (
                <p className="text-sm text-muted-foreground mt-2">
                  If permissions were denied, please enable them manually in your device settings.
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};