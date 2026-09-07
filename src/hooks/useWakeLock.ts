import { useEffect } from 'react';

type WakeLockSentinelLike = { release: () => Promise<void> };

export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let lock: WakeLockSentinelLike | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const wakeLock = (navigator as Navigator & {
          wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
        }).wakeLock;
        if (wakeLock && !cancelled) lock = await wakeLock.request('screen');
      } catch {
        // The game remains fully usable when a browser does not expose Wake Lock.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !lock) void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void lock?.release();
      lock = null;
    };
  }, [enabled]);
}
