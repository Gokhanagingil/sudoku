import { ArrowRight, Home, Trophy } from 'lucide-react';
import { GameToken } from '../components/GameToken';
import { ProgressMeter } from '../components/ProgressMeter';
import { DIFFICULTY_BY_ID, getNextDifficulty, getPlayerDifficulty } from '../domain/difficulties';
import type { GameSession, GameSettings, PlayerProgress } from '../domain/types';

interface ResultScreenProps {
  session: GameSession;
  settings: GameSettings;
  progress: PlayerProgress;
  onNext: () => void;
  onHome: () => void;
}

export function ResultScreen({ session, settings, progress, onNext, onHome }: ResultScreenProps) {
  const difficulty = DIFFICULTY_BY_ID[session.puzzle.difficultyId];
  const playerDifficulty = getPlayerDifficulty(progress.points);
  const nextDifficulty = getNextDifficulty(progress.points);
  const previousPoints = Math.max(0, progress.points - session.earnedPoints);
  const newlyUnlocked = playerDifficulty.minPoints > previousPoints ? playerDifficulty : null;

  return (
    <main className="result-screen page-shell">
      <section className="result-card">
        <div className="result-sky" aria-hidden="true">
          <span className="result-token result-token--one"><GameToken value={1} theme={settings.theme} showNumber={settings.showNumbers} /></span>
          <span className="result-token result-token--two"><GameToken value={Math.min(2, session.puzzle.spec.size)} theme={settings.theme} showNumber={settings.showNumbers} /></span>
          <span className="result-spark result-spark--one">✦</span><span className="result-spark result-spark--two">✦</span>
        </div>
        <span className="result-icon"><Trophy aria-hidden="true" /></span>
        <span className="eyebrow">KÖY TAMAMLANDI</span>
        <h1>Eline sağlık!</h1>
        <p>{difficulty.title} bulmacasını tamamladın. Bütün simgeler kendi yuvasını buldu.</p>

        <div className="points-earned">
          <span>Bu bulmaca</span>
          <strong>+{session.earnedPoints} puan</strong>
          <small>İpucu kullanmak kazanılan puanı azaltmaz.</small>
        </div>

        {newlyUnlocked && newlyUnlocked.id !== 'acemi' ? (
          <div className="unlock-banner"><Trophy aria-hidden="true" /><div><strong>{newlyUnlocked.title} seviyesi açıldı!</strong><span>Yeni bulmaca düzenleri seni bekliyor.</span></div></div>
        ) : null}

        <div className="result-progress">
          <div><span>Oyuncu seviyen</span><strong>{playerDifficulty.title}</strong></div>
          {nextDifficulty ? (
            <ProgressMeter
              value={progress.points - playerDifficulty.minPoints}
              max={nextDifficulty.minPoints - playerDifficulty.minPoints}
              label={`${nextDifficulty.title} için ${nextDifficulty.minPoints - progress.points} puan kaldı`}
            />
          ) : <ProgressMeter value={1} max={1} label="Pro yolculuğu tamamlandı" />}
        </div>

        <div className="result-actions">
          <button type="button" className="primary-button" onClick={onNext}>Yeni bulmaca <ArrowRight aria-hidden="true" /></button>
          <button type="button" className="secondary-button" onClick={onHome}><Home aria-hidden="true" /> Ana ekrana dön</button>
        </div>
      </section>
    </main>
  );
}
