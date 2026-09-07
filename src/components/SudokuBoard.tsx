import { describeCell, getBoxIndex, hasConflict } from '../domain/sudoku';
import { getTokenName } from '../domain/themes';
import type { GameSession, GameSettings } from '../domain/types';
import type { GameAction } from '../state/gameState';
import { GameToken } from './GameToken';

interface SudokuBoardProps {
  session: GameSession;
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
  hintedCell: number | null;
}

export function SudokuBoard({ session, settings, dispatch, hintedCell }: SudokuBoardProps) {
  const { puzzle, board, selectedCell } = session;
  const selectedValue = session.selectedToken ?? (selectedCell === null ? 0 : board[selectedCell]);
  const selectedRow = selectedCell === null ? -1 : Math.floor(selectedCell / puzzle.spec.size);
  const selectedColumn = selectedCell === null ? -1 : selectedCell % puzzle.spec.size;
  const selectedBox = selectedCell === null ? -1 : getBoxIndex(selectedCell, puzzle.spec);

  return (
    <div
      className={`sudoku-board sudoku-board--${puzzle.spec.size}`}
      style={{ gridTemplateColumns: `repeat(${puzzle.spec.size}, 1fr)` }}
      role="grid"
      aria-label={`${puzzle.spec.size} çarpı ${puzzle.spec.size} Kuş Köyü tahtası`}
    >
      {board.map((value, cell) => {
        const row = Math.floor(cell / puzzle.spec.size);
        const column = cell % puzzle.spec.size;
        const box = getBoxIndex(cell, puzzle.spec);
        const given = puzzle.givens[cell] !== 0;
        const related = selectedCell !== null && (row === selectedRow || column === selectedColumn || box === selectedBox);
        const sameValue = Boolean(selectedValue && value === selectedValue);
        const conflict = settings.autoCheck && Boolean(value) && (
          hasConflict(board, cell, puzzle.spec) || (!given && value !== puzzle.solution[cell])
        );
        const tutorialGuided = session.tutorial?.step === 'select-cell'
          && cell === session.tutorial.targetCell;
        const tutorialLocked = Boolean(session.tutorial) && (
          session.tutorial?.step === 'intro'
          || session.tutorial?.step === 'success'
          || (session.tutorial?.step === 'select-cell' && !tutorialGuided)
          || (session.tutorial?.step === 'select-token' && cell !== session.tutorial.targetCell)
        );
        const classes = [
          'sudoku-cell',
          given ? 'is-given' : '',
          cell === selectedCell ? 'is-selected' : '',
          related ? 'is-related' : '',
          sameValue ? 'is-same-value' : '',
          conflict ? 'is-conflict' : '',
          cell === hintedCell || tutorialGuided ? 'is-hinted' : '',
          column > 0 && column % puzzle.spec.boxColumns === 0 ? 'box-start-x' : '',
          row > 0 && row % puzzle.spec.boxRows === 0 ? 'box-start-y' : '',
        ].filter(Boolean).join(' ');
        const notes = session.notes[cell] ?? [];
        const label = value
          ? `${describeCell(cell, puzzle.spec)}: ${getTokenName(value, settings.theme)}${given ? ', başlangıç simgesi' : ''}${conflict ? ', yeniden kontrol edin' : ''}`
          : `${describeCell(cell, puzzle.spec)}: boş yuva${notes.length ? `, notlar ${notes.join(', ')}` : ''}`;

        return (
          <button
            type="button"
            role="gridcell"
            aria-selected={cell === selectedCell}
            aria-label={label}
            className={classes}
            key={cell}
            disabled={session.completed || tutorialLocked}
            onClick={() => {
              dispatch({ type: 'selectCell', cell });
              if (!session.tutorial && session.selectedToken && !given && value === 0) {
                dispatch({ type: 'enterValue', value: session.selectedToken });
              }
            }}
          >
            <span className="nest-ring" aria-hidden="true" />
            {value ? <GameToken value={value} theme={settings.theme} showNumber={settings.showNumbers} compact={puzzle.spec.size === 9} /> : null}
            {!value && notes.length ? (
              <span
                className="cell-notes"
                style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(puzzle.spec.size))}, 1fr)` }}
                aria-hidden="true"
              >
                {Array.from({ length: puzzle.spec.size }, (_, index) => index + 1).map((candidate) => (
                  <span key={candidate}>{notes.includes(candidate) ? candidate : ''}</span>
                ))}
              </span>
            ) : null}
            {conflict ? <span className="cell-alert" aria-hidden="true">!</span> : null}
          </button>
        );
      })}
    </div>
  );
}
