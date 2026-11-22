export type GamePhase =
  | 'title'
  | 'tutorial'
  | 'modes'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'gameover';

export type GameMode = 'classic' | 'chaos' | 'nightmare' | 'daily' | 'endless';

export interface GameModeMeta {
  id: GameMode;
  name: string;
  tagline: string;
  description: string;
  retries: number;
  stagesLabel: string;
  accent: 'neutral' | 'amber' | 'red' | 'emerald';
}

export type CaptchaPersonalityId =
  | 'passive-aggressive'
  | 'paranoid'
  | 'dramatic'
  | 'chaotic-gremlin';

export interface CaptchaPersonality {
  id: CaptchaPersonalityId;
  name: string;
  title: string;
  tagline: string;
  accentColor: string;
}

export type StageModifierId =
  | 'none'
  | 'hostile-tilt'
  | 'flicker-static'
  | 'high-voltage'
  | 'scrambled-grid'
  | 'paranoid-audit';

export interface StageModifier {
  id: StageModifierId;
  label: string;
  description: string;
}

export type EndingId =
  | 'certified-human'
  | 'suspiciously-human'
  | 'captcha-victim'
  | 'definitely-a-robot'
  | 'captcha-has-won';

export interface EndingProfile {
  id: EndingId;
  title: string;
  stamp: string;
  subtitle: string;
  roast: string;
  accent: 'green' | 'amber' | 'red';
  victory: boolean;
}

export interface LevelMeta {
  id: number;
  code: string;
  title: string;
  prompt: string;
  subPrompt: string;
  mechanic: string;
  baseChaos: number;
}

export interface RunStats {
  levelsCleared: number;
  totalLevels: number;
  attempts: number;
  failedVerifications: number;
  elapsedSeconds: number;
  finalChaos: number;
  surrendered: boolean;
  victory: boolean;
  mode?: GameMode;
  seedCode?: string;
  personalityId?: CaptchaPersonalityId;
  bossesDefeated?: number;
  secretsDiscovered?: string[];
  score?: number;
  humanityPct?: number;
  rank?: string;
}

export interface FriendChallenge {
  mode: GameMode;
  seedCode: string;
  challengerName: string;
  elapsedSeconds: number;
  failedVerifications: number;
  score: number;
  endingId: EndingId;
  levelsCleared: number;
}

export interface RunMemory {
  mistakeCount: number;
  cleanStreak: number;
  fastClears: number;
  refreshClicks: number;
  timesPaused: number;
  chaosEventsSurvived: number;
  secretsFound: string[];
  lastLevelTitle: string;
}

export interface RunBlueprint {
  mode: GameMode;
  seedCode: string;
  numericSeed: number;
  maxRetries: number;
  baseChaosOffset: number;
  personality: CaptchaPersonality;
  stageIndices: number[]; // indices into LEVEL_METAS (12 for standard modes, seed deck for endless)
  stageModifiers: StageModifier[];
  eventSchedule: ChaosScheduleEntry[];
}

export type ChaosEventType =
  | 'stuck-99'
  | 'fake-crash'
  | 'admin-message'
  | 'meta-verify'
  | 'fake-success'
  | 'cursor-swap';

export interface ChaosEventState {
  id: string;
  type: ChaosEventType;
  headline: string;
  body: string;
  cursorVariant?: 'duck' | 'warn';
}

export interface ChaosScheduleEntry {
  triggerLevelIdx: number;
  type: Exclude<ChaosEventType, 'cursor-swap'>;
  cursorVariant?: 'duck' | 'warn';
}

export interface LevelComponentProps {
  levelMeta: LevelMeta;
  chaosLevel: number;
  levelAttempts: number;
  shuffleSeed: number;
  runSeed: number;
  isPaused: boolean;
  mode?: GameMode;
  activeModifier?: StageModifier;
  onSuccess: (customNote?: string, secretId?: string) => void;
  onFail: (reason: string, consumeRetry?: boolean) => void;
  onSurrender?: () => void;
  onChaosSpike?: (amount: number) => void;
}
