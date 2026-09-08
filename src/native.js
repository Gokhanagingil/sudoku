// The static app uses the bridge injected by the pinned Capacitor Android shell.
// No native bridge, no ad SDK/network request on the browser/PWA build.
export function isNative() { return typeof window.Capacitor?.nativePromise === "function"; }
export function nativeCall(method, options = {}) {
  return isNative() ? window.Capacitor.nativePromise("DengeDevice", method, options) : Promise.resolve({ available: false });
}
export function syncNativeContext(runtime) {
  const visible = document.visibilityState !== "hidden";
  const modal = runtime.settingsOpen || runtime.menuOpen || runtime.screen === "result";
  return nativeCall("setContext", {
    home: visible && runtime.screen === "home" && !modal && runtime.save.completed.length > 0,
    keepAwake: visible && runtime.screen === "game" && !modal && !!runtime.save.activeGame && runtime.settings.keepAwake
  }).catch(() => ({ available: false }));
}
