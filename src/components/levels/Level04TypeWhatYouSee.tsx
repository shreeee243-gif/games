import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

const CODE_POOLS = [
  ['H3LL7X', 'H3LL9Q', 'H3LL42'],
  ['N0TB0T', 'N0TB8Z', 'N0TB3X'],
  ['M3AT7K', 'M3AT2V', 'M3AT99'],
];

export const Level04TypeWhatYouSee: React.FC<LevelComponentProps> = ({
  runSeed,
  onSuccess,
  onFail,
}) => {
  const codeStages = React.useMemo(
    () => CODE_POOLS[Math.abs(runSeed) % CODE_POOLS.length],
    [runSeed],
  );
  const [stageIdx, setStageIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('Case-insensitive. Mostly.');

  const currentCode = codeStages[stageIdx];

  const handleChange = (nextVal: string) => {
    setValue(nextVal);
    if (!locked && stageIdx < codeStages.length - 1) {
      if (
        (stageIdx === 0 && nextVal.length === 4) ||
        (stageIdx === 1 && nextVal.length === 5)
      ) {
        sound.glitch();
        setStageIdx((s) => Math.min(codeStages.length - 1, s + 1));
        setNote('Oops, the last two characters mutated while you were typing. Keep up!');
      }
    }
  };

  const handleLock = () => {
    sound.click();
    setLocked(true);
    setNote('Ink locked. Note: previous session paused at character 4 as well.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = value.trim().toUpperCase();
    if (!cleaned) {
      onFail('You submitted empty air. Humans usually press keys first.');
      return;
    }
    if (cleaned === currentCode) {
      onSuccess(
        'Accurate transcription despite active sabotage. Impressive.',
        locked ? 'ink-bolt' : undefined,
      );
      return;
    }
    if (codeStages.includes(cleaned)) {
      onFail(
        `You typed "${cleaned}", which was the code 2 seconds ago. Check the updated ending!`,
      );
      return;
    }
    onFail(`Expected "${currentCode}" (currently). You typed "${cleaned}".`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative overflow-hidden rounded-md border border-[#333333] bg-[#141414] p-5">
        <button
          type="button"
          onClick={handleLock}
          aria-label={locked ? 'Text is locked' : 'Freeze mutating text'}
          title={locked ? 'Text frozen' : 'Freeze mutating text'}
          className={`absolute right-2.5 top-2.5 inline-flex min-h-[40px] items-center gap-1 rounded border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
            locked
              ? 'border-[#4E8A63]/50 bg-[#18231C] text-[#89B898]'
              : 'border-[#333333] bg-[#222222] text-[#929292] hover:border-[#B84B4B] hover:text-[#EEEEEE]'
          }`}
        >
          {locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          {locked ? 'Frozen' : 'Bolt'}
        </button>

        <svg
          viewBox="0 0 320 90"
          className="mx-auto h-24 w-full max-w-[320px] select-none"
          role="img"
          aria-label={`Distorted verification text reading ${currentCode}`}
        >
          <rect width="320" height="90" fill="#181818" rx="4" />
          <path d="M12 24 Q90 68 180 28 T308 52" stroke="#B84B4B" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M18 66 Q120 14 210 64 T306 24" stroke="#6E6E6E" strokeWidth="1.5" fill="none" opacity="0.45" />
          <line x1="0" y1="45" x2="320" y2="41" stroke="#B84B4B" strokeWidth="1" strokeDasharray="6 4" opacity="0.45" />
          {currentCode.split('').map((ch, idx) => {
            const x = 36 + idx * 46;
            const y = 58 + (idx % 2 === 0 ? -5 : 6);
            const rot = (idx % 2 === 0 ? -11 : 12) + (stageIdx * 3);
            const isMutatedTail = idx >= 4 && stageIdx > 0;
            return (
              <text
                key={`${idx}-${ch}`}
                x={x}
                y={y}
                transform={`rotate(${rot} ${x} ${y})`}
                fill={isMutatedTail ? '#D48A8A' : '#EEEEEE'}
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="700"
                fontSize="36"
                letterSpacing="2"
              >
                {ch}
              </text>
            );
          })}
        </svg>

        <p className="mt-2 text-center text-xs text-[#929292]">{note}</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="captcha-text-input" className="sr-only">
          Type the distorted verification code
        </label>
        <input
          id="captcha-text-input"
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type the 6 characters..."
          autoComplete="off"
          spellCheck={false}
          className="min-h-[44px] flex-1 rounded-md border border-[#333333] bg-[#141414] px-3.5 py-2 font-mono text-base uppercase tracking-[0.2em] text-[#EEEEEE] placeholder:tracking-normal placeholder:text-[#666666] focus:border-[#B84B4B] focus:outline-none"
        />
        <button
          type="submit"
          className="min-h-[44px] rounded-md bg-[#B84B4B] px-6 py-2.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-[#A03E3E] active:scale-[0.98]"
        >
          Verify
        </button>
      </div>
    </form>
  );
};
