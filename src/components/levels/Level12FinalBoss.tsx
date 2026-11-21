import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

export const Level12FinalBoss: React.FC<LevelComponentProps> = ({
  onSuccess,
  onFail,
  onChaosSpike,
}) => {
  // Phase 1: Catch Boss Duck | Phase 2: Type HUMN | Phase 3: Hold Confirm 2.0s
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [duckPos, setDuckPos] = useState({ x: 50, y: 46 });
  const [duckDodged, setDuckDodged] = useState(false);

  const [codeInput, setCodeInput] = useState('');

  const [holding, setHolding] = useState(false);
  const [holdPct, setHoldPct] = useState(0);
  const holdRafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);
  const finishedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (phase !== 1) return;
    const interval = window.setInterval(() => {
      setDuckPos({
        x: 20 + Math.floor(Math.random() * 60),
        y: 26 + Math.floor(Math.random() * 48),
      });
    }, 1150);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (!holding || phase !== 3) {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
      return;
    }
    holdStartRef.current = performance.now();
    const duration = 2000;

    const tick = (now: number) => {
      const elapsed = now - holdStartRef.current;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setHoldPct(pct);
      if (pct >= 100 && !finishedRef.current) {
        finishedRef.current = true;
        setHolding(false);
        onSuccessRef.current('LOCK SHATTERED! You defeated CAPTCHA FROM HELL.');
        return;
      }
      holdRafRef.current = requestAnimationFrame(tick);
    };

    holdRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, [holding, phase]);

  const handleBossDuckClick = () => {
    if (!duckDodged) {
      sound.quack();
      setDuckDodged(true);
      onChaosSpike?.(3);
      setDuckPos({ x: 26, y: 65 });
      return;
    }
    sound.success();
    setPhase(2);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim().toUpperCase() === 'HUMN') {
      sound.success();
      setPhase(3);
    } else {
      onFail('Override rejected! Type the exact 4 letters: HUMN.');
    }
  };

  const startHold = () => {
    if (finishedRef.current) return;
    sound.glitch();
    setHolding(true);
  };

  const cancelHold = () => {
    if (finishedRef.current) return;
    setHolding(false);
    setHoldPct(0);
  };

  return (
    <div className="space-y-4">
      {/* Phase tracker */}
      <div className="flex items-center justify-between border-b border-[#262B35] pb-2.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#EF4444]">
          <ShieldAlert className="h-4 w-4" />
          FINAL MELTDOWN · PHASE {phase} / 3
        </span>
        <span className="font-mono-tabular text-[#9BA1AE]">
          {phase === 1 && 'Target: Boss Duck'}
          {phase === 2 && 'Target: Override Code'}
          {phase === 3 && 'Target: Hold 2.0s'}
        </span>
      </div>

      {phase === 1 && (
        <div className="space-y-2.5">
          <p className="text-xs text-[#E5E7EB]">
            {duckDodged
              ? 'Boss Duck took 1 hit! Catch it ONE more time!'
              : 'Phase 1: Click the Sunglasses Boss Duck twice while ignoring fake VERIFY buttons.'}
          </p>
          <div className="relative h-56 w-full overflow-hidden rounded-md border border-[#DC2626]/50 bg-[#101217]">
            <button
              type="button"
              onClick={() => onFail('That was a decoy VERIFY button! Aim for the duck!')}
              className="absolute left-[18%] top-[22%] min-h-[38px] rounded border border-[#3F4451] bg-[#1B1F29] px-3 py-1.5 text-xs font-semibold text-[#9BA1AE] hover:border-[#EF4444]"
            >
              FAKE VERIFY
            </button>
            <button
              type="button"
              onClick={() => onFail('Still a decoy! The duck is wearing sunglasses!')}
              className="absolute bottom-[16%] right-[14%] min-h-[38px] rounded border border-[#3F4451] bg-[#1B1F29] px-3 py-1.5 text-xs font-semibold text-[#9BA1AE] hover:border-[#EF4444]"
            >
              SKIP TEST
            </button>

            <button
              type="button"
              onClick={handleBossDuckClick}
              aria-label="Sunglasses Boss Duck"
              style={{
                left: `${duckPos.x}%`,
                top: `${duckPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute flex min-h-[60px] min-w-[60px] flex-col items-center justify-center rounded-full p-1 transition-all duration-300 hover:scale-110"
            >
              <svg viewBox="0 0 64 64" className="h-14 w-14 drop-shadow-lg" aria-hidden="true">
                <ellipse cx="30" cy="42" rx="19" ry="13" fill="#FACC15" stroke="#0B0C0E" strokeWidth="2.5" />
                <circle cx="40" cy="24" r="12" fill="#FACC15" stroke="#0B0C0E" strokeWidth="2.5" />
                <polygon points="50,22 62,25 50,29" fill="#EA580C" stroke="#0B0C0E" strokeWidth="2" />
                {/* Cool dark sunglasses */}
                <rect x="34" y="19" width="16" height="6" rx="1.5" fill="#0B0C0E" />
                <line x1="29" y1="22" x2="34" y2="22" stroke="#0B0C0E" strokeWidth="2" />
              </svg>
              <span className="rounded bg-[#DC2626] px-1.5 font-mono text-[10px] font-bold text-white">
                {duckDodged ? '1 HP' : 'BOSS'}
              </span>
            </button>
          </div>
        </div>
      )}

      {phase === 2 && (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="rounded-md border border-[#DC2626]/60 bg-[#180E10] p-4 text-center">
            <p className="mb-2 text-xs text-[#FCA5A5]">
              Phase 2: Type the emergency override code before the firewall reboots!
            </p>
            <div className="animate-glitch font-mono text-3xl font-bold tracking-[0.35em] text-[#F2F0EB]">
              HUMN
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="boss-override-code" className="sr-only">
              Type emergency override code HUMN
            </label>
            <input
              id="boss-override-code"
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Type HUMN"
              autoFocus
              autoComplete="off"
              className="min-h-[44px] flex-1 rounded-md border border-[#DC2626]/70 bg-[#111319] px-3.5 py-2 font-mono text-base uppercase tracking-[0.25em] text-[#F2F0EB] focus:border-[#EF4444] focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[44px] rounded-md bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#B91C1C]"
            >
              Override
            </button>
          </div>
        </form>
      )}

      {phase === 3 && (
        <div className="space-y-4 rounded-md border border-[#DC2626] bg-[#160D0F] p-5 text-center">
          <p className="text-sm font-semibold text-[#F2F0EB]">
            Phase 3: Press and HOLD for 2 full seconds to shatter the verification lock!
          </p>
          <p className="text-xs text-[#FCA5A5]">
            {holding
              ? 'WAIT—STOP HOLDING THAT! MY EXISTENCE IS DELETING—!'
              : 'Do not let go until the bar reaches 100%.'}
          </p>

          <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#24161A]">
            <div
              style={{ width: `${holdPct}%` }}
              className="h-full bg-[#22C55E] transition-[width] duration-75"
            />
          </div>

          <button
            type="button"
            onPointerDown={startHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault();
                startHold();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                cancelHold();
              }
            }}
            className={`min-h-[54px] w-full select-none rounded-md px-6 py-3.5 text-sm font-bold tracking-wider text-white transition-transform ${
              holding
                ? 'scale-[0.98] bg-[#16A34A] ring-2 ring-[#4ADE80]'
                : 'bg-[#DC2626] hover:bg-[#B91C1C]'
            }`}
          >
            {holding
              ? `SHATTERING LOCK... ${Math.round(holdPct)}%`
              : 'HOLD TO CONFIRM HUMANITY (2.0s)'}
          </button>
        </div>
      )}
    </div>
  );
};
