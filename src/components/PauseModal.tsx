import React from 'react';
import { formatDuration } from '../game/engine';

interface PauseModalProps {
  levelNumber: number;
  isEndless?: boolean;
  elapsedSeconds: number;
  chaosLevel: number;
  onResume: () => void;
  onRestart: () => void;
  onChangeLevel: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelNumber,
  isEndless = false,
  elapsedSeconds,
  chaosLevel,
  onResume,
  onRestart,
  onChangeLevel,
  onTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verification Paused"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
    >
      <div className="animate-stage-enter w-full max-w-sm rounded-md border border-[#333333] bg-[#191919] p-6">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
          Session Paused
        </div>
        <h2 className="mt-1 text-xl font-semibold text-[#EEEEEE]">
          Verification Suspended
        </h2>
        <p className="mt-1 text-xs text-[#929292]">
          Timers are frozen. Your session remains open in the background.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#262626] py-3 text-center">
          <div>
            <div className="font-mono text-[10px] uppercase text-[#929292]">
              {isEndless ? 'Wave' : 'Stage'}
            </div>
            <div className="font-mono-tabular text-base font-semibold text-[#EEEEEE]">
              {isEndless ? `${levelNumber} / ∞` : `${levelNumber}/12`}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#929292]">Time</div>
            <div className="font-mono-tabular text-base font-semibold text-[#EEEEEE]">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#929292]">Chaos</div>
            <div className="font-mono-tabular text-base font-semibold text-[#B84B4B]">
              {chaosLevel}%
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] w-full rounded bg-[#B84B4B] px-4 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
          >
            Resume Verification
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[44px] w-full rounded border border-[#333333] bg-[#222222] px-4 py-2.5 text-sm font-medium text-[#EEEEEE] transition-colors hover:border-[#666666]"
          >
            Restart From Stage 1
          </button>
          <button
            type="button"
            onClick={onChangeLevel}
            className="min-h-[44px] w-full rounded border border-[#333333] bg-[#191919] px-4 py-2.5 text-sm font-medium text-[#EEEEEE] transition-colors hover:border-[#666666] hover:bg-[#222222]"
          >
            Select Mode / Level
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="min-h-[44px] w-full rounded px-4 py-2 text-xs font-medium text-[#929292] transition-colors hover:text-[#EEEEEE]"
          >
            Return to Title
          </button>
        </div>
      </div>
    </div>
  );
};
