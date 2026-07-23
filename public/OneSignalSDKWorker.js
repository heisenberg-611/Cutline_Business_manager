try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {
  console.warn("OneSignal SDK failed to load (possibly blocked by adblocker).");
}
try {
  importScripts("/sw.js");
} catch (e) {
  console.warn("Serwist /sw.js not found or failed to load (expected in dev mode)");
}
