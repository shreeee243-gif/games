import React, { useState } from 'react';
import { Check, RotateCcw, Share2 } from 'lucide-react';
import { buildShareText, determineEnding, formatDuration } from '../game/engine';
import type { RunStats } from '../game/types';
import { sound } from '../utils/sound';

interface ResultScreenProps {
  stats: RunStats;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  onPlayAgain,
  onReturnTitle,
}) => {
  const ending = determineEnding(stats);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');

  const accentClasses =
    ending.accent === 'green'
      ? 'border-[#22C55E] text-[#4ADE80]'
      : ending.accent === 'amber'
        ? 'border-[#F59E0B] text-[#FBBF24]'
        : 'border-[#DC2626] text-[#EF4444]';

  const handleShare = async () => {
    sound.click();
    const text = buildShareText(stats, ending);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `CAPTCHA FROM HELL — ${ending.title}`,
          text,
        });
        setShareStatus('shared');
        window.setTimeout(() => setShareStatus('idle'), 2600);
        return;
      } catch {
        // User canceled or browser blocked native share; fall back to clipboard
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setShareStatus('copied');
        window.setTimeout(() => setShareStatus('idle'), 2600);
        return;
      }
    } catch {
      // Fallback below
    }

    // Legacy textarea fallback for restricted contexts
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setShareStatus('copied');
      window.setTimeout(() => setShareStatus('idle'), 2600);
    } finally {
      document.body.removeChild(el);
    }
  };

  return (
    <main className="captcha-bg-grid flex min-h-screen w-full items-center justify-center px-4 py-10">
      <section
        aria-label="Final Humanity Assessment"
        className="relative w-full max-w-lg rounded-lg border border-[#2C313C] bg-[#14161A] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.65)] sm:p-8"
      >
        {/* Top dossier line */}
        <div className="flex items-center justify-between border-b border-[#232730] pb-3 font-mono text-[11px] uppercase tracking-wider text-[#717786]">
          <span>Humanity Assessment Dossier</span>
          <span className="font-mono-tabular">
            {stats.levelsCleared}/{stats.totalLevels} Cleared
          </span>
        </div>

        {/* Verdict Stamp + Title */}
        <div className="mt-6 flex flex-col items-start gap-3">
          <div
            className={`animate-stamp inline-block border-2 px-3 py-1 font-mono text-xs font-bold tracking-[0.18em] ${accentClasses}`}
          >
            {ending.stamp}
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#F2F0EB] sm:text-4xl">
            {ending.title}
          </h1>
          <p className="text-sm leading-relaxed text-[#D1D5DB]">{ending.subtitle}</p>
        </div>

        {/* Tabular Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#232730] py-5 sm:grid-cols-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Attempts
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F2F0EB]">
              {stats.attempts}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Time Taken
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F2F0EB]">
              {formatDuration(stats.elapsedSeconds)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Failed Checks
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#EF4444]">
              {stats.failedVerifications}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#717786]">
              Final Chaos
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F59E0B]">
              {stats.finalChaos}%
            </div>
          </div>
        </div>

        {/* Contextual Roast */}
        <blockquote className="mt-5 rounded-md bg-[#101217] px-4 py-3 text-sm italic text-[#9BA1AE]">
          “{ending.roast}”
        </blockquote>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md bg-[#DC2626] px-5 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-[#B91C1C] active:scale-[0.98]"
          >
            {shareStatus !== 'idle' ? (
              <>
                <Check className="h-4 w-4" />
                {shareStatus === 'shared' ? 'Shared!' : 'Copied Failure Card!'}
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share Your Failure
              </>
            )}
          </button>

          <button
            type="button"
            data-start="true"
            onClick={() => {
              sound.click();
              onPlayAgain();
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-[#2F3542] bg-[#1A1D24] px-5 py-3 text-sm font-semibold text-[#F2F0EB] transition-colors hover:border-[#525A6B] hover:bg-[#222631]"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#717786]">
          <button
            type="button"
            onClick={() => {
              sound.click();
              onReturnTitle();
            }}
            className="underline decoration-[#3F4451] underline-offset-4 hover:text-[#F2F0EB]"
          >
            Return to Title
          </button>
          <span className="font-mono text-[11px]">TRY THIS. I DARE YOU.</span>
        </div>
      </section>
    </main>
  );
};
