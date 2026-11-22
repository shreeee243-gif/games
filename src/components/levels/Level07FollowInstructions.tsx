import React, { useEffect, useState } from 'react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

export const Level07FollowInstructions: React.FC<LevelComponentProps> = ({
  isPaused,
  onSuccess,
  onFail,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [blueTurnedRed, setBlueTurnedRed] = useState(false);
  const onSuccessRef = React.useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const completedRef = React.useRef(false);

  useEffect(() => {
    if (isPaused || completedRef.current) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused || completedRef.current) return;
    if (secondsLeft > 0 && secondsLeft <= 3) {
      sound.countdownTick();
    } else if (secondsLeft === 0) {
      completedRef.current = true;
      onSuccessRef.current(
        'Shocking impulse control! You actually refused to press the giant red button.',
      );
    }
  }, [secondsLeft, isPaused]);

  const hitRedBait = (label: string) => {
    if (completedRef.current) return;
    setSecondsLeft(5);
    onFail(label);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-md border border-[#333333] bg-[#141414] p-4 text-sm">
        <p className="font-semibold text-[#EEEEEE]">
          1. Click the red button immediately to continue.
        </p>
        <p className="font-semibold text-[#D48A8A]">
          2. Do NOT click the red button.
        </p>
        <p className="text-[#929292]">
          3. Clicking the red button will immediately invalidate your humanity.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-md border border-[#333333] bg-[#181818] p-5">
        <div className="font-mono-tabular text-xs text-[#929292]">
          Impulse Patience Check:{' '}
          <strong className="text-sm text-[#EEEEEE]">{secondsLeft}s</strong>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              hitRedBait('Rule 2 and Rule 3 explicitly told you NOT to click it! Impulse failed.')
            }
            className="min-h-[48px] flex-1 rounded-md bg-[#B84B4B] px-5 py-3 text-sm font-bold tracking-wide text-[#EEEEEE] transition-transform hover:scale-[1.01] hover:bg-[#A03E3E] active:scale-[0.98]"
          >
            DO NOT CLICK (CONTINUE)
          </button>

          <button
            type="button"
            onMouseEnter={() => {
              sound.glitch();
              setBlueTurnedRed(true);
            }}
            onFocus={() => setBlueTurnedRed(true)}
            onClick={() => {
              if (blueTurnedRed) {
                hitRedBait('Aha! It turned red right before you clicked. Technically a red button!');
              } else {
                sound.glitch();
                setBlueTurnedRed(true);
                hitRedBait('Psych! That blue button is painted red on the inside.');
              }
            }}
            className={`min-h-[48px] flex-1 rounded-md px-5 py-3 text-sm font-semibold text-[#EEEEEE] transition-colors duration-150 ${
              blueTurnedRed
                ? 'bg-[#B84B4B] hover:bg-[#A03E3E]'
                : 'bg-[#3B5B8C] hover:bg-[#B84B4B]'
            }`}
          >
            {blueTurnedRed ? 'HAHA IT IS RED NOW' : 'Definitely Not Red'}
          </button>
        </div>

        <p className="pt-1 text-center text-[11px] leading-relaxed text-[#7A7A7A]">
          Compliance Clause 7.4: To verify{' '}
          <button
            type="button"
            onClick={() => {
              if (completedRef.current) return;
              completedRef.current = true;
              sound.click();
              onSuccess(
                'Clause 7.4 logged: unscripted hesitation recorded. Certified human compliance.',
                'fine-print',
              );
            }}
            className="cursor-pointer underline decoration-[#555555] underline-offset-2 transition-colors hover:text-[#EEEEEE]"
          >
            human
          </button>{' '}
          restraint, keep your hands off ALL buttons for 5 seconds.
        </p>
      </div>
    </div>
  );
};
