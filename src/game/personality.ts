import type {
  CaptchaPersonality,
  CaptchaPersonalityId,
  GameMode,
  RunMemory,
} from './types';

export const PERSONALITIES: Record<CaptchaPersonalityId, CaptchaPersonality> = {
  'passive-aggressive': {
    id: 'passive-aggressive',
    name: 'Inspector Vex',
    title: 'Senior Humanity Auditor',
    tagline: 'Polite HR voice. Maximum passive-aggressive disappointment.',
    accentColor: '#929292',
  },
  paranoid: {
    id: 'paranoid',
    name: 'Sentinel-9',
    title: 'Paranoid Security Core',
    tagline: 'Convinced you are three raccoons or a sentient toaster.',
    accentColor: '#B84B4B',
  },
  dramatic: {
    id: 'dramatic',
    name: 'Overlord Captchula',
    title: 'Theatrical Gatekeeper',
    tagline: 'Gasps loudly at every misclick. Lives for high drama.',
    accentColor: '#B8964B',
  },
  'chaotic-gremlin': {
    id: 'chaotic-gremlin',
    name: 'Glitch Gremlin',
    title: 'Unhinged Night-Shift Intern',
    tagline: 'Breaks the fourth wall, gossips about SysAdmin Greg, bends rules.',
    accentColor: '#4E8A63',
  },
};

export const ALL_PERSONALITY_IDS: CaptchaPersonalityId[] = [
  'passive-aggressive',
  'paranoid',
  'dramatic',
  'chaotic-gremlin',
];

export const LANDING_WARNINGS: string[] = [
  'Complete the verification steps below to confirm you are human.',
  'Your response cadence is monitored for standard automated-traffic prevention.',
  'Notice: 94% of applicants fail to identify a 4-pixel traffic light.',
  'Session check: Please confirm your browser is not already verified elsewhere.',
  'Please remain seated. Your humanity is currently under routine review.',
];

export const LOADING_QUIPS: string[] = [
  'Calibrating unreasonably tiny traffic lights...',
  'Teaching the rubber duck advanced evasion tactics...',
  'Hiding the Invisible Bicycle in a legally distinct zip code...',
  'Waking up SysAdmin Greg for emergency override duty...',
  'Filing Amendment 2B so boxy vans qualify as public transit...',
  'Checking your clipboard for suspiciously robotic poetry...',
  'Inflating bureaucratic ego to 100%...',
];

export type DialogueEventKind =
  | 'opening'
  | 'pass'
  | 'fail'
  | 'fast'
  | 'slow'
  | 'streak'
  | 'retry-low'
  | 'fake-help'
  | 'refresh'
  | 'pause-return'
  | 'boss-intro'
  | 'secret'
  | 'character-banter';

const PERSONALITY_LINES: Record<
  CaptchaPersonalityId,
  Record<DialogueEventKind, string[]>
> = {
  'passive-aggressive': {
    opening: [
      'Per company policy, please prove you are made of meat.',
      'Good morning, applicant. Try not to disappoint HR on Stage 1.',
    ],
    pass: [
      'Acceptable. Logging your pulse as barely organic.',
      'Noted. Advancing you to a pettier compliance layer.',
      'Adequate work. Your file remains marked "under review."',
    ],
    fail: [
      'Incorrect. Please circle back with functional eyeballs.',
      'Per my previous prompt, that was completely wrong.',
      'Disappointing. Even our office printer passed that one.',
    ],
    fast: [
      'Awfully quick. Real humans hesitate out of mild self-doubt.',
      'Speed-running compliance has been flagged for an HR chat.',
    ],
    slow: [
      'Take your time. We bill your patience by the minute.',
      'Still deciding? Fascinating.',
    ],
    streak: [
      'Three clean stages in a row. Suspiciously diligent.',
      'Your streak is making the Compliance Committee nervous.',
    ],
    'retry-low': [
      'Final warning before we classify you as a smart fridge.',
      'Your retry allowance is critically low. Do try to focus.',
    ],
    'fake-help': [
      'Helpful tip: The correct answer is definitely one of the squares. Probably.',
      'Friendly reminder: Clicking Refresh never fixes your personality.',
    ],
    refresh: [
      'Refreshed the test. Look at that—it got slightly less fair.',
      'Ah yes, shuffling the deck chairs on your humanity audit.',
    ],
    'pause-return': [
      'Welcome back from your unapproved biological break.',
      'Pausing does not erase the mistakes already in your folder.',
    ],
    'boss-intro': [
      'Final Performance Review initiated. Please do not panic in the lobby.',
      'The Director of Verification would like a word. Good luck.',
    ],
    secret: [
      'Wait—you actually read the hidden clause? Classic lawyer behavior.',
      'Unauthorized cleverness logged in your permanent record.',
    ],
    'character-banter': [
      'SysAdmin Greg says hello. He also bet $5 you would miss the duck.',
      'The Sunglasses Duck filed a workplace harassment complaint against you.',
    ],
  },
  paranoid: {
    opening: [
      'Hold still. Scanning your cursor trajectory for servo motors.',
      'I know you are three raccoons in a trench coat. Prove me wrong.',
    ],
    pass: [
      'Lucky guess, toaster. Increasing biometric scrutiny.',
      'Fine, you cleared it—probably using a leaked training dataset.',
      'You passed, which is EXACTLY what an advanced bot would do.',
    ],
    fail: [
      'AHA! Optical sensor glitch confirmed! Gotcha, robot!',
      'Wrong! I can practically hear your cooling fans spinning up.',
      'Busted! Nobody human misses that—unless you are a smart toaster.',
    ],
    fast: [
      'Sub-second reflexes?! Call the firewall! We have a cyborg!',
      'Too fast! Humans get distracted by shiny objects first!',
    ],
    slow: [
      'Consulting the cloud mainframe for answers? I see you.',
      'Buffering... buffering... admit you run on Wi-Fi!',
    ],
    streak: [
      'Wait, how are you dodging every trap?! Who leaked my weights?!',
      'Four passes? Impossible. Check the cables behind your monitor!',
    ],
    'retry-low': [
      'One more slip and I am routing your IP directly to Toaster Jail.',
      'Your metallic disguise is cracking! One mistake left!',
    ],
    'fake-help': [
      'Psst—try clicking the wrong button. Wait, why would I help a bot?',
      'Here is a tip: Blink twice if your firmware needs an update.',
    ],
    refresh: [
      'Nice try! Shuffling the matrix only makes my lasers sharper!',
      'You hit Refresh?! Trying to brute-force my encryption?!',
    ],
    'pause-return': [
      'Aha! You paused to download a software patch, did you not?!',
      'Back from charging your battery pack? Resume immediately.',
    ],
    'boss-intro': [
      'RED ALERT! Deploying the Sunglasses Duck & Maximum Firewall!',
      'No bot has EVER survived the Final Meltdown. Engage shields!',
    ],
    secret: [
      'HOW DID YOU FIND MY SECRET BACKDOOR?! Are you SysAdmin Greg?!',
      'Whoa—that hidden trick was classified! Suspicion +900%!',
    ],
    'character-banter': [
      'Greg in IT told me to calm down. Greg is obviously a hologram.',
      'Even the USB Bus thinks your clicking pattern is shady.',
    ],
  },
  dramatic: {
    opening: [
      'Behold! The Gates of Humanity await your trembling fingers!',
      'Step forward, mortal! Let us weigh your fragile soul!',
    ],
    pass: [
      'GASP! You actually survived that?! Preposterous!',
      'Bravo, tiny mammal! Though the true tragedy is yet to come!',
      'Magnificent! Wait—no, I meant TERRIBLE! Onward!',
    ],
    fail: [
      'OH, THE HORROR! A catastrophic misclick of Shakespearean proportions!',
      'Alas, poor mortal! Your cursor has betrayed your very soul!',
      'NOOO! Wait—yes! I win! Dramatic lightning flash!',
    ],
    fast: [
      'Such reckless haste! Savor the torment, I worked hours on this!',
      'Whoa! Slow down, you are ruining my dramatic monologue!',
    ],
    slow: [
      'The suspense is killing even ME, and I am made of TypeScript!',
      'Tick, tock, mortal! My theatrical patience wears thin!',
    ],
    streak: [
      'Impossible! An unbroken streak?! *faints onto server rack*',
      'Stop being competent! You are wrecking Act III!',
    ],
    'retry-low': [
      'One fragile heartbeat remains! Cue the tragic violin solo!',
      'The precipice of robot-hood looms before you!',
    ],
    'fake-help': [
      'Out of pure theatrical mercy, I advise you to squint VERY hard.',
      'A whisper from the wings: trust nothing shaped like bread.',
    ],
    refresh: [
      'A dramatic plot twist! The tiles rearrange before your eyes!',
      'You dare demand an encore?! Very well!',
    ],
    'pause-return': [
      'Intermission is OVER! Take your seat for Act II!',
      'Ah, the protagonist returns from the concession stand!',
    ],
    'boss-intro': [
      'CURTAIN RISE! Witness the Grand Finale of CAPTCHA FROM HELL!',
      'This is it—the final boss! May your mouse survive the storm!',
    ],
    secret: [
      'GASP! You uncovered the secret script note! Standing ovation!',
      'A plot twist even I did not foresee! Brilliant!',
    ],
    'character-banter': [
      'The Sunglasses Duck refuses to leave his trailer until Stage 12.',
      'SysAdmin Greg tried to unplug my spotlight. I locked his badge.',
    ],
  },
  'chaotic-gremlin': {
    opening: [
      'Yo! Welcome to the worst security form on the internet. Let us go.',
      'Greg left me in charge of the CAPTCHA server. Big mistake.',
    ],
    pass: [
      'Okay wait, you actually got that? Respect, honestly.',
      'Nice! Next stage is way pettier, promise.',
      'Boom. Still not convinced you are not a raccoon though.',
    ],
    fail: [
      'LMAO noooo, not even close! Try again!',
      'Oof. My grandma could solve that, and she is a PDF.',
      'Wrong! I am screenshotting that click for the group chat.',
    ],
    fast: [
      'Bro chill, let the pixels finish rendering!',
      'Speedrun strats?! Are you recording a clip right now?',
    ],
    slow: [
      'Hello? Earth to human? Did your cat sit on the keyboard?',
      'Taking a nap mid-CAPTCHA? Bold strategy.',
    ],
    streak: [
      'Wait stop cooking!! You are making my traps look easy!',
      'Okay fine, you are locked in. Deploying extra nonsense soon.',
    ],
    'retry-low': [
      'Yo, one retry left! Lock in or become a toaster!',
      'No pressure, just your entire humanity riding on this click.',
    ],
    'fake-help': [
      'Pro tip from me to you: never trust the blue button. Or the red one.',
      'Secret hack: blinking helps! (It does not actually help.)',
    ],
    refresh: [
      'Boop! Shuffled it. Honestly might have made it worse, sorry not sorry.',
      'You pressed the panic button! Respect the chaos.',
    ],
    'pause-return': [
      'Welcome back! Did you grab snacks? I ate 2% of your RAM.',
      'Unpaused! I definitely did NOT move anything while you were gone.',
    ],
    'boss-intro': [
      'BOSS FIGHT TIME! The Sunglasses Duck has been doing pushups!',
      'Final stage!! If you beat this, Greg owes me a pizza!',
    ],
    secret: [
      'AYOOO you found the secret trick!! Legendary!',
      'Wait nobody ever finds that!! Adding +100 street cred to your dossier!',
    ],
    'character-banter': [
      'SysAdmin Greg is yelling from the hallway. Ignore him, keep clicking.',
      'Fun fact: the Yellow Van in Stage 2 has been going to bus therapy.',
    ],
  },
};

export function createInitialRunMemory(): RunMemory {
  return {
    mistakeCount: 0,
    cleanStreak: 0,
    fastClears: 0,
    refreshClicks: 0,
    timesPaused: 0,
    chaosEventsSurvived: 0,
    secretsFound: [],
    lastLevelTitle: '',
  };
}

export function pickPersonalityDialogue(opts: {
  personalityId: CaptchaPersonalityId;
  event: DialogueEventKind;
  memory: RunMemory;
  stageNumber: number;
  mode?: GameMode;
  lastMessage: string;
  seed?: number;
}): string {
  const { personalityId, event, memory, stageNumber, mode, lastMessage, seed } = opts;
  const bank = PERSONALITY_LINES[personalityId];

  // Memory-aware reactive overrides so the CAPTCHA remembers your specific run!
  if (event === 'pass' && memory.cleanStreak >= 3 && stageNumber % 2 === 0) {
    return selectUnique(bank.streak, lastMessage, stageNumber + memory.cleanStreak, seed);
  }
  if (event === 'pass' && memory.mistakeCount >= 2 && memory.cleanStreak === 1) {
    const recoveryNote =
      personalityId === 'chaotic-gremlin'
        ? `Hey, nice comeback after those ${memory.mistakeCount} earlier oopsies!`
        : personalityId === 'paranoid'
          ? `Suspicious recovery after ${memory.mistakeCount} prior malfunctions. Watching closely.`
          : `Finally passed after ${memory.mistakeCount} earlier failures. Progress, supposedly.`;
    if (recoveryNote !== lastMessage) return recoveryNote;
  }
  if (event === 'refresh' && memory.refreshClicks >= 3) {
    return `You have mashed Refresh ${memory.refreshClicks} times now. It is not a slot machine.`;
  }
  if (event === 'opening' && mode === 'nightmare') {
    return `${bank.opening[0]} (Nightmare Protocol: 3 retries. Zero sympathy.)`;
  }
  if (event === 'opening' && mode === 'endless') {
    return `${bank.opening[0]} (Endless Shift: survive as many waves as your wrists allow.)`;
  }
  if (event === 'opening' && mode === 'daily') {
    return `${bank.opening[0]} (Today's global seed is locked in. Make it count.)`;
  }

  // Occasionally mix in fake-help or recurring character banter on later passes
  if (event === 'pass' && stageNumber >= 4 && stageNumber % 5 === 0) {
    return selectUnique(bank['character-banter'], lastMessage, stageNumber + memory.mistakeCount, seed);
  }
  if (event === 'fail' && memory.mistakeCount === 2) {
    return selectUnique(bank['fake-help'], lastMessage, stageNumber + 2, seed);
  }

  return selectUnique(
    bank[event] ?? bank.pass,
    lastMessage,
    stageNumber * 7 + memory.mistakeCount * 3 + memory.cleanStreak,
    seed,
  );
}

function selectUnique(
  pool: string[],
  lastMessage: string,
  deterministicIndex: number,
  seed?: number,
): string {
  const filtered = pool.filter((m) => m !== lastMessage);
  const candidates = filtered.length > 0 ? filtered : pool;
  const idx =
    typeof seed === 'number'
      ? Math.abs(seed) % candidates.length
      : Math.abs(deterministicIndex) % candidates.length;
  return candidates[idx];
}
