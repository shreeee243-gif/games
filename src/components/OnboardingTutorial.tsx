import React, { useState } from 'react';
import { ArrowRight, Check, Flame, Keyboard, Shuffle, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface OnboardingTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const TOTAL_STEPS = 4;

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  onComplete,
  onSkip,
}) => {
  const [step, setStep] = useState(0);

  const [miniSolved, setMiniSolved] = useState(false);
  const [miniFeedback, setMiniFeedback] = useState(
    'Tap the ONLY square containing an actual traffic light.',
  );

  const [demoChaos, setDemoChaos] = useState(14);
  const [demoQuip, setDemoQuip] = useState(
    'Right now the system looks ordinary. Poke it to preview how it escalates.',
  );

  const handleMiniPick = (kind: 'duck' | 'signal' | 'bread') => {
    if (kind === 'signal') {
      sound.success();
      setMiniSolved(true);
      setMiniFeedback('Correct. Yes, unreasonably tiny signals legally count.');
    } else if (kind === 'duck') {
      sound.quack();
      setMiniFeedback('That is a suspicious duck. You will meet him in Stage 3—and he runs.');
    } else {
      sound.wrong();
      setMiniFeedback('Sir, that is a loaf of bread. In Stage 2 we will gaslight you about it.');
    }
  };

  const handlePokeChaos = () => {
    sound.glitch();
    setDemoChaos((prev) => {
      const next = Math.min(100, prev + 28);
      if (next >= 90) {
        setDemoQuip('Threshold exceeded. Expect unscripted prompts, interruptions, and identity discrepancies.');
      } else if (next >= 60) {
        setDemoQuip('Hostile review active. Mistakes raise Chaos and trigger system interruptions.');
      } else {
        setDemoQuip('Suspicion rising. Keep poking to test system stability.');
      }
      return next;
    });
  };

  const handleNext = () => {
    sound.click();
    if (step + 1 >= TOTAL_STEPS) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <main className="captcha-bg-grid flex min-h-screen w-full flex-col items-center justify-between px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-xl items-center justify-between border-b border-[#222222] pb-3 text-xs text-[#929292]">
        <span className="font-mono-tabular uppercase tracking-wider">
          Candidate Orientation · Step {step + 1}/{TOTAL_STEPS}
        </span>
        <button
          type="button"
          onClick={() => {
            sound.click();
            onSkip();
          }}
          className="min-h-[40px] px-2 font-mono text-xs text-[#929292] underline decoration-[#444444] underline-offset-4 transition-colors hover:text-[#EEEEEE]"
        >
          Skip Tutorial
        </button>
      </div>

      <section
        aria-label="Interactive Orientation"
        className="animate-stage-enter my-auto w-full max-w-xl rounded-md border border-[#333333] bg-[#191919] p-5 sm:p-7"
      >
        <div className="mb-5 grid grid-cols-4 gap-1.5" aria-hidden="true">
          {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1 rounded-xs transition-colors duration-200 ${
                idx < step
                  ? 'bg-[#4E8A63]'
                  : idx === step
                    ? 'bg-[#B84B4B]'
                    : 'bg-[#222222]'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div key="step-0" className="animate-stage-enter space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
                Lesson 01 · Unfair Rules
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#EEEEEE]">
                Nothing Is What It Looks Like
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
                Each stage tests you with a different mechanic—visual grids, fleeing ducks,
                mutating codes, invisible radar, drag sockets, interrogation, and a 3-phase Final
                Boss. Try this warm-up check:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handleMiniPick('duck')}
                className="flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded border border-[#333333] bg-[#222222] p-3 text-xs text-[#EEEEEE] transition-colors hover:border-[#666666]"
              >
                <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
                  <ellipse cx="22" cy="31" rx="14" ry="9" fill="#D4B44A" stroke="#111111" strokeWidth="2" />
                  <circle cx="30" cy="18" r="8" fill="#D4B44A" stroke="#111111" strokeWidth="2" />
                  <polygon points="37,16 45,19 37,22" fill="#B8683A" />
                </svg>
                <span>Smug Duck</span>
              </button>

              <button
                type="button"
                onClick={() => handleMiniPick('signal')}
                className={`relative flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded border p-3 text-xs transition-colors ${
                  miniSolved
                    ? 'border-[#4E8A63] bg-[#16211A] text-[#89B898]'
                    : 'border-[#333333] bg-[#222222] text-[#EEEEEE] hover:border-[#B84B4B]'
                }`}
              >
                <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
                  <rect x="6" y="28" width="36" height="12" rx="2" fill="#191919" />
                  <rect x="33" y="13" width="6" height="14" rx="1.5" fill="#111111" stroke="#555555" strokeWidth="1" />
                  <circle cx="36" cy="16.5" r="1.4" fill="#B84B4B" />
                  <circle cx="36" cy="20" r="1.4" fill="#B8964B" />
                  <circle cx="36" cy="23.5" r="1.4" fill="#4E8A63" />
                </svg>
                <span>Tiny Signal</span>
                {miniSolved && (
                  <span className="animate-pop absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#4E8A63] text-[#111111]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleMiniPick('bread')}
                className="flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded border border-[#333333] bg-[#222222] p-3 text-xs text-[#EEEEEE] transition-colors hover:border-[#666666]"
              >
                <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
                  <rect x="8" y="18" width="32" height="18" rx="6" fill="#A6723B" stroke="#4A3219" strokeWidth="2" />
                  <rect x="13" y="22" width="6" height="5" rx="1" fill="#E5D7B8" />
                  <rect x="22" y="22" width="6" height="5" rx="1" fill="#E5D7B8" />
                  <rect x="31" y="22" width="5" height="5" rx="1" fill="#E5D7B8" />
                </svg>
                <span>Bread Bus?</span>
              </button>
            </div>

            <p
              role="status"
              className={`rounded border px-3.5 py-2.5 text-xs ${
                miniSolved
                  ? 'border-[#4E8A63]/60 bg-[#16211A] text-[#89B898]'
                  : 'border-[#333333] bg-[#111111] text-[#929292]'
              }`}
            >
              {miniFeedback}
            </p>
          </div>
        )}

        {step === 1 && (
          <div key="step-1" className="animate-stage-enter space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
                Lesson 02 · The Chaos Engine
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#EEEEEE]">
                The System Loses Composure
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
                As you advance or make mistakes, Chaos climbs. Expect stalled loading bars, fake
                crashes, cursor swaps, and occasional notices you were not meant to see.
              </p>
            </div>

            <div
              className={`rounded border bg-[#111111] p-4 transition-colors duration-200 ${
                demoChaos >= 85 ? 'border-[#B84B4B]' : 'border-[#333333]'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-wider text-[#929292]">
                  Simulated Chaos Meter
                </span>
                <span
                  className={`font-mono-tabular font-semibold ${
                    demoChaos >= 75 ? 'text-[#B84B4B]' : 'text-[#EEEEEE]'
                  }`}
                >
                  {demoChaos}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-xs bg-[#222222]">
                <div
                  style={{ width: `${demoChaos}%` }}
                  className={`h-full transition-[width] duration-200 ${
                    demoChaos >= 75 ? 'bg-[#B84B4B]' : 'bg-[#777777]'
                  }`}
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#EEEEEE]">{demoQuip}</p>

              <button
                type="button"
                onClick={handlePokeChaos}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded border border-[#333333] bg-[#222222] px-4 py-2 text-xs font-semibold text-[#EEEEEE] transition-colors hover:border-[#B84B4B]"
              >
                <Flame className="h-4 w-4 text-[#B84B4B]" />
                {demoChaos >= 100 ? 'Maximum Escalation Reached' : 'Poke the Chaos Engine'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="step-2" className="animate-stage-enter space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
                Lesson 03 · Replayability &amp; Clues
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#EEEEEE]">
                Modes, Seeds &amp; Hidden Anomalies
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
                Every run generates a reproducible seed and assigns an Examiner Personality. Pay
                close attention to fine print, subtle locks, and system status messages.
              </p>
            </div>

            <div className="space-y-3 border-y border-[#262626] py-3.5 text-sm">
              <div className="flex items-start gap-3">
                <Shuffle className="mt-0.5 h-4 w-4 shrink-0 text-[#929292]" />
                <div>
                  <strong className="text-[#EEEEEE]">5 Playable Modes:</strong>{' '}
                  <span className="text-[#929292]">
                    Classic, shuffled Chaos, 3-retry Nightmare, shared Daily Challenge, and Endless
                    Wave Survival.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#B84B4B]" />
                <div>
                  <strong className="text-[#EEEEEE]">5 Endings &amp; Hidden Notes:</strong>{' '}
                  <span className="text-[#929292]">
                    Uncovering subtle shortcuts and anomalies unlocks hidden archival remarks on
                    your final verification dossier.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div key="step-3" className="animate-stage-enter space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#929292]">
                Lesson 04 · Controls
              </p>
              <h1 className="mt-1 text-xl font-bold text-[#EEEEEE]">
                Pause, Mute &amp; Restart Anytime
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-[#929292]">
                Every challenge supports mouse, touch, and keyboard. Use the top bar or these
                shortcuts anytime during a run:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded border border-[#333333] bg-[#222222] p-3">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#EEEEEE]">
                  <Keyboard className="h-3.5 w-3.5 text-[#B84B4B]" />
                  Esc / P
                </div>
                <p className="mt-1 text-xs text-[#929292]">
                  Pause timers and suspend verification.
                </p>
              </div>
              <div className="rounded border border-[#333333] bg-[#222222] p-3">
                <div className="font-mono text-xs font-semibold text-[#EEEEEE]">M Key</div>
                <p className="mt-1 text-xs text-[#929292]">
                  Mute or unmute sound effects.
                </p>
              </div>
              <div className="rounded border border-[#333333] bg-[#222222] p-3">
                <div className="font-mono text-xs font-semibold text-[#EEEEEE]">R Key</div>
                <p className="mt-1 text-xs text-[#929292]">
                  Restart immediately from Stage 1.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#262626] pt-4">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => {
              sound.click();
              setStep((s) => Math.max(0, s - 1));
            }}
            className="min-h-[44px] rounded px-3 text-xs font-medium text-[#929292] transition-colors hover:text-[#EEEEEE] disabled:opacity-30"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex min-h-[46px] items-center gap-2 rounded bg-[#B84B4B] px-6 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E]"
          >
            {step + 1 >= TOTAL_STEPS ? 'Choose Your Mode' : 'Next Step'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <p className="text-center font-mono text-[11px] text-[#666666]">
        Replay this orientation anytime from How to Play.
      </p>
    </main>
  );
};
