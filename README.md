# BamSignal

BamSignal is a React/Vite football prediction dashboard with light and dark modes, a responsive website layout, and Capacitor setup for native Android/iOS shells.

## Run the Website

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Android

The Android platform project has been generated in `android/`.

```bash
npm run cap:sync
npm run android
```

If Gradle needs to download wrapper dependencies for the first time, Android Studio may be the smoother way to open and finish the first sync.

The debug APK can be built with Android Studio's bundled Java 21 runtime:

```bash
cd android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./gradlew assembleDebug
```

## iOS

Capacitor is configured for iOS and the native folder has been generated in `ios/`. Running or archiving the iOS app requires full Xcode, not only Command Line Tools:

```bash
xcode-select -s /Applications/Xcode.app/Contents/Developer
npm run ios
```

## Product Notes

The app uses original BamSignal copy and branding while matching the reference product category: football predictions, confidence percentages, major European leagues, betting markets, FAQs, contact links, responsible gambling language, and app-store focused calls to action.
