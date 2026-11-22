import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Swords } from 'lucide-react';
import { ENDINGS, formatDuration, loadUnlockedEndings } from '../game/engine';
import { LANDING_WARNINGS } from '../game/personality';
import type { FriendChallenge } from '../game/types';
import { sound } from '../utils/sound';

interface TitleScreenProps {
  incomingChallenge: FriendChallenge | null;
  onPlayNow: () => void;
  onHowToPlay: () => void;
  onAcceptChallenge: (challenge: FriendChallenge) => void;
  onDismissChallenge: () => void;
}

const CHECKBOX_REACTIONS = [
  'Doubtful. Prove it.',
  'That click felt 14% synthetic.',
  'Nice try. Continue to verification.',
  'Response cadence flagged. Proceeding.',
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  incomingChallenge,
  onPlayNow,
  onHowToPlay,
  onAcceptChallenge,
  onDismissChallenge,
}) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [warningIdx, setWarningIdx] = useState(0);
  const [checkboxState, setCheckboxState] = useState<'idle' | 'checking' | 'betrayed'>('idle');
  const [reactionLine, setReactionLine] = useState(CHECKBOX_REACTIONS[0]);
  const timersRef = React.useRef<number[]>([]);
  const unlockedCount = useMemo(() => loadUnlockedEndings().length, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWarningIdx((i) => (i + 1) % LANDING_WARNINGS.length);
    }, 5200);
    return () => {
      window.clearInterval(interval);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 4.5;
    const ny = (e.clientY / window.innerHeight - 0.5) * 3;
    setEyeOffset({ x: nx, y: ny });
  };

  const handleFakeCheckbox = () => {
    if (checkboxState !== 'idle') return;
    sound.click();
    setCheckboxState('checking');
    setReactionLine(
      CHECKBOX_REACTIONS[Math.floor(Math.random() * CHECKBOX_REACTIONS.length)],
    );
    const t1 = window.setTimeout(() => {
      sound.glitch();
      setCheckboxState('betrayed');
      const t2 = window.setTimeout(() => {
        if (incomingChallenge) {
          onAcceptChallenge(incomingChallenge);
        } else {
          onPlayNow();
        }
      }, 480);
      timersRef.current.push(t2);
    }, 440);
    timersRef.current.push(t1);
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      className="captcha-bg-grid flex min-h-screen w-full flex-col items-center justify-between px-5 py-8 sm:px-6 sm:py-10"
    >
      {/* Quiet corporate header status line */}
      <div className="flex w-full max-w-3xl items-center justify-between border-b border-[#222222] pb-3 font-mono text-[11px] tracking-wider text-[#929292]">
        <span>SYSTEM STATUS: OPERATIONAL</span>
        <span className="font-mono-tabular">
          {unlockedCount > 0 ? `VERDICTS ${unlockedCount}/5 · ` : ''}12 CHECKS · 5 MODES
        </span>
      </div>

      {/* Main Centered Verification Gateway */}
      <div className="my-auto flex w-full max-w-md flex-col items-center py-8 text-center">
        {/* Incoming Friend Challenge Notice */}
        {incomingChallenge && (
          <div className="animate-stage-enter mb-6 w-full rounded-md border border-[#B84B4B]/70 bg-[#191919] p-4 text-left">
            <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-[#D48A8A]">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Swords className="h-3.5 w-3.5 text-[#B84B4B]" />
                Seeded Challenge Incoming
              </span>
              <span className="font-mono-tabular text-[#929292]">
                {incomingChallenge.mode.toUpperCase()} · {incomingChallenge.seedCode}
              </span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-[#EEEEEE]">
              {incomingChallenge.challengerName} dared you to beat their exact run.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono-tabular text-xs text-[#929292]">
              <span>Score: {incomingChallenge.score}</span>
              <span>Time: {formatDuration(incomingChallenge.elapsedSeconds)}</span>
              <span>Mistakes: {incomingChallenge.failedVerifications}</span>
              <span>Verdict: {ENDINGS[incomingChallenge.endingId].title}</span>
            </div>
            <div className="mt-3.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  onAcceptChallenge(incomingChallenge);
                }}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded bg-[#B84B4B] px-4 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
              >
                Accept Challenge
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  onDismissChallenge();
                }}
                className="min-h-[44px] rounded border border-[#333333] bg-[#222222] px-3.5 py-2 text-xs font-medium text-[#929292] transition-colors hover:text-[#EEEEEE]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Restrained monochrome verification mark with subtle cursor-tracking pupil */}
        <svg
          viewBox="0 0 64 64"
          className="mb-4 h-12 w-12 select-none"
          role="img"
          aria-label="CAPTCHA FROM HELL verification emblem"
        >
          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="8"
            fill="#191919"
            stroke="#333333"
            strokeWidth="1.5"
          />
          <path
            d="M15 32 Q32 20 49 32 Q32 44 15 32 Z"
            fill="none"
            stroke="#929292"
            strokeWidth="1.6"
          />
          <circle
            cx={32 + eyeOffset.x}
            cy={32 + eyeOffset.y}
            r="4.5"
            fill="#EEEEEE"
          />
          <circle
            cx={32 + eyeOffset.x * 1.15}
            cy={32 + eyeOffset.y * 1.15}
            r="2"
            fill="#B84B4B"
          />
        </svg>

        <h1 className="text-balance text-3xl font-bold tracking-tight text-[#EEEEEE] sm:text-4xl">
          CAPTCHA FROM <span className="text-[#B84B4B]">HELL</span>
        </h1>

        <p
          role="status"
          aria-live="polite"
          className="mt-3 mb-6 min-h-[2.75rem] max-w-sm text-balance text-sm leading-relaxed text-[#929292]"
        >
          {LANDING_WARNINGS[warningIdx]}
        </p>

        {/* Ordinary-looking corporate verification card */}
        <div className="w-full rounded-md border border-[#333333] bg-[#191919] p-4">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleFakeCheckbox}
              aria-label="I am not a robot checkbox"
              className="flex min-h-[52px] flex-1 items-center gap-3.5 rounded border border-[#333333] bg-[#222222] px-3.5 py-2.5 text-left transition-colors duration-150 hover:border-[#666666] focus-visible:outline-2 focus-visible:outline-[#B84B4B]"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2 transition-colors ${
                  checkboxState === 'betrayed'
                    ? 'border-[#B84B4B] bg-[#B84B4B] text-[#EEEEEE]'
                    : 'border-[#555555] bg-[#111111]'
                }`}
              >
                {checkboxState === 'checking' && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#929292] border-t-transparent" />
                )}
                {checkboxState === 'betrayed' && (
                  <span className="font-mono text-xs font-bold">!</span>
                )}
              </span>
              <span className="text-sm font-medium text-[#EEEEEE]">
                {checkboxState === 'idle' && 'I am not a robot'}
                {checkboxState === 'checking' && 'Checking session...'}
                {checkboxState === 'betrayed' && reactionLine}
              </span>
            </button>

            <div className="shrink-0 text-right">
              <div className="font-mono text-[10px] font-semibold tracking-wider text-[#929292]">
                reHELL
              </div>
              <div className="text-[10px] text-[#666666]">Privacy · Terms</div>
            </div>
          </div>
        </div>

        {/* Clean Primary + Secondary Actions */}
        <div className="mt-5 flex w-full flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            data-start="true"
            onClick={() => {
              sound.click();
              onPlayNow();
            }}
            className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded bg-[#B84B4B] px-6 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors duration-150 hover:bg-[#A03E3E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EEEEEE]"
          >
            Prove You Are Human
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              sound.click();
              onHowToPlay();
            }}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded border border-[#333333] bg-[#191919] px-5 py-2.5 text-sm font-medium text-[#EEEEEE] transition-colors duration-150 hover:bg-[#222222] focus-visible:outline-2 focus-visible:outline-[#B84B4B]"
          >
            <BookOpen className="h-4 w-4 text-[#929292]" />
            How to Play
          </button>
        </div>
      </div>

      {/* Quiet bottom controls line */}
      <p className="text-center font-mono text-[11px] text-[#666666]">
        Enter Start · Esc Pause · M Mute · R Restart
      </p>
    </main>
  );
};
