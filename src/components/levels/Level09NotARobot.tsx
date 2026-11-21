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

  const current = QUESTIONS[step];

  const handleChoose = (opt: Question['options'][number]) => {
    if (!opt.valid) {
      onFail(opt.failReason || 'Suspiciously robotic answer.');
      return;
    }

    // On question 3, the right answer cheekily shifts once before accepting
    if (step === 2 && !dodgedFinal) {
      sound.glitch();
      setDodgedFinal(true);
      return;
    }

    sound.click();
    if (step + 1 >= QUESTIONS.length) {
      onSuccess('Emotional dread about taxes confirmed. Welcome, fellow taxpayer.');
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-[#2C313C] bg-[#101217] p-4">
        <div className="mb-1 font-mono-tabular text-xs uppercase tracking-wider text-[#EF4444]">
          Polygraph Interrogation {step + 1} / {QUESTIONS.length}
        </div>
        <h3 className="font-display text-lg font-bold text-[#F2F0EB]">
          {current.prompt}
        </h3>
        {step === 2 && dodgedFinal && (
          <p className="mt-1.5 text-xs text-[#FCA5A5]">
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
              className={`min-h-[48px] w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#EF4444] ${
                shifted
                  ? 'translate-x-2 border-[#EF4444] bg-[#241316] text-white'
                  : 'border-[#2A2F3A] bg-[#161920] text-[#F2F0EB] hover:border-[#EF4444] hover:bg-[#1E222B]'
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
