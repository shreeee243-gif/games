import React, { useState } from 'react';
import { loadUnlockedEndings } from '../game/engine';
import { sound } from '../utils/sound';

interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [checkboxState, setCheckboxState] = useState<'idle' | 'checking' | 'betrayed'>('idle');
  const timersRef = React.useRef<number[]>([]);
  const unlockedCount = React.useMemo(() => loadUnlockedEndings().length, []);

  React.useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 6;
    const ny = (e.clientY / window.innerHeight - 0.5) * 4;
    setEyeOffset({ x: nx, y: ny });
  };

  const handleFakeCheckbox = () => {
    if (checkboxState !== 'idle') return;
    sound.click();
    setCheckboxState('checking');
    const t1 = window.setTimeout(() => {
      sound.glitch();
      setCheckboxState('betrayed');
      const t2 = window.setTimeout(() => {
        onStart();
      }, 420);
      timersRef.current.push(t2);
    }, 480);
    timersRef.current.push(t1);
  };

  return (
    <main
      onMouseMove={handleMouseMove}
      className="captcha-bg-grid relative flex min-h-screen w-full flex-col items-center justify-between px-6 py-10 sm:py-12"
    >
      {/* Top quiet brand spacer so the centerpiece breathes over calm negative space */}
      <div className="flex w-full max-w-4xl items-center justify-between text-xs text-[#717786]">
        <span className="font-mono-tabular tracking-wider">HUMANITY GATEWAY</span>
        <span className="font-mono-tabular">
          {unlockedCount > 0 ? `VERDICTS ${unlockedCount}/5 · ` : ''}12 SECURITY LAYERS
        </span>
      </div>

      {/* Main Focal Anchor */}
      <div className="my-auto flex w-full max-w-2xl flex-col items-center py-8 text-center">
        {/* Bespoke inline SVG Title Lockup */}
        <svg
          viewBox="0 0 640 165"
          className="mb-6 w-full max-w-[540px] select-none"
          role="img"
          aria-label="CAPTCHA FROM HELL"
        >
          {/* Demonic horned verification shield emblem */}
          <g transform="translate(278, 4)">
            <path
              d="M16 14 L8 2 L24 10 Z M68 14 L76 2 L60 10 Z"
              fill="#DC2626"
            />
            <path
              d="M42 6 L72 18 V44 C72 62 58 75 42 82 C26 75 12 62 12 44 V18 Z"
              fill="#14161A"
              stroke="#DC2626"
              strokeWidth="2.5"
            />
            {/* Suspicious gaze-tracking eye inside shield */}
            <path
              d="M23 43 Q42 29 61 43 Q42 57 23 43 Z"
              fill="#F2F0EB"
            />
            <circle
              cx={42 + eyeOffset.x}
              cy={43 + eyeOffset.y}
              r="6.5"
              fill="#DC2626"
            />
            <circle
              cx={42 + eyeOffset.x * 1.15}
              cy={43 + eyeOffset.y * 1.15}
              r="2.8"
              fill="#0B0C0E"
            />
          </g>

          {/* Cracked hairline separator */}
          <line x1="88" y1="98" x2="552" y2="98" stroke="#262B35" strokeWidth="1" />
          <line x1="250" y1="98" x2="390" y2="98" stroke="#DC2626" strokeWidth="2" />

          {/* Display Typography Lockup */}
          <text
            x="320"
            y="142"
            textAnchor="middle"
            fill="#F2F0EB"
            fontFamily="Bricolage Grotesque, sans-serif"
            fontWeight="800"
            fontSize="48"
            letterSpacing="-0.02em"
          >
            CAPTCHA FROM <tspan fill="#EF4444">HELL</tspan>
          </text>
        </svg>

        <p className="mb-8 max-w-md text-balance text-sm leading-relaxed text-[#9BA1AE] sm:text-base">
          Prove you are human across 12 increasingly unfair security tests before the system loses its mind.
        </p>

        {/* Interactive Hero Centerpiece: Classic Checkbox Widget */}
        <div className="w-full max-w-sm rounded-lg border border-[#262B35] bg-[#14161A] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleFakeCheckbox}
              aria-label="I am not a robot checkbox"
              className="flex min-h-[52px] flex-1 items-center gap-3.5 rounded-md border border-[#2C313C] bg-[#1A1D24] px-3.5 py-2.5 text-left transition-colors hover:border-[#DC2626] focus-visible:outline-2 focus-visible:outline-[#EF4444]"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                  checkboxState === 'betrayed'
                    ? 'border-[#DC2626] bg-[#DC2626] text-white'
                    : 'border-[#525A6B] bg-[#0F1116]'
                }`}
              >
                {checkboxState === 'checking' && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#EF4444] border-t-transparent" />
                )}
                {checkboxState === 'betrayed' && (
                  <span className="font-mono text-sm font-bold">!</span>
                )}
              </span>
              <span className="text-sm font-medium text-[#F2F0EB]">
                {checkboxState === 'idle' && 'I am not a robot'}
                {checkboxState === 'checking' && 'Judging your soul...'}
                {checkboxState === 'betrayed' && 'Doubtful. Prove it.'}
              </span>
            </button>

            <div className="shrink-0 text-right">
              <div className="font-mono text-[10px] font-semibold tracking-wider text-[#9BA1AE]">
                reHELL
              </div>
              <div className="text-[10px] text-[#6B7280]">Privacy · Mercy</div>
            </div>
          </div>
        </div>

        {/* Primary Start CTA */}
        <div className="mt-6">
          <button
            type="button"
            data-start="true"
            onClick={() => {
              sound.click();
              onStart();
            }}
            className="min-h-[48px] rounded-md bg-[#DC2626] px-8 py-3 text-sm font-bold tracking-wide text-white shadow-[0_8px_28px_rgba(220,38,38,0.28)] transition-all duration-150 hover:bg-[#B91C1C] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2F0EB]"
          >
            Begin Verification
          </button>
        </div>
      </div>

      {/* Single flat bottom control-hint line */}
      <p className="text-center font-mono text-xs text-[#717786]">
        Click / Drag / Type to Verify · Enter Start · Esc Pause · M Mute · R Restart
      </p>
    </main>
  );
};
