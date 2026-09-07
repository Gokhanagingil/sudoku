import { BIRDS } from '../domain/birds';
import { getTokenName } from '../domain/themes';
import type { GameSession, GameSettings } from '../domain/types';
import type { GameAction } from '../state/gameState';
import { GameToken } from './GameToken';

interface TokenPaletteProps {
  session: GameSession;
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
  onValue?: () => void;
}

export function TokenPalette({ session, settings, dispatch, onValue }: TokenPaletteProps) {
  const values = BIRDS.slice(0, session.puzzle.spec.size).map((item) => item.value);
  const selectedValue = session.selectedToken ?? (session.selectedCell === null ? 0 : session.board[session.selectedCell]);

  return (
    <section className="bird-palette" aria-label={session.noteMode ? 'Not olarak eklenebilecek simgeler' : 'Yerleştirilebilecek simgeler'}>
      <div className="palette-heading">
        <span>{session.noteMode ? 'Olasılık notu ekle' : settings.theme === 'birds' ? 'Kuşu seç' : 'Simgeyi seç'}</span>
        {session.noteMode ? <span className="mode-badge">NOT MODU AÇIK</span> : null}
      </div>
      <div className={`palette-grid palette-grid--${session.puzzle.spec.size}`}>
        {values.map((value) => {
          const count = session.board.filter((cellValue) => cellValue === value).length;
          const complete = count >= session.puzzle.spec.size;
          const name = getTokenName(value, settings.theme);
          const guided = session.tutorial?.step === 'select-token'
            && value === session.tutorial.targetValue;
          const tutorialLocked = Boolean(session.tutorial)
            && (!guided || session.tutorial?.step !== 'select-token');
          return (
            <button
              type="button"
              className={`palette-bird${selectedValue === value ? ' is-active' : ''}${guided ? ' is-guided' : ''}`}
              key={value}
              onClick={() => {
                onValue?.();
                const editableCellSelected = session.selectedCell !== null && session.puzzle.givens[session.selectedCell] === 0;
                dispatch(editableCellSelected ? { type: 'enterValue', value } : { type: 'selectToken', value });
              }}
              disabled={session.completed || complete || tutorialLocked}
              aria-label={`${name}${session.noteMode ? ' olasılık notunu ekle' : ' simgesini yerleştir'}${complete ? ', tamamlandı' : ''}`}
            >
              <GameToken value={value} theme={settings.theme} showNumber={settings.showNumbers} compact={session.puzzle.spec.size === 9} muted={complete} />
              <span className="palette-bird__name">{name.replace(' sayısı', '')}</span>
              {complete ? <span className="palette-bird__done" aria-hidden="true">✓</span> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
