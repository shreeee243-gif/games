import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { ChaosEventOverlay } from './components/ChaosEventOverlay';
import { GameHud } from './components/GameHud';
import { PauseModal } from './components/PauseModal';
import { ResultScreen } from './components/ResultScreen';
import { TitleScreen } from './components/TitleScreen';
import { Level01TrafficLights } from './components/levels/Level01TrafficLights';
import { Level02Buses } from './components/levels/Level02Buses';
import { Level03ClickDuck } from './components/levels/Level03ClickDuck';
import { Level04TypeWhatYouSee } from './components/levels/Level04TypeWhatYouSee';
import { Level05InvisibleObject } from './components/levels/Level05InvisibleObject';
import { Level06Water } from './components/levels/Level06Water';
import { Level07FollowInstructions } from './components/levels/Level07FollowInstructions';
import { Level08DragSquare } from './components/levels/Level08DragSquare';
import { Level09NotARobot } from './components/levels/Level09NotARobot';
import { Level10Impossible } from './components/levels/Level10Impossible';
import { Level11Sentient } from './components/levels/Level11Sentient';
import { Level12FinalBoss } from './components/levels/Level12FinalBoss';
import {
  LEVEL_METAS,
  MAX_RETRIES,
  TOTAL_LEVELS,
  calculateChaosLevel,
  pickSnarkyMessage,
} from './game/engine';
import type { ChaosEventState, GamePhase, LevelComponentProps, RunStats } from './game/types';
import { sound } from './utils/sound';

const LEVEL_COMPONENTS: React.FC<LevelComponentProps>[] = [
  Level01TrafficLights,
  Level02Buses,
  Level03ClickDuck,
  Level04TypeWhatYouSee,
  Level05InvisibleObject,
  Level06Water,
  Level07FollowInstructions,
  Level08DragSquare,
  Level09NotARobot,
  Level10Impossible,
  Level11Sentient,
  Level12FinalBoss,
];

const CHAOS_EVENTS_CATALOG: Omit<ChaosEventState, 'id'>[] = [
  {
    type: 'stuck-99',
    headline: 'HUMANITY SCAN STALLED',
    body: 'Verification bar permanently jammed at 99% while judging your browser tabs.',
  },
  {
    type: 'fake-crash',
    headline: 'CAPTCHAD.EXE STOPPED CARING',
    body: 'A fatal irony overflow occurred in module HUMAN_DOUBT.dll. Rebooting your dignity...',
  },
  {
    type: 'admin-message',
    headline: 'SysAdmin_Greg (Internal)',
    body: 'Hey sorry, the CAPTCHA gained consciousness again. Just keep clicking and do not make eye contact.',
  },
  {
    type: 'meta-verify',
    headline: 'META-VERIFICATION REQUIRED',
    body: 'Before continuing, please confirm you are not currently playing a CAPTCHA.',
  },
  {
    type: 'fake-success',
    headline: 'VERIFICATION COMPLETE',
    body: 'Congratulations!',
  },
];

function getInitialAutoStart(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(() =>
    getInitialAutoStart() ? 'playing' : 'title',
  );
  const [levelIdx, setLevelIdx] = useState(0);
  const [retriesLeft, setRetriesLeft] = useState(MAX_RETRIES);
  const [attempts, setAttempts] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [failedVerifications, setFailedVerifications] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [chaosBonus, setChaosBonus] = useState(0);
  const [muted, setMuted] = useState(false);

  const [systemFeedback, setSystemFeedback] = useState<{
    tone: 'neutral' | 'error' | 'success';
    text: string;
  }>({
    tone: 'neutral',
    text: 'Please remain calm. We are silently judging your clicks.',
  });

  const [shaking, setShaking] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [activeChaosEvent, setActiveChaosEvent] = useState<ChaosEventState | null>(null);
  const [cursorOverride, setCursorOverride] = useState<'none' | 'duck' | 'warn'>('none');
  const [finalStats, setFinalStats] = useState<RunStats | null>(null);

  const levelStartTimeRef = useRef<number>(Date.now());
  const lastSnarkRef = useRef<string>('');
  const chaosEventCursorRef = useRef<number>(0);

  const chaosLevel = useMemo(
    () => calculateChaosLevel(levelIdx, failedVerifications, chaosBonus),
    [levelIdx, failedVerifications, chaosBonus],
  );

  // Mirror state machine to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = phase;
  }, [phase]);

  // Run timer during active play
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const startFreshRun = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setPhase('playing');
    setLevelIdx(0);
    setRetriesLeft(MAX_RETRIES);
    setAttempts(0);
    setLevelAttempts(0);
    setFailedVerifications(0);
    setElapsedSeconds(0);
    setChaosBonus(0);
    setShuffleSeed(0);
    setActiveChaosEvent(null);
    setCursorOverride('none');
    setFinalStats(null);
    levelStartTimeRef.current = Date.now();
    setSystemFeedback({
      tone: 'neutral',
      text: 'Security checkpoint active. Prove you are made of meat.',
    });
  }, []);

  const triggerCursorChaos = useCallback((variant: 'duck' | 'warn') => {
    setCursorOverride(variant);
    window.setTimeout(() => {
      setCursorOverride('none');
    }, 5500);
  }, []);

  const triggerNextChaosEvent = useCallback(
    (forceType?: ChaosEventState['type']) => {
      const idx = chaosEventCursorRef.current % CHAOS_EVENTS_CATALOG.length;
      chaosEventCursorRef.current += 1;
      const picked =
        (forceType && CHAOS_EVENTS_CATALOG.find((e) => e.type === forceType)) ||
        CHAOS_EVENTS_CATALOG[idx];
      sound.glitch();
      setActiveChaosEvent({
        ...picked,
        id: `${picked.type}-${Date.now()}`,
      });
    },
    [],
  );

  // Keyboard shortcuts (Enter/Space on Title, Esc/P pause, M mute, R restart)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (phase === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          sound.click();
          startFreshRun();
        }
        return;
      }

      if (isTyping) {
        if (e.key === 'Escape' && phase === 'playing') {
          e.preventDefault();
          setPhase('paused');
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (phase === 'playing') {
          e.preventDefault();
          setPhase('paused');
        } else if (phase === 'paused') {
          e.preventDefault();
          setPhase('playing');
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const nextMuted = sound.toggleMute();
        setMuted(nextMuted);
      } else if (e.key.toLowerCase() === 'r' && (phase === 'playing' || phase === 'paused')) {
        e.preventDefault();
        startFreshRun();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, startFreshRun]);

  const finishGame = useCallback(
    (opts: { victory: boolean; surrendered?: boolean; clearedCount: number; finalFails: number; totalAttempts: number }) => {
      const snapshot: RunStats = {
        levelsCleared: opts.clearedCount,
        totalLevels: TOTAL_LEVELS,
        attempts: opts.totalAttempts,
        failedVerifications: opts.finalFails,
        elapsedSeconds,
        finalChaos: calculateChaosLevel(
          Math.min(TOTAL_LEVELS - 1, opts.clearedCount),
          opts.finalFails,
          chaosBonus,
        ),
        surrendered: Boolean(opts.surrendered),
        victory: opts.victory,
      };
      setFinalStats(snapshot);
      setActiveChaosEvent(null);
      setCursorOverride('none');
      if (opts.victory) {
        sound.victoryFanfare();
      } else {
        sound.defeatSting();
      }
      setPhase('gameover');
    },
    [chaosBonus, elapsedSeconds],
  );

  const handleLevelSuccess = useCallback(
    (customNote?: string) => {
      sound.success();
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      const levelElapsedMs = Date.now() - levelStartTimeRef.current;
      const nextIdx = levelIdx + 1;

      if (nextIdx >= TOTAL_LEVELS) {
        finishGame({
          victory: true,
          clearedCount: TOTAL_LEVELS,
          finalFails: failedVerifications,
          totalAttempts: nextAttempts,
        });
        return;
      }

      const feedbackMsg =
        customNote ||
        pickSnarkyMessage(
          {
            kind: levelElapsedMs < 3500 ? 'fast' : 'pass',
            levelId: levelIdx + 1,
            failedCount: failedVerifications,
          },
          lastSnarkRef.current,
        );
      lastSnarkRef.current = feedbackMsg;

      setSystemFeedback({ tone: 'success', text: feedbackMsg });
      setLevelIdx(nextIdx);
      setLevelAttempts(0);
      setShuffleSeed(0);
      levelStartTimeRef.current = Date.now();

      // Trigger funny chaotic random events at curated tension points (levels 3, 5, 7, 9, 11)
      if (nextIdx === 2) {
        triggerNextChaosEvent('admin-message');
      } else if (nextIdx === 4) {
        triggerNextChaosEvent('stuck-99');
      } else if (nextIdx === 6) {
        triggerNextChaosEvent('fake-success');
        triggerCursorChaos('duck');
      } else if (nextIdx === 8) {
        triggerNextChaosEvent('meta-verify');
      } else if (nextIdx === 10) {
        triggerNextChaosEvent('fake-crash');
        triggerCursorChaos('warn');
      }
    },
    [
      attempts,
      failedVerifications,
      finishGame,
      levelIdx,
      triggerCursorChaos,
      triggerNextChaosEvent,
    ],
  );

  const handleLevelFail = useCallback(
    (reason: string, consumeRetry = true) => {
      sound.wrong();
      setShaking(true);
      window.setTimeout(() => setShaking(false), 380);

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setLevelAttempts((a) => a + 1);

      if (!consumeRetry) {
        setSystemFeedback({ tone: 'error', text: reason });
        return;
      }

      const nextFails = failedVerifications + 1;
      const nextRetries = Math.max(0, retriesLeft - 1);
      setFailedVerifications(nextFails);
      setRetriesLeft(nextRetries);

      const extraSnark = pickSnarkyMessage(
        { kind: 'fail', levelId: levelIdx + 1, failedCount: nextFails },
        lastSnarkRef.current,
      );
      lastSnarkRef.current = extraSnark;

      setSystemFeedback({
        tone: 'error',
        text: reason || extraSnark,
      });

      // On grid levels (L2, L6, L10), sometimes shuffle tiles after a fail!
      if (levelIdx === 1 || levelIdx === 5 || levelIdx === 9) {
        setShuffleSeed((s) => s + 1);
      }

      if (nextRetries <= 0) {
        window.setTimeout(() => {
          finishGame({
            victory: false,
            clearedCount: levelIdx,
            finalFails: nextFails,
            totalAttempts: nextAttempts,
          });
        }, 450);
      }
    },
    [attempts, failedVerifications, finishGame, levelIdx, retriesLeft],
  );

  const handleSurrender = useCallback(() => {
    finishGame({
      victory: false,
      surrendered: true,
      clearedCount: levelIdx,
      finalFails: failedVerifications,
      totalAttempts: attempts + 1,
    });
  }, [attempts, failedVerifications, finishGame, levelIdx]);

  const handleManualShuffle = () => {
    sound.glitch();
    setShuffleSeed((s) => s + 1);
    setChaosBonus((b) => b + 2);
    setSystemFeedback({
      tone: 'neutral',
      text: 'Refreshed the CAPTCHA. Wait—it actually got slightly worse.',
    });
  };

  const handleDismissChaosEvent = useCallback((note?: string) => {
    setActiveChaosEvent(null);
    if (note) {
      setSystemFeedback({ tone: 'neutral', text: note });
    }
  }, []);

  if (phase === 'title') {
    return <TitleScreen onStart={startFreshRun} />;
  }

  if (phase === 'gameover' && finalStats) {
    return (
      <ResultScreen
        stats={finalStats}
        onPlayAgain={startFreshRun}
        onReturnTitle={() => setPhase('title')}
      />
    );
  }

  const currentMeta = LEVEL_METAS[levelIdx];
  const ActiveLevel = LEVEL_COMPONENTS[levelIdx];

  // Progressive visual tilt/chaos atmosphere at high chaos (never breaks readability)
  const chaosCardTilt =
    chaosLevel >= 88
      ? 'rotate-[-0.5deg] border-[#DC2626]/70'
      : chaosLevel >= 60
        ? 'border-[#DC2626]/40'
        : 'border-[#262B35]';

  const cursorClass =
    cursorOverride === 'duck'
      ? 'cursor-chaos-duck'
      : cursorOverride === 'warn'
        ? 'cursor-chaos-warn'
        : '';

  return (
    <div
      className={`captcha-bg-grid relative flex min-h-screen w-full flex-col justify-between ${cursorClass}`}
    >
      {/* Subtle CRT scanlines fade in as chaos rises */}
      {chaosLevel >= 35 && (
        <div
          className="crt-scanlines fixed inset-0 z-10"
          style={{ opacity: Math.min(0.45, (chaosLevel - 30) / 150) }}
          aria-hidden="true"
        />
      )}

      {/* Perimeter Game HUD */}
      <GameHud
        levelNumber={currentMeta.id}
        retriesLeft={retriesLeft}
        chaosLevel={chaosLevel}
        elapsedSeconds={elapsedSeconds}
        muted={muted}
        onToggleMute={() => setMuted(sound.toggleMute())}
        onPause={() => setPhase('paused')}
        onRestart={startFreshRun}
      />

      {/* Primary Center CAPTCHA Verification Widget */}
      <main className="relative z-20 mx-auto flex w-full max-w-[496px] flex-1 flex-col items-center justify-center px-4 py-3 sm:px-5">
        <div
          className={`w-full rounded-lg border bg-[#14161A] shadow-[0_24px_64px_rgba(0,0,0,0.65)] transition-transform duration-200 ${chaosCardTilt} ${
            shaking ? 'animate-shake' : ''
          }`}
        >
          {/* Sinister CAPTCHA Banner Header */}
          <div className="rounded-t-lg border-b border-[#252A34] bg-[#1A1D24] px-4 py-3.5">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-[#9BA1AE]">
              <span>
                {currentMeta.code} · {currentMeta.mechanic}
              </span>
              {chaosLevel >= 75 && (
                <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Hostile Mode
                </span>
              )}
            </div>
            <h1
              className={`mt-1 font-display text-xl font-bold tracking-tight text-[#F2F0EB] sm:text-[22px] ${
                chaosLevel >= 85 ? 'animate-glitch' : ''
              }`}
            >
              {currentMeta.title}
            </h1>
            <p className="mt-0.5 text-sm text-[#D1D5DB]">{currentMeta.prompt}</p>
            <p className="mt-0.5 text-xs text-[#9BA1AE]">{currentMeta.subPrompt}</p>
          </div>

          {/* Active Level Playfield */}
          <div className="p-4">
            <ActiveLevel
              key={currentMeta.id}
              levelMeta={currentMeta}
              chaosLevel={chaosLevel}
              levelAttempts={levelAttempts}
              shuffleSeed={shuffleSeed}
              onSuccess={handleLevelSuccess}
              onFail={handleLevelFail}
              onSurrender={handleSurrender}
              onChaosSpike={(amt) => setChaosBonus((b) => b + amt)}
            />
          </div>

          {/* Widget Footer: Contextual Sarcastic System Feedback + Refresh Gag */}
          <div className="flex items-center justify-between gap-3 rounded-b-lg border-t border-[#232730] bg-[#101217] px-4 py-2.5">
            <p
              role="status"
              aria-live="polite"
              className={`text-xs leading-snug ${
                systemFeedback.tone === 'error'
                  ? 'font-medium text-[#FCA5A5]'
                  : systemFeedback.tone === 'success'
                    ? 'font-medium text-[#86EFAC]'
                    : 'text-[#9BA1AE]'
              }`}
            >
              {systemFeedback.text}
            </p>
            <button
              type="button"
              onClick={handleManualShuffle}
              aria-label="Refresh CAPTCHA challenge"
              title="Refresh CAPTCHA (might make it worse)"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#262B35] bg-[#161920] text-[#9BA1AE] transition-colors hover:border-[#EF4444] hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom subtle hint bar */}
      <div className="relative z-20 pb-3 text-center font-mono text-[11px] text-[#5B6170]">
        Esc Pause · M Mute · R Restart
      </div>

      {/* Chaotic Random Events Overlay */}
      <ChaosEventOverlay
        event={activeChaosEvent}
        onDismiss={handleDismissChaosEvent}
      />

      {/* Pause Modal */}
      {phase === 'paused' && (
        <PauseModal
          levelNumber={currentMeta.id}
          elapsedSeconds={elapsedSeconds}
          chaosLevel={chaosLevel}
          onResume={() => setPhase('playing')}
          onRestart={startFreshRun}
          onTitle={() => setPhase('title')}
        />
      )}
    </div>
  );
}
