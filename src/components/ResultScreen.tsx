import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Link2, RotateCcw, Share2, Swords } from 'lucide-react';
import {
  ALL_ENDING_IDS,
  ENDINGS,
  buildChallengeUrl,
  buildShareText,
  calculateHumanityMetrics,
  compareChallengeResults,
  determineEnding,
  formatDuration,
  generateCertificateCode,
  recordUnlockedEnding,
} from '../game/engine';
import { resolveHiddenEndingVariation } from '../game/narrative';
import { PERSONALITIES } from '../game/personality';
import type { EndingId, FriendChallenge, RunStats } from '../game/types';
import { sound } from '../utils/sound';

interface ResultScreenProps {
  stats: RunStats;
  friendChallenge: FriendChallenge | null;
  onPlayAgain: () => void;
  onChangeMode: () => void;
  onReturnTitle: () => void;
}

function OfficialSeal({ accent }: { accent: 'green' | 'amber' | 'red' }) {
  const stroke =
    accent === 'green' ? '#4E8A63' : accent === 'amber' ? '#B8964B' : '#B84B4B';
  const fill =
    accent === 'green' ? '#16211A' : accent === 'amber' ? '#231F16' : '#241717';

  return (
    <svg
      viewBox="0 0 84 84"
      className="h-14 w-14 shrink-0 select-none sm:h-16 sm:w-16"
      aria-hidden="true"
    >
      <circle
        cx="42"
        cy="42"
        r="38"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeDasharray="4 2.5"
      />
      <circle
        cx="42"
        cy="42"
        r="31"
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M42 22 L56 28 V42 C56 51 50 58 42 62 C34 58 28 51 28 42 V28 Z"
        fill="#191919"
        stroke={stroke}
        strokeWidth="1.6"
      />
      {accent === 'green' ? (
        <path
          d="M35 42 L40 47 L50 35"
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <circle cx="42" cy="39" r="3" fill={stroke} />
          <path
            d="M36 49 Q42 45 48 49"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

async function copyTextSafe(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
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
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(el);
  }
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  friendChallenge,
  onPlayAgain,
  onChangeMode,
  onReturnTitle,
}) => {
  const ending = useMemo(() => determineEnding(stats), [stats]);
  const metrics = useMemo(() => calculateHumanityMetrics(stats), [stats]);
  const certCode = useMemo(
    () => generateCertificateCode(stats, ending.id),
    [stats, ending.id],
  );
  const hiddenVariation = useMemo(
    () => resolveHiddenEndingVariation(stats, ending.id),
    [stats, ending.id],
  );
  const personality = stats.personalityId
    ? PERSONALITIES[stats.personalityId]
    : PERSONALITIES['passive-aggressive'];

  const comparison = useMemo(
    () => (friendChallenge ? compareChallengeResults(stats, friendChallenge) : null),
    [stats, friendChallenge],
  );

  const [unlockedEndings, setUnlockedEndings] = useState<EndingId[]>([]);
  const [challengerName, setChallengerName] = useState('');
  const [showChallengeBox, setShowChallengeBox] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
  const [linkCopied, setLinkCopied] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

  const challengeUrl = useMemo(() => {
    const base =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://captcha-from-hell.app/';
    return buildChallengeUrl(
      base,
      { ...stats, score: metrics.score, humanityPct: metrics.humanityPct, rank: metrics.rank },
      ending,
      challengerName.trim() || 'Your Friend',
    );
  }, [stats, metrics, ending, challengerName]);

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
      ? 'border-[#4E8A63] text-[#89B898]'
      : ending.accent === 'amber'
        ? 'border-[#B8964B] text-[#D8BF7D]'
        : 'border-[#B84B4B] text-[#D48A8A]';

  const setTransientShare = (next: 'copied' | 'shared') => {
    setShareStatus(next);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setShareStatus('idle'), 2600);
  };

  const handleShareResult = async () => {
    sound.click();
    const text = buildShareText(
      { ...stats, score: metrics.score, humanityPct: metrics.humanityPct, rank: metrics.rank },
      ending,
      challengeUrl,
    );

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `CAPTCHA FROM HELL — ${ending.title}`,
          text,
        });
        setTransientShare('shared');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    await copyTextSafe(text);
    setTransientShare('copied');
  };

  const handleCopyChallengeLink = async () => {
    sound.click();
    await copyTextSafe(challengeUrl);
    setLinkCopied(true);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setLinkCopied(false), 2600);
  };

  const remainingEndings = ALL_ENDING_IDS.length - unlockedEndings.length;
  const secretsCount = stats.secretsDiscovered?.length ?? 0;
  const bossesCount = stats.bossesDefeated ?? (stats.victory ? 1 : 0);

  return (
    <main className="captcha-bg-grid flex min-h-screen w-full items-center justify-center px-4 py-8">
      <section
        aria-label="Official Humanity Assessment Certificate"
        className="animate-stage-enter w-full max-w-2xl rounded-md border border-[#333333] bg-[#191919] p-5 sm:p-7"
      >
        {/* Certificate Serial & Mode Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-3 font-mono text-[11px] uppercase tracking-wider text-[#929292]">
          <span>
            Department of Biological Verification · {(stats.mode ?? 'classic').toUpperCase()}
          </span>
          <span className="font-mono-tabular text-[#EEEEEE]">
            ID {certCode} · SEED {stats.seedCode ?? 'CLASSIC'}
          </span>
        </div>

        {/* Verdict Stamp + Title + Seal */}
        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`animate-stamp inline-block border px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-[0.16em] ${accentClasses}`}
              >
                {ending.stamp}
              </span>
              <span className="font-mono-tabular text-xs font-medium text-[#929292]">
                {metrics.humanityPct}% Human · Rank {metrics.rank}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#EEEEEE] sm:text-3xl">
              {ending.title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
              {ending.subtitle}
            </p>
          </div>
          <OfficialSeal accent={ending.accent} />
        </div>

        {/* Head-to-Head Friend Challenge Comparison */}
        {friendChallenge && comparison && (
          <div
            aria-label="Friend Challenge Comparison"
            className={`mt-5 rounded border p-4 ${
              comparison.winner === 'player'
                ? 'border-[#4E8A63]/70 bg-[#16211A]'
                : comparison.winner === 'friend'
                  ? 'border-[#B84B4B]/70 bg-[#231717]'
                  : 'border-[#333333] bg-[#222222]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-[#EEEEEE]">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Swords className="h-3.5 w-3.5 text-[#B84B4B]" />
                Head-to-Head Seed Duel
              </span>
              <span className="text-[#929292]">SEED {friendChallenge.seedCode}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-[#EEEEEE]">
              {comparison.headline}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-2.5 text-xs">
              <div className="font-mono text-[#929292]">Metric</div>
              <div className="font-mono font-semibold text-[#EEEEEE]">You</div>
              <div className="font-mono text-[#929292]">{friendChallenge.challengerName}</div>

              <div className="text-[#929292]">Score</div>
              <div className="font-mono-tabular font-semibold text-[#EEEEEE]">
                {comparison.playerScore}
              </div>
              <div className="font-mono-tabular text-[#D0D0D0]">{friendChallenge.score}</div>

              <div className="text-[#929292]">Time</div>
              <div className="font-mono-tabular font-semibold text-[#EEEEEE]">
                {formatDuration(stats.elapsedSeconds)}
              </div>
              <div className="font-mono-tabular text-[#D0D0D0]">
                {formatDuration(friendChallenge.elapsedSeconds)}
              </div>

              <div className="text-[#929292]">Mistakes</div>
              <div className="font-mono-tabular font-semibold text-[#EEEEEE]">
                {stats.failedVerifications}
              </div>
              <div className="font-mono-tabular text-[#D0D0D0]">
                {friendChallenge.failedVerifications}
              </div>

              <div className="text-[#929292]">Ending</div>
              <div className="font-medium text-[#EEEEEE]">{ending.title}</div>
              <div className="text-[#D0D0D0]">
                {ENDINGS[friendChallenge.endingId].title}
              </div>
            </div>
          </div>
        )}

        {/* Dossier Metrics Grid */}
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-[#262626] py-4 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Final Score
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#EEEEEE]">
              {metrics.score}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Completion Time
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#EEEEEE]">
              {formatDuration(stats.elapsedSeconds)}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Mistakes
            </div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#B84B4B]">
              {stats.failedVerifications}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Chaos Survived
            </div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-[#EEEEEE]">
              {stats.finalChaos}%
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Bosses Defeated
            </div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-[#EEEEEE]">
              {bossesCount}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
              Anomalies Found
            </div>
            <div className="font-mono-tabular mt-1 text-xl font-semibold text-[#89B898]">
              {secretsCount}
            </div>
          </div>
        </div>

        {/* Examiner Remarks */}
        <div className="mt-4 rounded border border-[#262626] bg-[#111111] px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#929292]">
            Examiner: <span className="text-[#EEEEEE]">{personality.name}</span> ·{' '}
            {personality.title}
          </div>
          <p className="mt-1 text-sm italic text-[#D0D0D0]">“{ending.roast}”</p>
        </div>

        {/* Subtle Optional Hidden Ending Variation (Archival Discrepancy Note) */}
        {hiddenVariation && (
          <div
            aria-label="Archival addendum"
            className="mt-3 rounded border border-[#B84B4B]/45 bg-[#1D1515] px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[#D48A8A]">
              <span>ADDENDUM · {hiddenVariation.label}</span>
              <span>{hiddenVariation.code}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#D0D0D0]">
              {hiddenVariation.note}
            </p>
          </div>
        )}

        {/* Replayability Tracker: All 5 Verdicts */}
        <div className="mt-4 border-t border-[#262626] pt-3.5">
          <div className="flex items-center justify-between text-xs text-[#929292]">
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Verdicts Discovered ({unlockedEndings.length}/{ALL_ENDING_IDS.length})
            </span>
            <span className="text-[11px] text-[#777777]">
              {remainingEndings > 0
                ? `${remainingEndings} more verdict${remainingEndings > 1 ? 's' : ''} to uncover`
                : 'All 5 verdicts collected'}
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
                      ? 'font-semibold text-[#EEEEEE]'
                      : discovered
                        ? 'text-[#929292]'
                        : 'text-[#555555]'
                  }
                >
                  {discovered ? `✓ ${ENDINGS[id].title}` : '· ???'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Expandable Challenge-a-Friend Link Builder */}
        {showChallengeBox && (
          <div className="animate-stage-enter mt-4 rounded border border-[#333333] bg-[#111111] p-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="challenger-name-input" className="sr-only">
                Your display name for the challenge link
              </label>
              <input
                id="challenger-name-input"
                type="text"
                maxLength={24}
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
                placeholder="Your name (optional, e.g. Alex)"
                className="min-h-[42px] flex-1 rounded border border-[#333333] bg-[#191919] px-3 py-1.5 text-xs text-[#EEEEEE] placeholder:text-[#666666] focus:border-[#B84B4B] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyChallengeLink}
                className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded bg-[#B84B4B] px-4 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
              >
                {linkCopied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                {linkCopied ? 'Challenge Link Copied!' : 'Copy Challenge Link'}
              </button>
            </div>
            <p className="mt-2 truncate font-mono text-[11px] text-[#777777]">
              {challengeUrl}
            </p>
          </div>
        )}

        {/* Primary Actions */}
        <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleShareResult}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded bg-[#B84B4B] px-4 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
          >
            {shareStatus !== 'idle' ? (
              <>
                <Check className="h-4 w-4" />
                {shareStatus === 'shared' ? 'Shared!' : 'Result Copied!'}
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share Result
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.click();
              setShowChallengeBox((v) => !v);
            }}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded border border-[#333333] bg-[#222222] px-4 py-2.5 text-sm font-medium text-[#EEEEEE] transition-colors hover:border-[#B84B4B]"
          >
            <Swords className="h-4 w-4 text-[#B84B4B]" />
            Challenge a Friend
          </button>

          <button
            type="button"
            data-start="true"
            onClick={() => {
              sound.click();
              onPlayAgain();
            }}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded border border-[#333333] bg-[#191919] px-4 py-2.5 text-sm font-medium text-[#EEEEEE] transition-colors hover:bg-[#222222]"
          >
            <RotateCcw className="h-4 w-4 text-[#929292]" />
            Play Again
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#929292]">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                sound.click();
                onChangeMode();
              }}
              className="underline decoration-[#444444] underline-offset-4 hover:text-[#EEEEEE]"
            >
              Change Mode
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                onReturnTitle();
              }}
              className="underline decoration-[#444444] underline-offset-4 hover:text-[#EEEEEE]"
            >
              Return to Title
            </button>
          </div>
          <span className="font-mono text-[11px] text-[#777777]">
            Cleared {stats.levelsCleared}/{stats.mode === 'endless' ? '∞' : stats.totalLevels}
          </span>
        </div>
      </section>
    </main>
  );
};
