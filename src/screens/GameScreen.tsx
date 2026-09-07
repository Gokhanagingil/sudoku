import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, HelpCircle, Pause, Play, RefreshCcw, Settings } from 'lucide-react';
import { SudokuBoard } from '../components/SudokuBoard';
import { TokenPalette } from '../components/TokenPalette';
import { GameToolbar } from '../components/GameToolbar';
import { Modal } from '../components/Modal';
import { DIFFICULTY_BY_ID } from '../domain/difficulties';
import { buildHint } from '../domain/sudoku';
import { getTokenName } from '../domain/themes';
import type { GameAction } from '../state/gameState';
import type { GameSession, GameSettings, Hint } from '../domain/types';
import { useWakeLock } from '../hooks/useWakeLock';
import { playSoftTone } from '../utils/audio';

interface GameScreenProps {
  session: GameSession;
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
  onExit: () => void;
  onSettings: () => void;
}

export function GameScreen({ session, settings, dispatch, onExit, onSettings }: GameScreenProps) {
  const [paused, setPaused] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [hint, setHint] = useState<Hint | null>(null);
  const difficulty = DIFFICULTY_BY_ID[session.puzzle.difficultyId];
  useWakeLock(settings.keepAwake && !paused && !session.completed);

  useEffect(() => {
    if (paused || session.completed) return;
    const timer = window.setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => window.clearInterval(timer);
  }, [dispatch, paused, session.completed]);

  useEffect(() => setHint(null), [session.board]);

  const selectedValue = session.selectedCell === null ? 0 : session.board[session.selectedCell];
  const selectedWrong = settings.autoCheck && session.selectedCell !== null && selectedValue !== 0 &&
    session.puzzle.givens[session.selectedCell] === 0 && selectedValue !== session.puzzle.solution[session.selectedCell];
  const selectedEditable = session.selectedCell !== null
    && session.puzzle.givens[session.selectedCell] === 0;
  const interactionHelp = session.selectedToken
    ? `${getTokenName(session.selectedToken, settings.theme).replace(' sayısı', '')} seçili. Boş bir yuvaya dokunabilir veya aşağıdan başka bir simge seçebilirsin.`
    : selectedEditable
      ? 'Yuva seçildi. Şimdi aşağıdan yerleştirmek istediğin simgeye dokun.'
      : 'Önce boş bir yuvaya, sonra aşağıdaki simgelerden birine dokun.';

  const requestHint = () => {
    const nextHint = buildHint(session.board, session.puzzle);
    setHint(nextHint);
    if (nextHint) dispatch({ type: 'useHint', cell: nextHint.cell });
  };

  const hintMessage = hint ? formatHint(hint, settings.theme) : '';

  return (
    <main className="game-screen">
      <header className="game-header">
        <button type="button" className="icon-button" onClick={onExit} aria-label="Ana ekrana dön"><ArrowLeft aria-hidden="true" /></button>
        <div className="game-heading">
          <strong>{difficulty.title}</strong>
          <span>Bölüm {session.puzzle.sequence} · {session.puzzle.spec.size}×{session.puzzle.spec.size} · {settings.theme === 'birds' ? 'Kuşlar' : settings.theme === 'shapes' ? 'Geometrik' : 'Klasik'}</span>
        </div>
        <div className="game-header__actions">
          {settings.showTimer ? <span className="game-timer"><Clock3 aria-hidden="true" />{formatTime(session.elapsedSeconds)}</span> : null}
          <button type="button" className="icon-button" onClick={onSettings} aria-label="Görsel ve oyun ayarları"><Settings aria-hidden="true" /></button>
          <button type="button" className="icon-button" onClick={() => setPaused(true)} aria-label="Oyunu duraklat"><Pause aria-hidden="true" /></button>
        </div>
      </header>

      <section className="rule-ribbon" aria-label="Oyun yönlendirmesi" aria-live="polite">
        <HelpCircle aria-hidden="true" />
        <p>{session.tutorial
          ? <><strong>Her simge bir kez:</strong> Her satırda, sütunda ve kalın çizgili bahçede.</>
          : <><strong>Sıradaki adım:</strong> {interactionHelp}</>}</p>
      </section>

      <div className="game-content">
        <section className="board-zone">
          <SudokuBoard
            session={session}
            settings={settings}
            dispatch={dispatch}
            hintedCell={hint?.cell ?? null}
          />
          {selectedWrong ? (
            <div className="gentle-alert" role="status">
              <strong>Bir daha bakalım.</strong> Bu simge burada çözümle uyuşmuyor. Puan kaybı yok; temizleyebilir veya geri alabilirsin.
            </div>
          ) : null}
          {session.tutorial ? (
            <TutorialCard session={session} settings={settings} dispatch={dispatch} />
          ) : null}
          {hint ? (
            <div className="hint-card" role="status">
              <div><strong>{hint.title}</strong><p>{hintMessage}</p></div>
              <button type="button" onClick={() => setHint(null)}>Anladım</button>
            </div>
          ) : null}
        </section>

        <section className="control-zone">
          <TokenPalette
            session={session}
            settings={settings}
            dispatch={dispatch}
            onValue={() => {
              if (settings.sound) playSoftTone('place');
              if (settings.haptics && 'vibrate' in navigator) navigator.vibrate(10);
            }}
          />
          <GameToolbar session={session} dispatch={dispatch} onHint={requestHint} />
        </section>
      </div>

      {paused ? (
        <Modal title="Oyun duraklatıldı" onClose={() => setPaused(false)}>
          <div className="pause-art" aria-hidden="true"><span>☘</span></div>
          <p className="modal-copy">Bulmacan otomatik kaydedildi. Hazır olduğunda aynı yerden devam edebilirsin.</p>
          <div className="modal-actions modal-actions--stacked">
            <button type="button" className="primary-button" onClick={() => setPaused(false)}><Play aria-hidden="true" /> Devam et</button>
            <button type="button" className="secondary-button" onClick={onExit}>Ana ekrana dön</button>
            <button type="button" className="text-button" onClick={() => { setPaused(false); setRestartOpen(true); }}><RefreshCcw aria-hidden="true" /> Bulmacayı yeniden başlat</button>
          </div>
        </Modal>
      ) : null}

      {restartOpen ? (
        <Modal title="Yeniden başlatılsın mı?" onClose={() => setRestartOpen(false)}>
          <p className="modal-copy">Bu bulmacadaki yerleştirmelerin ve notların temizlenecek. Toplam puanın etkilenmeyecek.</p>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={() => setRestartOpen(false)}>Vazgeç</button>
            <button type="button" className="danger-button" onClick={() => { dispatch({ type: 'restart' }); setRestartOpen(false); }}>Yeniden başlat</button>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function TutorialCard({ session, settings, dispatch }: {
  session: GameSession;
  settings: GameSettings;
  dispatch: React.Dispatch<GameAction>;
}) {
  const tutorial = session.tutorial!;
  const tokenName = getTokenName(tutorial.targetValue, settings.theme).replace(' sayısı', '');
  const focus = tutorial.lesson === 1 ? 'satır' : 'sütun';

  if (tutorial.step === 'intro') {
    return (
      <div className="tutorial-card tutorial-card--intro" role="status">
        <span className="tutorial-card__step">KISA DERS {tutorial.lesson}/2</span>
        <div><strong>{tutorial.lesson === 1 ? 'İlk yuvayı birlikte bulalım.' : 'Şimdi sütuna birlikte bakalım.'}</strong><p>Doğru seçimin nedenini ekranda adım adım göstereceğim.</p></div>
        <div className="tutorial-card__actions">
          <button type="button" className="tutorial-primary" onClick={() => dispatch({ type: 'beginTutorial' })}>Birlikte yapalım</button>
          <button type="button" className="tutorial-skip" onClick={() => dispatch({ type: 'skipTutorials' })}>Dersi geç</button>
        </div>
      </div>
    );
  }

  const title = tutorial.step === 'select-cell'
    ? `1/2 · Parlayan yuvaya dokun`
    : tutorial.step === 'select-token'
      ? `2/2 · ${tokenName} seç`
      : '✓ Harika, doğru yuvayı buldun!';
  const message = tutorial.step === 'select-cell'
    ? `Bu ${focus}daki diğer simgeler zaten yerinde. Boş kalan yuvaya dokun.`
    : tutorial.step === 'select-token'
      ? `Bu ${focus}da eksik kalan tek simge ${tokenName}. Aşağıda parlayan simgeye dokun.`
      : tutorial.lesson === 1
        ? 'Aynı simge bir satırda yalnızca bir kez bulunur. Şimdi bulmacaya sen devam edebilirsin.'
        : 'Bir sütunda da her simge yalnızca bir kez bulunur. Kararsız kaldığında “Not” düğmesiyle olasılıklarını yazabilirsin.';
  return (
    <div className={`tutorial-card${tutorial.step === 'success' ? ' is-success' : ''}`} role="status">
      <span className="tutorial-card__step">{title}</span>
      <p>{message}</p>
      {tutorial.step === 'success' ? (
        <button type="button" className="tutorial-primary" onClick={() => dispatch({ type: 'finishTutorial' })}>Kendim devam edeceğim</button>
      ) : null}
    </div>
  );
}

function formatHint(hint: Hint, theme: GameSettings['theme']) {
  const labels = hint.candidates.map((value) => getTokenName(value, theme));
  if (hint.title === 'Bir seçimi yeniden düşün') return hint.message;
  if (labels.length === 1) {
    return `${labels[0]} bu yuvada tek olasılık. Aynı satır, sütun ve bölgedeki simgeleri karşılaştır.`;
  }
  return `Bu yuvada ${labels.join(' veya ')} mümkün. Diğer yuvalardaki tekrarları eleyerek ilerle.`;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}
