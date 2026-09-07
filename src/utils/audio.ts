let audioContext: AudioContext | null = null;

export function playSoftTone(kind: 'place' | 'complete') {
  try {
    audioContext ??= new AudioContext();
    const now = audioContext.currentTime;
    const frequencies = kind === 'complete' ? [392, 494, 587] : [330];
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext!.createOscillator();
      const gain = audioContext!.createGain();
      const start = now + index * 0.09;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === 'complete' ? 0.055 : 0.035, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + (kind === 'complete' ? 0.28 : 0.12));
      oscillator.connect(gain).connect(audioContext!.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.32);
    });
  } catch {
    // Sound is an enhancement; gameplay never depends on audio support.
  }
}
