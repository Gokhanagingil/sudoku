import { useEffect, useRef, useState } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Modal } from './components/Modal';
import { useGameState } from './state/gameState';
import type { DifficultyId } from './domain/types';
import { playSoftTone } from './utils/audio';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

type Screen = 'home' | 'game' | 'result' | 'settings';

export default function App() {
  const { state, dispatch } = useGameState();
  const initialScreen: Screen = state.activeSession
    ? state.activeSession.completed ? 'result' : 'game'
    : 'home';
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [pendingDifficulty, setPendingDifficulty] = useState<DifficultyId | null>(null);
  const previousScreen = useRef<Screen>('home');
  const completionHandled = useRef(state.activeSession?.completed ?? false);

  useEffect(() => {
    if (screen !== 'game' || !state.activeSession?.completed || completionHandled.current) return;
    completionHandled.current = true;
    if (state.settings.sound) playSoftTone('complete');
    const timer = window.setTimeout(() => setScreen('result'), state.settings.reducedMotion ? 0 : 500);
    return () => window.clearTimeout(timer);
  }, [screen, state.activeSession?.completed, state.settings.reducedMotion, state.settings.sound]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let removeListener: (() => Promise<void>) | null = null;
    let active = true;
    void CapacitorApp.addListener('backButton', () => {
      if (pendingDifficulty) {
        setPendingDifficulty(null);
      } else if (screen === 'settings') {
        setScreen(previousScreen.current === 'settings' ? 'home' : previousScreen.current);
      } else if (screen === 'game' || screen === 'result') {
        setScreen('home');
      } else {
        void CapacitorApp.exitApp();
      }
    }).then((handle) => {
      if (!active) {
        void handle.remove();
      } else {
        removeListener = () => handle.remove();
      }
    });
    return () => {
      active = false;
      void removeListener?.();
    };
  }, [pendingDifficulty, screen]);

  const startImmediately = (difficultyId: DifficultyId) => {
    completionHandled.current = false;
    dispatch({ type: 'start', difficultyId, seed: Date.now() });
    setScreen('game');
  };

  const start = (difficultyId: DifficultyId) => {
    if (state.activeSession && !state.activeSession.completed) {
      setPendingDifficulty(difficultyId);
      return;
    }
    startImmediately(difficultyId);
  };

  const openSettings = () => {
    previousScreen.current = screen;
    setScreen('settings');
  };

  const classes = [
    'app',
    `theme-${state.settings.theme}`,
    `text-${state.settings.textScale}`,
    state.settings.highContrast ? 'high-contrast' : '',
    state.settings.reducedMotion ? 'reduced-motion' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {screen === 'home' ? (
        <HomeScreen
          state={state}
          onStart={start}
          onContinue={() => setScreen('game')}
          onSettings={openSettings}
        />
      ) : null}

      {screen === 'game' && state.activeSession ? (
        <GameScreen
          session={state.activeSession}
          settings={state.settings}
          dispatch={dispatch}
          onExit={() => setScreen('home')}
          onSettings={openSettings}
        />
      ) : null}

      {screen === 'result' && state.activeSession ? (
        <ResultScreen
          session={state.activeSession}
          settings={state.settings}
          progress={state.progress}
          onNext={() => startImmediately(state.activeSession!.puzzle.difficultyId)}
          onHome={() => {
            dispatch({ type: 'closeSession' });
            setScreen('home');
          }}
        />
      ) : null}

      {screen === 'settings' ? (
        <SettingsScreen
          settings={state.settings}
          dispatch={dispatch}
          onBack={() => setScreen(previousScreen.current === 'settings' ? 'home' : previousScreen.current)}
        />
      ) : null}

      {pendingDifficulty ? (
        <Modal title="Yeni bulmaca açılsın mı?" onClose={() => setPendingDifficulty(null)}>
          <p className="modal-copy">Devam eden bulmacan henüz tamamlanmadı. Yeni bulmaca açarsan o tahtadaki yerleştirmelerin ve notların silinir.</p>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={() => setPendingDifficulty(null)}>Kaldığım oyuna dön</button>
            <button type="button" className="danger-button" onClick={() => {
              const difficulty = pendingDifficulty;
              setPendingDifficulty(null);
              startImmediately(difficulty);
            }}>Yeni bulmaca aç</button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
