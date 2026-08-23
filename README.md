# Target Rush for iPhone and Android

## Play on an iPhone

The iPhone and the computer must be on the same Wi-Fi network. Start the server so it listens on the network:

```bash
npm start
```

The command prints the exact iPhone URL. Open that URL in Safari once, then tap **Share → Add to Home Screen → Add**. After that, tap the **Target Rush** icon; it opens full-screen without a browser URL.

Do not use `127.0.0.1` on the iPhone: there it means the iPhone itself. The simulator automatically opens the full-screen touch version on phones. Safari's **Share → Add to Home Screen** can add it like an app.

Target Rush is configured as a Capacitor 8 Android app. The game files live in `www/` and are bundled into the native app, so gameplay does not require internet access.

## Requirements

- Node.js 22 or newer and npm
- Android Studio
- A Google Play Console account for publishing to Google Play

## Generate the native projects

Run these commands from this directory:

```bash
npm install
npx cap add android
npm run sync
```

Android can be generated on Windows, macOS, or Linux. A Mac is not required.

## Run Android

```bash
npm run android
```

Choose a connected phone or emulator in Android Studio, then press Run.

Whenever the files in `www/` change, run `npm run sync` before rebuilding the app.

## Create a Google Play release

In Android Studio, use **Build → Generate Signed Bundle / APK**, choose **Android App Bundle**, and create or select a signing key. Upload the resulting `.aab` file to Google Play Console.
