import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ENDING_IDS,
  GAME_MODES,
  LEVEL_METAS,
  MAX_RETRIES,
  NIGHTMARE_RETRIES,
  TOTAL_LEVELS,
  buildChallengeUrl,
  buildShareText,
  calculateChaosLevel,
  calculateHumanityMetrics,
  compareChallengeResults,
  createRunBlueprint,
  createRunEventSchedule,
  determineEnding,
  evaluateGridSelection,
  evaluateInvisibleHit,
  formatDuration,
  generateCertificateCode,
  getChaosLabel,
  getDailySeedCode,
  getEndlessStageConfig,
  hashSeedString,
  parseChallengeFromSearch,
  pickSnarkyMessage,
} from './engine';
import {
  ALL_PERSONALITY_IDS,
  createInitialRunMemory,
  pickPersonalityDialogue,
} from './personality';
import {
  getLoadingSubline,
  getSystemStatusNotice,
  maybePickUnsettlingLine,
  pickAdminNotice,
  resolveHiddenEndingVariation,
} from './narrative';

test('defines all 12 distinct CAPTCHA levels with explicit prompts and 5 playable game modes', () => {
  assert.equal(LEVEL_METAS.length, 12);
  assert.equal(TOTAL_LEVELS, 12);
  assert.ok(MAX_RETRIES >= 4);
  assert.equal(NIGHTMARE_RETRIES, 3);
  const titles = new Set(LEVEL_METAS.map((l) => l.title));
  assert.equal(titles.size, 12);
  LEVEL_METAS.forEach((meta, idx) => {
    assert.equal(meta.id, idx + 1);
    assert.ok(meta.title.trim().length > 0);
    assert.ok(meta.prompt.trim().length >= 15, `Level ${meta.id} prompt should be descriptive`);
    assert.ok(meta.subPrompt.trim().length > 0);
  });
  assert.deepEqual(
    GAME_MODES.map((m) => m.id),
    ['classic', 'chaos', 'nightmare', 'daily', 'endless'],
  );
});

test('calculateChaosLevel scales monotonically with level and failures and clamps at 100', () => {
  const early = calculateChaosLevel(0, 0);
  const mid = calculateChaosLevel(5, 2);
  const max = calculateChaosLevel(11, 10, 50);
  assert.ok(early < mid);
  assert.equal(max, 100);
  assert.equal(getChaosLabel(10), 'Routine');
  assert.equal(getChaosLabel(95), 'Sentient');
});

test('determineEnding maps accurately to all 5 required endings with realistic thresholds', () => {
  const base = {
    totalLevels: 12,
    attempts: 14,
    finalChaos: 98,
    surrendered: false,
  };

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 12,
      failedVerifications: 1,
      elapsedSeconds: 95,
      victory: true,
    }).title,
    'Certified Human',
  );

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 12,
      failedVerifications: 3,
      elapsedSeconds: 180,
      victory: true,
    }).title,
    'Suspiciously Human',
  );

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 12,
      failedVerifications: 5,
      elapsedSeconds: 260,
      victory: true,
    }).title,
    'CAPTCHA Victim',
  );

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 3,
      failedVerifications: 6,
      elapsedSeconds: 70,
      victory: false,
    }).title,
    'Definitely a Robot',
  );

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 9,
      failedVerifications: 6,
      elapsedSeconds: 150,
      victory: false,
    }).title,
    'The CAPTCHA Has Won',
  );

  assert.equal(
    determineEnding({
      ...base,
      levelsCleared: 10,
      failedVerifications: 2,
      elapsedSeconds: 120,
      surrendered: true,
      victory: false,
    }).title,
    'The CAPTCHA Has Won',
  );

  assert.equal(ALL_ENDING_IDS.length, 5);
});

test('createRunBlueprint is deterministic per seed and distinct across modes/seeds', () => {
  const a1 = createRunBlueprint('chaos', 'HELL-7777');
  const a2 = createRunBlueprint('chaos', 'hell-7777');
  const b1 = createRunBlueprint('chaos', 'HELL-9999');

  assert.equal(a1.numericSeed, a2.numericSeed);
  assert.deepEqual(a1.stageIndices, a2.stageIndices);
  assert.equal(a1.personality.id, a2.personality.id);
  assert.deepEqual(
    a1.stageModifiers.map((m) => m.id),
    a2.stageModifiers.map((m) => m.id),
  );
  // Boss always anchors stage 12 in chaos/nightmare/daily
  assert.equal(a1.stageIndices[11], 11);
  assert.notEqual(a1.stageIndices.join(','), b1.stageIndices.join(','));

  const classic = createRunBlueprint('classic', 'SEED-1');
  assert.deepEqual(classic.stageIndices, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(classic.maxRetries, 6);

  const nightmare = createRunBlueprint('nightmare', 'SEED-1');
  assert.equal(nightmare.maxRetries, 3);
  assert.equal(nightmare.baseChaosOffset, 22);
  assert.ok(nightmare.stageModifiers.every((m) => m.id !== 'none'));
});

test('daily seed and endless wave generator are deterministic and inject bosses every 6th wave', () => {
  const d1 = getDailySeedCode(new Date('2026-11-21T10:00:00Z'));
  const d2 = getDailySeedCode(new Date('2026-11-21T23:59:00Z'));
  assert.equal(d1, 'DAILY-2026-11-21');
  assert.equal(d1, d2);

  const seed = hashSeedString('endless:TEST-ENDLESS');
  const wave5 = getEndlessStageConfig(seed, 5);
  const wave11 = getEndlessStageConfig(seed, 11);
  const wave17 = getEndlessStageConfig(seed, 17);
  assert.equal(wave5.isBossWave, true);
  assert.equal(wave5.levelIndex, 11);
  assert.equal(wave11.isBossWave, true);
  assert.equal(wave17.isBossWave, true);

  const wave0a = getEndlessStageConfig(seed, 0);
  const wave0b = getEndlessStageConfig(seed, 0);
  assert.equal(wave0a.levelIndex, wave0b.levelIndex);
});

test('createRunEventSchedule varies by seed, covers all 5 chaos types, and never fires on Stage 1', () => {
  const s1 = createRunEventSchedule(101);
  const s2 = createRunEventSchedule(99991);
  assert.equal(s1.length, 5);
  assert.equal(new Set(s1.map((e) => e.type)).size, 5);
  assert.ok(s1.every((e) => e.triggerLevelIdx >= 1 && e.triggerLevelIdx <= 10));
  const sig1 = s1.map((e) => `${e.triggerLevelIdx}:${e.type}`).join(',');
  const sig2 = s2.map((e) => `${e.triggerLevelIdx}:${e.type}`).join(',');
  assert.notEqual(sig1, sig2);
});

test('friend challenge URL encodes, decodes, and compares runs accurately', () => {
  const friendStats = {
    levelsCleared: 12,
    totalLevels: 12,
    attempts: 15,
    failedVerifications: 2,
    elapsedSeconds: 88,
    finalChaos: 98,
    surrendered: false,
    victory: true,
    mode: 'chaos' as const,
    seedCode: 'HELL-4K9P',
    bossesDefeated: 1,
    secretsDiscovered: ['fine-print'],
  };
  const friendEnding = determineEnding(friendStats);
  const url = buildChallengeUrl('https://example.com/', friendStats, friendEnding, 'Alex');
  const parsed = parseChallengeFromSearch(new URL(url).search);

  assert.ok(parsed);
  assert.equal(parsed.mode, 'chaos');
  assert.equal(parsed.seedCode, 'HELL-4K9P');
  assert.equal(parsed.challengerName, 'Alex');
  assert.equal(parsed.elapsedSeconds, 88);
  assert.equal(parsed.failedVerifications, 2);
  assert.equal(parsed.endingId, friendEnding.id);

  // Player clears faster with 0 mistakes -> player wins
  const playerStats = {
    ...friendStats,
    failedVerifications: 0,
    elapsedSeconds: 54,
  };
  const cmp = compareChallengeResults(playerStats, parsed);
  assert.equal(cmp.winner, 'player');
  assert.ok(cmp.headline.includes('Alex'));
});

test('personality dialogue engine adapts to run memory and avoids immediate repetition', () => {
  assert.equal(ALL_PERSONALITY_IDS.length, 4);
  const mem = createInitialRunMemory();
  const m1 = pickPersonalityDialogue({
    personalityId: 'paranoid',
    event: 'fail',
    memory: mem,
    stageNumber: 2,
    lastMessage: '',
    seed: 0,
  });
  const m2 = pickPersonalityDialogue({
    personalityId: 'paranoid',
    event: 'fail',
    memory: mem,
    stageNumber: 2,
    lastMessage: m1,
    seed: 0,
  });
  assert.notEqual(m1, m2);

  // Memory callback after 3+ refreshes
  const refreshMsg = pickPersonalityDialogue({
    personalityId: 'chaotic-gremlin',
    event: 'refresh',
    memory: { ...mem, refreshClicks: 4 },
    stageNumber: 3,
    lastMessage: '',
  });
  assert.ok(refreshMsg.includes('4 times'));
});

test('evaluateGridSelection checks exact matches, missed items, and extra decoys', () => {
  const pass = evaluateGridSelection(['a', 'b'], ['b', 'a']);
  assert.equal(pass.passed, true);
  assert.deepEqual(pass.missed, []);
  assert.deepEqual(pass.extra, []);

  const fail = evaluateGridSelection(['a', 'c'], ['a', 'b']);
  assert.equal(fail.passed, false);
  assert.deepEqual(fail.missed, ['b']);
  assert.deepEqual(fail.extra, ['c']);
});

test('evaluateInvisibleHit returns accurate heat zones and direct hits', () => {
  const hit = evaluateInvisibleHit(52, 48, 50, 50, 12);
  assert.equal(hit.hit, true);
  assert.equal(hit.heat, 'hit');

  const warm = evaluateInvisibleHit(80, 50, 50, 50, 12);
  assert.equal(warm.hit, false);
  assert.equal(warm.heat, 'warm');

  const freezing = evaluateInvisibleHit(5, 5, 85, 85, 12);
  assert.equal(freezing.hit, false);
  assert.equal(freezing.heat, 'freezing');
});

test('pickSnarkyMessage avoids repeating the immediately previous message', () => {
  const first = pickSnarkyMessage({ kind: 'fail', levelId: 1, failedCount: 1 }, '', 0);
  const second = pickSnarkyMessage({ kind: 'fail', levelId: 1, failedCount: 1 }, first, 0);
  assert.notEqual(first, second);
});

test('formatDuration, humanity metrics, certificate code, and buildShareText format cleanly', () => {
  assert.equal(formatDuration(125), '02:05');
  const stats = {
    levelsCleared: 12,
    totalLevels: 12,
    attempts: 18,
    failedVerifications: 3,
    elapsedSeconds: 142,
    finalChaos: 99,
    surrendered: false,
    victory: true,
    mode: 'classic' as const,
    seedCode: 'HELL-1234',
  };
  const ending = determineEnding(stats);
  const metrics = calculateHumanityMetrics(stats);
  assert.ok(metrics.humanityPct >= 4 && metrics.humanityPct <= 99);
  assert.ok(metrics.score > 0);
  const cert = generateCertificateCode(stats, ending.id);
  assert.match(cert, /^CFH-SUS-\d{4}$/);
  const share = buildShareText(stats, ending);
  assert.ok(share.includes(cert));
  assert.ok(share.includes('SUSPICIOUSLY HUMAN'));
  assert.ok(share.includes('02:22'));
  assert.ok(share.includes('% human'));
});

test('narrative status notice stays ordinary on Stage 1 and surfaces rare identity anomalies later', () => {
  const stage1 = getSystemStatusNotice({
    stageNumber: 1,
    numericSeed: 0,
    chaosLevel: 95,
    anomaliesFound: 3,
  });
  assert.equal(stage1.text, 'SYSTEM STATUS: OPERATIONAL');
  assert.equal(stage1.anomaly, false);

  const lateChaos = getSystemStatusNotice({
    stageNumber: 11,
    numericSeed: 42,
    chaosLevel: 92,
    anomaliesFound: 1,
  });
  assert.equal(lateChaos.anomaly, true);
  assert.notEqual(lateChaos.text, 'SYSTEM STATUS: OPERATIONAL');
});

test('maybePickUnsettlingLine stays quiet on early stages, avoids immediate repetition, and loading/admin helpers are deterministic', () => {
  const mem = createInitialRunMemory();
  assert.equal(
    maybePickUnsettlingLine({ stageNumber: 1, numericSeed: 0, memory: mem, lastMessage: '' }),
    null,
  );
  assert.equal(
    maybePickUnsettlingLine({ stageNumber: 2, numericSeed: 0, memory: mem, lastMessage: '' }),
    null,
  );

  // Stage 4 with seed 0 -> (0 + 52) % 4 === 0 -> returns an unsettling line
  const first = maybePickUnsettlingLine({
    stageNumber: 4,
    numericSeed: 0,
    memory: mem,
    lastMessage: '',
  });
  assert.ok(typeof first === 'string' && first.length > 0);
  const second = maybePickUnsettlingLine({
    stageNumber: 4,
    numericSeed: 0,
    memory: mem,
    lastMessage: first!,
  });
  assert.ok(typeof second === 'string');
  assert.notEqual(second, first);

  assert.ok(getLoadingSubline(3) !== null);
  assert.equal(getLoadingSubline(4), null);
  const admin = pickAdminNotice(17, 5);
  assert.ok(admin.headline.length > 0 && admin.body.length > 0);
});

test('resolveHiddenEndingVariation maps surrender, 3+ anomalies, 1+ anomalies, and synthetic drift cleanly', () => {
  const baseStats = {
    levelsCleared: 12,
    totalLevels: 12,
    attempts: 13,
    failedVerifications: 0,
    elapsedSeconds: 80,
    finalChaos: 96,
    surrendered: false,
    victory: true,
    mode: 'classic' as const,
    seedCode: 'HELL-1000',
  };

  // Standard clean run without secrets -> no hidden addendum
  assert.equal(resolveHiddenEndingVariation(baseStats, 'certified-human'), null);

  // 1 anomaly -> ARCHIVE-02
  const dup = resolveHiddenEndingVariation(
    { ...baseStats, secretsDiscovered: ['fine-print'] },
    'certified-human',
  );
  assert.equal(dup?.code, 'ARCHIVE-02');
  assert.equal(dup?.label, 'DUPLICATE SESSION CONFIRMED');

  // 3+ anomalies -> ARCHIVE-01
  const ambig = resolveHiddenEndingVariation(
    { ...baseStats, secretsDiscovered: ['ink-bolt', 'fine-print', 'session-echo'] },
    'certified-human',
  );
  assert.equal(ambig?.code, 'ARCHIVE-01');
  assert.equal(ambig?.label, 'CONSCIOUSNESS AMBIGUITY LOGGED');

  // Surrender -> ARCHIVE-03
  const surr = resolveHiddenEndingVariation(
    { ...baseStats, surrendered: true, victory: false, levelsCleared: 10 },
    'captcha-has-won',
  );
  assert.equal(surr?.code, 'ARCHIVE-03');
  assert.equal(surr?.label, 'IMPRINT RETAINED');

  // Robot failure past stage 4 -> ARCHIVE-04
  const drift = resolveHiddenEndingVariation(
    { ...baseStats, victory: false, levelsCleared: 5, failedVerifications: 6 },
    'definitely-a-robot',
  );
  assert.equal(drift?.code, 'ARCHIVE-04');
  assert.equal(drift?.label, 'SYNTHETIC DRIFT DETECTED');
});
