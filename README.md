# Target Rush for iPhone and Android

## Play on an iPhone

The iPhone and the computer must be on the same Wi-Fi network. Start the server so it listens on the network:

```bash
npm start
```

The command prints the exact iPhone URL. Open that URL in Safari once, then tap **Share → Add to Home Screen → Add**. After that, tap the **Target Rush** icon; it opens full-screen without a browser URL.

Do not use `127.0.0.1` on the iPhone: there it means the iPhone itself. The simulator automatically opens the full-screen touch version on phones. Safari's **Share → Add to Home Screen** can add it like an app.

Target Rush is configured as a Capacitor 8 iPhone and Android app. The game files live in `www/` and are bundled into each native app, so gameplay does not require internet access.

## Requirements

- Node.js 22 or newer and npm
- Android Studio for Android builds
- macOS with Xcode for iPhone builds
- A Google Play Console account for publishing to Google Play
- An Apple Developer account for App Store publishing

## Set up the native projects

The `android/` and `ios/` projects are included. After cloning, run:

```bash
npm install
npm run sync
```

Only use `npx cap add android` or `npx cap add ios` if that platform directory has been removed and needs to be regenerated.

Android can be generated on Windows, macOS, or Linux. A Mac is not required.

## Run Android

```bash
npm run android
```

Choose a connected phone or emulator in Android Studio, then press Run.

Whenever the files in `www/` change, run `npm run sync` before rebuilding the app.

## Run on iPhone

The iOS project can be generated anywhere, but Apple requires a Mac with Xcode to build and sign it:

```bash
npm run build:ios
```

In Xcode, select the `App` target, choose your development team under **Signing & Capabilities**, connect an iPhone, and press Run. The bundle identifier is `com.targetrush.game`.

## Create a Google Play release

In Android Studio, use **Build → Generate Signed Bundle / APK**, choose **Android App Bundle**, and create or select a signing key. Upload the resulting `.aab` file to Google Play Console.

## Create an App Store release

In Xcode, set the version/build number and choose **Product → Archive**. In the Organizer, select **Distribute App → App Store Connect**. Complete the listing, screenshots, age rating, and privacy details in App Store Connect before submitting for review.
