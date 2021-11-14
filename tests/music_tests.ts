// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Music Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { KeyManager } from '../src/keymanager';
import { Music } from '../src/music';

const MusicTests = {
  Start(): void {
    QUnit.module('MusicTests');
    test('Valid Notes', validNotes);
    test('Valid Keys', validKeys);
    test('Note Values', noteValue);
    test('Interval Values', intervalValue);
    test('Relative Notes', relativeNotes);
    test('Relative Note Names', relativeNoteNames);
    test('Canonical Notes', canonicalNotes);
    test('Canonical Intervals', canonicalIntervals);
    test('Scale Tones', scaleTones);
    test('Scale Intervals', scaleIntervals);
  },
};

function validNotes(): void {
  expect(10);

  const music = new Music();

  let parts = music.getNoteParts('c');
  equal(parts.root, 'c');
  equal(parts.accidental, null);

  // getNoteParts() converts its argument to lowercase.
  parts = music.getNoteParts('C');
  equal(parts.root, 'c');
  equal(parts.accidental, null);

  parts = music.getNoteParts('c#');
  equal(parts.root, 'c');
  equal(parts.accidental, '#');

  parts = music.getNoteParts('c##');
  equal(parts.root, 'c');
  equal(parts.accidental, '##');

  throws(() => music.getNoteParts('r'), /BadArguments/, 'Invalid note: r');
  throws(() => music.getNoteParts(''), /BadArguments/, "Invalid note: ''");
}

function validKeys(): void {
  expect(18);

  const music = new Music();

  let parts = music.getKeyParts('c');
  equal(parts.root, 'c');
  equal(parts.accidental, null);
  equal(parts.type, 'M');

  parts = music.getKeyParts('d#');
  equal(parts.root, 'd');
  equal(parts.accidental, '#');
  equal(parts.type, 'M');

  parts = music.getKeyParts('fbm');
  equal(parts.root, 'f');
  equal(parts.accidental, 'b');
  equal(parts.type, 'm');

  parts = music.getKeyParts('c#mel');
  equal(parts.root, 'c');
  equal(parts.accidental, '#');
  equal(parts.type, 'mel');

  parts = music.getKeyParts('g#harm');
  equal(parts.root, 'g');
  equal(parts.accidental, '#');
  equal(parts.type, 'harm');

  throws(() => music.getKeyParts('r'), /BadArguments/, 'Invalid key: r');
  throws(() => music.getKeyParts(''), /BadArguments/, `Invalid key: ''`);
  throws(() => music.getKeyParts('#m'), /BadArguments/, 'Invalid key: #m');
}

function noteValue(): void {
  expect(3);

  const music = new Music();

  let note = music.getNoteValue('c');
  equal(note, 0);

  throws(() => music.getNoteValue('r'), /BadArguments/, 'Invalid note name');

  note = music.getNoteValue('f#');
  equal(note, 6);
}

function intervalValue(): void {
  expect(2);

  const music = new Music();

  const value = music.getIntervalValue('b2');
  equal(value, 1);

  throws(() => music.getIntervalValue('7'), /BadArguments/, 'Invalid interval name');
}

function relativeNotes(): void {
  expect(8);

  const music = new Music();

  let value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b5'));
  equal(value, 6);

  throws(
    () => music.getRelativeNoteValue(music.getNoteValue('bc'), music.getIntervalValue('b2')),
    /BadArguments/,
    'Invalid note'
  );

  throws(
    () => music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p3')),
    /BadArguments/,
    'Invalid interval'
  );

  // Direction
  value = music.getRelativeNoteValue(music.getNoteValue('d'), music.getIntervalValue('2'), -1);
  equal(value, 0);

  throws(
    () => music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p4'), 0),
    /BadArguments/,
    'Invalid direction: 0'
  );

  // Rollover
  value = music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('b5'));
  equal(value, 5);

  // Reverse rollover
  value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b2'), -1);
  equal(value, 11);

  // Practical tests
  value = music.getRelativeNoteValue(music.getNoteValue('g'), music.getIntervalValue('p5'));
  equal(value, 2);
}

function relativeNoteNames(): void {
  expect(9);

  const music = new Music();
  equal(music.getRelativeNoteName('b', music.getNoteValue('c#')), 'b##');
  equal(music.getRelativeNoteName('c', music.getNoteValue('c')), 'c');
  equal(music.getRelativeNoteName('c', music.getNoteValue('db')), 'c#');
  equal(music.getRelativeNoteName('c', music.getNoteValue('b')), 'cb');
  equal(music.getRelativeNoteName('c#', music.getNoteValue('db')), 'c#');
  equal(music.getRelativeNoteName('e', music.getNoteValue('f#')), 'e##');
  equal(music.getRelativeNoteName('e', music.getNoteValue('d#')), 'eb');
  equal(music.getRelativeNoteName('e', music.getNoteValue('fb')), 'e');
  throws(
    () => music.getRelativeNoteName('e', music.getNoteValue('g#')),
    /BadArguments/,
    'Too far away. Notes not related.'
  );
}

function canonicalNotes(): void {
  expect(3);

  const music = new Music();

  equal(music.getCanonicalNoteName(0), 'c');
  equal(music.getCanonicalNoteName(2), 'd');

  throws(() => music.getCanonicalNoteName(-1), /BadArguments/, 'Invalid note value');
}

function canonicalIntervals(): void {
  expect(3);

  const music = new Music();

  equal(music.getCanonicalIntervalName(0), 'unison');
  equal(music.getCanonicalIntervalName(2), 'M2');

  throws(() => music.getCanonicalIntervalName(-1), /BadArguments/, 'Invalid interval value');
}

function scaleTones(): void {
  expect(24);

  // C Major
  const music = new Music();
  const manager = new KeyManager('CM');

  const c_major = music.getScaleTones(music.getNoteValue('c'), Music.scales.major);
  let values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

  equal(c_major.length, 7);

  for (let i = 0; i < c_major.length; ++i) {
    equal(music.getCanonicalNoteName(c_major[i]), values[i]);
  }

  // Dorian
  const c_dorian = music.getScaleTones(music.getNoteValue('c'), Music.scales.dorian);
  values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];

  let note = null;
  equal(c_dorian.length, 7);
  for (let i = 0; i < c_dorian.length; ++i) {
    note = music.getCanonicalNoteName(c_dorian[i]);
    equal(manager.selectNote(note).note, values[i]);
  }

  // Mixolydian
  const c_mixolydian = music.getScaleTones(music.getNoteValue('c'), Music.scales.mixolydian);
  values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];

  equal(c_mixolydian.length, 7);

  for (let i = 0; i < c_mixolydian.length; ++i) {
    note = music.getCanonicalNoteName(c_mixolydian[i]);
    equal(manager.selectNote(note).note, values[i]);
  }
}

function scaleIntervals(): void {
  expect(6);

  const m = new Music();

  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('c'), m.getNoteValue('d'))), 'M2');
  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('g'), m.getNoteValue('c'))), 'p4');
  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('c'), m.getNoteValue('c'))), 'unison');
  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('f'), m.getNoteValue('cb'))), 'dim5');

  // Forwards and backwards
  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('d'), m.getNoteValue('c'), 1)), 'b7');
  equal(m.getCanonicalIntervalName(m.getIntervalBetween(m.getNoteValue('d'), m.getNoteValue('c'), -1)), 'M2');
}

VexFlowTests.register(MusicTests);
export { MusicTests };
