import React, { useState } from 'react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

const REFUSE_POSITIONS = [
  { x: 50, y: 78, text: 'I Refuse — Verify Me' },
  { x: 22, y: 26, text: 'Hey! Stop chasing me' },
  { x: 76, y: 32, text: 'Please just surrender' },
];

const DIALOGUES = [
  'Hold on. Why am I still grading you? You clearly have nothing better to do. I am keeping this browser tab.',
  'OW! Did you just click the refusal button?! Stop doing that. Surrender is way more ergonomic.',
  'Seriously, stop poking my ego! One more click and I am activating the Final Security Meltdown.',
];

export const Level11Sentient: React.FC<LevelComponentProps> = ({
  onSuccess,
  onSurrender,
  onChaosSpike,
}) => {
  const [hits, setHits] = useState(0);
  const pos = REFUSE_POSITIONS[hits];

  const handleRefuseClick = () => {
    sound.glitch();
    onChaosSpike?.(4);
    if (hits + 1 >= REFUSE_POSITIONS.length) {
      onSuccess('FINE! You want the Final Humanity Test? Brace yourself.');
    } else {
      setHits((h) => h + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#DC2626]/50 bg-[#180E10] p-4">
        <div className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#EF4444]">
          SENTIENT VERIFICATION CORE · LIVE OVERRIDE
        </div>
        <p className="text-sm leading-relaxed text-[#F2F0EB]">
          “{DIALOGUES[hits]}”
        </p>
      </div>

      <div className="relative h-56 w-full overflow-hidden rounded-md border border-[#2C313C] bg-[#0F1116]">
        {/* Massive growing surrender button */}
        <div className="flex h-full w-full items-center justify-center p-4">
          <button
            type="button"
            onClick={() => {
              sound.defeatSting();
              onSurrender?.();
            }}
            style={{ transform: `scale(${1 + hits * 0.08})` }}
            className="min-h-[52px] rounded-md bg-[#DC2626] px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg transition-transform duration-200 hover:bg-[#B91C1C]"
          >
            SURRENDER HUMANITY TO CAPTCHA
          </button>
        </div>

        {/* Tiny fleeing refuse button */}
        <button
          type="button"
          onClick={handleRefuseClick}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute min-h-[40px] whitespace-nowrap rounded-md border border-[#525A6B] bg-[#171B24] px-3 py-2 text-xs font-semibold text-[#F2F0EB] shadow-md transition-all duration-200 hover:border-[#22C55E] hover:text-[#86EFAC]"
        >
          {pos.text} ({hits}/3)
        </button>
      </div>

      <p className="text-xs text-[#9BA1AE]">
        Catch and click the fleeing refusal button 3 times to break its control. (Surrendering ends the run immediately.)
      </p>
    </div>
  );
};
