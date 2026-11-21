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
      <div className="space-y-2 rounded-md border border-[#2C313C] bg-[#101217] p-4 text-sm">
        <p className="font-semibold text-[#F2F0EB]">
          1. Click the red button immediately to continue.
        </p>
        <p className="font-semibold text-[#FCA5A5]">
          2. Do NOT click the red button.
        </p>
        <p className="text-[#9BA1AE]">
          3. Clicking the red button will immediately invalidate your humanity.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-md border border-[#262B35] bg-[#13161C] p-5">
        <div className="font-mono-tabular text-xs text-[#9BA1AE]">
          Impulse Patience Check:{' '}
          <strong className="text-sm text-[#F2F0EB]">{secondsLeft}s</strong>
        </div>

        <div className="flex w-full flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              hitRedBait('Rule 2 and Rule 3 explicitly told you NOT to click it! Impulse failed.')
            }
            className="min-h-[48px] flex-1 rounded-md bg-[#DC2626] px-5 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-[#B91C1C] active:scale-[0.98]"
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
            className={`min-h-[48px] flex-1 rounded-md px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 ${
              blueTurnedRed
                ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                : 'bg-[#2563EB] hover:bg-[#DC2626]'
            }`}
          >
            {blueTurnedRed ? 'HAHA IT IS RED NOW' : 'Definitely Not Red'}
          </button>
        </div>

        <p className="pt-1 text-center text-[11px] leading-relaxed text-[#717786]">
          Compliance Clause 7.4: To verify{' '}
          <button
            type="button"
            onClick={() => {
              sound.click();
              onSuccess('You actually read the tiny legal fine print?! Certified lawyer behavior.');
            }}
            className="cursor-pointer underline decoration-[#525A6B] underline-offset-2 transition-colors hover:text-[#F2F0EB]"
          >
            human
          </button>{' '}
          restraint, keep your hands off ALL buttons for 5 seconds.
        </p>
      </div>
    </div>
  );
};
