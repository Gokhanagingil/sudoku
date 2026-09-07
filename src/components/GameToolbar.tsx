import { Eraser, Lightbulb, PencilLine, RotateCcw } from 'lucide-react';
import type { GameSession } from '../domain/types';
import type { GameAction } from '../state/gameState';

interface GameToolbarProps {
  session: GameSession;
  dispatch: React.Dispatch<GameAction>;
  onHint: () => void;
}

export function GameToolbar({ session, dispatch, onHint }: GameToolbarProps) {
  const selectedEditable = session.selectedCell !== null && session.puzzle.givens[session.selectedCell] === 0;
  return (
    <div className="game-toolbar" role="toolbar" aria-label="Bulmaca araçları">
      <button type="button" className="tool-button" onClick={() => dispatch({ type: 'undo' })} disabled={!session.undoStack.length || Boolean(session.tutorial)}>
        <RotateCcw aria-hidden="true" />
        <span>Geri al</span>
      </button>
      <button type="button" className="tool-button" onClick={() => dispatch({ type: 'erase' })} disabled={!selectedEditable || Boolean(session.tutorial)}>
        <Eraser aria-hidden="true" />
        <span>Temizle</span>
      </button>
      <button
        type="button"
        className={`tool-button tool-button--notes${session.noteMode ? ' is-active' : ''}`}
        onClick={() => dispatch({ type: 'toggleNotes' })}
        aria-pressed={session.noteMode}
        disabled={Boolean(session.tutorial)}
      >
        <PencilLine aria-hidden="true" />
        <span>Not</span>
        <span className="tool-state">{session.noteMode ? 'Açık' : 'Kapalı'}</span>
      </button>
      <button type="button" className="tool-button" onClick={onHint} disabled={Boolean(session.tutorial)}>
        <Lightbulb aria-hidden="true" />
        <span>İpucu</span>
      </button>
    </div>
  );
}
