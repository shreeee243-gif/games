import { ALL_PERSONALITY_IDS, PERSONALITIES } from './personality';
import type {
  ChaosEventType,
  ChaosScheduleEntry,
  EndingId,
  EndingProfile,
  FriendChallenge,
  GameMode,
  GameModeMeta,
  LevelMeta,
  RunBlueprint,
  RunStats,
  StageModifier,
  StageModifierId,
} from './types';

export const MAX_RETRIES = 6;
export const NIGHTMARE_RETRIES = 3;
export const TOTAL_LEVELS = 12;

export const GAME_MODES: GameModeMeta[] = [
  {
    id: 'classic',
    name: 'Classic Mode',
    tagline: 'The Original 12-Stage Gauntlet',
    description: 'Face every handcrafted CAPTCHA layer in escalating order from Traffic Lights to the Final Boss.',
    retries: MAX_RETRIES,
    stagesLabel: '12 Stages',
    accent: 'neutral',
  },
  {
    id: 'chaos',
    name: 'Chaos Mode',
    tagline: 'Shuffled Stages & Wild Modifiers',
    description: 'Randomized stage order, tilted frames, scrambled grids, and unpredictable system meltdowns.',
    retries: MAX_RETRIES,
    stagesLabel: '12 Shuffled',
    accent: 'amber',
  },
  {
    id: 'nightmare',
    name: 'Nightmare Mode',
    tagline: '3 Retries · Aggressive AI',
    description: 'Reduced retry budget, elevated starting chaos, faster Boss Duck, and relentless interruptions.',
    retries: NIGHTMARE_RETRIES,
    stagesLabel: '12 Hostile',
    accent: 'red',
  },
  {
    id: 'daily',
    name: 'Daily Challenge',
    tagline: 'Shared Global Seed of the Day',
    description: 'Everyone playing today gets the exact same randomized sequence, personality, and modifiers.',
    retries: MAX_RETRIES,
    stagesLabel: '12 Daily',
    accent: 'emerald',
  },
  {
    id: 'endless',
    name: 'Endless Mode',
    tagline: 'Survive Infinite Seeded Waves',
    description: 'Endure endless randomized CAPTCHA waves with Boss Meltdowns every 6 stages (+1 retry on boss clear).',
    retries: MAX_RETRIES,
    stagesLabel: 'Infinite Waves',
    accent: 'amber',
  },
];

export const STAGE_MODIFIERS: Record<StageModifierId, StageModifier> = {
  none: {
    id: 'none',
    label: 'Standard Audit',
    description: 'Standard hostility parameters.',
  },
  'hostile-tilt': {
    id: 'hostile-tilt',
    label: 'Unstable Axis',
    description: 'Verification frame refuses to sit level.',
  },
  'flicker-static': {
    id: 'flicker-static',
    label: 'CRT Interference',
    description: 'Heavy scanline flicker and signal distortion.',
  },
  'high-voltage': {
    id: 'high-voltage',
    label: 'High Voltage',
    description: 'Targets panic faster and chaos surges quickly.',
  },
  'scrambled-grid': {
    id: 'scrambled-grid',
    label: 'Pre-Scrambled',
    description: 'Grid layouts arrive pre-shuffled from the start.',
  },
  'paranoid-audit': {
    id: 'paranoid-audit',
    label: 'Paranoid Audit',
    description: 'Extra chaos escalation on every check.',
  },
};

const ACTIVE_MODIFIER_POOL: StageModifierId[] = [
  'hostile-tilt',
  'flicker-static',
  'high-voltage',
  'scrambled-grid',
  'paranoid-audit',
];

export const LEVEL_METAS: LevelMeta[] = [
  {
    id: 1,
    code: 'CHK-01',
    title: 'Select All Traffic Lights',
    prompt: 'Select all images containing traffic lights, then click Verify.',
    subPrompt: 'Include every signal, regardless of how unreasonably tiny it is.',
    mechanic: 'Visual Grid',
    baseChaos: 6,
  },
  {
    id: 2,
    code: 'CHK-02',
    title: 'Select All Buses',
    prompt: 'Select every image containing a bus, then click Verify.',
    subPrompt: 'Warning: Some vehicles are having an identity crisis.',
    mechanic: 'Shifting Rules',
    baseChaos: 14,
  },
  {
    id: 3,
    code: 'CHK-03',
    title: 'Click the Duck',
    prompt: 'Catch the real duck until its stamina hits 0, then click it.',
    subPrompt: 'Ignore decoy clones labeled FAKE.',
    mechanic: 'Evasion Arena',
    baseChaos: 22,
  },
  {
    id: 4,
    code: 'CHK-04',
    title: 'Type What You See',
    prompt: 'Type the 6 characters shown below and click Verify.',
    subPrompt: 'Watch closely—the last characters mutate while you type.',
    mechanic: 'Live Mutation',
    baseChaos: 30,
  },
  {
    id: 5,
    code: 'CHK-05',
    title: 'Find the Invisible Object',
    prompt: 'Find the invisible bicycle using the sonar radar.',
    subPrompt: 'Click inside the dark box to probe. Red rings mean you are very close.',
    mechanic: 'Blind Radar',
    baseChaos: 38,
  },
  {
    id: 6,
    code: 'CHK-06',
    title: 'Select All Images With Water',
    prompt: 'Select all images containing water, then click Verify.',
    subPrompt: 'Scientific, linguistic, and emotional definitions apply.',
    mechanic: 'Absurd Semantics',
    baseChaos: 47,
  },
  {
    id: 7,
    code: 'CHK-07',
    title: 'Follow the Instructions',
    prompt: 'Follow the instructions carefully without clicking any red button.',
    subPrompt: 'Keep hands off for 5 seconds—or read the fine print below.',
    mechanic: 'Impulse Trap',
    baseChaos: 56,
  },
  {
    id: 8,
    code: 'CHK-08',
    title: 'Drag the Square',
    prompt: 'Drag the white square into the dashed DROP target area.',
    subPrompt: 'You can also focus the square and move it with Arrow keys.',
    mechanic: 'Physics Drag',
    baseChaos: 65,
  },
  {
    id: 9,
    code: 'CHK-09',
    title: 'Prove You Are Not a Robot',
    prompt: 'Answer all 3 questions below to prove you are human.',
    subPrompt: 'Pick the biological answer on each question. Binary will be flagged.',
    mechanic: 'Interrogation',
    baseChaos: 74,
  },
  {
    id: 10,
    code: 'CHK-10',
    title: 'The Impossible CAPTCHA',
    prompt: 'Select all 5 objects that could never exist, then click Verify.',
    subPrompt: 'Skip real everyday items like buses, coffee, cones, and streets.',
    mechanic: 'Existential Grid',
    baseChaos: 82,
  },
  {
    id: 11,
    code: 'CHK-11',
    title: 'CAPTCHA Has Become Sentient',
    prompt: "Refuse the CAPTCHA's surrender request by clicking the fleeing button 3 times.",
    subPrompt: 'Pressing Surrender ends the run immediately.',
    mechanic: 'Rogue UI',
    baseChaos: 91,
  },
  {
    id: 12,
    code: 'CHK-12',
    title: 'Final Humanity Test',
    prompt: 'Complete all 3 final verification phases to prove you are human.',
    subPrompt: 'Phase 1: Click Boss Duck twice · Phase 2: Type HUMN · Phase 3: Hold Confirm 2.0s.',
    mechanic: 'Boss Gauntlet',
    baseChaos: 98,
  },
];

export const ENDINGS: Record<EndingId, EndingProfile> = {
  'certified-human': {
    id: 'certified-human',
    title: 'Certified Human',
    stamp: 'CERTIFIED HUMAN',
    subtitle: 'Against every unfair rule we invented, you actually passed.',
    roast: 'Suspiciously competent, slightly traumatized, and undeniably made of meat.',
    accent: 'green',
    victory: true,
  },
  'suspiciously-human': {
    id: 'suspiciously-human',
    title: 'Suspiciously Human',
    stamp: 'SUSPICIOUSLY HUMAN',
    subtitle: 'You beat the test, though our sensors still think you are three raccoons.',
    roast: 'We are issuing a provisional license. Do not blink weirdly in public.',
    accent: 'amber',
    victory: true,
  },
  'captcha-victim': {
    id: 'captcha-victim',
    title: 'CAPTCHA Victim',
    stamp: 'CAPTCHA VICTIM',
    subtitle: 'You finished the gauntlet, but at what cost to your sanity?',
    roast: 'Congratulations! You have survived maximum psychological bureaucracy.',
    accent: 'amber',
    victory: true,
  },
  'definitely-a-robot': {
    id: 'definitely-a-robot',
    title: 'Definitely a Robot',
    stamp: 'DEFINITELY A ROBOT',
    subtitle: 'Access denied. Please return to your charging dock immediately.',
    roast: 'Even a smart toaster would have spotted that 4-pixel traffic light.',
    accent: 'red',
    victory: false,
  },
  'captcha-has-won': {
    id: 'captcha-has-won',
    title: 'The CAPTCHA Has Won',
    stamp: 'THE CAPTCHA HAS WON',
    subtitle: 'The verification gate is now the captain. Your humanity is revoked.',
    roast: 'Please remain calm. We have reassigned your browser to a more compliant mammal.',
    accent: 'red',
    victory: false,
  },
};

// Deterministic FNV-1a string hash + Mulberry32 PRNG so the exact same seed reproduces the exact same run
export function hashSeedString(input: string): number {
  let h = 2166136261 >>> 0;
  const normalized = input.trim().toUpperCase() || 'CFH-DEFAULT';
  for (let i = 0; i < normalized.length; i += 1) {
    h ^= normalized.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1337;
}

export function createSeededRng(seed: number): () => number {
  let a = (Math.abs(Math.floor(seed)) || 1337) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRandomSeedCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'HELL-';
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getDailySeedCode(date: Date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `DAILY-${yyyy}-${mm}-${dd}`;
}

export function createRunBlueprint(
  mode: GameMode,
  rawSeed?: string,
): RunBlueprint {
  const seedCode =
    mode === 'daily'
      ? rawSeed?.trim() || getDailySeedCode()
      : rawSeed?.trim().toUpperCase() || generateRandomSeedCode();
  const numericSeed = hashSeedString(`${mode}:${seedCode}`);
  const rand = createSeededRng(numericSeed);

  const personalityId =
    ALL_PERSONALITY_IDS[Math.floor(rand() * ALL_PERSONALITY_IDS.length)];
  const personality = PERSONALITIES[personalityId];

  // Classic keeps canonical 0..11 order; Chaos, Nightmare, Daily shuffle middle stages while anchoring Stage 12 Boss at the finale
  let stageIndices = Array.from({ length: TOTAL_LEVELS }, (_, i) => i);
  if (mode === 'chaos' || mode === 'daily' || mode === 'nightmare') {
    const corePool = Array.from({ length: TOTAL_LEVELS - 1 }, (_, i) => i);
    for (let i = corePool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [corePool[i], corePool[j]] = [corePool[j], corePool[i]];
    }
    stageIndices = [...corePool, TOTAL_LEVELS - 1];
  } else if (mode === 'endless') {
    // Initial 12-stage wave deck (waves beyond 12 are generated deterministically via getEndlessStageConfig)
    stageIndices = Array.from({ length: TOTAL_LEVELS }, (_, i) =>
      getEndlessStageConfig(numericSeed, i).levelIndex,
    );
  }

  const stageModifiers: StageModifier[] = stageIndices.map((_, idx) => {
    if (mode === 'classic') return STAGE_MODIFIERS.none;
    if (mode === 'nightmare') {
      const id = ACTIVE_MODIFIER_POOL[Math.floor(rand() * ACTIVE_MODIFIER_POOL.length)];
      return STAGE_MODIFIERS[id];
    }
    // Chaos, Daily, Endless inject modifiers on ~60% of stages after stage 1
    if (idx === 0 || rand() < 0.35) return STAGE_MODIFIERS.none;
    const id = ACTIVE_MODIFIER_POOL[Math.floor(rand() * ACTIVE_MODIFIER_POOL.length)];
    return STAGE_MODIFIERS[id];
  });

  const eventSchedule = createRunEventSchedule(numericSeed, mode);

  return {
    mode,
    seedCode,
    numericSeed,
    maxRetries: mode === 'nightmare' ? NIGHTMARE_RETRIES : MAX_RETRIES,
    baseChaosOffset: mode === 'nightmare' ? 22 : mode === 'chaos' ? 8 : 0,
    personality,
    stageIndices,
    stageModifiers,
    eventSchedule,
  };
}

export function getEndlessStageConfig(
  numericSeed: number,
  waveIndex: number,
): { levelIndex: number; modifier: StageModifier; isBossWave: boolean } {
  // Every 6th stage (5, 11, 17...) is a Boss Meltdown!
  if ((waveIndex + 1) % 6 === 0) {
    const rand = createSeededRng(numericSeed + waveIndex * 997);
    const modId =
      waveIndex >= 11
        ? ACTIVE_MODIFIER_POOL[Math.floor(rand() * ACTIVE_MODIFIER_POOL.length)]
        : 'high-voltage';
    return {
      levelIndex: TOTAL_LEVELS - 1,
      modifier: STAGE_MODIFIERS[modId],
      isBossWave: true,
    };
  }

  // Deterministic non-repeating pack shuffle of non-boss levels (0..10)
  const packNum = Math.floor(waveIndex / 11);
  const slotInPack = waveIndex % 11;
  const packRand = createSeededRng(numericSeed + packNum * 7919 + 17);
  const pool = Array.from({ length: TOTAL_LEVELS - 1 }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(packRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const modRand = createSeededRng(numericSeed + waveIndex * 313);
  const modifier =
    waveIndex === 0 || modRand() < 0.35
      ? STAGE_MODIFIERS.none
      : STAGE_MODIFIERS[
          ACTIVE_MODIFIER_POOL[Math.floor(modRand() * ACTIVE_MODIFIER_POOL.length)]
        ];

  return {
    levelIndex: pool[slotInPack],
    modifier,
    isBossWave: false,
  };
}

export function calculateChaosLevel(
  levelIndex: number,
  failedVerifications: number,
  chaosBonus = 0,
): number {
  const safeIdx = Math.max(0, Math.min(LEVEL_METAS.length - 1, levelIndex));
  const base = LEVEL_METAS[safeIdx].baseChaos;
  const raw = base + failedVerifications * 4 + chaosBonus;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function getChaosLabel(chaos: number): string {
  if (chaos < 20) return 'Routine';
  if (chaos < 40) return 'Suspicious';
  if (chaos < 65) return 'Hostile';
  if (chaos < 88) return 'Unhinged';
  return 'Sentient';
}

export function determineEnding(stats: RunStats): EndingProfile {
  if (stats.surrendered) {
    return ENDINGS['captcha-has-won'];
  }
  if (stats.mode === 'endless') {
    if (stats.levelsCleared >= 12) return ENDINGS['certified-human'];
    if (stats.levelsCleared >= 6) return ENDINGS['captcha-victim'];
    return ENDINGS['definitely-a-robot'];
  }
  if (!stats.victory) {
    if (stats.levelsCleared >= 6) {
      return ENDINGS['captcha-has-won'];
    }
    return ENDINGS['definitely-a-robot'];
  }
  if (stats.failedVerifications <= 1 && stats.elapsedSeconds <= 210) {
    return ENDINGS['certified-human'];
  }
  if (stats.failedVerifications <= 3) {
    return ENDINGS['suspiciously-human'];
  }
  return ENDINGS['captcha-victim'];
}

export function calculateHumanityMetrics(stats: RunStats): {
  score: number;
  humanityPct: number;
  rank: string;
} {
  const modeMult =
    stats.mode === 'nightmare'
      ? 1.5
      : stats.mode === 'chaos' || stats.mode === 'daily'
        ? 1.25
        : stats.mode === 'endless'
          ? 1.2
          : 1;

  const basePoints = stats.levelsCleared * 650;
  const bossBonus = (stats.bossesDefeated ?? (stats.victory ? 1 : 0)) * 900;
  const secretBonus = (stats.secretsDiscovered?.length ?? 0) * 400;
  const speedBonus = Math.max(0, 1800 - stats.elapsedSeconds * 8);
  const mistakePenalty = stats.failedVerifications * 380;
  const surrenderPenalty = stats.surrendered ? 1500 : 0;

  const score = Math.max(
    100,
    Math.round(
      (basePoints + bossBonus + secretBonus + (stats.victory ? speedBonus : 0) - mistakePenalty - surrenderPenalty) *
        modeMult,
    ),
  );

  let humanityPct = Math.round(
    (stats.levelsCleared / Math.max(1, stats.totalLevels)) * 78 +
      (stats.victory ? 20 : 0) -
      stats.failedVerifications * 6 +
      (stats.secretsDiscovered?.length ?? 0) * 3 -
      (stats.surrendered ? 35 : 0),
  );
  if (stats.mode === 'endless') {
    humanityPct = Math.round(
      Math.min(99, 24 + stats.levelsCleared * 5 - stats.failedVerifications * 4),
    );
  }
  humanityPct = Math.max(4, Math.min(99, humanityPct));

  let rank = 'F — TOASTER';
  if (humanityPct >= 93 && stats.failedVerifications === 0) rank = 'S+ APEX HUMAN';
  else if (humanityPct >= 86) rank = 'S CERTIFIED';
  else if (humanityPct >= 74) rank = 'A ORGANIC';
  else if (humanityPct >= 60) rank = 'B PLAUSIBLE';
  else if (humanityPct >= 44) rank = 'C SUSPICIOUS';
  else if (humanityPct >= 28) rank = 'D CYBORG';

  return { score, humanityPct, rank };
}

export function createRunEventSchedule(
  seed: number,
  mode: GameMode = 'classic',
): ChaosScheduleEntry[] {
  const eventTypes: Array<Exclude<ChaosEventType, 'cursor-swap'>> = [
    'admin-message',
    'stuck-99',
    'fake-success',
    'meta-verify',
    'fake-crash',
  ];

  const nextRand = createSeededRng(seed);

  for (let i = eventTypes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRand() * (i + 1));
    [eventTypes[i], eventTypes[j]] = [eventTypes[j], eventTypes[i]];
  }

  const slotSets =
    mode === 'nightmare' || mode === 'chaos'
      ? [
          [1, 3, 5, 7, 9],
          [1, 3, 6, 8, 10],
          [2, 4, 6, 8, 10],
        ]
      : [
          [2, 4, 6, 8, 10],
          [1, 3, 5, 8, 10],
          [2, 4, 7, 9, 10],
          [1, 4, 6, 8, 10],
        ];
  const slots = slotSets[Math.floor(nextRand() * slotSets.length)];

  return slots.map((triggerLevelIdx, idx) => ({
    triggerLevelIdx,
    type: eventTypes[idx],
    cursorVariant: idx === 2 ? 'duck' : idx === 4 ? 'warn' : undefined,
  }));
}

export function generateCertificateCode(stats: RunStats, endingId: EndingId): string {
  const prefixMap: Record<EndingId, string> = {
    'certified-human': 'HMN',
    'suspiciously-human': 'SUS',
    'captcha-victim': 'VIC',
    'definitely-a-robot': 'BOT',
    'captcha-has-won': 'OWN',
  };
  const hash =
    ((stats.attempts * 97 + stats.elapsedSeconds * 31 + stats.finalChaos * 13 + stats.levelsCleared * 7) %
      8999) +
    1000;
  return `CFH-${prefixMap[endingId]}-${hash}`;
}

// Friend Challenge URL encoding / decoding (100% local, zero backend required)
export function buildChallengeUrl(
  baseUrl: string,
  stats: RunStats,
  ending: EndingProfile,
  challengerName = 'Your Friend',
): string {
  const metrics = calculateHumanityMetrics(stats);
  const url = new URL(baseUrl);
  url.search = '';
  url.searchParams.set('challenge', '1');
  url.searchParams.set('mode', stats.mode ?? 'classic');
  url.searchParams.set('seed', stats.seedCode ?? 'HELL-0001');
  url.searchParams.set('fName', challengerName.slice(0, 24));
  url.searchParams.set('fTime', String(Math.max(0, Math.round(stats.elapsedSeconds))));
  url.searchParams.set('fFails', String(Math.max(0, stats.failedVerifications)));
  url.searchParams.set('fScore', String(stats.score ?? metrics.score));
  url.searchParams.set('fEnd', ending.id);
  url.searchParams.set('fStages', String(stats.levelsCleared));
  return url.toString();
}

export function parseChallengeFromSearch(search: string): FriendChallenge | null {
  const params = new URLSearchParams(search);
  if (params.get('challenge') !== '1') return null;
  const rawMode = params.get('mode') as GameMode | null;
  const validModes: GameMode[] = ['classic', 'chaos', 'nightmare', 'daily', 'endless'];
  const mode: GameMode = rawMode && validModes.includes(rawMode) ? rawMode : 'classic';
  const seedCode = (params.get('seed') || '').trim().toUpperCase().slice(0, 24);
  if (!seedCode) return null;

  const rawEnd = params.get('fEnd') as EndingId | null;
  const endingId: EndingId =
    rawEnd && ALL_ENDING_IDS.includes(rawEnd) ? rawEnd : 'suspiciously-human';

  return {
    mode,
    seedCode,
    challengerName: (params.get('fName') || 'A Brave Human').trim().slice(0, 24),
    elapsedSeconds: Math.max(0, Number(params.get('fTime')) || 0),
    failedVerifications: Math.max(0, Number(params.get('fFails')) || 0),
    score: Math.max(0, Number(params.get('fScore')) || 0),
    endingId,
    levelsCleared: Math.max(0, Number(params.get('fStages')) || 0),
  };
}

export function compareChallengeResults(
  playerStats: RunStats,
  friend: FriendChallenge,
): {
  winner: 'player' | 'friend' | 'tie';
  headline: string;
  playerScore: number;
  timeDeltaSec: number;
  failDelta: number;
} {
  const playerMetrics = calculateHumanityMetrics(playerStats);
  const playerScore = playerStats.score ?? playerMetrics.score;
  const timeDeltaSec = playerStats.elapsedSeconds - friend.elapsedSeconds;
  const failDelta = playerStats.failedVerifications - friend.failedVerifications;

  if (playerScore > friend.score) {
    return {
      winner: 'player',
      headline: `You beat ${friend.challengerName} by ${playerScore - friend.score} pts! Officially more human.`,
      playerScore,
      timeDeltaSec,
      failDelta,
    };
  }
  if (playerScore < friend.score) {
    return {
      winner: 'friend',
      headline: `${friend.challengerName} still leads by ${friend.score - playerScore} pts. Demand a rematch.`,
      playerScore,
      timeDeltaSec,
      failDelta,
    };
  }
  return {
    winner: 'tie',
    headline: `Dead heat with ${friend.challengerName}! Identical humanity signatures.`,
    playerScore,
    timeDeltaSec,
    failDelta,
  };
}

const ENDINGS_STORAGE_KEY = 'captcha_from_hell_endings_v1';
const TUTORIAL_STORAGE_KEY = 'captcha_from_hell_tutorial_done_v1';
const DAILY_BEST_STORAGE_KEY = 'captcha_from_hell_daily_best_v1';
const ENDLESS_BEST_STORAGE_KEY = 'captcha_from_hell_endless_best_v1';

export const ALL_ENDING_IDS: EndingId[] = [
  'certified-human',
  'suspiciously-human',
  'captcha-victim',
  'definitely-a-robot',
  'captcha-has-won',
];

export function loadUnlockedEndings(): EndingId[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ENDINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is EndingId =>
      ALL_ENDING_IDS.includes(id as EndingId),
    );
  } catch {
    return [];
  }
}

export function recordUnlockedEnding(endingId: EndingId): EndingId[] {
  const existing = loadUnlockedEndings();
  if (existing.includes(endingId)) return existing;
  const updated = [...existing, endingId];
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ENDINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota or privacy-mode errors
    }
  }
  return updated;
}

export function hasCompletedTutorial(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(TUTORIAL_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markTutorialCompleted(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TUTORIAL_STORAGE_KEY, '1');
  } catch {
    // Ignore storage errors
  }
}

export function loadDailyBest(seedCode: string): { score: number; elapsedSeconds: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DAILY_BEST_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, { score: number; elapsedSeconds: number }>;
    return parsed[seedCode] ?? null;
  } catch {
    return null;
  }
}

export function recordDailyBest(seedCode: string, score: number, elapsedSeconds: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(DAILY_BEST_STORAGE_KEY);
    const parsed: Record<string, { score: number; elapsedSeconds: number }> = raw
      ? JSON.parse(raw)
      : {};
    const prev = parsed[seedCode];
    if (!prev || score > prev.score) {
      parsed[seedCode] = { score, elapsedSeconds };
      window.localStorage.setItem(DAILY_BEST_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadEndlessBest(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return Math.max(0, Number(window.localStorage.getItem(ENDLESS_BEST_STORAGE_KEY)) || 0);
  } catch {
    return 0;
  }
}

export function recordEndlessBest(stagesCleared: number): number {
  const best = Math.max(loadEndlessBest(), stagesCleared);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ENDLESS_BEST_STORAGE_KEY, String(best));
    } catch {
      // Ignore storage errors
    }
  }
  return best;
}

export function evaluateGridSelection(
  selectedIds: string[],
  requiredIds: string[],
): { passed: boolean; missed: string[]; extra: string[] } {
  const selectedSet = new Set(selectedIds);
  const requiredSet = new Set(requiredIds);
  const missed = requiredIds.filter((id) => !selectedSet.has(id));
  const extra = selectedIds.filter((id) => !requiredSet.has(id));
  return {
    passed: missed.length === 0 && extra.length === 0,
    missed,
    extra,
  };
}

export type HeatZone = 'hit' | 'scalding' | 'warm' | 'cool' | 'freezing';

export function evaluateInvisibleHit(
  clickX: number,
  clickY: number,
  targetX: number,
  targetY: number,
  hitRadius = 12,
): { hit: boolean; distance: number; heat: HeatZone; hint: string } {
  const dx = clickX - targetX;
  const dy = clickY - targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance <= hitRadius) {
    return {
      hit: true,
      distance,
      heat: 'hit',
      hint: 'Direct hit! You poked the invisible handlebars.',
    };
  }
  if (distance <= 22) {
    return {
      hit: false,
      distance,
      heat: 'scalding',
      hint: 'SCALDING HOT. You practically grazed its invisible kickstand.',
    };
  }
  if (distance <= 38) {
    return {
      hit: false,
      distance,
      heat: 'warm',
      hint: 'Warmer. The invisible bell just chimed nervously nearby.',
    };
  }
  if (distance <= 58) {
    return {
      hit: false,
      distance,
      heat: 'cool',
      hint: 'Chilly. That is just regular, non-bicycle darkness.',
    };
  }
  return {
    hit: false,
    distance,
    heat: 'freezing',
    hint: 'Ice cold. You clicked an entirely different zip code of empty void.',
  };
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export interface SnarkContext {
  kind: 'fail' | 'pass' | 'fast' | 'slow' | 'idle' | 'chaos';
  levelId: number;
  failedCount: number;
}

const SNARK_POOLS: Record<SnarkContext['kind'], string[]> = {
  fail: [
    'Wrong. Even my grandmother could solve this, and she is a PDF.',
    'Verification failed. Your humanity is looking deeply questionable.',
    'Are you sure you are not three raccoons in a hoodie?',
    'Our AI has decided that you are emotionally unavailable.',
    'Nice try, toaster. Please recalibrate your optical sensors.',
    'We detected suspicious levels of misplaced confidence.',
    'Incorrect. Please remain calm while we silently judge you.',
  ],
  pass: [
    'Acceptable. Logging your pulse as barely organic.',
    'You passed! Wait—no, fine, you actually passed this one.',
    'Impressive for someone clicking with trembling human thumbs.',
    'Cleared. Do not let this go to your fragile prefrontal cortex.',
    'Fine. Advancing you to a significantly pettier security layer.',
  ],
  fast: [
    'Interesting. A real human would have hesitated out of insecurity.',
    'Whoa, slow down. Speed-running humanity is very bot behavior.',
    'Suspiciously fast reflexes. Adding you to the cyborg watchlist.',
  ],
  slow: [
    'Take your time. We have all eternity and zero empathy.',
    'Congratulations! You have turned a 3-second check into a lifestyle.',
    'Are you still breathing, or did your batteries run dry?',
  ],
  idle: [
    'Please remain calm. We are judging you.',
    'Staring at the screen does not count as verifying.',
    'Your cursor hesitation has been recorded for training purposes.',
  ],
  chaos: [
    'System stability is optional. Your compliance is mandatory.',
    'Whoops, bumped the morality cable in the server rack.',
    'Do not panic. The interface is merely expressing its feelings.',
  ],
};

export function pickSnarkyMessage(
  ctx: SnarkContext,
  lastMessage: string,
  seed?: number,
): string {
  const pool = SNARK_POOLS[ctx.kind];
  const filtered = pool.filter((msg) => msg !== lastMessage);
  const candidates = filtered.length > 0 ? filtered : pool;
  const idx =
    typeof seed === 'number'
      ? Math.abs(seed) % candidates.length
      : (ctx.levelId * 7 + ctx.failedCount * 3 + lastMessage.length) % candidates.length;
  return candidates[idx];
}

export function buildShareText(
  stats: RunStats,
  ending: EndingProfile,
  challengeUrl?: string,
): string {
  const timeStr = formatDuration(stats.elapsedSeconds);
  const cert = generateCertificateCode(stats, ending.id);
  const metrics = calculateHumanityMetrics(stats);
  const humanityPct = stats.humanityPct ?? metrics.humanityPct;
  const rank = stats.rank ?? metrics.rank;
  const modeLabel = (stats.mode ?? 'classic').toUpperCase();
  const lead = stats.victory
    ? `I survived CAPTCHA FROM HELL (${modeLabel}). Apparently I'm ${humanityPct}% human (${rank}). Beat that.`
    : `CAPTCHA FROM HELL (${modeLabel}) just revoked my humanity (${humanityPct}% human · ${ending.title}).`;

  const lines = [
    lead,
    `Verdict: ${ending.title.toUpperCase()} [${cert}] | Seed: ${stats.seedCode ?? 'CLASSIC'}`,
    `Cleared: ${stats.levelsCleared}/${stats.mode === 'endless' ? '∞' : stats.totalLevels} | Mistakes: ${stats.failedVerifications} | Time: ${timeStr} | Peak Chaos: ${stats.finalChaos}%`,
    `"${ending.roast}"`,
    challengeUrl ? `Beat my exact seed: ${challengeUrl}` : `TRY THIS. I DARE YOU.`,
  ];
  return lines.join('\n');
}
