import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, Share2 } from 'lucide-react';
import {
  ALL_ENDING_IDS,
  ENDINGS,
  buildShareText,
  determineEnding,
  formatDuration,
  generateCertificateCode,
  recordUnlockedEnding,
} from '../game/engine';
import type { EndingId, RunStats } from '../game/types';
import { sound } from '../utils/sound';

interface ResultScreenProps {
  stats: RunStats;
  onPlayAgain: () => void;
  onReturnTitle: () => void;
}

function OfficialSeal({ accent }: { accent: 'green' | 'amber' | 'red' }) {
  const stroke =
    accent === 'green' ? '#22C55E' : accent === 'amber' ? '#F59E0B' : '#DC2626';
  const fill =
    accent === 'green' ? '#0D2618' : accent === 'amber' ? '#261C0A' : '#260E11';

  return (
    <svg
      viewBox="0 0 84 84"
      className="h-16 w-16 shrink-0 select-none sm:h-[72px] sm:w-[72px]"
      aria-hidden="true"
    >
      <circle cx="42" cy="42" r="38" fill={fill} stroke={stroke} strokeWidth="2" strokeDasharray="4 2.5" />
      <circle cx="42" cy="42" r="31" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.8" />
      <path
        d="M42 20 L57 27 V42 C57 52 50 60 42 64 C34 60 27 52 27 42 V27 Z"
        fill="#14161A"
        stroke={stroke}
        strokeWidth="2"
      />
      {accent === 'green' ? (
        <path d="M35 42 L40 47 L50 35" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="42" cy="39" r="3.5" fill={stroke} />
          <path d="M36 49 Q42 45 48 49" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  onPlayAgain,
  onReturnTitle,
}) => {
  const ending = useMemo(() => determineEnding(stats), [stats]);
  const certCode = useMemo(
    () => generateCertificateCode(stats, ending.id),
    [stats, ending.id],
  );
  const [unlockedEndings, setUnlockedEndings] = useState<EndingId[]>([]);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setUnlockedEndings(recordUnlockedEnding(ending.id));
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [ending.id]);

  const accentClasses =
    ending.accent === 'green'
      ? 'border-[#22C55E] text-[#4ADE80]'
      : ending.accent === 'amber'
        ? 'border-[#F59E0B] text-[#FBBF24]'
        : 'border-[#DC2626] text-[#EF4444]';

  const outerFrameAccent =
    ending.accent === 'green'
      ? 'border-[#22C55E]/40'
      : ending.accent === 'amber'
        ? 'border-[#F59E0B]/40'
        : 'border-[#DC2626]/45';

  const setShareFeedback = (next: 'copied' | 'shared') => {
    setShareStatus(next);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setShareStatus('idle'), 2600);
  };

  const handleShare = async () => {
    sound.click();
    const text = buildShareText(stats, ending);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `CAPTCHA FROM HELL — ${ending.title}`,
          text,
        });
        setShareFeedback('shared');
        return;
      } catch {
        // User canceled or native share unsupported; fall back to clipboard
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setShareFeedback('copied');
        return;
      }
    } catch {
      // Fallback below
    }

    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      setShareFeedback('copied');
    } finally {
      document.body.removeChild(el);
    }
  };

  const remainingEndings = ALL_ENDING_IDS.length - unlockedEndings.length;

  return (
    <main className="captcha-bg-grid flex min-h-screen w-full items-center justify-center px-4 py-8">
      <section
        aria-label="Official Humanity Assessment Certificate"
        className={`animate-stage-enter relative w-full max-w-xl rounded-lg border bg-[#14161A] p-2.5 shadow-[0_24px_64px_rgba(0,0,0,0.7)] ${outerFrameAccent}`}
      >
        {/* Inner double-hairline certificate frame */}
        <div className="relative rounded-md border border-[#2A2F3A] bg-[#121419] p-5 sm:p-7">
          {/* Corner registration marks */}
          <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-[#525A6B]" />
          <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-[#525A6B]" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-[#525A6B]" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-[#525A6B]" />

          {/* Certificate serial header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232730] pb-3 font-mono text-[11px] uppercase tracking-wider text-[#717786]">
            <span>Department of Biological Verification</span>
            <span className="font-mono-tabular text-[#9BA1AE]">ID {certCode}</span>
          </div>

          {/* Verdict Stamp + Official Seal + Title */}
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div
                className={`animate-stamp inline-block border-2 px-3 py-1 font-mono text-xs font-bold tracking-[0.18em] ${accentClasses}`}
              >
                {ending.stamp}
              </div>
              <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#F2F0EB] sm:text-4xl">
                {ending.title}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#D1D5DB]">
                {ending.subtitle}
              </p>
            </div>
            <OfficialSeal accent={ending.accent} />
          </div>

          {/* Tabular Official Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-y border-[#232730] py-4 sm:grid-cols-4">
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

          {/* Examiner's Official Remarks */}
          <blockquote className="mt-4 rounded-md border border-[#232730] bg-[#0D0F13] px-4 py-3 text-sm italic text-[#C4C9D4]">
            “{ending.roast}”
          </blockquote>

          {/* Replayability Tracker: All 5 Verdicts */}
          <div className="mt-4 border-t border-[#232730] pt-3.5">
            <div className="flex items-center justify-between text-xs text-[#9BA1AE]">
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Verdicts Discovered ({unlockedEndings.length}/{ALL_ENDING_IDS.length})
              </span>
              <span className="text-[11px] text-[#717786]">
                {remainingEndings > 0
                  ? `${remainingEndings} more verdict${remainingEndings > 1 ? 's' : ''} to uncover`
                  : 'All 5 verdicts collected!'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
              {ALL_ENDING_IDS.map((id) => {
                const discovered = unlockedEndings.includes(id);
                const isCurrent = id === ending.id;
                return (
                  <span
                    key={id}
                    className={
                      isCurrent
                        ? 'font-semibold text-[#F2F0EB]'
                        : discovered
                          ? 'text-[#9BA1AE]'
                          : 'text-[#4B5160]'
                    }
                  >
                    {discovered ? `✓ ${ENDINGS[id].title}` : '· ???'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Primary Actions */}
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-md bg-[#DC2626] px-5 py-3 text-sm font-bold tracking-wide text-white transition-all duration-150 hover:bg-[#B91C1C] active:scale-[0.98]"
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
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md border border-[#2F3542] bg-[#1A1D24] px-5 py-3 text-sm font-semibold text-[#F2F0EB] transition-all duration-150 hover:border-[#525A6B] hover:bg-[#222631] active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Play Again
            </button>
          </div>

          {/* Official Signature Footer */}
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
            <span className="font-mono text-[11px]">
              Cleared {stats.levelsCleared}/{stats.totalLevels} · TRY THIS. I DARE YOU.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};
