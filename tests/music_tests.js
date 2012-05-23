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
  expect(26);

  var music = new Vex.Flow.Music();

  equals(music.getScaleNotes("c","major").join(),["c", "d", "e", "f", "g", "a", "b"].join(),"c major");
  equals(music.getScaleNotes("d","major").join(),["d", "e", "f#", "g", "a", "b","c#"].join(),"d major");
  equals(music.getScaleNotes("g","major").join(),["g","a","b","c","d","e","f#"].join(),"g major");
  equals(music.getScaleNotes("a","major").join(),["a","b","c#","d","e","f#","g#"].join(),"a major");
  equals(music.getScaleNotes("e","major").join(),["e", "f#", "g#", "a", "b","c#","d#"].join(),"e major");
  equals(music.getScaleNotes("b","major").join(),["b","c#","d#","e","f#","g#","a#"].join(),"b major");

  equals(music.getScaleNotes("f","major").join(),["f", "g", "a", "bb","c","d","e"].join(),"f major");

  equals(music.getScaleNotes("c","dorian").join(),["c","d","eb","f","g","a","bb"].join(),"c dorian");
  equals(music.getScaleNotes("c","phrygian").join(),["c","db","eb","f","g","ab","bb"].join(),"c phrygian");
  equals(music.getScaleNotes("c","lydian").join(),["c","d","e","f#","g","a","b"].join(),"c lydian");
  equals(music.getScaleNotes("c","mixolydian").join(),["c", "d", "e", "f", "g", "a", "bb"].join(),"c mixolydian");
  equals(music.getScaleNotes("c","minor").join(),["c", "d", "eb", "f", "g", "ab", "bb"].join(),"c minor");
  equals(music.getScaleNotes("c","aeolian").join(),["c", "d", "eb", "f", "g", "ab", "bb"].join(),"c aeolian");
  //equals(music.getScaleNotes("c","locrian").join(),["c", "db", "eb", "f", "gb", "ab", "bb"].join(),"c locrian");

  equals(music.getScaleNotes("c","majorPentatonic").join(),["c", "d", "e", "g", "a"].join(),"c major pentatonic");
  equals(music.getScaleNotes("c","minorPentatonic").join(),["c", "eb", "f", "g", "bb"].join(),"c minor pentatonic");
  equals(music.getScaleNotes("c","blues").join(),["c","eb","f","gb","g","bb"].join(),"c blues");

  equals(music.getScaleNotes("d","major").join(),["d", "e", "f#", "g", "a", "b","c#"].join(),"d major");
  equals(music.getScaleNotes("d","ionian").join(),["d", "e", "f#", "g", "a", "b","c#"].join(),"d ionian");
  equals(music.getScaleNotes("d","dorian").join(),["d", "e", "f", "g", "a", "b","c"].join(),"d dorian");
  equals(music.getScaleNotes("d","phrygian").join(),["d", "eb", "f", "g", "a", "bb","c"].join(),"d phrygian");
  equals(music.getScaleNotes("d","lydian").join(),["d", "e", "f#", "g#", "a", "b","c#"].join(),"d lydian");
  equals(music.getScaleNotes("d","mixolydian").join(),["d", "e", "f#", "g", "a", "b","c"].join(),"d mixolydian");
  equals(music.getScaleNotes("d","minor").join(),["d", "e", "f", "g", "a", "bb","c"].join(),"d minor");
  equals(music.getScaleNotes("d","aeolian").join(),["d", "e", "f", "g", "a", "bb","c"].join(),"d aeolian");
  equals(music.getScaleNotes("d","locrian").join(),["d", "eb", "f", "g", "ab", "bb","c"].join(),"d locrian");


  equals(music.getScaleNotes("ab","major").join(),["ab", "bb", "c", "db", "eb", "f","g"].join(),"ab major");

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
