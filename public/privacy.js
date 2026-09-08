function returnToGame() { if (history.length > 1) history.back(); else location.replace("./"); }
document.getElementById("back").addEventListener("click", returnToGame);
window.addEventListener("denge-back", returnToGame);

if (window.Capacitor?.nativePromise) window.Capacitor.nativePromise("DengeDevice", "setContext", {home:false,keepAwake:false}).catch(() => {});
