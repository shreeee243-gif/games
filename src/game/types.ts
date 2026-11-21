export type GamePhase = 'title' | 'playing' | 'paused' | 'gameover';

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

export interface LevelComponentProps {
  levelMeta: LevelMeta;
  chaosLevel: number;
  levelAttempts: number;
  shuffleSeed: number;
  onSuccess: (customNote?: string) => void;
  onFail: (reason: string, consumeRetry?: boolean) => void;
  onSurrender?: () => void;
  onChaosSpike?: (amount: number) => void;
}
