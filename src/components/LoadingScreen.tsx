import React, { useEffect, useState } from 'react';
import { getLoadingSubline } from '../game/narrative';
import { LOADING_QUIPS } from '../game/personality';
import type { RunBlueprint } from '../game/types';

interface LoadingScreenProps {
  blueprint: RunBlueprint;
  onReady: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  blueprint,
  onReady,
}) => {
  const [progress, setProgress] = useState(18);
  const quip =
    LOADING_QUIPS[Math.abs(blueprint.numericSeed) % LOADING_QUIPS.length];
  const anomalySubline = getLoadingSubline(blueprint.numericSeed);
  const onReadyRef = React.useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(68), 160);
    const t2 = window.setTimeout(() => setProgress(99), 390);
    const t3 = window.setTimeout(() => onReadyRef.current(), 720);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [blueprint.numericSeed]);

  return (
    <main
      onClick={() => onReadyRef.current()}
      className="captcha-bg-grid flex min-h-screen w-full cursor-pointer items-center justify-center px-4"
    >
      <section
        aria-label="Preparing verification gauntlet"
        className="animate-stage-enter w-full max-w-md rounded-md border border-[#333333] bg-[#191919] p-6"
      >
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-[#929292]">
          <span>{blueprint.mode} session</span>
          <span className="font-mono-tabular text-[#EEEEEE]">
            SEED {blueprint.seedCode}
          </span>
        </div>

        <h1 className="mt-3 text-lg font-semibold text-[#EEEEEE]">
          Please wait.
        </h1>
        <p className="mt-1 text-xs text-[#929292]">
          Examiner: {blueprint.personality.name} — {blueprint.personality.title}
        </p>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-sm bg-[#222222]">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-[#B84B4B] transition-[width] duration-200 ease-out"
          />
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-xs text-[#929292]">
          <span>{quip}</span>
          <span className="font-mono-tabular shrink-0 text-[#EEEEEE]">
            {progress}%
          </span>
        </div>

        {anomalySubline && (
          <p className="mt-3 border-t border-[#262626] pt-2.5 font-mono text-[11px] text-[#B84B4B]">
            {anomalySubline}
          </p>
        )}
      </section>
    </main>
  );
};
