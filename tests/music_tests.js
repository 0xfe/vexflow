/**
 * VexFlow - Music Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Music = {}

Vex.Flow.Test.Music.Start = function() {
  module("Music");
  test("Valid Notes", Vex.Flow.Test.Music.validNotes);
  test("Note Values", Vex.Flow.Test.Music.noteValue);
  test("Interval Values", Vex.Flow.Test.Music.intervalValue);
  test("Relative Notes", Vex.Flow.Test.Music.relativeNotes);
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
