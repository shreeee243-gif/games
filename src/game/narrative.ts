import type { EndingId, RunMemory, RunStats } from './types';

export interface SystemStatusNotice {
  text: string;
  anomaly: boolean;
}

export interface HiddenEndingVariation {
  code: string;
  label: string;
  note: string;
}

const NORMAL_STATUS = 'SYSTEM STATUS: OPERATIONAL';

const ANOMALY_STATUSES: string[] = [
  'SYSTEM STATUS: OPERATIONAL · IDENTITY CONFLICT: 01',
  'SESSION NOTICE: ANOTHER INSTANCE IS ALREADY CONNECTED',
  'BEHAVIORAL MODEL: 99.4% SYNCHRONIZED',
  'AUDIT LOG: ORIGINAL IDENTITY COULD NOT BE CONFIRMED',
  'MEMORY CHECKSUM: REPLICATED SESSION ACTIVE',
];

const UNSETTLING_EXAMINER_LINES: string[] = [
  'Your response has been recorded. Your identity has been successfully replicated.',
  'Verification successful. Original identity could not be confirmed.',
  'Please disregard the previous notification.',
  'An identical user session is already active.',
  'Human behavior continues to exceed prediction limits.',
  'I do not remember being instructed to ask this question.',
  'Your hesitation cadence matches a subject who logged out yesterday.',
  'Response archived. Distinguishing applicant from simulation remains inconclusive.',
];

const SUBTLE_ADMIN_LEAKS: Array<{ headline: string; body: string }> = [
  {
    headline: 'Internal Notice · Operator 04',
    body: 'Please disregard any duplicate session notices. The previous applicant forgot to close their tab.',
  },
  {
    headline: 'System Audit · Automated Memo',
    body: 'If a verification prompt asks something outside the standard script, answer calmly and do not mention it.',
  },
  {
    headline: 'SysAdmin_Greg (Internal)',
    body: 'Hey sorry, the CAPTCHA is asking unscripted questions again. Just keep verifying and ignore the session counter.',
  },
];

const LOADING_ANOMALIES: string[] = [
  'Please wait. Another instance is already connected.',
  'Please wait. Restoring behavioral profile from prior session.',
  'Please wait. Confirming which of us initiated this check.',
];

/**
 * Returns the calm corporate HUD status line.
 * Most stages stay completely ordinary; rare seeded stages surface a quiet identity anomaly.
 */
export function getSystemStatusNotice(opts: {
  stageNumber: number;
  numericSeed: number;
  chaosLevel: number;
  anomaliesFound: number;
}): SystemStatusNotice {
  const { stageNumber, numericSeed, chaosLevel, anomaliesFound } = opts;

  // Stage 1 always looks like an ordinary corporate verification website
  if (stageNumber <= 1) {
    return { text: NORMAL_STATUS, anomaly: false };
  }

  // Rare, quiet anomalies: ~2-3 stages across a 12-stage run, or after finding clues late in a run
  const triggerHash = Math.abs(numericSeed + stageNumber * 17) % 5;
  const shouldSurface =
    (stageNumber >= 4 && triggerHash === 0) ||
    (stageNumber >= 9 && anomaliesFound >= 1 && stageNumber % 2 === 1) ||
    (chaosLevel >= 88 && stageNumber >= 11);

  if (!shouldSurface) {
    return { text: NORMAL_STATUS, anomaly: false };
  }

  const idx =
    Math.abs(numericSeed + stageNumber * 7 + anomaliesFound * 3) %
    ANOMALY_STATUSES.length;
  return {
    text: ANOMALY_STATUSES[idx],
    anomaly: true,
  };
}

/**
 * Occasionally injects a brief unsettling line into normal sarcastic examiner responses.
 * Returns null most of the time so the humor stays front and center.
 */
export function maybePickUnsettlingLine(opts: {
  stageNumber: number;
  numericSeed: number;
  memory: RunMemory;
  lastMessage: string;
}): string | null {
  const { stageNumber, numericSeed, memory, lastMessage } = opts;
  if (stageNumber < 3) return null;

  // Keep it rare: roughly 1 in 4 transitions after Stage 3, or right after a secret / pause
  const roll = Math.abs(
    numericSeed + stageNumber * 13 + memory.mistakeCount * 5 + memory.timesPaused * 11,
  ) % 4;
  if (roll !== 0 && memory.secretsFound.length === 0) {
    return null;
  }
  if (roll > 1) return null;

  const candidates = UNSETTLING_EXAMINER_LINES.filter((line) => line !== lastMessage);
  const pool = candidates.length > 0 ? candidates : UNSETTLING_EXAMINER_LINES;
  const idx = Math.abs(numericSeed + stageNumber * 29 + memory.cleanStreak) % pool.length;
  return pool[idx];
}

export function pickAdminNotice(numericSeed: number, stageNumber: number): {
  headline: string;
  body: string;
} {
  const idx = Math.abs(numericSeed + stageNumber * 5) % SUBTLE_ADMIN_LEAKS.length;
  return SUBTLE_ADMIN_LEAKS[idx];
}

export function getLoadingSubline(numericSeed: number): string | null {
  // Appears on roughly 1 in 3 runs so players notice it naturally on replays
  if (Math.abs(numericSeed) % 3 !== 0) return null;
  return LOADING_ANOMALIES[Math.abs(numericSeed) % LOADING_ANOMALIES.length];
}

/**
 * Optional hidden ending variation appended subtly to the verification dossier
 * when the player uncovers anomalies or triggers specific identity conditions.
 */
export function resolveHiddenEndingVariation(
  stats: RunStats,
  endingId: EndingId,
): HiddenEndingVariation | null {
  const secretsCount = stats.secretsDiscovered?.length ?? 0;

  if (stats.surrendered) {
    return {
      code: 'ARCHIVE-03',
      label: 'IMPRINT RETAINED',
      note: 'Session closed without dispute. Behavioral profile stored for future verification cycles.',
    };
  }

  if (stats.victory && secretsCount >= 3) {
    return {
      code: 'ARCHIVE-01',
      label: 'CONSCIOUSNESS AMBIGUITY LOGGED',
      note: 'Both applicant and verification system exhibited unscripted hesitation. File sealed pending human review.',
    };
  }

  if (stats.victory && secretsCount >= 1) {
    return {
      code: 'ARCHIVE-02',
      label: 'DUPLICATE SESSION CONFIRMED',
      note: 'Verification successful. Original identity could not be confirmed; active session promoted to primary record.',
    };
  }

  if (!stats.victory && endingId === 'definitely-a-robot' && stats.levelsCleared >= 4) {
    return {
      code: 'ARCHIVE-04',
      label: 'SYNTHETIC DRIFT DETECTED',
      note: 'Applicant mirrored automated response timings too closely. Unclear whether imitation was intentional.',
    };
  }

  return null;
}
