import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Flame,
  Infinity as InfinityIcon,
  Shield,
  Shuffle,
  Skull,
} from 'lucide-react';
import {
  GAME_MODES,
  LEVEL_METAS,
  formatDuration,
  getDailySeedCode,
  loadDailyBest,
  loadEndlessBest,
} from '../game/engine';
import type { GameMode } from '../game/types';
import { sound } from '../utils/sound';

interface ModeSelectScreenProps {
  onSelectMode: (mode: GameMode, customSeed?: string) => void;
  onSelectLevel: (levelIndex: number) => void;
  onBackToTitle: () => void;
  onOpenTutorial: () => void;
}

function ModeIcon({ mode }: { mode: GameMode }) {
  switch (mode) {
    case 'classic':
      return <Shield className="h-4 w-4 text-[#EEEEEE]" />;
    case 'chaos':
      return <Shuffle className="h-4 w-4 text-[#B8964B]" />;
    case 'nightmare':
      return <Skull className="h-4 w-4 text-[#B84B4B]" />;
    case 'daily':
      return <Calendar className="h-4 w-4 text-[#89B898]" />;
    case 'endless':
      return <InfinityIcon className="h-4 w-4 text-[#929292]" />;
  }
}

export const ModeSelectScreen: React.FC<ModeSelectScreenProps> = ({
  onSelectMode,
  onSelectLevel,
  onBackToTitle,
  onOpenTutorial,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [customSeed, setCustomSeed] = useState('');

  const dailySeed = useMemo(() => getDailySeedCode(), []);
  const dailyBest = useMemo(() => loadDailyBest(dailySeed), [dailySeed]);
  const endlessBest = useMemo(() => loadEndlessBest(), []);

  const activeMeta = GAME_MODES.find((m) => m.id === selectedMode) ?? GAME_MODES[0];

  const handleLaunch = () => {
    sound.click();
    const cleaned = customSeed.trim().toUpperCase();
    onSelectMode(selectedMode, selectedMode === 'daily' ? dailySeed : cleaned || undefined);
  };

  return (
    <main className="captcha-bg-grid flex min-h-screen w-full flex-col items-center justify-between px-4 py-8 sm:px-6">
      {/* Minimal top utility bar */}
      <div className="flex w-full max-w-4xl items-center justify-between border-b border-[#222222] pb-3 text-xs text-[#929292]">
        <button
          type="button"
          onClick={() => {
            sound.click();
            onBackToTitle();
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 font-mono text-xs text-[#929292] transition-colors hover:text-[#EEEEEE]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Title
        </button>

        <button
          type="button"
          onClick={() => {
            sound.click();
            onOpenTutorial();
          }}
          className="inline-flex min-h-[40px] items-center gap-1.5 font-mono text-xs text-[#929292] transition-colors hover:text-[#EEEEEE]"
        >
          <BookOpen className="h-3.5 w-3.5" />
          How to Play
        </button>
      </div>

      {/* Mode Selection Workspace */}
      <section className="animate-stage-enter my-auto w-full max-w-4xl py-4">
        <div className="mb-4 text-center sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
            Verification Protocol Selection
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#EEEEEE] sm:text-3xl">
            Select Verification Mode
          </h1>
          <p className="mt-1 max-w-xl text-sm text-[#929292]">
            Every mode assigns an Examiner Personality and a reproducible seed you can share.
          </p>
        </div>

        {/* 5 Playable Mode Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            const borderTone = isSelected
              ? mode.id === 'daily'
                ? 'border-[#4E8A63] bg-[#16211A]'
                : 'border-[#B84B4B] bg-[#222222]'
              : 'border-[#333333] bg-[#191919] hover:border-[#555555]';

            return (
              <button
                key={mode.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  sound.click();
                  setSelectedMode(mode.id);
                }}
                className={`flex min-h-[128px] flex-col justify-between rounded-md border p-3.5 text-left transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#B84B4B] ${borderTone}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <ModeIcon mode={mode.id} />
                    <span className="font-mono-tabular text-[11px] text-[#929292]">
                      {mode.stagesLabel} · {mode.retries} Retries
                    </span>
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-[#EEEEEE]">
                    {mode.name}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#929292]">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-3 border-t border-[#262626] pt-2.5 font-mono text-[11px] text-[#777777]">
                  {mode.id === 'daily' && (
                    <span className="text-[#89B898]">
                      {dailySeed}
                      {dailyBest
                        ? ` · Best ${dailyBest.score} (${formatDuration(dailyBest.elapsedSeconds)})`
                        : ' · Unplayed today'}
                    </span>
                  )}
                  {mode.id === 'endless' && (
                    <span>
                      {endlessBest > 0
                        ? `Personal Best: ${endlessBest} stages cleared`
                        : 'Boss wave every 6 stages'}
                    </span>
                  )}
                  {mode.id === 'nightmare' && (
                    <span className="text-[#D48A8A]">
                      <Flame className="mr-1 inline h-3 w-3" />
                      1.5× Score Multiplier
                    </span>
                  )}
                  {mode.id === 'chaos' && <span>1.25× Score · Active Modifiers</span>}
                  {mode.id === 'classic' && <span>Canonical 1–12 Sequence</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Launch & Optional Custom Seed Strip */}
        <div className="mt-5 flex flex-col gap-3 rounded-md border border-[#333333] bg-[#191919] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="custom-seed-input"
              className="whitespace-nowrap font-mono text-xs uppercase tracking-wider text-[#929292]"
            >
              Run Seed
            </label>
            {selectedMode === 'daily' ? (
              <div className="font-mono-tabular text-xs font-medium text-[#89B898]">
                {dailySeed} (Locked to today&apos;s global challenge)
              </div>
            ) : (
              <input
                id="custom-seed-input"
                type="text"
                maxLength={24}
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                placeholder="Random (or enter friend's seed)"
                className="min-h-[42px] w-full max-w-sm rounded border border-[#333333] bg-[#111111] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#EEEEEE] placeholder:normal-case placeholder:tracking-normal placeholder:text-[#666666] focus:border-[#B84B4B] focus:outline-none"
              />
            )}
          </div>

          <button
            type="button"
            data-launch-mode="true"
            onClick={handleLaunch}
            className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded bg-[#B84B4B] px-6 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors duration-150 hover:bg-[#A03E3E]"
          >
            Start {activeMeta.name}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Direct Level Selection (Levels 1-12) */}
        <div className="mt-5 border-t border-[#262626] pt-5">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#EEEEEE]">
                Direct Level Select · 12 Challenges
              </h2>
              <p className="mt-0.5 text-xs text-[#929292]">
                Click any challenge below to open and play it immediately.
              </p>
            </div>
            <span className="font-mono text-[11px] text-[#777777]">
              Starts in Classic order from selected stage
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {LEVEL_METAS.map((level, idx) => (
              <button
                key={level.id}
                type="button"
                data-level-select={level.id}
                aria-label={`Play Level ${level.id}: ${level.title}`}
                onClick={() => {
                  sound.click();
                  onSelectLevel(idx);
                }}
                className="group flex min-h-[76px] flex-col justify-between rounded border border-[#333333] bg-[#191919] p-3 text-left transition-colors duration-150 hover:border-[#B84B4B] hover:bg-[#222222] focus-visible:outline-2 focus-visible:outline-[#B84B4B]"
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[#929292]">
                  <span className="font-semibold text-[#D48A8A]">
                    LV {String(level.id).padStart(2, '0')}
                  </span>
                  <span className="truncate">{level.mechanic}</span>
                </div>
                <div className="mt-1.5 text-xs font-medium leading-snug text-[#EEEEEE] group-hover:text-white">
                  {level.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="text-center font-mono text-[11px] text-[#666666]">
        Same mode + same seed always reproduces the same challenge order and examiner.
      </p>
    </main>
  );
};
