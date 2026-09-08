export function focusKey(element) {
  if (!element?.dataset) return null;
  for (const name of ["setting", "action", "cell", "token", "theme", "tier"]) {
    if (element.dataset[name] !== undefined) return `[data-${name}="${element.dataset[name]}"]`;
  }
  return null;
}
export function restoreFocus(root, key) {
  const dialog = root.querySelector('[role="dialog"]');
  root.querySelectorAll("main > :not(.modal-layer)").forEach(el => { el.inert = !!dialog; });
  const candidate = (dialog || root).querySelector(key || "[data-never]");
  if (candidate && !candidate.disabled) candidate.focus({ preventScroll: true });
  else if (dialog) {
    const first = dialog.querySelector("button:not(:disabled),input,a[href]");
    (first || dialog).focus({ preventScroll: true });
  }
}
export function trapDialogTab(event, root) {
  const dialog = root.querySelector('[role="dialog"]');
  if (!dialog || event.key !== "Tab") return false;
  const items = [...dialog.querySelectorAll("button:not(:disabled),input:not([hidden]),a[href]")].filter(el => !el.hidden && el.getClientRects().length);
  if (!items.length) return false;
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  return true;
}
