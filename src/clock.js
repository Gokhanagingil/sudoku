// Only visible, unpaused play contributes to the optional informational timer.
export function elapsedMillis(game, now = Date.now()) {
  if (!game) return 0;
  return Math.max(0, Number(game.elapsedBefore) || 0) + (game.clockRunning ? Math.max(0, now - game.startedAt) : 0);
}
export function pauseClock(game, now = Date.now()) {
  if (!game) return;
  game.elapsedBefore = elapsedMillis(game, now);
  game.startedAt = now;
  game.clockRunning = false;
}
export function resumeClock(game, now = Date.now()) {
  if (!game || game.clockRunning) return;
  game.startedAt = now;
  game.clockRunning = true;
}
