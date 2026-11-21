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
import { CAPTCHA_IMAGES } from './game/assets';
import {
  LEVEL_METAS,
  MAX_RETRIES,
  TOTAL_LEVELS,
  calculateChaosLevel,
  createRunEventSchedule,
  pickSnarkyMessage,
} from './game/engine';
import type {
  ChaosEventState,
  ChaosScheduleEntry,
  GamePhase,
  LevelComponentProps,
  RunStats,
} from './game/types';
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

const CHAOS_EVENT_TEMPLATES: Record<
  ChaosScheduleEntry['type'],
  Omit<ChaosEventState, 'id'>
> = {
  'stuck-99': {
    type: 'stuck-99',
    headline: 'HUMANITY SCAN STALLED',
    body: 'Verification bar permanently jammed at 99% while judging your browser tabs.',
  },
  'fake-crash': {
    type: 'fake-crash',
    headline: 'CAPTCHAD.EXE STOPPED CARING',
    body: 'A fatal irony overflow occurred in module HUMAN_DOUBT.dll. Rebooting your dignity...',
  },
  'admin-message': {
    type: 'admin-message',
    headline: 'SysAdmin_Greg (Internal)',
    body: 'Hey sorry, the CAPTCHA gained consciousness again. Just keep clicking and do not make eye contact.',
  },
  'meta-verify': {
    type: 'meta-verify',
    headline: 'META-VERIFICATION REQUIRED',
    body: 'Before continuing, please confirm you are not currently playing a CAPTCHA.',
  },
  'fake-success': {
    type: 'fake-success',
    headline: 'VERIFICATION COMPLETE',
    body: 'Congratulations!',
  },
};

function getInitialAutoStart(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('autostart') === '1';
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(() =>
    getInitialAutoStart() ? 'playing' : 'title',
  );
  const [runSeed, setRunSeed] = useState<number>(() => Date.now());
  const [eventSchedule, setEventSchedule] = useState<ChaosScheduleEntry[]>(() =>
    createRunEventSchedule(Date.now()),
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
  const [cardFlash, setCardFlash] = useState<'none' | 'success' | 'error'>('none');
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [activeChaosEvent, setActiveChaosEvent] = useState<ChaosEventState | null>(null);
  const [cursorOverride, setCursorOverride] = useState<'none' | 'duck' | 'warn'>('none');
  const [finalStats, setFinalStats] = useState<RunStats | null>(null);

  const levelStartTimeRef = useRef<number>(Date.now());
  const lastSnarkRef = useRef<string>('');
  const pendingTimersRef = useRef<number[]>([]);

  const clearPendingTimers = useCallback(() => {
    pendingTimersRef.current.forEach((id) => window.clearTimeout(id));
    pendingTimersRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      pendingTimersRef.current = pendingTimersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    pendingTimersRef.current.push(id);
    return id;
  }, []);

  // Preload all 6 generated CAPTCHA photos once so later levels render instantly
  useEffect(() => {
    Object.values(CAPTCHA_IMAGES).forEach((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
    return clearPendingTimers;
  }, [clearPendingTimers]);

  const chaosLevel = useMemo(
    () => calculateChaosLevel(levelIdx, failedVerifications, chaosBonus),
    [levelIdx, failedVerifications, chaosBonus],
  );

  // Mirror state machine to document.body.dataset.state & sync Web Audio pause state
  useEffect(() => {
    document.body.dataset.state = phase;
    sound.setPaused(phase === 'paused');
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
    clearPendingTimers();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const nextSeed = Date.now() + Math.floor(Math.random() * 10000);
    setRunSeed(nextSeed);
    setEventSchedule(createRunEventSchedule(nextSeed));
    setPhase('playing');
    setLevelIdx(0);
    setRetriesLeft(MAX_RETRIES);
    setAttempts(0);
    setLevelAttempts(0);
    setFailedVerifications(0);
    setElapsedSeconds(0);
    setChaosBonus(0);
    setShuffleSeed(0);
    setShaking(false);
    setCardFlash('none');
    setActiveChaosEvent(null);
    setCursorOverride('none');
    setFinalStats(null);
    levelStartTimeRef.current = Date.now();
    setSystemFeedback({
      tone: 'neutral',
      text: 'Security checkpoint active. Prove you are made of meat.',
    });
  }, [clearPendingTimers]);

  const triggerCursorChaos = useCallback(
    (variant: 'duck' | 'warn') => {
      setCursorOverride(variant);
      scheduleTimeout(() => {
        setCursorOverride('none');
      }, 5500);
    },
    [scheduleTimeout],
  );

  const triggerScheduledChaosEvent = useCallback(
    (entry: ChaosScheduleEntry) => {
      const template = CHAOS_EVENT_TEMPLATES[entry.type];
      sound.glitch();
      setActiveChaosEvent({
        ...template,
        id: `${entry.type}-${Date.now()}`,
      });
      if (entry.cursorVariant) {
        triggerCursorChaos(entry.cursorVariant);
      }
    },
    [triggerCursorChaos],
  );

  const triggerCardFlash = useCallback(
    (tone: 'success' | 'error') => {
      setCardFlash(tone);
      scheduleTimeout(() => setCardFlash('none'), 340);
    },
    [scheduleTimeout],
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
          sound.pauseToggle(true);
          setPhase('paused');
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (phase === 'playing') {
          e.preventDefault();
          sound.pauseToggle(true);
          setPhase('paused');
        } else if (phase === 'paused') {
          e.preventDefault();
          sound.pauseToggle(false);
          setPhase('playing');
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const nextMuted = sound.toggleMute();
        setMuted(nextMuted);
      } else if (e.key.toLowerCase() === 'r' && (phase === 'playing' || phase === 'paused')) {
        e.preventDefault();
        sound.click();
        startFreshRun();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, startFreshRun]);

  const finishGame = useCallback(
    (opts: {
      victory: boolean;
      surrendered?: boolean;
      clearedCount: number;
      finalFails: number;
      totalAttempts: number;
    }) => {
      clearPendingTimers();
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
    [chaosBonus, clearPendingTimers, elapsedSeconds],
  );

  const handleLevelSuccess = useCallback(
    (customNote?: string) => {
      sound.success();
      triggerCardFlash('success');
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

      // Check randomized run chaos schedule for this stage transition
      const scheduled = eventSchedule.find((ev) => ev.triggerLevelIdx === nextIdx);
      if (scheduled) {
        triggerScheduledChaosEvent(scheduled);
      }
    },
    [
      attempts,
      eventSchedule,
      failedVerifications,
      finishGame,
      levelIdx,
      triggerCardFlash,
      triggerScheduledChaosEvent,
    ],
  );

  const handleLevelFail = useCallback(
    (reason: string, consumeRetry = true) => {
      sound.wrong();
      triggerCardFlash('error');
      setShaking(true);
      scheduleTimeout(() => setShaking(false), 380);

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

      // On grid levels (L2, L6, L10), shuffle tiles after a fail for extra mischief
      if (levelIdx === 1 || levelIdx === 5 || levelIdx === 9) {
        setShuffleSeed((s) => s + 1);
      }

      if (nextRetries <= 0) {
        scheduleTimeout(() => {
          finishGame({
            victory: false,
            clearedCount: levelIdx,
            finalFails: nextFails,
            totalAttempts: nextAttempts,
          });
        }, 450);
      }
    },
    [
      attempts,
      failedVerifications,
      finishGame,
      levelIdx,
      retriesLeft,
      scheduleTimeout,
      triggerCardFlash,
    ],
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

  const handleManualShuffle = useCallback(() => {
    sound.glitch();
    setShuffleSeed((s) => s + 1);
    setChaosBonus((b) => b + 2);
    setSystemFeedback({
      tone: 'neutral',
      text: 'Refreshed the CAPTCHA. Wait—it actually got slightly worse.',
    });
  }, []);

  const handleDismissChaosEvent = useCallback((note?: string) => {
    setActiveChaosEvent(null);
    if (note) {
      setSystemFeedback({ tone: 'neutral', text: note });
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    setMuted(sound.toggleMute());
  }, []);

  const handlePause = useCallback(() => {
    sound.pauseToggle(true);
    setPhase('paused');
  }, []);

  const handleResume = useCallback(() => {
    sound.pauseToggle(false);
    setPhase('playing');
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

  // Progressive 5-tier chaos atmosphere (never hurts readability)
  const chaosCardFrame =
    cardFlash === 'success'
      ? 'border-[#22C55E] shadow-[0_0_32px_rgba(34,197,94,0.22)]'
      : cardFlash === 'error'
        ? 'border-[#EF4444] shadow-[0_0_34px_rgba(239,68,68,0.28)]'
        : chaosLevel >= 90
          ? 'rotate-[-0.55deg] border-[#DC2626]/80 shadow-[0_24px_64px_rgba(220,38,38,0.2)]'
          : chaosLevel >= 70
            ? 'rotate-[0.25deg] border-[#DC2626]/55 shadow-[0_24px_64px_rgba(0,0,0,0.7)]'
            : chaosLevel >= 45
              ? 'border-[#991B1B]/60 shadow-[0_24px_64px_rgba(0,0,0,0.68)]'
              : 'border-[#262B35] shadow-[0_24px_64px_rgba(0,0,0,0.65)]';

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
      {/* Progressive peripheral red tension vignette as chaos climbs */}
      {chaosLevel >= 45 && (
        <div
          className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(circle at center, transparent 52%, rgba(220,38,38,0.22) 100%)',
            opacity: Math.min(1, (chaosLevel - 40) / 60),
          }}
          aria-hidden="true"
        />
      )}

      {/* Subtle CRT scanlines fade in progressively as chaos rises */}
      {chaosLevel >= 25 && (
        <div
          className="crt-scanlines fixed inset-0 z-10"
          style={{ opacity: Math.min(0.42, (chaosLevel - 20) / 170) }}
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
        onToggleMute={handleToggleMute}
        onPause={handlePause}
        onRestart={startFreshRun}
      />

      {/* Primary Center CAPTCHA Verification Widget */}
      <main className="relative z-20 mx-auto flex w-full max-w-[496px] flex-1 flex-col items-center justify-center px-4 py-3 sm:px-5">
        <div
          className={`w-full rounded-lg border bg-[#14161A] transition-[transform,border-color,box-shadow] duration-200 ${chaosCardFrame} ${
            shaking ? 'animate-shake' : ''
          }`}
        >
          {/* Sinister CAPTCHA Banner Header */}
          <div className="rounded-t-lg border-b border-[#252A34] bg-[#1A1D24] px-4 py-3.5">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-[#9BA1AE]">
              <span>
                {currentMeta.code} · {currentMeta.mechanic}
              </span>
              {chaosLevel >= 70 && (
                <span className="inline-flex items-center gap-1 font-semibold text-[#EF4444]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {chaosLevel >= 90 ? 'Sentient Override' : 'Hostile Mode'}
                </span>
              )}
            </div>
            <h1
              className={`mt-1 font-display text-xl font-bold tracking-tight text-[#F2F0EB] sm:text-[22px] ${
                chaosLevel >= 80 ? 'animate-glitch' : ''
              }`}
            >
              {currentMeta.title}
            </h1>
            <p className="mt-0.5 text-sm text-[#D1D5DB]">{currentMeta.prompt}</p>
            <p className="mt-0.5 text-xs text-[#9BA1AE]">{currentMeta.subPrompt}</p>
          </div>

          {/* Active Level Playfield with crisp entry transition */}
          <div key={currentMeta.id} className="animate-stage-enter p-4">
            <ActiveLevel
              levelMeta={currentMeta}
              chaosLevel={chaosLevel}
              levelAttempts={levelAttempts}
              shuffleSeed={shuffleSeed}
              runSeed={runSeed}
              isPaused={phase === 'paused'}
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
              className={`text-xs leading-snug transition-colors duration-150 ${
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
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#262B35] bg-[#161920] text-[#9BA1AE] transition-all duration-150 hover:border-[#EF4444] hover:text-white active:scale-95"
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
          onResume={handleResume}
          onRestart={startFreshRun}
          onTitle={() => {
            sound.pauseToggle(false);
            setPhase('title');
          }}
        />
      )}
    </div>
  );
}
