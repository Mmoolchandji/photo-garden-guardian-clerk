// Enhanced debugging logger for sharing functionality
export class ShareDebugLogger {
  private static logs: string[] = [];
  
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
      this.logs.push(`${logMessage} - Data: ${JSON.stringify(data, null, 2)}`);
    } else {
      console.log(logMessage);
      this.logs.push(logMessage);
    }
    
    // Keep only last 50 logs to prevent memory issues
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }
  
  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}`;
    
    if (error) {
      console.error(logMessage, error);
      this.logs.push(`${logMessage} - Error: ${error.toString()}`);
    } else {
      console.error(logMessage);
      this.logs.push(logMessage);
    }
    
    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }
  }
  
  static getLogs() {
    return this.logs;
  }
  
  static exportLogs() {
    const logsText = this.logs.join('\n');
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sharing-debug-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  static clear() {
    this.logs = [];
    console.log('Debug logs cleared');
  }
}

// Global debug flag
export const DEBUG_SHARING = true;

export const debugLog = (message: string, data?: any) => {
  if (DEBUG_SHARING) {
    ShareDebugLogger.log(message, data);
  }
};

export const debugError = (message: string, error?: any) => {
  if (DEBUG_SHARING) {
    ShareDebugLogger.error(message, error);
  }
};
