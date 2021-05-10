/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
import { Music } from '../src/music';
import { KeyManager } from '../src/keymanager';
import { QUnit, ok, test, expect, equal } from './declarations';

const MusicTests = {
  Start(): void {
    QUnit.module('MusicTests');
    test('Valid Notes', MusicTests.validNotes);
    test('Valid Keys', MusicTests.validKeys);
    test('Note Values', MusicTests.noteValue);
    test('Interval Values', MusicTests.intervalValue);
    test('Relative Notes', MusicTests.relativeNotes);
    test('Relative Note Names', MusicTests.relativeNoteNames);
    test('Canonical Notes', MusicTests.canonicalNotes);
    test('Canonical Intervals', MusicTests.canonicalIntervals);
    test('Scale Tones', MusicTests.scaleTones);
    test('Scale Intervals', MusicTests.scaleIntervals);
  },

  validNotes(): void {
    expect(10);

    const music = new Music();

    let parts = music.getNoteParts('c');
    equal(parts.root, 'c');
    equal(parts.accidental, null);

    parts = music.getNoteParts('C');
    equal(parts.root, 'c');
    equal(parts.accidental, null);

    parts = music.getNoteParts('c#');
    equal(parts.root, 'c');
    equal(parts.accidental, '#');

    parts = music.getNoteParts('c##');
    equal(parts.root, 'c');
    equal(parts.accidental, '##');

    try {
      music.getNoteParts('r');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid note: r');
    }

    try {
      music.getNoteParts('');
    } catch (e) {
      equal(e.code, 'BadArguments', "Invalid note: ''");
    }
  },

  validKeys(): void {
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

    try {
      music.getKeyParts('r');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid key: r');
    }

    try {
      music.getKeyParts('');
    } catch (e) {
      equal(e.code, 'BadArguments', "Invalid key: ''");
    }

    try {
      music.getKeyParts('#m');
    } catch (e) {
      equal(e.code, 'BadArguments', 'Invalid key: #m');
    }
  },

  noteValue(): void {
    expect(3);

    const music = new Music();

    let note = music.getNoteValue('c');
    equal(note, 0);

    try {
      music.getNoteValue('r');
    } catch (e) {
      ok(true, 'Invalid note');
    }

    note = music.getNoteValue('f#');
    equal(note, 6);
  },

  intervalValue(): void {
    expect(2);

    const music = new Music();

    const value = music.getIntervalValue('b2');
    equal(value, 1);

    try {
      music.getIntervalValue('7');
    } catch (e) {
      ok(true, 'Invalid note');
    }
  },

  relativeNotes(): void {
    expect(8);

    const music = new Music();

    let value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b5'));
    equal(value, 6);

    try {
      music.getRelativeNoteValue(music.getNoteValue('bc'), music.getIntervalValue('b2'));
    } catch (e) {
      ok(true, 'Invalid note');
    }

    try {
      music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p3'));
    } catch (e) {
      ok(true, 'Invalid interval');
    }

    // Direction
    value = music.getRelativeNoteValue(music.getNoteValue('d'), music.getIntervalValue('2'), -1);
    equal(value, 0);

    try {
      music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('p4'), 0);
    } catch (e) {
      ok(true, 'Invalid direction');
    }

    // Rollover
    value = music.getRelativeNoteValue(music.getNoteValue('b'), music.getIntervalValue('b5'));
    equal(value, 5);

    // Reverse rollover
    value = music.getRelativeNoteValue(music.getNoteValue('c'), music.getIntervalValue('b2'), -1);
    equal(value, 11);

    // Practical tests
    value = music.getRelativeNoteValue(music.getNoteValue('g'), music.getIntervalValue('p5'));
    equal(value, 2);
  },

  relativeNoteNames(): void {
    expect(9);

    const music = new Music();
    equal(music.getRelativeNoteName('c', music.getNoteValue('c')), 'c');
    equal(music.getRelativeNoteName('c', music.getNoteValue('db')), 'c#');
    equal(music.getRelativeNoteName('c#', music.getNoteValue('db')), 'c#');
    equal(music.getRelativeNoteName('e', music.getNoteValue('f#')), 'e##');
    equal(music.getRelativeNoteName('e', music.getNoteValue('d#')), 'eb');
    equal(music.getRelativeNoteName('e', music.getNoteValue('fb')), 'e');

    try {
      music.getRelativeNoteName('e', music.getNoteValue('g#'));
    } catch (e) {
      ok(true, 'Too far');
    }

    equal(music.getRelativeNoteName('b', music.getNoteValue('c#')), 'b##');
    equal(music.getRelativeNoteName('c', music.getNoteValue('b')), 'cb');
  },

  canonicalNotes(): void {
    expect(3);

    const music = new Music();

    equal(music.getCanonicalNoteName(0), 'c');
    equal(music.getCanonicalNoteName(2), 'd');

    try {
      music.getCanonicalNoteName(-1);
    } catch (e) {
      ok(true, 'Invalid note value');
    }
  },

  canonicalIntervals(): void {
    expect(3);

    const music = new Music();

    equal(music.getCanonicalIntervalName(0), 'unison');
    equal(music.getCanonicalIntervalName(2), 'M2');

    try {
      music.getCanonicalIntervalName(-1);
    } catch (e) {
      ok(true, 'Invalid interval value');
    }
  },

  scaleTones(): void {
    expect(24);

    // C Major
    const music = new Music();
    const manager = new KeyManager('CM');

    const c_major = music.getScaleTones(music.getNoteValue('c'), Music.scales.major);
    let values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

    equal(c_major.length, 7);

    for (let cm = 0; cm < c_major.length; ++cm) {
      equal(music.getCanonicalNoteName(c_major[cm]), values[cm]);
    }

    // Dorian
    const c_dorian = music.getScaleTones(music.getNoteValue('c'), Music.scales.dorian);
    values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];

    let note = null;
    equal(c_dorian.length, 7);
    for (let cd = 0; cd < c_dorian.length; ++cd) {
      note = music.getCanonicalNoteName(c_dorian[cd]);
      equal(manager.selectNote(note).note, values[cd]);
    }

    // Mixolydian
    const c_mixolydian = music.getScaleTones(music.getNoteValue('c'), Music.scales.mixolydian);
    values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];

    equal(c_mixolydian.length, 7);

    for (let i = 0; i < c_mixolydian.length; ++i) {
      note = music.getCanonicalNoteName(c_mixolydian[i]);
      equal(manager.selectNote(note).note, values[i]);
    }
  },

  scaleIntervals(): void {
    expect(6);

    const music = new Music();

    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('c'), music.getNoteValue('d'))),
      'M2'
    );
    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('g'), music.getNoteValue('c'))),
      'p4'
    );
    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('c'), music.getNoteValue('c'))),
      'unison'
    );
    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('f'), music.getNoteValue('cb'))),
      'dim5'
    );

    // Forwards and backwards
    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('d'), music.getNoteValue('c'), 1)),
      'b7'
    );
    equal(
      music.getCanonicalIntervalName(music.getIntervalBetween(music.getNoteValue('d'), music.getNoteValue('c'), -1)),
      'M2'
    );
  },
};
export { MusicTests };
