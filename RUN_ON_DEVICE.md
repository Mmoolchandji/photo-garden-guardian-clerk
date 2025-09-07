# Running Photo Garden Guardian on Physical Device

This guide helps you deploy the app to your Android device for testing native features.

## Prerequisites

1. **Enable Developer Options on your phone:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Developer Options will appear in Settings

2. **Enable USB Debugging:**
   - Go to Settings > Developer Options
   - Enable "USB Debugging"
   - Enable "Install via USB" (if available)

3. **Install Android SDK Platform Tools:**
   - Download from: https://developer.android.com/studio/releases/platform-tools
   - Add to your PATH environment variable

## Deployment Steps

### Step 1: Connect Your Device
```bash
# Connect phone via USB cable
# Allow USB debugging when prompted on phone

# Verify device is connected
adb devices -l
```

You should see your device listed (not "unauthorized").

### Step 2: Build and Deploy
```bash
# Build the web assets
npm run build

# Sync changes to native platform
npx cap sync android

# Deploy to your specific device (replace YOUR_DEVICE_ID)
npx cap run android --target YOUR_DEVICE_ID
```

### Step 3: Alternative Manual Installation
If the above fails, you can manually install the APK:

```bash
# Build the APK
cd android
./gradlew assembleDebug
cd ..

# Install manually
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

### ADB Issues
```bash
# Kill and restart ADB server
adb kill-server
adb start-server

# Check for port conflicts
netstat -ano | findstr 5037

# If port is occupied, kill the process
taskkill /PID [PID_NUMBER] /F
```

### Device Not Recognized
1. Try different USB cable
2. Install device-specific USB drivers
3. Try different USB port
4. Restart both computer and phone

### App Not Installing
1. Uninstall previous version: `adb uninstall app.lovable.photogarden.guardian`
2. Clear ADB cache: `adb kill-server && adb start-server`
3. Check available storage on device

## Native Features Testing

Once installed, test these native capabilities:
- ✅ Camera access for photo capture
- ✅ File system operations
- ✅ Device haptic feedback
- ✅ Native sharing
- ✅ Status bar theming
- ✅ Splash screen

## Development vs Production

**Current Setup:** Native app with bundled assets (production-ready)
- ✅ Works offline
- ✅ Fast loading
- ✅ True native experience
- ✅ No dependency on external servers

## Quick Commands

```bash
# Full rebuild and deploy
npm run android:deploy

# Just deploy existing build
npm run android:install

# Build release version
npm run android:release
```