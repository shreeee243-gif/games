import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { ChaosEventOverlay } from './components/ChaosEventOverlay';
import { GameHud } from './components/GameHud';
import { LoadingScreen } from './components/LoadingScreen';
import { ModeSelectScreen } from './components/ModeSelectScreen';
import { OnboardingTutorial } from './components/OnboardingTutorial';
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
  TOTAL_LEVELS,
  calculateChaosLevel,
  calculateHumanityMetrics,
  createRunBlueprint,
  getEndlessStageConfig,
  markTutorialCompleted,
  parseChallengeFromSearch,
  recordDailyBest,
  recordEndlessBest,
} from './game/engine';
import {
  getSystemStatusNotice,
  maybePickUnsettlingLine,
  pickAdminNotice,
} from './game/narrative';
import {
  createInitialRunMemory,
  pickPersonalityDialogue,
} from './game/personality';
import type {
  ChaosEventState,
  ChaosScheduleEntry,
  FriendChallenge,
  GameMode,
  GamePhase,
  LevelComponentProps,
  RunBlueprint,
  RunMemory,
  RunStats,
  StageModifier,
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

function getInitialFriendChallenge(): FriendChallenge | null {
  if (typeof window === 'undefined') return null;
  return parseChallengeFromSearch(window.location.search);
}

interface StageClearedState {
  clearedStageNumber: number;
  clearedTitle: string;
  feedback: string;
  isUnsettling: boolean;
  nextStageIdx: number;
  isFinalVictory: boolean;
  nextAttempts: number;
  nextBosses: number;
}

export default function App() {
  const initialAutoStart = useMemo(() => getInitialAutoStart(), []);
  const [incomingChallenge, setIncomingChallenge] = useState<FriendChallenge | null>(
    () => getInitialFriendChallenge(),
  );
  const [activeChallenge, setActiveChallenge] = useState<FriendChallenge | null>(null);

  const [blueprint, setBlueprint] = useState<RunBlueprint>(() =>
    createRunBlueprint('classic'),
  );
  const [phase, setPhase] = useState<GamePhase>(() =>
    initialAutoStart ? 'playing' : 'title',
  );

  // stageIdx is 0-based progression step in current run (0..11 in standard modes, 0..∞ in endless)
  const [stageIdx, setStageIdx] = useState(0);
  const [retriesLeft, setRetriesLeft] = useState(blueprint.maxRetries);
  const [attempts, setAttempts] = useState(0);
  const [levelAttempts, setLevelAttempts] = useState(0);
  const [failedVerifications, setFailedVerifications] = useState(0);
  const [bossesDefeated, setBossesDefeated] = useState(0);
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
  const [anomaliesFound, setAnomaliesFound] = useState(0);
  const [stageResetKey, setStageResetKey] = useState(0);
  const [stagesClearedCount, setStagesClearedCount] = useState(0);
  const [stageCleared, setStageCleared] = useState<StageClearedState | null>(null);
  const [finalStats, setFinalStats] = useState<RunStats | null>(null);

  const levelStartTimeRef = useRef<number>(Date.now());
  const elapsedSecondsRef = useRef<number>(0);
  elapsedSecondsRef.current = elapsedSeconds;
  const runMemoryRef = useRef<RunMemory>(createInitialRunMemory());
  const lastDialogueRef = useRef<string>('');
  const pendingTimersRef = useRef<number[]>([]);
  const stageClearedRef = useRef<StageClearedState | null>(null);
  stageClearedRef.current = stageCleared;
  const pendingLossRef = useRef<boolean>(false);

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

  // Active stage configuration resolved from blueprint (supports all 5 modes including Endless waves)
  const activeStageConfig = useMemo<{
    levelIndex: number;
    modifier: StageModifier;
    isBossWave: boolean;
  }>(() => {
    if (blueprint.mode === 'endless') {
      return getEndlessStageConfig(blueprint.numericSeed, stageIdx);
    }
    const clampedIdx = Math.min(blueprint.stageIndices.length - 1, stageIdx);
    const levelIndex = blueprint.stageIndices[clampedIdx] ?? 0;
    const modifier = blueprint.stageModifiers[clampedIdx] ?? {
      id: 'none',
      label: 'Standard Audit',
      description: '',
    };
    return {
      levelIndex,
      modifier,
      isBossWave: levelIndex === TOTAL_LEVELS - 1,
    };
  }, [blueprint, stageIdx]);

  const chaosLevel = useMemo(() => {
    const modifierBonus =
      activeStageConfig.modifier.id === 'paranoid-audit' ? 8 : 0;
    const endlessClimb =
      blueprint.mode === 'endless' ? Math.min(35, stageIdx * 3) : 0;
    return calculateChaosLevel(
      Math.min(TOTAL_LEVELS - 1, stageIdx),
      failedVerifications,
      blueprint.baseChaosOffset + chaosBonus + modifierBonus + endlessClimb,
    );
  }, [
    activeStageConfig.modifier.id,
    blueprint.baseChaosOffset,
    blueprint.mode,
    chaosBonus,
    failedVerifications,
    stageIdx,
  ]);

  // Mirror state machine to document.body.dataset.state & sync Web Audio pause state
  useEffect(() => {
    document.body.dataset.state = phase;
    sound.setPaused(phase === 'paused');
  }, [phase]);

  // Run timer during active puzzle play (paused while viewing Stage Cleared feedback)
  useEffect(() => {
    if (phase !== 'playing' || stageCleared !== null) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, stageCleared]);

  const launchRun = useCallback(
    (
      mode: GameMode,
      customSeed?: string,
      opts?: {
        skipLoading?: boolean;
        challenge?: FriendChallenge | null;
        startStageIdx?: number;
      },
    ) => {
      clearPendingTimers();
      pendingLossRef.current = false;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      const nextBlueprint = createRunBlueprint(mode, customSeed);
      const nextMemory = createInitialRunMemory();
      runMemoryRef.current = nextMemory;
      const clampedStart = Math.max(
        0,
        Math.min(TOTAL_LEVELS - 1, opts?.startStageIdx ?? 0),
      );
      setBlueprint(nextBlueprint);
      setActiveChallenge(opts?.challenge ?? null);

      setStageIdx(clampedStart);
      setRetriesLeft(nextBlueprint.maxRetries);
      setAttempts(0);
      setLevelAttempts(0);
      setFailedVerifications(0);
      setBossesDefeated(0);
      setElapsedSeconds(0);
      setChaosBonus(0);
      setShuffleSeed(
        nextBlueprint.stageModifiers[clampedStart]?.id === 'scrambled-grid' ? 1 : 0,
      );
      setShaking(false);
      setCardFlash('none');
      setActiveChaosEvent(null);
      setCursorOverride('none');
      setAnomaliesFound(0);
      setStageResetKey((k) => k + 1);
      setStagesClearedCount(0);
      setStageCleared(null);
      setFinalStats(null);
      levelStartTimeRef.current = Date.now();

      const openingLine = pickPersonalityDialogue({
        personalityId: nextBlueprint.personality.id,
        event: 'opening',
        memory: nextMemory,
        stageNumber: clampedStart + 1,
        mode,
        lastMessage: '',
        seed: nextBlueprint.numericSeed,
      });
      lastDialogueRef.current = openingLine;
      setSystemFeedback({ tone: 'neutral', text: openingLine });
      setPhase(opts?.skipLoading ? 'playing' : 'loading');
    },
    [clearPendingTimers],
  );

  const handleRestartCurrentRun = useCallback(() => {
    // Restart same mode (if in a friend challenge, keep exact challenge seed!)
    launchRun(
      blueprint.mode,
      activeChallenge
        ? activeChallenge.seedCode
        : blueprint.mode === 'daily'
          ? blueprint.seedCode
          : undefined,
      { skipLoading: true, challenge: activeChallenge },
    );
  }, [activeChallenge, blueprint.mode, blueprint.seedCode, launchRun]);

  const handleBackToSelect = useCallback(() => {
    clearPendingTimers();
    pendingLossRef.current = false;
    sound.pauseToggle(false);
    sound.click();
    setStageCleared(null);
    setActiveChaosEvent(null);
    setCursorOverride('none');
    setPhase('modes');
  }, [clearPendingTimers]);

  const handleJumpToStage = useCallback(
    (targetIdx: number) => {
      if (blueprint.mode !== 'classic') return;
      const clamped = Math.max(0, Math.min(TOTAL_LEVELS - 1, targetIdx));
      clearPendingTimers();
      pendingLossRef.current = false;
      sound.click();
      setStageCleared(null);
      setActiveChaosEvent(null);
      setCursorOverride('none');
      setShaking(false);
      setCardFlash('none');
      setStageIdx(clamped);
      setStageResetKey((k) => k + 1);
      setLevelAttempts(0);
      setShuffleSeed(
        blueprint.stageModifiers[clamped]?.id === 'scrambled-grid' ? 1 : 0,
      );
      levelStartTimeRef.current = Date.now();
      const targetMeta = LEVEL_METAS[blueprint.stageIndices[clamped] ?? clamped];
      setSystemFeedback({
        tone: 'neutral',
        text: `Loaded Level ${clamped + 1}: ${targetMeta.title}.`,
      });
      setPhase('playing');
    },
    [blueprint.mode, blueprint.stageIndices, blueprint.stageModifiers, clearPendingTimers],
  );

  const handleLandingPlayNow = useCallback(() => {
    setPhase('modes');
  }, []);

  const handleTutorialFinish = useCallback(() => {
    markTutorialCompleted();
    setPhase('modes');
  }, []);

  const handleAcceptChallenge = useCallback(
    (challenge: FriendChallenge) => {
      markTutorialCompleted();
      launchRun(challenge.mode, challenge.seedCode, { challenge });
    },
    [launchRun],
  );

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
    (entry: ChaosScheduleEntry, targetStageNumber: number) => {
      const template =
        entry.type === 'admin-message'
          ? {
              type: 'admin-message' as const,
              ...pickAdminNotice(blueprint.numericSeed, targetStageNumber),
            }
          : CHAOS_EVENT_TEMPLATES[entry.type];
      sound.glitch();
      runMemoryRef.current.chaosEventsSurvived += 1;
      setActiveChaosEvent({
        ...template,
        id: `${entry.type}-${Date.now()}`,
      });
      if (entry.cursorVariant) {
        triggerCursorChaos(entry.cursorVariant);
      }
    },
    [blueprint.numericSeed, triggerCursorChaos],
  );

  const triggerCardFlash = useCallback(
    (tone: 'success' | 'error') => {
      setCardFlash(tone);
      scheduleTimeout(() => setCardFlash('none'), 340);
    },
    [scheduleTimeout],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractiveTarget =
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (phase === 'title') {
        if ((e.key === 'Enter' || e.key === ' ') && !isInteractiveTarget) {
          e.preventDefault();
          sound.click();
          if (incomingChallenge) {
            handleAcceptChallenge(incomingChallenge);
          } else {
            handleLandingPlayNow();
          }
        }
        return;
      }

      if (isTyping) {
        if (e.key === 'Escape' && phase === 'playing') {
          e.preventDefault();
          sound.pauseToggle(true);
          runMemoryRef.current.timesPaused += 1;
          setPhase('paused');
        }
        return;
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        if (phase === 'playing') {
          e.preventDefault();
          sound.pauseToggle(true);
          runMemoryRef.current.timesPaused += 1;
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
        handleRestartCurrentRun();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleAcceptChallenge,
    handleLandingPlayNow,
    handleRestartCurrentRun,
    incomingChallenge,
    phase,
  ]);

  const finishGame = useCallback(
    (opts: {
      victory: boolean;
      surrendered?: boolean;
      clearedCount: number;
      finalFails: number;
      totalAttempts: number;
      finalBossesDefeated: number;
    }) => {
      clearPendingTimers();
      const baseSnapshot: RunStats = {
        levelsCleared: opts.clearedCount,
        totalLevels: blueprint.mode === 'endless' ? Math.max(12, opts.clearedCount) : TOTAL_LEVELS,
        attempts: opts.totalAttempts,
        failedVerifications: opts.finalFails,
        elapsedSeconds: elapsedSecondsRef.current,
        finalChaos: calculateChaosLevel(
          Math.min(TOTAL_LEVELS - 1, opts.clearedCount),
          opts.finalFails,
          blueprint.baseChaosOffset + chaosBonus,
        ),
        surrendered: Boolean(opts.surrendered),
        victory: opts.victory,
        mode: blueprint.mode,
        seedCode: blueprint.seedCode,
        personalityId: blueprint.personality.id,
        bossesDefeated: opts.finalBossesDefeated,
        secretsDiscovered: [...runMemoryRef.current.secretsFound],
      };

      const metrics = calculateHumanityMetrics(baseSnapshot);
      const snapshot: RunStats = {
        ...baseSnapshot,
        score: metrics.score,
        humanityPct: metrics.humanityPct,
        rank: metrics.rank,
      };

      if (blueprint.mode === 'daily') {
        recordDailyBest(blueprint.seedCode, metrics.score, snapshot.elapsedSeconds);
      } else if (blueprint.mode === 'endless') {
        recordEndlessBest(opts.clearedCount);
      }

      setFinalStats(snapshot);
      setActiveChaosEvent(null);
      setCursorOverride('none');
      if (opts.victory || (blueprint.mode === 'endless' && opts.clearedCount >= 6)) {
        sound.victoryFanfare();
      } else {
        sound.defeatSting();
      }
      setPhase('gameover');
    },
    [blueprint, chaosBonus, clearPendingTimers],
  );

  const handleLevelSuccess = useCallback(
    (customNote?: string, secretId?: string) => {
      if (stageClearedRef.current || pendingLossRef.current) return;
      sound.success();
      triggerCardFlash('success');
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      const levelElapsedMs = Date.now() - levelStartTimeRef.current;
      const mem = runMemoryRef.current;
      mem.cleanStreak += 1;
      if (levelElapsedMs < 3500) mem.fastClears += 1;
      if (secretId && !mem.secretsFound.includes(secretId)) {
        mem.secretsFound.push(secretId);
        setAnomaliesFound(mem.secretsFound.length);
      }

      const clearedBoss = activeStageConfig.isBossWave;
      const nextBosses = clearedBoss ? bossesDefeated + 1 : bossesDefeated;
      if (clearedBoss) {
        setBossesDefeated(nextBosses);
      }

      const nextStageIdx = stageIdx + 1;
      setStagesClearedCount((c) => c + 1);
      const isFinalVictory =
        blueprint.mode !== 'endless' && nextStageIdx >= TOTAL_LEVELS;

      // Endless boss clear reward: +1 retry (capped at blueprint.maxRetries)
      if (blueprint.mode === 'endless' && clearedBoss) {
        setRetriesLeft((r) => Math.min(blueprint.maxRetries, r + 1));
      }

      const nextIsBoss = !isFinalVictory
        ? blueprint.mode === 'endless'
          ? getEndlessStageConfig(blueprint.numericSeed, nextStageIdx).isBossWave
          : blueprint.stageIndices[nextStageIdx] === TOTAL_LEVELS - 1
        : false;

      const dialogueEvent = secretId
        ? 'secret'
        : nextIsBoss
          ? 'boss-intro'
          : levelElapsedMs < 3500
            ? 'fast'
            : 'pass';

      const personalityLine = pickPersonalityDialogue({
        personalityId: blueprint.personality.id,
        event: dialogueEvent,
        memory: mem,
        stageNumber: nextStageIdx + 1,
        mode: blueprint.mode,
        lastMessage: lastDialogueRef.current,
      });

      const unsettlingLine =
        !secretId && !nextIsBoss && !isFinalVictory
          ? maybePickUnsettlingLine({
              stageNumber: nextStageIdx + 1,
              numericSeed: blueprint.numericSeed,
              memory: mem,
              lastMessage: lastDialogueRef.current,
            })
          : null;

      const feedbackMsg =
        unsettlingLine ??
        (secretId || nextIsBoss || !customNote ? personalityLine : customNote);
      lastDialogueRef.current = feedbackMsg;

      const clearedMeta = LEVEL_METAS[activeStageConfig.levelIndex];
      setSystemFeedback({
        tone: unsettlingLine ? 'neutral' : 'success',
        text: feedbackMsg,
      });
      setStageCleared({
        clearedStageNumber: stageIdx + 1,
        clearedTitle: clearedMeta.title,
        feedback: feedbackMsg,
        isUnsettling: Boolean(unsettlingLine),
        nextStageIdx,
        isFinalVictory,
        nextAttempts,
        nextBosses,
      });
    },
    [
      activeStageConfig.isBossWave,
      activeStageConfig.levelIndex,
      attempts,
      blueprint,
      bossesDefeated,
      stageIdx,
      triggerCardFlash,
    ],
  );

  const handleAdvanceFromCleared = useCallback(() => {
    const cleared = stageClearedRef.current;
    if (!cleared) return;
    sound.click();

    if (cleared.isFinalVictory) {
      setStageCleared(null);
      finishGame({
        victory: true,
        clearedCount: TOTAL_LEVELS,
        finalFails: failedVerifications,
        totalAttempts: cleared.nextAttempts,
        finalBossesDefeated: cleared.nextBosses,
      });
      return;
    }

    const nextMod =
      blueprint.mode === 'endless'
        ? getEndlessStageConfig(blueprint.numericSeed, cleared.nextStageIdx).modifier
        : blueprint.stageModifiers[cleared.nextStageIdx];

    setStageCleared(null);
    setStageIdx(cleared.nextStageIdx);
    setLevelAttempts(0);
    setShuffleSeed(nextMod?.id === 'scrambled-grid' ? 1 : 0);
    levelStartTimeRef.current = Date.now();

    const scheduleLookupIdx =
      blueprint.mode === 'endless' ? cleared.nextStageIdx % 11 : cleared.nextStageIdx;
    const scheduled = blueprint.eventSchedule.find(
      (ev) => ev.triggerLevelIdx === scheduleLookupIdx,
    );
    if (scheduled) {
      triggerScheduledChaosEvent(scheduled, cleared.nextStageIdx + 1);
    }
  }, [
    blueprint.eventSchedule,
    blueprint.mode,
    blueprint.numericSeed,
    blueprint.stageModifiers,
    failedVerifications,
    finishGame,
    triggerScheduledChaosEvent,
  ]);

  const handleLevelFail = useCallback(
    (reason: string, consumeRetry = true) => {
      if (stageClearedRef.current || pendingLossRef.current) return;
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

      const mem = runMemoryRef.current;
      mem.mistakeCount = nextFails;
      mem.cleanStreak = 0;

      const personalityFail = pickPersonalityDialogue({
        personalityId: blueprint.personality.id,
        event: nextRetries === 1 ? 'retry-low' : 'fail',
        memory: mem,
        stageNumber: stageIdx + 1,
        mode: blueprint.mode,
        lastMessage: lastDialogueRef.current,
      });
      lastDialogueRef.current = personalityFail;

      setSystemFeedback({
        tone: 'error',
        text: reason || personalityFail,
      });

      // Shuffle grid levels (L2, L6, L10) on fail for extra mischief
      const activeLvIdx = activeStageConfig.levelIndex;
      if (activeLvIdx === 1 || activeLvIdx === 5 || activeLvIdx === 9) {
        setShuffleSeed((s) => s + 1);
      }

      if (nextRetries <= 0) {
        pendingLossRef.current = true;
        scheduleTimeout(() => {
          pendingLossRef.current = false;
          finishGame({
            victory: false,
            clearedCount: stagesClearedCount,
            finalFails: nextFails,
            totalAttempts: nextAttempts,
            finalBossesDefeated: bossesDefeated,
          });
        }, 450);
      }
    },
    [
      activeStageConfig.levelIndex,
      attempts,
      blueprint.mode,
      blueprint.personality.id,
      bossesDefeated,
      failedVerifications,
      finishGame,
      retriesLeft,
      scheduleTimeout,
      stageIdx,
      stagesClearedCount,
      triggerCardFlash,
    ],
  );

  const handleSurrender = useCallback(() => {
    finishGame({
      victory: false,
      surrendered: true,
      clearedCount: stagesClearedCount,
      finalFails: failedVerifications,
      totalAttempts: attempts + 1,
      finalBossesDefeated: bossesDefeated,
    });
  }, [attempts, bossesDefeated, failedVerifications, finishGame, stagesClearedCount]);

  const handleManualShuffle = useCallback(() => {
    sound.glitch();
    setShuffleSeed((s) => s + 1);
    setChaosBonus((b) => b + 2);
    const mem = runMemoryRef.current;
    mem.refreshClicks += 1;
    if (mem.refreshClicks === 3 && !mem.secretsFound.includes('panic-refresh')) {
      mem.secretsFound.push('panic-refresh');
      setAnomaliesFound(mem.secretsFound.length);
    }
    const line = pickPersonalityDialogue({
      personalityId: blueprint.personality.id,
      event: 'refresh',
      memory: mem,
      stageNumber: stageIdx + 1,
      mode: blueprint.mode,
      lastMessage: lastDialogueRef.current,
    });
    lastDialogueRef.current = line;
    setSystemFeedback({ tone: 'neutral', text: line });
  }, [blueprint.mode, blueprint.personality.id, stageIdx]);

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
    runMemoryRef.current.timesPaused += 1;
    setPhase('paused');
  }, []);

  const handleResume = useCallback(() => {
    sound.pauseToggle(false);
    const line = pickPersonalityDialogue({
      personalityId: blueprint.personality.id,
      event: 'pause-return',
      memory: runMemoryRef.current,
      stageNumber: stageIdx + 1,
      mode: blueprint.mode,
      lastMessage: lastDialogueRef.current,
    });
    lastDialogueRef.current = line;
    setSystemFeedback({ tone: 'neutral', text: line });
    setPhase('playing');
  }, [blueprint.mode, blueprint.personality.id, stageIdx]);

  const handleChaosSpike = useCallback((amt: number) => {
    setChaosBonus((b) => b + amt);
  }, []);

  if (phase === 'title') {
    return (
      <TitleScreen
        incomingChallenge={incomingChallenge}
        onPlayNow={handleLandingPlayNow}
        onHowToPlay={() => setPhase('tutorial')}
        onAcceptChallenge={handleAcceptChallenge}
        onDismissChallenge={() => setIncomingChallenge(null)}
      />
    );
  }

  if (phase === 'tutorial') {
    return (
      <OnboardingTutorial
        onComplete={handleTutorialFinish}
        onSkip={handleTutorialFinish}
      />
    );
  }

  if (phase === 'modes') {
    return (
      <ModeSelectScreen
        onSelectMode={(mode, seed) => launchRun(mode, seed)}
        onSelectLevel={(levelIndex) =>
          launchRun('classic', undefined, {
            startStageIdx: levelIndex,
            skipLoading: true,
          })
        }
        onBackToTitle={() => setPhase('title')}
        onOpenTutorial={() => setPhase('tutorial')}
      />
    );
  }

  if (phase === 'loading') {
    return (
      <LoadingScreen
        blueprint={blueprint}
        onReady={() => {
          levelStartTimeRef.current = Date.now();
          setPhase('playing');
        }}
      />
    );
  }

  if (phase === 'gameover' && finalStats) {
    return (
      <ResultScreen
        stats={finalStats}
        friendChallenge={activeChallenge}
        onPlayAgain={handleRestartCurrentRun}
        onChangeMode={() => setPhase('modes')}
        onReturnTitle={() => setPhase('title')}
      />
    );
  }

  const currentMeta = LEVEL_METAS[activeStageConfig.levelIndex];
  const ActiveLevel = LEVEL_COMPONENTS[activeStageConfig.levelIndex];
  const activeModifier = activeStageConfig.modifier;
  const isLevelBlocked =
    phase === 'paused' ||
    stageCleared !== null ||
    (activeChaosEvent !== null && activeChaosEvent.type !== 'admin-message');

  const statusNotice = getSystemStatusNotice({
    stageNumber: stageIdx + 1,
    numericSeed: blueprint.numericSeed,
    chaosLevel,
    anomaliesFound,
  });

  const stageTitles =
    blueprint.mode === 'classic'
      ? blueprint.stageIndices.map((idx) => LEVEL_METAS[idx]?.title ?? '')
      : undefined;

  const cardBorderTone =
    stageCleared !== null || cardFlash === 'success'
      ? 'border-[#4E8A63]'
      : cardFlash === 'error'
        ? 'border-[#B84B4B]'
        : statusNotice.anomaly || chaosLevel >= 88
          ? 'border-[#B84B4B]/65'
          : 'border-[#333333]';

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
      {/* Minimal Corporate Verification HUD */}
      <GameHud
        stageNumber={stageIdx + 1}
        mode={blueprint.mode}
        seedCode={blueprint.seedCode}
        personalityName={blueprint.personality.name}
        retriesLeft={retriesLeft}
        maxRetries={blueprint.maxRetries}
        chaosLevel={chaosLevel}
        elapsedSeconds={elapsedSeconds}
        statusNotice={statusNotice}
        anomaliesFound={anomaliesFound}
        muted={muted}
        canJumpLevels={blueprint.mode === 'classic'}
        stageTitles={stageTitles}
        onSelectStage={handleJumpToStage}
        onBack={handleBackToSelect}
        onToggleMute={handleToggleMute}
        onPause={handlePause}
        onRestart={handleRestartCurrentRun}
      />

      {/* Primary Center CAPTCHA Verification Card */}
      <main className="mx-auto flex w-full max-w-[492px] flex-1 flex-col items-center justify-center px-4 py-4 sm:px-5">
        <div
          data-active-level={currentMeta.id}
          className={`w-full rounded-md border bg-[#191919] transition-colors duration-150 ${cardBorderTone} ${
            shaking ? 'animate-shake' : ''
          }`}
        >
          {/* Clean Verification Header + Explicit Instruction Box */}
          <div className="rounded-t-md border-b border-[#333333] bg-[#222222] px-4 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              <span>
                LEVEL {String(currentMeta.id).padStart(2, '0')} · {currentMeta.code} · {currentMeta.mechanic}
                {activeModifier.id !== 'none' ? ` · ${activeModifier.label}` : ''}
              </span>
              {chaosLevel >= 75 && (
                <span className="inline-flex items-center gap-1 font-semibold text-[#B84B4B]">
                  <ShieldAlert className="h-3 w-3" />
                  {chaosLevel >= 90 ? 'Unscripted Review' : 'Elevated Scrutiny'}
                </span>
              )}
            </div>
            <h1
              className={`mt-1 text-lg font-semibold tracking-tight text-[#EEEEEE] sm:text-xl ${
                statusNotice.anomaly ? 'animate-glitch' : ''
              }`}
            >
              {currentMeta.title}
            </h1>
            <div
              data-challenge-instruction="true"
              className="mt-2 rounded border border-[#333333] bg-[#161616] px-3 py-2"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                Instruction
              </div>
              <p className="mt-0.5 text-sm font-medium text-[#EEEEEE]">
                {currentMeta.prompt}
              </p>
              <p className="mt-0.5 text-xs text-[#929292]">{currentMeta.subPrompt}</p>
            </div>
          </div>

          {/* Active Level Playfield OR Stage Cleared Feedback Panel */}
          <div
            key={`${blueprint.numericSeed}-${stageIdx}-${stageResetKey}`}
            className="animate-stage-enter p-4"
          >
            {stageCleared ? (
              <div
                data-stage-cleared="true"
                role="status"
                aria-live="polite"
                className="space-y-4 rounded-md border border-[#4E8A63]/70 bg-[#152019] p-5 text-center"
              >
                <CheckCircle2 className="mx-auto h-9 w-9 text-[#89B898]" />
                <div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#89B898]">
                    Stage {String(stageCleared.clearedStageNumber).padStart(2, '0')} Verified
                  </div>
                  <h2 className="mt-1 text-lg font-semibold text-[#EEEEEE]">
                    {stageCleared.clearedTitle} — Passed
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#CCCCCC]">
                    {stageCleared.feedback}
                  </p>
                </div>

                <button
                  type="button"
                  data-next-stage="true"
                  autoFocus
                  onClick={handleAdvanceFromCleared}
                  className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded bg-[#4E8A63] px-5 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#417553]"
                >
                  {stageCleared.isFinalVictory
                    ? 'View Final Assessment'
                    : `Continue to Stage ${String(stageCleared.nextStageIdx + 1).padStart(2, '0')}`}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className={isLevelBlocked ? 'pointer-events-none opacity-60' : ''}>
                <ActiveLevel
                  levelMeta={currentMeta}
                  chaosLevel={chaosLevel}
                  levelAttempts={levelAttempts}
                  shuffleSeed={shuffleSeed}
                  runSeed={blueprint.numericSeed + stageIdx * 31}
                  isPaused={isLevelBlocked}
                  mode={blueprint.mode}
                  activeModifier={activeModifier}
                  onSuccess={handleLevelSuccess}
                  onFail={handleLevelFail}
                  onSurrender={handleSurrender}
                  onChaosSpike={handleChaosSpike}
                />
              </div>
            )}
          </div>

          {/* Widget Footer: Examiner Feedback + Refresh */}
          <div className="flex items-center justify-between gap-3 rounded-b-md border-t border-[#262626] bg-[#151515] px-4 py-2.5">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#777777]">
                {blueprint.personality.name}
              </div>
              <p
                role="status"
                aria-live="polite"
                className={`text-xs leading-snug transition-colors duration-150 ${
                  stageCleared
                    ? 'font-medium text-[#89B898]'
                    : systemFeedback.tone === 'error'
                      ? 'font-medium text-[#D48A8A]'
                      : systemFeedback.tone === 'success'
                        ? 'font-medium text-[#89B898]'
                        : 'text-[#B5B5B5]'
                }`}
              >
                {stageCleared
                  ? 'Stage verified. Click Continue above to advance.'
                  : systemFeedback.text}
              </p>
            </div>
            <button
              type="button"
              disabled={stageCleared !== null}
              onClick={handleManualShuffle}
              aria-label="Refresh CAPTCHA challenge"
              title="Refresh CAPTCHA (might make it worse)"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-[#333333] bg-[#222222] text-[#929292] transition-colors hover:border-[#666666] hover:text-[#EEEEEE] disabled:opacity-40 sm:h-9 sm:w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom subtle hint bar */}
      <div className="pb-3 text-center font-mono text-[11px] text-[#666666]">
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
          levelNumber={stageIdx + 1}
          isEndless={blueprint.mode === 'endless'}
          elapsedSeconds={elapsedSeconds}
          chaosLevel={chaosLevel}
          onResume={handleResume}
          onRestart={handleRestartCurrentRun}
          onChangeLevel={handleBackToSelect}
          onTitle={() => {
            clearPendingTimers();
            sound.pauseToggle(false);
            setStageCleared(null);
            setActiveChaosEvent(null);
            setPhase('title');
          }}
        />
      )}
    </div>
  );
}
