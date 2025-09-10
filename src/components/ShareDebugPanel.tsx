import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShareDebugLogger, DEBUG_SHARING } from '@/utils/sharing/debugLogger';
import { getNativeSharingCapabilities, isNativeSharingAvailable } from '@/utils/sharing';

interface ShareDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareDebugPanel: React.FC<ShareDebugPanelProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = React.useState<string[]>([]);
  const [capabilities, setCabilities] = React.useState<any>(null);

  React.useEffect(() => {
    if (isOpen) {
      setLogs(ShareDebugLogger.getLogs());
      setCabilities(getNativeSharingCapabilities());
    }
  }, [isOpen]);

  const refreshLogs = () => {
    setLogs(ShareDebugLogger.getLogs());
    setCabilities(getNativeSharingCapabilities());
  };

  const clearLogs = () => {
    ShareDebugLogger.clear();
    setLogs([]);
  };

  const exportLogs = () => {
    ShareDebugLogger.exportLogs();
  };

  if (!isOpen || !DEBUG_SHARING) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Share Debug Panel</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button size="sm" onClick={refreshLogs}>Refresh</Button>
            <Button size="sm" variant="outline" onClick={clearLogs}>Clear</Button>
            <Button size="sm" variant="outline" onClick={exportLogs}>Export</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Sharing Capabilities</h4>
              <div className="bg-muted p-3 rounded-md text-sm">
                <pre>{JSON.stringify(capabilities, null, 2)}</pre>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div>Native Available: {isNativeSharingAvailable() ? '✅' : '❌'}</div>
                <div>Platform: {(window as any).Capacitor?.getPlatform() || 'Web'}</div>
                <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Debug Logs ({logs.length})</h4>
              <div className="bg-muted p-3 rounded-md h-64 overflow-y-auto text-xs font-mono">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">No logs yet</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};