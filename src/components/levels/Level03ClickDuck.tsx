import React, { useRef, useState } from 'react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

interface DuckEntity {
  id: string;
  x: number; // %
  y: number; // %
  isReal: boolean;
  taunt: string;
}

const MAX_DODGES = 4;

const TAUNTS = [
  'Too slow, mammal!',
  'Quack. Try cardio.',
  'Mitosis activated!',
  'Nice reflexes, grandpa.',
  '*wheeze* okay... my tiny legs hurt.',
];

function DuckSvg({ real, tired }: { real: boolean; tired: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12 drop-shadow-md" aria-hidden="true">
      <ellipse cx="30" cy="42" rx="19" ry="13" fill={real ? '#FACC15' : '#EAB308'} stroke="#0B0C0E" strokeWidth="2.5" />
      <circle cx="40" cy="24" r="12" fill={real ? '#FACC15' : '#EAB308'} stroke="#0B0C0E" strokeWidth="2.5" />
      <polygon points="50,22 62,25 50,29" fill="#EA580C" stroke="#0B0C0E" strokeWidth="2" />
      {tired ? (
        <>
          <path d="M39 20 L45 24 M45 20 L39 24" stroke="#0B0C0E" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M31 14 Q29 19 31 22 Q33 19 31 14 Z" fill="#38BDF8" />
        </>
      ) : (
        <>
          <circle cx="43" cy="22" r="2.6" fill="#0B0C0E" />
          <path d="M39 17 L47 19" stroke="#0B0C0E" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <path d="M18 41 Q28 36 36 43" fill="none" stroke="#CA8A04" strokeWidth="2.5" strokeLinecap="round" />
      {!real && (
        <text x="30" y="46" textAnchor="middle" fill="#0B0C0E" fontSize="8" fontWeight="bold" fontFamily="monospace">
          FAKE
        </text>
      )}
    </svg>
  );
}

export const Level03ClickDuck: React.FC<LevelComponentProps> = ({
  onSuccess,
  onFail,
  onChaosSpike,
}) => {
  const arenaRef = useRef<HTMLDivElement>(null);
  const lastDodgeAt = useRef(0);
  const [dodges, setDodges] = useState(0);
  const [statusLine, setStatusLine] = useState('Hover or tap carefully. The duck senses fear.');
  const [ducks, setDucks] = useState<DuckEntity[]>([
    { id: 'real-duck', x: 50, y: 50, isReal: true, taunt: 'Catch me.' },
  ]);

  const isTired = dodges >= MAX_DODGES;

  const dodgeRealDuck = () => {
    const now = Date.now();
    if (now - lastDodgeAt.current < 260) return;
    lastDodgeAt.current = now;

    sound.quack();
    const nextDodges = dodges + 1;
    setDodges(nextDodges);
    setStatusLine(TAUNTS[Math.min(nextDodges, TAUNTS.length - 1)]);
    onChaosSpike?.(2);

    const newX = 16 + ((nextDodges * 37 + 19) % 68);
    const newY = 20 + ((nextDodges * 43 + 11) % 60);

    setDucks((prev) => {
      const updated = prev.map((d) =>
        d.isReal ? { ...d, x: newX, y: newY } : d,
      );
      if (updated.length < 5) {
        const oldReal = prev.find((d) => d.isReal);
        updated.push({
          id: `decoy-${nextDodges}`,
          x: oldReal ? oldReal.x : 30,
          y: oldReal ? oldReal.y : 30,
          isReal: false,
          taunt: 'DECOY',
        });
      }
      return updated;
    });
  };

  const handleDuckClick = (duck: DuckEntity) => {
    if (!duck.isReal) {
      sound.wrong();
      onFail('You clicked an obvious decoy duck. Look at the label stamped on its wing.');
      return;
    }

    if (!isTired) {
      dodgeRealDuck();
      return;
    }

    onSuccess('You exhausted a digital waterfowl into submission. Very human.');
  };

  const handleArenaPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTired || e.pointerType === 'touch') return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const real = ducks.find((d) => d.isReal);
    if (!real) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const dist = Math.hypot(px - real.x, py - real.y);
    if (dist < 18) {
      dodgeRealDuck();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#9BA1AE]">
        <span>{statusLine}</span>
        <span className="font-mono-tabular text-[#F2F0EB]">
          Stamina: {Math.max(0, MAX_DODGES - dodges)}/{MAX_DODGES}
        </span>
      </div>

      <div
        ref={arenaRef}
        onPointerMove={handleArenaPointerMove}
        className="relative h-64 w-full overflow-hidden rounded-md border border-[#262B35] bg-[#101217] sm:h-72"
      >
        {/* Pond radar grid lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {ducks.map((duck) => (
          <button
            key={duck.id}
            type="button"
            onClick={() => handleDuckClick(duck)}
            aria-label={duck.isReal ? 'Real rubber duck' : `Decoy duck ${duck.id}`}
            style={{
              left: `${duck.x}%`,
              top: `${duck.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute flex min-h-[56px] min-w-[56px] flex-col items-center justify-center rounded-full p-1 transition-all duration-200 ease-out hover:scale-110 focus-visible:outline-2 focus-visible:outline-[#EF4444]"
          >
            <DuckSvg real={duck.isReal} tired={duck.isReal && isTired} />
            {duck.isReal && isTired && (
              <span className="mt-0.5 rounded bg-[#DC2626] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                TIRED
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#9BA1AE]">
        {isTired
          ? 'The duck is out of breath! Click it now before it regains its ego.'
          : 'Chase the real duck until its stamina drops to zero. Ignore clones.'}
      </p>
    </div>
  );
};
