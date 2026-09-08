import { runtime } from "./state.js";

let audioContext = null;
let wakeLock = null;

function getAudioContext() {
  if (!runtime.settings.sound) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

function tone(frequency, duration = 0.055, delay = 0, volume = 0.025) {
  const context = getAudioContext();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

export function softFeedback(kind) {
  if (runtime.settings.haptics && navigator.vibrate) {
    const pattern = kind === "complete" ? [18, 45, 24] : kind === "nudge" ? 10 : kind === "place" ? 14 : 7;
    navigator.vibrate(pattern);
  }
  if (!runtime.settings.sound) return;
  try {
    if (kind === "complete") { tone(523, .08, 0); tone(659, .08, .09); tone(784, .11, .18); }
    else if (kind === "nudge") tone(260, .045, 0, .018);
    else if (kind === "hint") tone(587, .065, 0, .02);
    else if (kind === "undo") tone(392, .05, 0, .018);
    else if (kind === "note") tone(494, .04, 0, .015);
    else if (kind === "erase") tone(330, .04, 0, .014);
    else if (kind === "place") tone(523, .055, 0, .022);
    else tone(440, .035, 0, .012);
  } catch { /* ses desteği yoksa oyun sessiz devam eder */ }
}

export async function requestWakeLock() {
  if ((wakeLock && !wakeLock.released) || !runtime.settings.keepAwake || !navigator.wakeLock || runtime.screen !== "game" || !runtime.save.activeGame) return;
  try { wakeLock = await navigator.wakeLock.request("screen"); } catch { /* platform may reject */ }
}

export async function releaseWakeLock() {
  try { await wakeLock?.release(); } catch { /* ignore */ }
  wakeLock = null;
}
