/**
 * VexFlow - Music API Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Music = (function () {
  var Music = {
    Start: function () {
      QUnit.module('Music');
      test('Valid Notes', Music.validNotes);
      test('Valid Keys', Music.validKeys);
      test('Note Values', Music.noteValue);
      test('Interval Values', Music.intervalValue);
      test('Relative Notes', Music.relativeNotes);
      test('Relative Note Names', Music.relativeNoteNames);
      test('Canonical Notes', Music.canonicalNotes);
      test('Canonical Intervals', Music.canonicalNotes);
      test('Scale Tones', Music.scaleTones);
      test('Scale Intervals', Music.scaleIntervals);
    },

    validNotes: function () {
      expect(10);

      var parts = VF.Music.getNoteParts('c');
      equal(parts.root, 'c');
      equal(parts.accidental, null);

      parts = VF.Music.getNoteParts('C');
      equal(parts.root, 'c');
      equal(parts.accidental, null);

      parts = VF.Music.getNoteParts('c#');
      equal(parts.root, 'c');
      equal(parts.accidental, '#');

      parts = VF.Music.getNoteParts('c##');
      equal(parts.root, 'c');
      equal(parts.accidental, '##');

      try {
        VF.Music.getNoteParts('r');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid note: r');
      }

      try {
        VF.Music.getNoteParts('');
      } catch (e) {
        equal(e.code, 'BadArguments', "Invalid note: ''");
      }
    },

    validKeys: function () {
      expect(18);

      var parts = VF.Music.getKeyParts('c');
      equal(parts.root, 'c');
      equal(parts.accidental, null);
      equal(parts.type, 'M');

      parts = VF.Music.getKeyParts('d#');
      equal(parts.root, 'd');
      equal(parts.accidental, '#');
      equal(parts.type, 'M');

      parts = VF.Music.getKeyParts('fbm');
      equal(parts.root, 'f');
      equal(parts.accidental, 'b');
      equal(parts.type, 'm');

      parts = VF.Music.getKeyParts('c#mel');
      equal(parts.root, 'c');
      equal(parts.accidental, '#');
      equal(parts.type, 'mel');

      parts = VF.Music.getKeyParts('g#harm');
      equal(parts.root, 'g');
      equal(parts.accidental, '#');
      equal(parts.type, 'harm');

      try {
        VF.Music.getKeyParts('r');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid key: r');
      }

      try {
        VF.Music.getKeyParts('');
      } catch (e) {
        equal(e.code, 'BadArguments', "Invalid key: ''");
      }

      try {
        VF.Music.getKeyParts('#m');
      } catch (e) {
        equal(e.code, 'BadArguments', 'Invalid key: #m');
      }
    },

    noteValue: function () {
      expect(3);

      var note = VF.Music.getNoteValue('c');
      equal(note, 0);

      try {
        VF.Music.getNoteValue('r');
      } catch (e) {
        ok(true, 'Invalid note');
      }

      note = VF.Music.getNoteValue('f#');
      equal(note, 6);
    },

    intervalValue: function () {
      expect(2);

      var value = VF.Music.getIntervalValue('b2');
      equal(value, 1);

      try {
        VF.Music.getIntervalValue('7');
      } catch (e) {
        ok(true, 'Invalid note');
      }
    },

    relativeNotes: function () {
      expect(8);

      var value = VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('c'), VF.Music.getIntervalValue('b5'));
      equal(value, 6);

      try {
        VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('bc'), VF.Music.getIntervalValue('b2'));
      } catch (e) {
        ok(true, 'Invalid note');
      }

      try {
        VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('b'), VF.Music.getIntervalValue('p3'));
      } catch (e) {
        ok(true, 'Invalid interval');
      }

      // Direction
      value = VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('d'), VF.Music.getIntervalValue('2'), -1);
      equal(value, 0);

      try {
        VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('b'), VF.Music.getIntervalValue('p4'), 0);
      } catch (e) {
        ok(true, 'Invalid direction');
      }

      // Rollover
      value = VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('b'), VF.Music.getIntervalValue('b5'));
      equal(value, 5);

      // Reverse rollover
      value = VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('c'), VF.Music.getIntervalValue('b2'), -1);
      equal(value, 11);

      // Practical tests
      value = VF.Music.getRelativeNoteValue(VF.Music.getNoteValue('g'), VF.Music.getIntervalValue('p5'));
      equal(value, 2);
    },

    relativeNoteNames: function () {
      expect(9);

      equal(VF.Music.getRelativeNoteName('c', VF.Music.getNoteValue('c')), 'c');
      equal(VF.Music.getRelativeNoteName('c', VF.Music.getNoteValue('db')), 'c#');
      equal(VF.Music.getRelativeNoteName('c#', VF.Music.getNoteValue('db')), 'c#');
      equal(VF.Music.getRelativeNoteName('e', VF.Music.getNoteValue('f#')), 'e##');
      equal(VF.Music.getRelativeNoteName('e', VF.Music.getNoteValue('d#')), 'eb');
      equal(VF.Music.getRelativeNoteName('e', VF.Music.getNoteValue('fb')), 'e');

      try {
        VF.Music.getRelativeNoteName('e', VF.Music.getNoteValue('g#'));
      } catch (e) {
        ok(true, 'Too far');
      }

      equal(VF.Music.getRelativeNoteName('b', VF.Music.getNoteValue('c#')), 'b##');
      equal(VF.Music.getRelativeNoteName('c', VF.Music.getNoteValue('b')), 'cb');
    },

    canonicalNotes: function () {
      expect(3);

      equal(VF.Music.getCanonicalNoteName(0), 'c');
      equal(VF.Music.getCanonicalNoteName(2), 'd');

      try {
        VF.Music.getCanonicalNoteName(-1);
      } catch (e) {
        ok(true, 'Invalid note value');
      }
    },

    canonicalIntervals: function () {
      expect(3);

      equal(VF.Music.getCanonicalIntervalName(0), 'unison');
      equal(VF.Music.getCanonicalIntervalName(2), 'M2');

      try {
        VF.Music.getCanonicalIntervalName(-1);
      } catch (e) {
        ok(true, 'Invalid interval value');
      }
    },

    scaleTones: function () {
      expect(24);

      // C Major
      var manager = new VF.KeyManager('CM');

      var c_major = VF.Music.getScaleTones(VF.Music.getNoteValue('c'), VF.Music.scales.major);
      var values = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

      equal(c_major.length, 7);

      for (var cm = 0; cm < c_major.length; ++cm) {
        equal(VF.Music.getCanonicalNoteName(c_major[cm]), values[cm]);
      }

      // Dorian
      var c_dorian = VF.Music.getScaleTones(VF.Music.getNoteValue('c'), VF.Music.scales.dorian);
      values = ['c', 'd', 'eb', 'f', 'g', 'a', 'bb'];

      var note = null;
      equal(c_dorian.length, 7);
      for (var cd = 0; cd < c_dorian.length; ++cd) {
        note = VF.Music.getCanonicalNoteName(c_dorian[cd]);
        equal(manager.selectNote(note).note, values[cd]);
      }

      // Mixolydian
      var c_mixolydian = VF.Music.getScaleTones(VF.Music.getNoteValue('c'), VF.Music.scales.mixolydian);
      values = ['c', 'd', 'e', 'f', 'g', 'a', 'bb'];

      equal(c_mixolydian.length, 7);

      for (var i = 0; i < c_mixolydian.length; ++i) {
        note = VF.Music.getCanonicalNoteName(c_mixolydian[i]);
        equal(manager.selectNote(note).note, values[i]);
      }
    },

    scaleIntervals: function () {
      expect(6);

      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('c'), VF.Music.getNoteValue('d'))
        ),
        'M2'
      );
      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('g'), VF.Music.getNoteValue('c'))
        ),
        'p4'
      );
      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('c'), VF.Music.getNoteValue('c'))
        ),
        'unison'
      );
      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('f'), VF.Music.getNoteValue('cb'))
        ),
        'dim5'
      );

      // Forwards and backwards
      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('d'), VF.Music.getNoteValue('c'), 1)
        ),
        'b7'
      );
      equal(
        VF.Music.getCanonicalIntervalName(
          VF.Music.getIntervalBetween(VF.Music.getNoteValue('d'), VF.Music.getNoteValue('c'), -1)
        ),
        'M2'
      );
    },
  };

  return Music;
})();
