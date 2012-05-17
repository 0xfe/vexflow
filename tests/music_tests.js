/**
 * VexFlow - Music Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Music = {}

Vex.Flow.Test.Music.Start = function() {
  module("Music");
  test("Valid Notes", Vex.Flow.Test.Music.validNotes);
  test("Valid Keys", Vex.Flow.Test.Music.validKeys);
  test("Note Values", Vex.Flow.Test.Music.noteValue);
  test("Interval Values", Vex.Flow.Test.Music.intervalValue);
  test("Relative Notes", Vex.Flow.Test.Music.relativeNotes);
  test("Relative Note Names", Vex.Flow.Test.Music.relativeNoteNames);
  test("Canonical Notes", Vex.Flow.Test.Music.canonicalNotes);
  test("Canonical Intervals", Vex.Flow.Test.Music.canonicalNotes);
  test("Scale Tones", Vex.Flow.Test.Music.scaleTones);
  test("Scale Intervals", Vex.Flow.Test.Music.scaleIntervals);
}

Vex.Flow.Test.Music.validNotes = function(options) {
  expect(10);

  var music = new Vex.Flow.Music();

  var parts = music.getNoteParts("c");
  equals(parts.root, "c");
  equals(parts.accidental, null);

  var parts = music.getNoteParts("C");
  equals(parts.root, "c");
  equals(parts.accidental, null);

  var parts = music.getNoteParts("c#");
  equals(parts.root, "c");
  equals(parts.accidental, "#");

  var parts = music.getNoteParts("c##");
  equals(parts.root, "c");
  equals(parts.accidental, "##");

  try {
    music.getNoteParts("r");
  } catch (e) {
    equals(e.code, "BadArguments", "Invalid note: r");
  }

  try {
    music.getNoteParts("");
  } catch (e) {
    equals(e.code, "BadArguments", "Invalid note: ''");
  }
}

Vex.Flow.Test.Music.validKeys = function(options) {
  expect(18);

  var music = new Vex.Flow.Music();

  var parts = music.getKeyParts("c");
  equals(parts.root, "c");
  equals(parts.accidental, null);
  equals(parts.type, "M");

  var parts = music.getKeyParts("d#");
  equals(parts.root, "d");
  equals(parts.accidental, "#");
  equals(parts.type, "M");

  var parts = music.getKeyParts("fbm");
  equals(parts.root, "f");
  equals(parts.accidental, "b");
  equals(parts.type, "m");

  var parts = music.getKeyParts("c#mel");
  equals(parts.root, "c");
  equals(parts.accidental, "#");
  equals(parts.type, "mel");

  var parts = music.getKeyParts("g#harm");
  equals(parts.root, "g");
  equals(parts.accidental, "#");
  equals(parts.type, "harm");

  try {
    music.getKeyParts("r");
  } catch (e) {
    equals(e.code, "BadArguments", "Invalid key: r");
  }

  try {
    music.getKeyParts("");
  } catch (e) {
    equals(e.code, "BadArguments", "Invalid key: ''");
  }

  try {
    music.getKeyParts("#m");
  } catch (e) {
    equals(e.code, "BadArguments", "Invalid key: #m");
  }
}

Vex.Flow.Test.Music.noteValue = function(options) {
  expect(3);

  var music = new Vex.Flow.Music();

  var note = music.getNoteValue("c");
  equals(note, 0);

  try {
    var note = music.getNoteValue("r");
  } catch(e) {
    ok(true, "Invalid note");
  }

  var note = music.getNoteValue("f#");
  equals(note, 6);
}

Vex.Flow.Test.Music.intervalValue = function(options) {
  expect(2);

  var music = new Vex.Flow.Music();

  var value = music.getIntervalValue("b2");
  equals(value, 1);

  try {
    value = music.getIntervalValue("7");
  } catch(e) {
    ok(true, "Invalid note");
  }
}

Vex.Flow.Test.Music.relativeNotes = function(options) {
  expect(8);

  var music = new Vex.Flow.Music();

  var value = music.getRelativeNoteValue(music.getNoteValue("c"),
      music.getIntervalValue("b5"));
  equals(value, 6);

  try {
    value = music.getRelativeNoteValue(music.getNoteValue("bc"),
        music.getIntervalValue("b2"));
  } catch(e) {
    ok(true, "Invalid note");
  }

  try {
    value = music.getRelativeNoteValue(music.getNoteValue("b"),
        music.getIntervalValue("p3"));
  } catch(e) {
    ok(true, "Invalid interval");
  }

  // Direction
  var value = music.getRelativeNoteValue(music.getNoteValue("d"),
      music.getIntervalValue("2"), -1);
  equals(value, 0);

  try {
    value = music.getRelativeNoteValue(music.getNoteValue("b"),
        music.getIntervalValue("p4"), 0);
  } catch(e) {
    ok(true, "Invalid direction");
  }

  // Rollover
  var value = music.getRelativeNoteValue(music.getNoteValue("b"),
      music.getIntervalValue("b5"));
  equals(value, 5);

  // Reverse rollover
  var value = music.getRelativeNoteValue(music.getNoteValue("c"),
      music.getIntervalValue("b2"), -1);
  equals(value, 11);

  // Practical tests
  var value = music.getRelativeNoteValue(music.getNoteValue("g"),
      music.getIntervalValue("p5"));
  equals(value, 2);
}

Vex.Flow.Test.Music.relativeNoteNames = function(options) {
  expect(9);

  var music = new Vex.Flow.Music();
  equals(music.getRelativeNoteName("c", music.getNoteValue("c")), "c");
  equals(music.getRelativeNoteName("c", music.getNoteValue("db")), "c#");
  equals(music.getRelativeNoteName("c#", music.getNoteValue("db")), "c#");
  equals(music.getRelativeNoteName("e", music.getNoteValue("f#")), "e##");
  equals(music.getRelativeNoteName("e", music.getNoteValue("d#")), "eb");
  equals(music.getRelativeNoteName("e", music.getNoteValue("fb")), "e");

  try {
    v = music.getRelativeNoteName("e", music.getNoteValue("g#"));
  } catch(e) {
    ok(true, "Too far");
  }

  equals(music.getRelativeNoteName("b", music.getNoteValue("c#")), "b##");
  equals(music.getRelativeNoteName("c", music.getNoteValue("b")), "cb");
}

Vex.Flow.Test.Music.canonicalNotes = function(options) {
  expect(3);

  var music = new Vex.Flow.Music();

  equals(music.getCanonicalNoteName(0), "c");
  equals(music.getCanonicalNoteName(2), "d");

  try {
    music.getCanonicalNoteName(-1);
  } catch(e) {
    ok(true, "Invalid note value");
  }
}

Vex.Flow.Test.Music.canonicalIntervals = function(options) {
  expect(3);

  var music = new Vex.Flow.Music();

  equals(music.getCanonicalIntervalName(0), "unison");
  equals(music.getCanonicalIntervalName(2), "M2");

  try {
    music.getCanonicalIntervalName(-1);
  } catch(e) {
    ok(true, "Invalid interval value");
  }
}

Vex.Flow.Test.Music.scaleTones = function(options) {
  expect(36);

  // C Major
  var music = new Vex.Flow.Music();
  var manager = new Vex.Flow.KeyManager("CM");

  var c_major = music.getScaleTones(
      music.getNoteValue("c"), Vex.Flow.Music.scales.major);
  var values = ["c", "d", "e", "f", "g", "a", "b"];

  equals(c_major.length, 7);

  for (var i = 0; i < c_major.length; ++i) {
    equals(music.getCanonicalNoteName(c_major[i]), values[i]);
  }

  // Dorian
  var c_dorian = music.getScaleTones(
      music.getNoteValue("c"), Vex.Flow.Music.scales.dorian);
  var values = ["c", "d", "eb", "f", "g", "a", "bb"];

  equals(c_dorian.length,  7);
  for (var i = 0; i < c_dorian.length; ++i) {
      var note = music.getCanonicalNoteName(c_dorian[i]);
      equals(manager.selectNote(note).note, values[i]);
  }

  // Mixolydian
  var c_mixolydian = music.getScaleTones(
      music.getNoteValue("c"), Vex.Flow.Music.scales.mixolydian);
  var values = ["c", "d", "e", "f", "g", "a", "bb"];

  equals(c_mixolydian.length,  7);

  for (var i = 0; i < c_mixolydian.length; ++i) {
      var note = music.getCanonicalNoteName(c_mixolydian[i]);
      equals(manager.selectNote(note).note, values[i]);
  }

  // Major Pentatonic
  var c_major_pentatonic = music.getScaleTones(
      music.getNoteValue("c"), Vex.Flow.Music.scales.majorPentatonic);
  var values = ["c", "d", "e", "g", "a"];

  equals(c_major_pentatonic.length,  5);

  for (var i = 0; i < c_major_pentatonic.length; ++i) {
      var note = music.getCanonicalNoteName(c_major_pentatonic[i]);
      equals(manager.selectNote(note).note, values[i]);
  }

  // Minor Pentatonic
  var c_minor_pentatonic = music.getScaleTones(
      music.getNoteValue("c"), Vex.Flow.Music.scales.minorPentatonic);
  var values = ["c", "eb", "f", "g", "bb"];

  equals(c_minor_pentatonic.length,  5);

  for (var i = 0; i < c_minor_pentatonic.length; ++i) {
      var note = music.getCanonicalNoteName(c_minor_pentatonic[i]);
      equals(manager.selectNote(note).note, values[i]);
  }
}

Vex.Flow.Test.Music.scaleIntervals = function(options) {
  expect(6);

  var music = new Vex.Flow.Music();

  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("c"), music.getNoteValue("d"))), "M2");
  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("g"), music.getNoteValue("c"))), "p4");
  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("c"), music.getNoteValue("c"))), "unison");
  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("f"), music.getNoteValue("cb"))), "dim5");

  // Forwards and backwards
  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("d"), music.getNoteValue("c"), 1)), "b7");
  equals(music.getCanonicalIntervalName(music.getIntervalBetween(
         music.getNoteValue("d"), music.getNoteValue("c"), -1)), "M2");
}
