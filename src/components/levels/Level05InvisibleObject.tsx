import React, { useMemo, useRef, useState } from 'react';
import { evaluateInvisibleHit, type HeatZone } from '../../game/engine';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

interface Ping {
  id: number;
  x: number;
  y: number;
  heat: HeatZone;
}

export const Level05InvisibleObject: React.FC<LevelComponentProps> = ({
  runSeed,
  onSuccess,
  onFail,
}) => {
  const boxRef = useRef<HTMLButtonElement>(null);
  const revealTimeoutRef = useRef<number | null>(null);
  const target = useMemo(() => {
    const spots = [
      { x: 68, y: 38 },
      { x: 30, y: 66 },
      { x: 72, y: 68 },
      { x: 32, y: 34 },
    ];
    return spots[Math.abs(runSeed) % spots.length];
  }, [runSeed]);
  const [pings, setPings] = useState<Ping[]>([]);
  const [hint, setHint] = useState('Click anywhere in the dark void to locate the Invisible Bicycle.');
  const [revealed, setRevealed] = useState(false);
  const [misses, setMisses] = useState(0);

  React.useEffect(() => {
    return () => {
      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const handleVoidClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (revealed) return;
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const result = evaluateInvisibleHit(x, y, target.x, target.y, 13);
    sound.radarPing(result.heat);
    setHint(result.hint);
    setPings((prev) => [...prev.slice(-6), { id: Date.now(), x, y, heat: result.heat }]);

    if (result.hit) {
      setRevealed(true);
      revealTimeoutRef.current = window.setTimeout(() => {
        onSuccess('You actually found an invisible bicycle. Optometrists hate this trick.');
      }, 600);
      return;
    }

    const nextMisses = misses + 1;
    setMisses(nextMisses);
    if (nextMisses >= 6 && nextMisses % 3 === 0) {
      onFail('Six blind pokes into empty darkness. Charging you one retry for flailing.');
    }
  };

  const heatColor = (heat: HeatZone) => {
    if (heat === 'hit') return 'border-[#22C55E]';
    if (heat === 'scalding') return 'border-[#EF4444]';
    if (heat === 'warm') return 'border-[#F59E0B]';
    return 'border-[#64748B]';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[#F2F0EB]">{hint}</span>
        <span className="shrink-0 font-mono-tabular text-[#9BA1AE]">Probes: {misses}</span>
      </div>

      <button
        ref={boxRef}
        type="button"
        data-target-x={target.x}
        data-target-y={target.y}
        onClick={handleVoidClick}
        aria-label="Dark void containing an invisible bicycle. Click to probe."
        className="relative block h-64 w-full touch-none select-none overflow-hidden rounded-md border border-[#2C313C] bg-[#0B0D11] text-left focus-visible:outline-2 focus-visible:outline-[#EF4444] sm:h-72"
      >
        {/* Subtle tactical radar crosshair lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.14) 1px, transparent 1px)',
            backgroundSize: '25% 25%',
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-xs tracking-widest text-[#333B4B]">
            [ 100% GENUINE INVISIBLE BICYCLE INSIDE ]
          </span>
        </div>

        {/* Faint shimmer clue if player gets scalding hot */}
        {(revealed || pings.some((p) => p.heat === 'scalding')) && (
          <svg
            viewBox="0 0 120 70"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`pointer-events-none absolute h-16 w-24 transition-opacity duration-300 ${
              revealed ? 'opacity-100' : 'opacity-25'
            }`}
            aria-hidden="true"
          >
            <circle cx="28" cy="48" r="16" fill="none" stroke={revealed ? '#22C55E' : '#EF4444'} strokeWidth="2.5" strokeDasharray={revealed ? '' : '4 3'} />
            <circle cx="92" cy="48" r="16" fill="none" stroke={revealed ? '#22C55E' : '#EF4444'} strokeWidth="2.5" strokeDasharray={revealed ? '' : '4 3'} />
            <path d="M28 48 L52 24 L82 24 L92 48 M52 24 L60 48 L28 48 M82 24 L86 14 L96 14" fill="none" stroke={revealed ? '#22C55E' : '#EF4444'} strokeWidth="2.5" />
          </svg>
        )}

        {pings.map((ping) => (
          <React.Fragment key={ping.id}>
            <span
              style={{ left: `${ping.x}%`, top: `${ping.y}%` }}
              className={`animate-sonar pointer-events-none absolute h-10 w-10 rounded-full border-2 ${heatColor(
                ping.heat,
              )}`}
            />
            <span
              style={{
                left: `${ping.x}%`,
                top: `${ping.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none absolute h-2 w-2 rounded-full bg-[#F2F0EB]/60"
            />
          </React.Fragment>
        ))}
      </button>

      <p className="text-xs text-[#9BA1AE]">
        Tip: Red rings mean scalding hot. Click directly on the glowing outline once you spot it.
      </p>
    </div>
  );
};
