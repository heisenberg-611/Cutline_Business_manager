importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
try {
  importScripts("/sw.js");
} catch (e) {
  console.warn("Serwist /sw.js not found or failed to load (expected in dev mode)");
}
