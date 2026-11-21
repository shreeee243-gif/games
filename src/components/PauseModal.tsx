import React from 'react';
import { formatDuration } from '../game/engine';

interface PauseModalProps {
  levelNumber: number;
  elapsedSeconds: number;
  chaosLevel: number;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelNumber,
  elapsedSeconds,
  chaosLevel,
  onResume,
  onRestart,
  onTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Verification Paused"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-sm rounded-lg border border-[#2C313C] bg-[#14161A] p-6 shadow-2xl">
        <div className="font-mono text-xs uppercase tracking-wider text-[#EF4444]">
          Session Suspended
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-[#F2F0EB]">
          Taking a Breather?
        </h2>
        <p className="mt-1 text-xs text-[#9BA1AE]">
          We will keep judging you patiently until you resume.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#232730] py-3 text-center">
          <div>
            <div className="font-mono text-[10px] uppercase text-[#717786]">Stage</div>
            <div className="font-mono-tabular text-base font-bold text-[#F2F0EB]">
              {levelNumber}/12
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#717786]">Time</div>
            <div className="font-mono-tabular text-base font-bold text-[#F2F0EB]">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase text-[#717786]">Chaos</div>
            <div className="font-mono-tabular text-base font-bold text-[#EF4444]">
              {chaosLevel}%
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="min-h-[44px] w-full rounded-md bg-[#DC2626] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#B91C1C]"
          >
            Resume Verification
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="min-h-[44px] w-full rounded-md border border-[#2C313C] bg-[#1A1D24] px-4 py-2.5 text-sm font-medium text-[#F2F0EB] hover:border-[#525A6B]"
          >
            Restart From Stage 1
          </button>
          <button
            type="button"
            onClick={onTitle}
            className="min-h-[44px] w-full rounded-md px-4 py-2 text-xs font-medium text-[#9BA1AE] hover:text-[#F2F0EB]"
          >
            Return to Title
          </button>
        </div>
      </div>
    </div>
  );
};
