import { isCapacitorApp } from '@/utils/sharing/deviceDetection';

interface MobileLoadingStateProps {
  message?: string;
  showNativeStyle?: boolean;
}

const MobileLoadingState = ({ 
  message = 'Loading...', 
  showNativeStyle = true 
}: MobileLoadingStateProps) => {
  const isNative = isCapacitorApp() && showNativeStyle;

  if (isNative) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card p-6 rounded-2xl shadow-lg border max-w-xs mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-primary/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-foreground text-center">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to regular loading state
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default MobileLoadingState;