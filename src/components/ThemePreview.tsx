import { VISUAL_THEMES } from '../domain/themes';
import type { ThemeId } from '../domain/types';
import { GameToken } from './GameToken';

interface ThemePreviewProps {
  value: ThemeId;
  selected: boolean;
  onSelect: (theme: ThemeId) => void;
  showNumbers: boolean;
}

export function ThemePreview({ value, selected, onSelect, showNumbers }: ThemePreviewProps) {
  const theme = VISUAL_THEMES.find((item) => item.id === value)!;
  return (
    <button
      type="button"
      className={`theme-card${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect(value)}
      aria-pressed={selected}
    >
      <span className="theme-card__tokens" aria-hidden="true">
        {[1, 2, 3].map((token) => (
          <GameToken key={token} value={token} theme={value} showNumber={showNumbers} compact />
        ))}
      </span>
      <span className="theme-card__copy">
        <strong>{theme.title}</strong>
        <small>{theme.description}</small>
      </span>
      <span className="theme-card__check" aria-hidden="true">{selected ? '✓' : ''}</span>
    </button>
  );
}
