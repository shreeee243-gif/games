import React from 'react';
import { ArrowLeft, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { TOTAL_LEVELS, formatDuration, getChaosLabel } from '../game/engine';
import type { SystemStatusNotice } from '../game/narrative';
import type { GameMode } from '../game/types';

interface GameHudProps {
  stageNumber: number;
  mode: GameMode;
  seedCode: string;
  personalityName: string;
  retriesLeft: number;
  maxRetries: number;
  chaosLevel: number;
  elapsedSeconds: number;
  statusNotice: SystemStatusNotice;
  anomaliesFound: number;
  muted: boolean;
  canJumpLevels?: boolean;
  stageTitles?: string[];
  onSelectStage?: (stageIdx: number) => void;
  onBack: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

function RetrySocket({ filled }: { filled: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2.5 w-2.5 rounded-xs border transition-colors duration-150 ${
        filled
          ? 'border-[#B84B4B] bg-[#B84B4B]'
          : 'border-[#333333] bg-transparent'
      }`}
    />
  );
}

export const GameHud: React.FC<GameHudProps> = ({
  stageNumber,
  mode,
  seedCode,
  personalityName,
  retriesLeft,
  maxRetries,
  chaosLevel,
  elapsedSeconds,
  statusNotice,
  anomaliesFound,
  muted,
  canJumpLevels = false,
  stageTitles,
  onSelectStage,
  onBack,
  onToggleMute,
  onPause,
  onRestart,
}) => {
  const chaosLabel = getChaosLabel(chaosLevel);
  const chaosColor =
    chaosLevel >= 75 ? 'text-[#B84B4B]' : 'text-[#EEEEEE]';

  const isEndless = mode === 'endless';
  const progressSlots = isEndless ? 6 : TOTAL_LEVELS;
  const activeSlotInCycle = isEndless ? ((stageNumber - 1) % 6) + 1 : stageNumber;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-4 sm:px-6">
      {/* Subtle corporate system status bar — occasionally surfaces quiet identity conflicts */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-wider">
        <span
          className={
            statusNotice.anomaly
              ? 'animate-glitch text-[#B84B4B]'
              : 'text-[#929292]'
          }
        >
          {statusNotice.text}
        </span>
        <span className="font-mono-tabular text-[#777777]">
          {anomaliesFound > 0 ? (
            <span className="mr-2.5 text-[#B84B4B]">
              Anomalies: {anomaliesFound}
            </span>
          ) : null}
          {mode} · {personalityName} · SEED {seedCode}
        </span>
      </div>

      {/* Clean single-row verification telemetry bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-[#262626] py-2.5">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              {isEndless ? 'Wave' : 'Stage'}
            </div>
            <div className="font-mono-tabular text-base font-semibold leading-none text-[#EEEEEE]">
              {String(stageNumber).padStart(2, '0')}
              <span className="text-xs font-normal text-[#777777]">
                {isEndless ? ' / ∞' : ` / ${TOTAL_LEVELS}`}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#262626]" aria-hidden="true" />

          {/* Discrete Retry Indicators */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Retries ({retriesLeft}/{maxRetries})
            </div>
            <div
              className="mt-1 flex items-center gap-1.5"
              aria-label={`${retriesLeft} of ${maxRetries} retries left`}
            >
              {Array.from({ length: maxRetries }).map((_, idx) => (
                <RetrySocket key={idx} filled={idx < retriesLeft} />
              ))}
            </div>
          </div>

          <div className="hidden h-6 w-px bg-[#262626] sm:block" aria-hidden="true" />

          {/* Minimal Chaos Readout */}
          <div className="hidden sm:block">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Chaos · {chaosLabel}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-xs bg-[#222222]">
                <div
                  style={{ width: `${chaosLevel}%` }}
                  className={`h-full transition-[width] duration-200 ${
                    chaosLevel >= 75 ? 'bg-[#B84B4B]' : 'bg-[#777777]'
                  }`}
                />
              </div>
              <span className={`font-mono-tabular text-xs font-medium ${chaosColor}`}>
                {chaosLevel}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Timer + Minimal Utility Controls */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="mr-1 text-left sm:text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Time
            </div>
            <div className="font-mono-tabular text-sm font-medium leading-none text-[#EEEEEE]">
              {formatDuration(elapsedSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onBack();
              }}
              aria-label="Back to mode and level selection"
              title="Back to Levels / Modes"
              className="inline-flex h-11 items-center gap-1 rounded border border-[#333333] bg-[#191919] px-2.5 font-mono text-[11px] text-[#929292] transition-colors hover:border-[#666666] hover:text-[#EEEEEE] sm:h-9"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Levels</span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              aria-label={muted ? 'Unmute audio (M)' : 'Mute audio (M)'}
              title={muted ? 'Unmute [M]' : 'Mute [M]'}
              className="flex h-11 w-11 items-center justify-center rounded border border-[#333333] bg-[#191919] text-[#929292] transition-colors hover:border-[#666666] hover:text-[#EEEEEE] sm:h-9 sm:w-9"
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
              className="flex h-11 w-11 items-center justify-center rounded border border-[#333333] bg-[#191919] text-[#929292] transition-colors hover:border-[#666666] hover:text-[#EEEEEE] sm:h-9 sm:w-9"
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
              className="flex h-11 w-11 items-center justify-center rounded border border-[#333333] bg-[#191919] text-[#929292] transition-colors hover:border-[#B84B4B] hover:text-[#D48A8A] sm:h-9 sm:w-9"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Navigation / Progress Line */}
      <div className="mt-2 flex items-center gap-2">
        {canJumpLevels && onSelectStage && !isEndless ? (
          <nav
            aria-label="Level quick switcher"
            className="grid flex-1 grid-cols-12 gap-1"
          >
            {Array.from({ length: progressSlots }).map((_, idx) => {
              const done = idx + 1 < activeSlotInCycle;
              const current = idx + 1 === activeSlotInCycle;
              const label = stageTitles?.[idx]
                ? `Jump to Level ${idx + 1}: ${stageTitles[idx]}`
                : `Jump to Level ${idx + 1}`;
              return (
                <button
                  key={idx}
                  type="button"
                  data-hud-level={idx + 1}
                  aria-label={label}
                  aria-current={current ? 'step' : undefined}
                  title={`Level ${idx + 1}${stageTitles?.[idx] ? ` — ${stageTitles[idx]}` : ''}`}
                  onClick={() => onSelectStage(idx)}
                  className={`flex h-6 items-center justify-center rounded-xs border font-mono text-[10px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#B84B4B] ${
                    current
                      ? 'border-[#B84B4B] bg-[#B84B4B] font-semibold text-[#EEEEEE]'
                      : done
                        ? 'border-[#4E8A63]/70 bg-[#18231C] text-[#89B898] hover:border-[#4E8A63]'
                        : 'border-[#2A2A2A] bg-[#191919] text-[#929292] hover:border-[#666666] hover:text-[#EEEEEE]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </nav>
        ) : (
          <div
            className={`grid flex-1 gap-1 ${isEndless ? 'grid-cols-6' : 'grid-cols-12'}`}
            aria-hidden="true"
          >
            {Array.from({ length: progressSlots }).map((_, idx) => {
              const done = idx + 1 < activeSlotInCycle;
              const current = idx + 1 === activeSlotInCycle;
              return (
                <div
                  key={idx}
                  className={`h-1.5 rounded-xs transition-colors duration-200 ${
                    done
                      ? 'bg-[#4E8A63]'
                      : current
                        ? 'bg-[#B84B4B]'
                        : 'bg-[#222222]'
                  }`}
                />
              );
            })}
          </div>
        )}
        <span className={`font-mono-tabular text-[11px] font-medium sm:hidden ${chaosColor}`}>
          Chaos {chaosLevel}%
        </span>
      </div>
    </div>
  );
};
