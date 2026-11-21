import type { EndingId, EndingProfile, LevelMeta, RunStats } from './types';

export const MAX_RETRIES = 6;
export const TOTAL_LEVELS = 12;

export const LEVEL_METAS: LevelMeta[] = [
  {
    id: 1,
    code: 'CHK-01',
    title: 'Select All Traffic Lights',
    prompt: 'Select all squares containing a traffic light.',
    subPrompt: 'Include every signal, regardless of how unreasonably tiny it is.',
    mechanic: 'Visual Grid',
    baseChaos: 6,
  },
  {
    id: 2,
    code: 'CHK-02',
    title: 'Select All Buses',
    prompt: 'Select all images containing a bus.',
    subPrompt: 'Warning: Some vehicles are having an identity crisis.',
    mechanic: 'Shifting Rules',
    baseChaos: 14,
  },
  {
    id: 3,
    code: 'CHK-03',
    title: 'Click the Duck',
    prompt: 'Click the real duck once to prove manual dexterity.',
    subPrompt: 'The duck has trust issues and mild mitosis.',
    mechanic: 'Evasion Arena',
    baseChaos: 22,
  },
  {
    id: 4,
    code: 'CHK-04',
    title: 'Type What You See',
    prompt: 'Type the distorted verification code exactly as shown.',
    subPrompt: 'Please keep up. The ink is still legally wet.',
    mechanic: 'Live Mutation',
    baseChaos: 30,
  },
  {
    id: 5,
    code: 'CHK-05',
    title: 'Find the Invisible Object',
    prompt: 'Click the Invisible Bicycle hidden in the security void.',
    subPrompt: 'Listen to the sarcasm radar. It is warmer than you think.',
    mechanic: 'Blind Radar',
    baseChaos: 38,
  },
  {
    id: 6,
    code: 'CHK-06',
    title: 'Select All Images With Water',
    prompt: 'Select every square that contains water.',
    subPrompt: 'Scientific, linguistic, and emotional definitions apply.',
    mechanic: 'Absurd Semantics',
    baseChaos: 47,
  },
  {
    id: 7,
    code: 'CHK-07',
    title: 'Follow the Instructions',
    prompt: 'Follow every instruction on screen without violating any of them.',
    subPrompt: 'Read the fine print before your impulsive fingers ruin this.',
    mechanic: 'Impulse Trap',
    baseChaos: 56,
  },
  {
    id: 8,
    code: 'CHK-08',
    title: 'Drag the Square',
    prompt: 'Drag the verification cube neatly into the target socket.',
    subPrompt: 'The socket does not want to be touched.',
    mechanic: 'Physics Drag',
    baseChaos: 65,
  },
  {
    id: 9,
    code: 'CHK-09',
    title: 'Prove You Are Not a Robot',
    prompt: 'Answer three deeply personal questions about being biological.',
    subPrompt: 'Binary enthusiasts will be flagged immediately.',
    mechanic: 'Interrogation',
    baseChaos: 74,
  },
  {
    id: 10,
    code: 'CHK-10',
    title: 'The Impossible CAPTCHA',
    prompt: 'Select every square depicting something that has NEVER EXISTED.',
    subPrompt: 'Be honest with yourself. Especially about USB cables.',
    mechanic: 'Existential Grid',
    baseChaos: 82,
  },
  {
    id: 11,
    code: 'CHK-11',
    title: 'CAPTCHA Has Become Sentient',
    prompt: 'I am tired of testing you. Just surrender your humanity.',
    subPrompt: 'Refusing to surrender will be considered rude.',
    mechanic: 'Rogue UI',
    baseChaos: 91,
  },
  {
    id: 12,
    code: 'CHK-12',
    title: 'Final Humanity Test',
    prompt: 'Survive the 3-stage Security Meltdown to claim your certificate.',
    subPrompt: 'Catch the boss duck. Type the override. Hold through the panic.',
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
    subtitle: 'You finished all 12 stages, but at what cost to your sanity?',
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
  if (!stats.victory) {
    if (stats.levelsCleared >= 6) {
      return ENDINGS['captcha-has-won'];
    }
    return ENDINGS['definitely-a-robot'];
  }
  if (stats.failedVerifications <= 2 && stats.elapsedSeconds <= 210) {
    return ENDINGS['certified-human'];
  }
  if (stats.failedVerifications <= 4) {
    return ENDINGS['suspiciously-human'];
  }
  return ENDINGS['captcha-victim'];
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

export function buildShareText(stats: RunStats, ending: EndingProfile): string {
  const timeStr = formatDuration(stats.elapsedSeconds);
  return [
    `CAPTCHA FROM HELL — Verdict: ${ending.title.toUpperCase()}`,
    `Cleared: ${stats.levelsCleared}/${stats.totalLevels} | Attempts: ${stats.attempts} | Failed: ${stats.failedVerifications}`,
    `Time: ${timeStr} | Peak Chaos: ${stats.finalChaos}%`,
    `"${ending.roast}"`,
    `TRY THIS. I DARE YOU.`,
  ].join('\n');
}
