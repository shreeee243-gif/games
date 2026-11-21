import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ENDING_IDS,
  LEVEL_METAS,
  MAX_RETRIES,
  TOTAL_LEVELS,
  buildShareText,
  calculateChaosLevel,
  createRunEventSchedule,
  determineEnding,
  evaluateGridSelection,
  evaluateInvisibleHit,
  formatDuration,
  generateCertificateCode,
  getChaosLabel,
  pickSnarkyMessage,
} from './engine';

test('defines all 12 distinct CAPTCHA levels', () => {
  assert.equal(LEVEL_METAS.length, 12);
  assert.equal(TOTAL_LEVELS, 12);
  assert.ok(MAX_RETRIES >= 4);
  const titles = new Set(LEVEL_METAS.map((l) => l.title));
  assert.equal(titles.size, 12);
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

test('formatDuration, certificate code, and buildShareText format failure card cleanly', () => {
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
  };
  const ending = determineEnding(stats);
  const cert = generateCertificateCode(stats, ending.id);
  assert.match(cert, /^CFH-SUS-\d{4}$/);
  const share = buildShareText(stats, ending);
  assert.ok(share.includes(cert));
  assert.ok(share.includes('SUSPICIOUSLY HUMAN'));
  assert.ok(share.includes('02:22'));
  assert.ok(share.includes('TRY THIS. I DARE YOU.'));
});
