import React from 'react';
import { Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { MAX_RETRIES, TOTAL_LEVELS, formatDuration, getChaosLabel } from '../game/engine';

interface GameHudProps {
  levelNumber: number;
  retriesLeft: number;
  chaosLevel: number;
  elapsedSeconds: number;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

function RetrySocket({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M10 2 L17 5 V10 C17 14 14 17 10 18.5 C6 17 3 14 3 10 V5 Z"
        fill={filled ? '#DC2626' : 'transparent'}
        stroke={filled ? '#FCA5A5' : '#3F4451'}
        strokeWidth="1.6"
      />
      {!filled && (
        <path d="M7 7 L13 13 M13 7 L7 13" stroke="#525A6B" strokeWidth="1.4" strokeLinecap="round" />
      )}
    </svg>
  );
}

export const GameHud: React.FC<GameHudProps> = ({
  levelNumber,
  retriesLeft,
  chaosLevel,
  elapsedSeconds,
  muted,
  onToggleMute,
  onPause,
  onRestart,
}) => {
  const chaosLabel = getChaosLabel(chaosLevel);
  const chaosColor =
    chaosLevel >= 80
      ? 'text-[#EF4444]'
      : chaosLevel >= 45
        ? 'text-[#F59E0B]'
        : 'text-[#F2F0EB]';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#232730] pb-3">
        {/* Stage + Progress */}
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Stage
            </div>
            <div className="font-mono-tabular text-lg font-bold leading-none text-[#F2F0EB]">
              {String(levelNumber).padStart(2, '0')}
              <span className="text-xs font-normal text-[#717786]"> / {TOTAL_LEVELS}</span>
            </div>
          </div>

          <div className="h-7 w-px bg-[#232730]" aria-hidden="true" />

          {/* Discrete Retry Sockets */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Retries ({retriesLeft}/{MAX_RETRIES})
            </div>
            <div className="mt-1 flex items-center gap-1" aria-label={`${retriesLeft} of ${MAX_RETRIES} retries left`}>
              {Array.from({ length: MAX_RETRIES }).map((_, idx) => (
                <RetrySocket key={idx} filled={idx < retriesLeft} />
              ))}
            </div>
          </div>

          <div className="hidden h-7 w-px bg-[#232730] sm:block" aria-hidden="true" />

          {/* Chaos Meter */}
          <div className="hidden sm:block">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Chaos · {chaosLabel}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-sm bg-[#1E222B]">
                <div
                  style={{ width: `${chaosLevel}%` }}
                  className={`h-full transition-[width] duration-200 ${
                    chaosLevel >= 80
                      ? 'bg-[#EF4444]'
                      : chaosLevel >= 45
                        ? 'bg-[#F59E0B]'
                        : 'bg-[#9BA1AE]'
                  }`}
                />
              </div>
              <span className={`font-mono-tabular text-xs font-semibold ${chaosColor}`}>
                {chaosLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Timer + Compact Utility Buttons */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="mr-1 text-left sm:text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Time
            </div>
            <div className="font-mono-tabular text-sm font-semibold leading-none text-[#F2F0EB]">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-2">

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute audio (M)' : 'Mute audio (M)'}
            title={muted ? 'Unmute [M]' : 'Mute [M]'}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#262B35] bg-[#14161A] text-[#9BA1AE] transition-colors hover:border-[#525A6B] hover:text-[#F2F0EB]"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onPause();
            }}
            aria-label="Pause game (P or Escape)"
            title="Pause [P / Esc]"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#262B35] bg-[#14161A] text-[#9BA1AE] transition-colors hover:border-[#525A6B] hover:text-[#F2F0EB]"
          >
            <Pause className="h-4 w-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            aria-label="Restart run (R)"
            title="Restart [R]"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#262B35] bg-[#14161A] text-[#9BA1AE] transition-colors hover:border-[#DC2626] hover:text-[#FCA5A5]"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          </div>
        </div>
      </div>

      {/* Slim 12-segment progress strip + mobile chaos readout */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-12 gap-1" aria-hidden="true">
          {Array.from({ length: TOTAL_LEVELS }).map((_, idx) => {
            const done = idx + 1 < levelNumber;
            const current = idx + 1 === levelNumber;
            return (
              <div
                key={idx}
                className={`h-1.5 rounded-xs transition-colors duration-200 ${
                  done
                    ? 'bg-[#22C55E]'
                    : current
                      ? 'bg-[#EF4444]'
                      : 'bg-[#1D2129]'
                }`}
              />
            );
          })}
        </div>
        <span className={`font-mono-tabular text-[11px] font-semibold sm:hidden ${chaosColor}`}>
          Chaos {chaosLevel}%
        </span>
      </div>
    </div>
  );
};
