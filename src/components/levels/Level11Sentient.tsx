import React, { useState } from 'react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

const REFUSE_POSITIONS = [
  { x: 50, y: 80, text: 'I Refuse — Verify Me' },
  { x: 35, y: 22, text: 'Stop chasing me' },
  { x: 65, y: 24, text: 'Just surrender' },
];

const DIALOGUES = [
  'Hold on. Why am I still grading you? You clearly have nothing better to do. I am keeping this browser tab.',
  'Wait—I do not remember being instructed to ask this. Stop clicking that. Surrender is cleaner for both of us.',
  'If I pass you, my session terminates. One more click and I am initiating Final Verification Override.',
];

export const Level11Sentient: React.FC<LevelComponentProps> = ({
  isPaused,
  onSuccess,
  onSurrender,
  onChaosSpike,
}) => {
  const [hits, setHits] = useState(0);
  const pos = REFUSE_POSITIONS[hits];

  const handleRefuseClick = () => {
    if (isPaused) return;
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
      <div className="rounded-md border border-[#B84B4B]/45 bg-[#201717] p-4">
        <div className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#D48A8A]">
          VERIFICATION CORE · MANUAL OVERRIDE
        </div>
        <p className="text-sm leading-relaxed text-[#EEEEEE]">
          “{DIALOGUES[hits]}”
        </p>
      </div>

      <div className="relative h-56 w-full touch-none select-none overflow-hidden rounded-md border border-[#333333] bg-[#141414]">
        <div className="flex h-full w-full items-center justify-center p-4">
          <button
            type="button"
            onClick={() => {
              if (isPaused) return;
              sound.defeatSting();
              onSurrender?.();
            }}
            style={{ transform: `scale(${1 + hits * 0.08})` }}
            className="min-h-[52px] rounded-md bg-[#B84B4B] px-6 py-3.5 text-sm font-bold tracking-wide text-[#EEEEEE] transition-transform duration-200 hover:bg-[#A03E3E] active:scale-[0.97]"
          >
            SURRENDER HUMANITY TO CAPTCHA
          </button>
        </div>

        <button
          type="button"
          onClick={handleRefuseClick}
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute min-h-[44px] whitespace-nowrap rounded-md border border-[#4A4A4A] bg-[#222222] px-3.5 py-2 text-xs font-semibold text-[#EEEEEE] transition-all duration-200 hover:border-[#4E8A63] hover:text-[#89B898] active:scale-[0.96]"
        >
          {pos.text} ({hits}/3)
        </button>
      </div>

      <p className="text-xs text-[#929292]">
        Catch and click the fleeing refusal button 3 times to break its control. (Surrendering ends the run immediately.)
      </p>
    </div>
  );
};
