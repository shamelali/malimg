# Native mobile packaging with Capacitor

The same responsive Next.js application is already installable as a PWA from any HTTPS deployment. Capacitor is included for teams that need Google Play or Apple App Store distribution.

## Recommended architecture

The Capacitor shell should point to the deployed HTTPS Next.js application. This keeps the REST API, map, authentication, payments and IoT webhooks on the same release cadence as the web app.

```bash
# 1. Deploy the Next.js app over HTTPS, then:
export LAMBAK_PUBLIC_URL="https://lambak.example.gov.my"

# 2. Add platforms on a workstation with Android Studio / Xcode.
npm install
npx cap add android
npx cap add ios        # macOS/Xcode only

# 3. Copy the shell and open native IDEs.
npx cap sync
npx cap open android
npx cap open ios
```

## Android

Requirements:

- Android Studio
- JDK 17+
- Android SDK platform 35 or newer

Use `npx cap open android`, then build an AAB from Android Studio or Gradle.

## iOS

Requirements:

- macOS with Xcode
- Apple Developer Program membership
- Push, location and emergency-use entitlement review if native plugins are added

The current pilot uses web/PWA location and camera permissions. Add native plugins only if the App Store build requires them.

## Device capabilities

- `@capacitor/geolocation` is installed and registered for Android.
- The web app's SOS helper uses native geolocation inside Capacitor, browser geolocation in the PWA, and falls back to the Gunung Lambak trail coordinate if permission is denied.
- Camera/NFC access for QR scanning and smart-lock check-in can be added in the next iteration with tested Capacitor plugins.

## Offline behavior

- The service worker provides the web app shell.
- Ranger mutations are represented by the offline queue and should be persisted in IndexedDB in the next mobile-hardening iteration.
- `www/index.html` is a placeholder native launch shell. With `LAMBAK_PUBLIC_URL` configured, Capacitor loads the deployed web app.

## App store considerations

1. The SOS feature must include clear test/demo separation and emergency-number disclaimers.
2. PDPA consent must be collected before geolocation or family-link data is enabled.
3. Government emergency escalation must be signed off by MPK Kluang, APM and the clinic before production.
4. iOS requires account deletion and privacy nutrition labels; Android requires a data safety form.
