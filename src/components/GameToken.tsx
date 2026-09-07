import { BirdToken } from './BirdToken';
import type { ThemeId } from '../domain/types';

interface GameTokenProps {
  value: number;
  theme: ThemeId;
  showNumber?: boolean;
  compact?: boolean;
  muted?: boolean;
}

const SHAPE_COLORS = [
  ['#327A73', '#E6F0EB'],
  ['#D26A47', '#F7E2D5'],
  ['#5570A8', '#E1E7F4'],
  ['#9A5D8D', '#F0DFED'],
  ['#AF8635', '#F7E9C8'],
  ['#597843', '#E5EEDC'],
  ['#B55058', '#F6DADD'],
  ['#3E7386', '#DDECF0'],
  ['#785B9E', '#E9E0F3'],
] as const;

export function GameToken({ value, theme, showNumber = true, compact = false, muted = false }: GameTokenProps) {
  if (theme === 'birds') {
    return <BirdToken value={value} showNumber={showNumber} compact={compact} muted={muted} />;
  }

  if (theme === 'classic') {
    return (
      <span className={`classic-token${compact ? ' classic-token--compact' : ''}${muted ? ' is-muted' : ''}`} aria-label={`${value} sayısı`}>
        {value}
      </span>
    );
  }

  const [primary, secondary] = SHAPE_COLORS[value - 1] ?? SHAPE_COLORS[0];
  return (
    <span className={`shape-token${compact ? ' shape-token--compact' : ''}${muted ? ' is-muted' : ''}`} role="img" aria-label={`${value}. geometrik şekil`}>
      <svg viewBox="0 0 72 72" aria-hidden="true">
        <Shape value={value} primary={primary} secondary={secondary} />
      </svg>
      {showNumber ? <span className="bird-token__number" aria-hidden="true">{value}</span> : null}
    </span>
  );
}

function Shape({ value, primary, secondary }: { value: number; primary: string; secondary: string }) {
  const common = { fill: secondary, stroke: primary, strokeWidth: 7, strokeLinejoin: 'round' as const };
  if (value === 1) return <circle cx="36" cy="36" r="24" {...common} />;
  if (value === 2) return <polygon points="36,9 65,61 7,61" {...common} />;
  if (value === 3) return <rect x="12" y="12" width="48" height="48" rx="5" {...common} />;
  if (value === 4) return <polygon points="36,7 65,36 36,65 7,36" {...common} />;
  if (value === 5) return <polygon points="36,7 65,29 54,64 18,64 7,29" {...common} />;
  if (value === 6) return <polygon points="20,8 52,8 67,36 52,64 20,64 5,36" {...common} />;
  if (value === 7) return <polygon points="36,5 44,26 67,27 49,41 55,64 36,51 17,64 23,41 5,27 28,26" {...common} />;
  if (value === 8) return <path d="M28 7h16v21h21v16H44v21H28V44H7V28h21Z" {...common} />;
  return (
    <>
      <circle cx="36" cy="36" r="27" {...common} />
      <circle cx="36" cy="36" r="12" fill="white" stroke={primary} strokeWidth="6" />
    </>
  );
}
