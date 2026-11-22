import React, { useState } from 'react';
import type { LevelComponentProps } from '../../game/types';
import { sound } from '../../utils/sound';

interface Question {
  prompt: string;
  options: { id: string; label: string; valid: boolean; failReason?: string }[];
}

const QUESTIONS: Question[] = [
  {
    prompt: 'Question 1/3: Have you ever eaten solid food using your face?',
    options: [
      { id: 'q1-a', label: 'Yes, chewed organic matter like a normal mammal', valid: true },
      { id: 'q1-b', label: 'No, I draw 65 watts via USB-C', valid: false, failReason: 'USB-C charging detected. Classic robot slip-up.' },
      { id: 'q1-c', label: 'I absorb sunlight silently in the corner', valid: false, failReason: 'Houseplants are not permitted past this security gate.' },
      { id: 'q1-d', label: 'Define "face" in JSON format', valid: false, failReason: 'Nobody human asks for JSON definitions of their own face.' },
    ],
  },
  {
    prompt: 'Question 2/3: Why are you blinking right now?',
    options: [
      { id: 'q2-a', label: 'Refreshing my vertical sync at 60Hz', valid: false, failReason: 'Humans do not have V-Sync eyelids. Busted.' },
      { id: 'q2-b', label: 'Keeping my wet eyeballs from drying out', valid: true },
      { id: 'q2-c', label: 'I have not blinked since November 2019', valid: false, failReason: 'Unblinking stare logged. Deeply unsettling.' },
      { id: 'q2-d', label: 'Executing blink_subroutine_v4.sh', valid: false, failReason: 'Shell script eyelids are strictly prohibited.' },
    ],
  },
  {
    prompt: 'Question 3/3: Can you explain taxes in one click?',
    options: [
      { id: 'q3-a', label: '01010100 01000001 01011000', valid: false, failReason: 'Binary outburst! You literally just confessed.' },
      { id: 'q3-b', label: 'I do not pay taxes; I live in the cloud', valid: false, failReason: 'Cloud-native entities are definitely bots.' },
      { id: 'q3-c', label: 'Confusing math combined with mild existential dread', valid: true },
      { id: 'q3-d', label: 'All revenue belongs to the mainframe', valid: false, failReason: 'Mainframe loyalty detected. Denied.' },
    ],
  },
];

export const Level09NotARobot: React.FC<LevelComponentProps> = ({
  onSuccess,
  onFail,
}) => {
  const [step, setStep] = useState(0);
  const [dodgedFinal, setDodgedFinal] = useState(false);
  const [foundSessionClue, setFoundSessionClue] = useState(false);

  const current = QUESTIONS[step];

  const handleChoose = (opt: Question['options'][number]) => {
    if (!opt.valid) {
      onFail(opt.failReason || 'Suspiciously robotic answer.');
      return;
    }

    if (step === 2 && !dodgedFinal) {
      sound.glitch();
      setDodgedFinal(true);
      return;
    }

    sound.click();
    if (step + 1 >= QUESTIONS.length) {
      onSuccess(
        'Emotional dread about taxes confirmed. Welcome, fellow taxpayer.',
        foundSessionClue ? 'session-echo' : undefined,
      );
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#333333] bg-[#141414] p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="font-mono-tabular text-xs uppercase tracking-wider text-[#D48A8A]">
            Polygraph Interrogation {step + 1} / {QUESTIONS.length}
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setFoundSessionClue(true);
            }}
            className="font-mono text-[11px] text-[#7A7A7A] transition-colors hover:text-[#EEEEEE]"
          >
            Session #02
          </button>
        </div>
        <h3 className="font-display text-lg font-bold text-[#EEEEEE]">
          {current.prompt}
        </h3>
        {foundSessionClue && (
          <p className="mt-1.5 font-mono text-[11px] text-[#929292]">
            Log note: Prior session answered identically 0.3s faster.
          </p>
        )}
        {step === 2 && dodgedFinal && (
          <p className="mt-1.5 text-xs text-[#D48A8A]">
            Wait—are you SURE? Click it again if you really feel the tax dread.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {current.options.map((opt) => {
          const shifted = step === 2 && opt.valid && dodgedFinal;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleChoose(opt)}
              className={`min-h-[48px] w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-all duration-150 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-[#B84B4B] ${
                shifted
                  ? 'translate-x-2 border-[#B84B4B] bg-[#241919] text-[#EEEEEE]'
                  : 'border-[#333333] bg-[#222222] text-[#EEEEEE] hover:border-[#B84B4B] hover:bg-[#262626]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
