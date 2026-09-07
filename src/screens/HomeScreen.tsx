import { ChevronRight, LockKeyhole, Settings, Sparkles } from 'lucide-react';
import { DIFFICULTIES, getNextDifficulty, getPlayerDifficulty, isDifficultyUnlocked } from '../domain/difficulties';
import type { DifficultyId, PersistedGameState } from '../domain/types';
import { BirdToken } from '../components/BirdToken';
import { ProgressMeter } from '../components/ProgressMeter';

interface HomeScreenProps {
  state: PersistedGameState;
  onStart: (difficultyId: DifficultyId) => void;
  onContinue: () => void;
  onSettings: () => void;
}

export function HomeScreen({ state, onStart, onContinue, onSettings }: HomeScreenProps) {
  const playerDifficulty = getPlayerDifficulty(state.progress.points);
  const nextDifficulty = getNextDifficulty(state.progress.points);
  const activeSession = state.activeSession && !state.activeSession.completed ? state.activeSession : null;
  const pointsIntoLevel = state.progress.points - playerDifficulty.minPoints;
  const levelSpan = nextDifficulty ? nextDifficulty.minPoints - playerDifficulty.minPoints : 1;

  return (
    <main className="home-screen page-shell">
      <header className="home-header">
        <div className="brand-lockup">
          <span className="brand-mark"><BirdToken value={1} showNumber={false} compact /></span>
          <span><strong>Kuş Köyü</strong><small>Sudoku</small></span>
        </div>
        <button type="button" className="icon-button" onClick={onSettings} aria-label="Ayarları aç">
          <Settings aria-hidden="true" />
        </button>
      </header>

      <section className="village-hero">
        <div className="sun-orb" aria-hidden="true" />
        <div className="hero-cloud hero-cloud--one" aria-hidden="true" />
        <div className="hero-cloud hero-cloud--two" aria-hidden="true" />
        <div className="hero-house hero-house--one" aria-hidden="true"><span className="hero-house__roof" /><span className="hero-house__door" /></div>
        <div className="hero-house hero-house--two" aria-hidden="true"><span className="hero-house__roof" /><span className="hero-house__door" /></div>
        <div className="hero-house hero-house--three" aria-hidden="true"><span className="hero-house__roof" /><span className="hero-house__door" /></div>
        <div className="hero-path" aria-hidden="true" />
        <div className="hero-branch" aria-hidden="true" />
        <span className="hero-bird hero-bird--one"><BirdToken value={2} showNumber={false} /></span>
        <span className="hero-bird hero-bird--two"><BirdToken value={4} showNumber={false} compact /></span>
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={18} aria-hidden="true" /> Sakin düşün, köyü tamamla</span>
          <h1>Her kuşa doğru yuvayı bul.</h1>
          <p>Satırda, sütunda ve her bahçede her simge yalnızca bir kez yer alsın.</p>
          <button
            type="button"
            className="primary-button primary-button--hero"
            onClick={activeSession ? onContinue : () => onStart(state.progress.lastDifficultyId)}
          >
            {activeSession ? 'Kaldığın yerden devam et' : 'Oyuna başla'}
            <ChevronRight aria-hidden="true" />
          </button>
          {activeSession ? (
            <small className="continue-detail">
              {DIFFICULTIES.find((item) => item.id === activeSession.puzzle.difficultyId)?.title} · Bölüm {activeSession.puzzle.sequence} · {activeSession.board.filter(Boolean).length}/{activeSession.board.length} yuva
            </small>
          ) : null}
        </div>
      </section>

      <section className="mastery-card" aria-labelledby="mastery-heading">
        <div className="mastery-card__heading">
          <div>
            <span className="eyebrow">OYUNCU SEVİYEN</span>
            <h2 id="mastery-heading">{playerDifficulty.title}</h2>
          </div>
          <strong className="point-pill">{state.progress.points} puan</strong>
        </div>
        {nextDifficulty ? (
          <ProgressMeter
            value={pointsIntoLevel}
            max={levelSpan}
            label={`${nextDifficulty.title} için ${Math.max(0, nextDifficulty.minPoints - state.progress.points)} puan kaldı`}
          />
        ) : (
          <ProgressMeter value={1} max={1} label="En yüksek seviye açık" />
        )}
        <p className="gentle-note">Her tamamlanan bulmaca puan kazandırır. İpucu kullanmak ilerlemeni durdurmaz.</p>
      </section>

      <section className="levels-section" aria-labelledby="levels-heading">
        <div className="section-heading">
          <div>
            <span className="eyebrow">UZUN SOLUKLU YOLCULUK</span>
            <h2 id="levels-heading">Zorluk seviyeleri</h2>
          </div>
          <span className="section-count">5 kademe</span>
        </div>
        <div className="level-grid">
          {DIFFICULTIES.map((difficulty, index) => {
            const unlocked = isDifficultyUnlocked(difficulty.id, state.progress.points);
            const completed = state.progress.puzzlesCompleted[difficulty.id];
            return (
              <button
                type="button"
                className={`level-card${difficulty.id === playerDifficulty.id ? ' is-current' : ''}`}
                key={difficulty.id}
                onClick={() => unlocked && onStart(difficulty.id)}
                disabled={!unlocked}
                style={{ '--level-accent': difficulty.accent } as React.CSSProperties}
              >
                <span className="level-card__number">{index + 1}</span>
                <span className="level-card__copy">
                  <strong>{difficulty.title}</strong>
                  <small>{difficulty.shortDescription}</small>
                  <span>{unlocked ? `${completed} bulmaca tamamlandı` : `${difficulty.minPoints} puanda açılır`}</span>
                </span>
                <span className="level-card__action" aria-hidden="true">
                  {unlocked ? <ChevronRight /> : <LockKeyhole />}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
