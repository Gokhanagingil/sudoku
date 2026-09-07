import { getBird } from '../domain/birds';

interface BirdTokenProps {
  value: number;
  showNumber?: boolean;
  compact?: boolean;
  muted?: boolean;
}

export function BirdToken({ value, showNumber = true, compact = false, muted = false }: BirdTokenProps) {
  const bird = getBird(value);
  return (
    <span
      className={`bird-token${compact ? ' bird-token--compact' : ''}${muted ? ' bird-token--muted' : ''}`}
      role="img"
      aria-label={bird.name}
      title={bird.name}
    >
      <svg viewBox="0 0 100 92" aria-hidden="true" focusable="false">
        <ellipse cx="47" cy="78" rx="28" ry="5" fill="rgba(30,60,40,.14)" />
        <path d="M29 65 15 75l19-2Z" fill={bird.wing} />
        <ellipse cx="48" cy="52" rx="27" ry="30" transform="rotate(-10 48 52)" fill={bird.body} />
        <ellipse cx="53" cy="58" rx="18" ry="22" transform="rotate(-12 53 58)" fill={bird.chest} />
        <path d="M31 48c-10 9-10 24 2 29 10-5 15-15 16-29-6-4-12-4-18 0Z" fill={bird.wing} />
        <path d="M34 52c-4 6-4 13 0 18" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="61" cy="29" r="18" fill={bird.body} />
        <BirdMark mark={bird.mark} wing={bird.wing} />
        <path d="m76 31 15 6-16 5Z" fill={bird.accent} />
        <circle cx="66" cy="25" r="4" fill="#fff" />
        <circle cx="67" cy="25" r="2.1" fill="#1f3028" />
        <path d="M57 14c3-5 7-8 12-9-2 5-2 8 0 12" fill={bird.wing} />
        <path d="M39 79v6M55 78v7" stroke="#875c3e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {showNumber ? <span className="bird-token__number" aria-hidden="true">{value}</span> : null}
    </span>
  );
}

function BirdMark({ mark, wing }: { mark: 'dots' | 'bib' | 'mask' | 'stripe'; wing: string }) {
  if (mark === 'dots') {
    return <><circle cx="42" cy="54" r="3" fill={wing} opacity=".7" /><circle cx="50" cy="62" r="2.4" fill={wing} opacity=".65" /></>;
  }
  if (mark === 'bib') {
    return <path d="M52 42c-2 7-1 13 4 20-8 2-15-2-18-9 3-6 7-9 14-11Z" fill={wing} opacity=".58" />;
  }
  if (mark === 'mask') {
    return <path d="M56 25c8-1 14 2 18 7-5 5-12 6-18 3Z" fill={wing} opacity=".9" />;
  }
  return <path d="M37 54c8 4 15 5 24 1" fill="none" stroke={wing} strokeWidth="3.5" strokeLinecap="round" opacity=".7" />;
}
