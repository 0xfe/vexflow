/**
 * VexFlow - StaveNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveNote = {}

Vex.Flow.Test.StaveNote.Start = function() {
  module("StaveNote");
  test("Tick", Vex.Flow.Test.StaveNote.ticks);
  test("Tick - New API", Vex.Flow.Test.StaveNote.ticksNewApi);
  test("Stem", Vex.Flow.Test.StaveNote.stem);
  test("Automatic Stem Direction", Vex.Flow.Test.StaveNote.autoStem);
  test("StaveLine", Vex.Flow.Test.StaveNote.staveLine);
  test("Width", Vex.Flow.Test.StaveNote.width);
  test("TickContext", Vex.Flow.Test.StaveNote.tickContext);

  Vex.Flow.Test.runTests("StaveNote Draw - Treble", Vex.Flow.Test.StaveNote.draw,
      { clef: "treble", octaveShift: 0, restKey: "r/4" });

  Vex.Flow.Test.runTests("StaveNote BoundingBoxes - Treble", Vex.Flow.Test.StaveNote.drawBoundingBoxes,
      { clef: "treble", octaveShift: 0, restKey: "r/4" });

  Vex.Flow.Test.runTests("StaveNote Draw - Alto", Vex.Flow.Test.StaveNote.draw,
      { clef: "alto", octaveShift: -1, restKey: "r/4" });

  Vex.Flow.Test.runTests("StaveNote Draw - Tenor", Vex.Flow.Test.StaveNote.draw,
      { clef: "tenor", octaveShift: -1, restKey: "r/3" });

  Vex.Flow.Test.runTests("StaveNote Draw - Bass", Vex.Flow.Test.StaveNote.draw,
      { clef: "bass", octaveShift: -2, restKey: "r/3" });

  Vex.Flow.Test.runTests("StaveNote Draw - Harmonic And Muted",
                        Vex.Flow.Test.StaveNote.drawHarmonicAndMuted);
  

  Vex.Flow.Test.runTests("StaveNote Draw - Slash",
                        Vex.Flow.Test.StaveNote.drawSlash);
  
  Vex.Flow.Test.runTests("Displacements", Vex.Flow.Test.StaveNote.displacements);
  
  Vex.Flow.Test.runTests("StaveNote Draw - Bass", Vex.Flow.Test.StaveNote.drawBass);
  
  Vex.Flow.Test.runTests("StaveNote Draw - Key Styles",
      Vex.Flow.Test.StaveNote.drawKeyStyles);
  
  Vex.Flow.Test.runTests("StaveNote Draw - StaveNote Styles",
      Vex.Flow.Test.StaveNote.drawNoteStyles);
  
  Vex.Flow.Test.runTests("Flag and Dot Placement - Stem Up", Vex.Flow.Test.StaveNote.dotsAndFlagsStemUp);
  Vex.Flow.Test.runTests("Flag and Dots Placement - Stem Down", Vex.Flow.Test.StaveNote.dotsAndFlagsStemDown);
  
  Vex.Flow.Test.runTests("Beam and Dot Placement - Stem Up", Vex.Flow.Test.StaveNote.dotsAndBeamsUp);
  Vex.Flow.Test.runTests("Beam and Dot Placement - Stem Down", Vex.Flow.Test.StaveNote.dotsAndBeamsDown);
  Vex.Flow.Test.runTests("Center Aligned Note", Vex.Flow.Test.StaveNote.centerAlignedRest);
  Vex.Flow.Test.runTests("Center Aligned Note with Articulation", Vex.Flow.Test.StaveNote.centerAlignedRestFermata);
  Vex.Flow.Test.runTests("Center Aligned Note with Annotation", Vex.Flow.Test.StaveNote.centerAlignedRestAnnotation);
  Vex.Flow.Test.runTests("Center Aligned Note - Multi Voice", Vex.Flow.Test.StaveNote.centerAlignedMultiVoice);
  Vex.Flow.Test.runTests("Center Aligned Note with Multiple Modifiers", Vex.Flow.Test.StaveNote.centerAlignedNoteMultiModifiers);
}

Vex.Flow.Test.StaveNote.ticks = function(options) {
  var BEAT = 1 * Vex.Flow.RESOLUTION / 4;

  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "1/2"});
  equal(note.getTicks().value(), BEAT * 8, "Breve note has 8 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "w"});
  equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "q"});
  equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hd"});
  equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hdd"});
  equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hddd"});
  equal(note.getTicks().value(), BEAT * 3.75, "Triple-dotted half note has 3.75 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hdr"});
  equal(note.getTicks().value(), BEAT * 3, "Dotted half rest has 3 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hddr"});
  equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half rest has 3.5 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "hdddr"});
  equal(note.getTicks().value(), BEAT * 3.75, "Triple-dotted half rest has 3.75 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "qdh"});
  equal(note.getTicks().value(), BEAT * 1.5,
         "Dotted harmonic quarter note has 1.5 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "qddh"});
  equal(note.getTicks().value(), BEAT * 1.75,
         "Double-dotted harmonic quarter note has 1.75 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "qdddh"});
  equal(note.getTicks().value(), BEAT * 1.875,
         "Triple-dotted harmonic quarter note has 1.875 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8dm"});
  equal(note.getTicks().value(), BEAT * 0.75, "Dotted muted 8th note has 0.75 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8ddm"});
  equal(note.getTicks().value(), BEAT * 0.875,
         "Double-dotted muted 8th note has 0.875 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8dddm"});
  equal(note.getTicks().value(), BEAT * 0.9375,
         "Triple-dotted muted 8th note has 0.9375 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "8.7dddm"});
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments",
        "Invalid note duration '8.7' throws BadArguments exception");
  }

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "2Z"});
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments",
        "Invalid note type 'Z' throws BadArguments exception");
  }

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "2dddZ"});
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments",
        "Invalid note type 'Z' for dotted note throws BadArguments exception");
  }
}

Vex.Flow.Test.StaveNote.ticksNewApi = function() {
  var BEAT = 1 * Vex.Flow.RESOLUTION / 4;

  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "1"});
  equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "4"});
  equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 1});
  equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 2});
  equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 3});
  equal(note.getTicks().value(), BEAT * 3.75,
         "Triple-dotted half note has 3.75 beats");
  equal(note.getNoteType(), "n", "Note type is 'n' for normal note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 1, type: "r"});
  equal(note.getTicks().value(), BEAT * 3, "Dotted half rest has 3 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 2, type: "r"});
  equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half rest has 3.5 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "2", dots: 3, type: "r"});
  equal(note.getTicks().value(), BEAT * 3.75,
         "Triple-dotted half rest has 3.75 beats");
  equal(note.getNoteType(), "r", "Note type is 'r' for rest");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 1, type: "h"});
  equal(note.getTicks().value(), BEAT * 1.5,
         "Dotted harmonic quarter note has 1.5 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 2, type: "h"});
  equal(note.getTicks().value(), BEAT * 1.75,
         "Double-dotted harmonic quarter note has 1.75 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "4", dots: 3, type: "h"});
  equal(note.getTicks().value(), BEAT * 1.875,
         "Triple-dotted harmonic quarter note has 1.875 beats");
  equal(note.getNoteType(), "h", "Note type is 'h' for harmonic note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 1, type: "m"});
  equal(note.getTicks().value(), BEAT * 0.75, "Dotted muted 8th note has 0.75 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 2, type: "m"});
  equal(note.getTicks().value(), BEAT * 0.875,
         "Double-dotted muted 8th note has 0.875 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: 3, type: "m"});
  equal(note.getTicks().value(), BEAT * 0.9375,
         "Triple-dotted muted 8th note has 0.9375 beats");
  equal(note.getNoteType(), "m", "Note type is 'm' for muted note");

  var note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "1s"});
  equal(note.getTicks().value(), BEAT * 4, "Whole note has 4 beats");
  equal(note.getNoteType(), "s", "Note type is 's' for slash note");

  var note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "4s"});
  equal(note.getTicks().value(), BEAT, "Quarter note has 1 beats");
  equal(note.getNoteType(), "s", "Note type is 's' for slash note");

  var note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "2s", dots: 1});
  equal(note.getTicks().value(), BEAT * 3, "Dotted half note has 3 beats");
  equal(note.getNoteType(), "s", "Note type is 's' for slash note");

  var note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "2s", dots: 2});
  equal(note.getTicks().value(), BEAT * 3.5, "Double-dotted half note has 3.5 beats");
  equal(note.getNoteType(), "s", "Note type is 's' for slash note");

  var note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "2s", dots: 3});
  equal(note.getTicks().value(), BEAT * 3.75,
         "Triple-dotted half note has 3.75 beats");
  equal(note.getNoteType(), "s", "Note type is 's' for slash note");

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "8.7"});
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments",
        "Invalid note duration '8.7' throws BadArguments exception");
  }

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "8", dots: "three" });
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments", "Invalid number of dots 'three' " +
           "(as string) throws BadArguments exception");
  }

  try {
    new Vex.Flow.StaveNote(
        { keys: ["c/4", "e/4", "g/4"], duration: "2", type: "Z"});
    throw new Error();
  } catch (e) {
    equal(e.code, "BadArguments",
        "Invalid note type 'Z' throws BadArguments exception");
  }
}


Vex.Flow.Test.StaveNote.stem = function() {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "w"});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_UP,
      "Default note has UP stem");
}

Vex.Flow.Test.StaveNote.autoStem = function() {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/5", "e/5", "g/5"], duration: "8", auto_stem: true});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_DOWN,
      "Stem must be down");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/5", "e/4", "g/4"], duration: "8", auto_stem: true});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_UP,
      "Stem must be up");

  note = new Vex.Flow.StaveNote(
      { keys: ["c/5"], duration: "8", auto_stem: true});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_DOWN,
      "Stem must be up");

  note = new Vex.Flow.StaveNote(
      { keys: ["a/4", "e/5", "g/5"], duration: "8", auto_stem: true});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_DOWN,
      "Stem must be down");

  note = new Vex.Flow.StaveNote(
      { keys: ["b/4"], duration: "8", auto_stem: true});
  equal(note.getStemDirection(), Vex.Flow.StaveNote.STEM_DOWN,
      "Stem must be up");

}

Vex.Flow.Test.StaveNote.staveLine = function() {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});
  var props = note.getKeyProps();
  equal(props[0].line, 0, "C/4 on line 0");
  equal(props[1].line, 1, "E/4 on line 1");
  equal(props[2].line, 2.5, "A/4 on line 2.5");

  var stave = new Vex.Flow.Stave(10, 10, 300);
  note.setStave(stave);

  var ys = note.getYs();
  equal(ys.length, 3, "Chord should be rendered on three lines");
  equal(ys[0], 100, "Line for C/4");
  equal(ys[1], 90, "Line for E/4");
  equal(ys[2], 75, "Line for A/4");
}

Vex.Flow.Test.StaveNote.width = function() {
  expect(1);
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});

  try {
    var width = note.getWidth();
  } catch (e) {
    equal(e.code, "UnformattedNote",
        "Unformatted note should have no width");
  }
}

Vex.Flow.Test.StaveNote.tickContext = function() {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note);
  tickContext.preFormat();
  tickContext.setX(10);
  tickContext.setPadding(0);

  equal(tickContext.getWidth(), 16);
}

Vex.Flow.Test.StaveNote.showNote = function(note_struct, stave, ctx, x, drawBoundingBox) {
  var note = new Vex.Flow.StaveNote(note_struct);
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();

  if (drawBoundingBox) {
    note.getBoundingBox().draw(ctx);
  }
  return note;
}

Vex.Flow.Test.StaveNote.draw = function(options, contextBuilder) {
  var clef = options.params.clef;
  var octaveShift = options.params.octaveShift;
  var restKey = options.params.restKey;

  var ctx = new contextBuilder(options.canvas_sel, 700, 180);
  var stave = new Vex.Flow.Stave(10, 30, 750);

  stave.setContext(ctx);
  stave.addClef(clef);
  stave.draw();

  var lowerKeys = ["c/", "e/", "a/"];
  var higherKeys = ["c/", "e/", "a/"];
  for (var k = 0; k < lowerKeys.length; k++) {
    lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
    higherKeys[k] = higherKeys[k] + (5 + octaveShift);
  }

  var restKeys = [ restKey ];

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { clef: clef, keys: higherKeys, duration: "1/2"},
    { clef: clef, keys: lowerKeys, duration: "w"},
    { clef: clef, keys: higherKeys, duration: "h"},
    { clef: clef, keys: lowerKeys, duration: "q"},
    { clef: clef, keys: higherKeys, duration: "8"},
    { clef: clef, keys: lowerKeys, duration: "16"},
    { clef: clef, keys: higherKeys, duration: "32"},
    { clef: clef, keys: higherKeys, duration: "64"},
    { clef: clef, keys: higherKeys, duration: "128"},
    { clef: clef, keys: lowerKeys, duration: "1/2",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "w",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "h",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "q",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "8",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "16",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "32",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "64",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "128",
      stem_direction: -1},

    { clef: clef, keys: restKeys, duration: "1/2r"},
    { clef: clef, keys: restKeys, duration: "wr"},
    { clef: clef, keys: restKeys, duration: "hr"},
    { clef: clef, keys: restKeys, duration: "qr"},
    { clef: clef, keys: restKeys, duration: "8r"},
    { clef: clef, keys: restKeys, duration: "16r"},
    { clef: clef, keys: restKeys, duration: "32r"},
    { clef: clef, keys: restKeys, duration: "64r"},
    { clef: clef, keys: restKeys, duration: "128r"},
    { keys: ["x/4"], duration: "h"}
  ];
  expect(notes.length * 2);

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawBoundingBoxes = function(options, contextBuilder) {
  var clef = options.params.clef;
  var octaveShift = options.params.octaveShift;
  var restKey = options.params.restKey;

  var ctx = new contextBuilder(options.canvas_sel, 700, 180);
  var stave = new Vex.Flow.Stave(10, 30, 750);

  stave.setContext(ctx);
  stave.addClef(clef);
  stave.draw();

  var lowerKeys = ["c/", "e/", "a/"];
  var higherKeys = ["c/", "e/", "a/"];
  for (var k = 0; k < lowerKeys.length; k++) {
    lowerKeys[k] = lowerKeys[k] + (4 + octaveShift);
    higherKeys[k] = higherKeys[k] + (5 + octaveShift);
  }

  var restKeys = [ restKey ];

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { clef: clef, keys: higherKeys, duration: "1/2"},
    { clef: clef, keys: lowerKeys, duration: "w"},
    { clef: clef, keys: higherKeys, duration: "h"},
    { clef: clef, keys: lowerKeys, duration: "q"},
    { clef: clef, keys: higherKeys, duration: "8"},
    { clef: clef, keys: lowerKeys, duration: "16"},
    { clef: clef, keys: higherKeys, duration: "32"},
    { clef: clef, keys: higherKeys, duration: "64"},
    { clef: clef, keys: higherKeys, duration: "128"},
    { clef: clef, keys: lowerKeys, duration: "1/2",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "w",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "h",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "q",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "8",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "16",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "32",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "64",
      stem_direction: -1},
    { clef: clef, keys: lowerKeys, duration: "128"},

    { clef: clef, keys: restKeys, duration: "1/2r"},
    { clef: clef, keys: restKeys, duration: "wr"},
    { clef: clef, keys: restKeys, duration: "hr"},
    { clef: clef, keys: restKeys, duration: "qr"},
    { clef: clef, keys: restKeys, duration: "8r"},
    { clef: clef, keys: restKeys, duration: "16r"},
    { clef: clef, keys: restKeys, duration: "32r"},
    { clef: clef, keys: restKeys, duration: "64r"},
    { clef: clef, keys: restKeys, duration: "128r"},
    { keys: ["x/4"], duration: "h"}
  ];
  expect(notes.length * 2);

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25, true);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawBass = function(options, contextBuilder) {
  expect(40);
  var ctx = new contextBuilder(options.canvas_sel, 600, 280);
  var stave = new Vex.Flow.Stave(10, 10, 650);
  var stave2 = new Vex.Flow.Stave(10, 150, 650);
  stave.setContext(ctx);
  stave.addClef('bass');
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "1/2"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "w"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "h"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "8"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "32"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "h", stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q", stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "8", stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16", stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "32", stem_direction: -1},

    { keys: ["r/4"], duration: "1/2r"},
    { keys: ["r/4"], duration: "wr"},
    { keys: ["r/4"], duration: "hr"},
    { keys: ["r/4"], duration: "qr"},
    { keys: ["r/4"], duration: "8r"},
    { keys: ["r/4"], duration: "16r"},
    { keys: ["r/4"], duration: "32r"},
    { keys: ["x/4"], duration: "h"}
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.displacements = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  var stave = new Vex.Flow.Stave(10, 10, 650);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { keys: ["g/3", "a/3", "c/4", "d/4", "e/4"], duration: "1/2"},
    { keys: ["g/3", "a/3", "c/4", "d/4", "e/4"], duration: "w"},
    { keys: ["d/4", "e/4", "f/4"], duration: "h"},
    { keys: ["f/4", "g/4", "a/4", "b/4"], duration: "q"},
    { keys: ["e/3", "b/3", "c/4", "e/4", "f/4", "g/5", "a/5"], duration: "8"},
    { keys: ["a/3", "c/4", "e/4", "g/4", "a/4", "b/4"], duration: "16"},
    { keys: ["c/4", "e/4", "a/4"], duration: "32"},
    { keys: ["c/4", "e/4", "a/4", "a/4"], duration: "64"},
    { keys: ["g/3", "c/4", "d/4", "e/4"], duration: "h", stem_direction: -1},
    { keys: ["d/4", "e/4", "f/4"], duration: "q", stem_direction: -1},
    { keys: ["f/4", "g/4", "a/4", "b/4"], duration: "8", stem_direction: -1},
    { keys: ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4"], duration: "16",
      stem_direction: -1},
    { keys: ["b/3", "c/4", "e/4", "a/4", "b/5", "c/6", "e/6"], duration: "32",
      stem_direction: -1},
    { keys: ["b/3", "c/4", "e/4", "a/4", "b/5", "c/6", "e/6", "e/6"],
      duration: "64", stem_direction: -1}
  ];
  expect(notes.length * 2);

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 45);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawHarmonicAndMuted = function(options,
                                                        contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 300, 180);
  var stave = new Vex.Flow.Stave(10, 10, 280);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { keys: ["c/4", "e/4", "a/4"], duration: "1/2h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "wh"},
    { keys: ["c/4", "e/4", "a/4"], duration: "hh"},
    { keys: ["c/4", "e/4", "a/4"], duration: "qh"},
    { keys: ["c/4", "e/4", "a/4"], duration: "8h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "16h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "32h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "64h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "128h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "1/2h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "wh", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "hh", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "qh", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "8h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "16h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "32h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "64h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "128h", stem_direction: -1},

    { keys: ["c/4", "e/4", "a/4"], duration: "1/2m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "wm"},
    { keys: ["c/4", "e/4", "a/4"], duration: "hm"},
    { keys: ["c/4", "e/4", "a/4"], duration: "qm"},
    { keys: ["c/4", "e/4", "a/4"], duration: "8m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "16m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "32m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "64m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "128m"},
    { keys: ["c/4", "e/4", "a/4"], duration: "1/2m", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "wm", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "hm", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "qm", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "8m", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "16m", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "32m", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "64m", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "128m", stem_direction: -1}
  ];
  expect(notes.length * 2);

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawSlash = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 180);
  var stave = new Vex.Flow.Stave(10, 10, 650);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { keys: ["b/4"], duration: "1/2s", stem_direction: -1},
    { keys: ["b/4"], duration: "ws", stem_direction: -1},
    { keys: ["b/4"], duration: "hs", stem_direction: -1},
    { keys: ["b/4"], duration: "qs", stem_direction: -1},
    { keys: ["b/4"], duration: "8s", stem_direction: -1},
    { keys: ["b/4"], duration: "16s", stem_direction: -1},
    { keys: ["b/4"], duration: "32s", stem_direction: -1},
    { keys: ["b/4"], duration: "64s", stem_direction: -1},
    { keys: ["b/4"], duration: "128s", stem_direction: -1},

    { keys: ["b/4"], duration: "1/2s", stem_direction: 1},
    { keys: ["b/4"], duration: "ws", stem_direction: 1},
    { keys: ["b/4"], duration: "hs", stem_direction: 1},
    { keys: ["b/4"], duration: "qs", stem_direction: 1},
    { keys: ["b/4"], duration: "8s", stem_direction: 1},
    { keys: ["b/4"], duration: "16s", stem_direction: 1},
    { keys: ["b/4"], duration: "32s", stem_direction: 1},
    { keys: ["b/4"], duration: "64s", stem_direction: 1},
    { keys: ["b/4"], duration: "128s", stem_direction: 1},

    // Beam
    { keys: ["b/4"], duration: "8s", stem_direction: -1},
    { keys: ["b/4"], duration: "8s", stem_direction: -1},
    { keys: ["b/4"], duration: "8s", stem_direction: 1},
    { keys: ["b/4"], duration: "8s", stem_direction: 1}
  ];

  var stave_notes = notes.map(function(note) {return new Vex.Flow.StaveNote(note)});
  var beam1 = new Vex.Flow.Beam([stave_notes[16], stave_notes[17]]);
  var beam2 = new Vex.Flow.Beam([stave_notes[18], stave_notes[19]]);

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, stave_notes, false);

  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  ok("Slash Note Heads");
}

Vex.Flow.Test.StaveNote.drawKeyStyles = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 300, 280);
  var stave = new Vex.Flow.Stave(10, 0, 100);
  ctx.scale(3, 3);
  stave.setContext(ctx);
  stave.draw();

  var note_struct = { keys: ["g/4","bb/4","d/5"], duration: "q" };
  var note = new Vex.Flow.StaveNote(note_struct);
  note.addAccidental(1, new Vex.Flow.Accidental('b'));
  note.setKeyStyle(1, {shadowBlur:15, shadowColor:'blue', fillStyle:'blue'});

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(25).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();

  ok(note.getX() > 0, "Note has X value");
  ok(note.getYs().length > 0, "Note has Y values");
}

Vex.Flow.Test.StaveNote.drawNoteStyles = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 300, 280);
  var stave = new Vex.Flow.Stave(10, 0, 100);
  ctx.scale(3, 3);
  stave.setContext(ctx);
  stave.draw();

  var note_struct = { keys: ["g/4","bb/4","d/5"], duration: "q" };
  var note = new Vex.Flow.StaveNote(note_struct);
  note.addAccidental(1, new Vex.Flow.Accidental('b'));
  note.setStyle({shadowBlur:15, shadowColor:'blue', fillStyle:'blue', strokeStyle:'blue'});

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(25).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();

  ok(note.getX() > 0, "Note has X value");
  ok(note.getYs().length > 0, "Note has Y values");
}


Vex.Flow.Test.StaveNote.renderNote = function(note, stave, ctx, x) {
  var mc = new Vex.Flow.ModifierContext();
  note.addToModifierContext(mc);

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

  note.setContext(ctx).setStave(stave);
  note.draw();

  ctx.save();
  return note;
}

Vex.Flow.Test.StaveNote.dotsAndFlagsStemUp = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var notes = [
    newNote({ keys: ["f/4"],
        duration: "4", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "8", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "16", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "32", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "64", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "128", stem_direction: 1}).
      addDotToAll().
      addDotToAll(),


    newNote({ keys: ["g/4"],
        duration: "4", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "8", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "16", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "32"}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "64", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "128", stem_direction: 1}).
      addDotToAll().
      addDotToAll()
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
  }

  ok(true, "Full Dot");
}


Vex.Flow.Test.StaveNote.dotsAndFlagsStemDown = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var notes = [
    newNote({ keys: ["e/5"],
        duration: "4", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "8", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "16", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "32", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "64", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "128", stem_direction: -1}).
      addDotToAll(),


    newNote({ keys: ["d/5"],
        duration: "4", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "8", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "16", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "32",  stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "64", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "128", stem_direction: -1}).
      addDotToAll()
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
  }

  ok(true, "Full Dot");
}
Vex.Flow.Test.StaveNote.dotsAndBeamsUp = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 150);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var notes = [
    newNote({ keys: ["f/4"],
        duration: "8", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "16", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "32", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "64", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["f/4"],
        duration: "128", stem_direction: 1}).
      addDotToAll().
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "8", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "16", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "32"}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "64", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4"],
        duration: "128", stem_direction: 1}).
      addDotToAll().
      addDotToAll()
  ];

  var beam = new Vex.Flow.Beam(notes);

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
  }

  beam.setContext(ctx).draw();
  ok(true, "Full Dot");
}



Vex.Flow.Test.StaveNote.dotsAndBeamsDown = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var notes = [

    newNote({ keys: ["e/5"],
        duration: "8", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "16", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "32", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "64", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/5"],
        duration: "128", stem_direction: -1}).
      addDotToAll(),


    newNote({ keys: ["d/5"],
        duration: "8", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "16", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "32",  stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "64", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["d/5"],
        duration: "128", stem_direction: -1}).
      addDotToAll()
  ];

  var beam = new Vex.Flow.Beam(notes);

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.StaveNote.renderNote(notes[i], stave, ctx, (i * 65));
  }
  beam.setContext(ctx).draw();

  ok(true, "Full Dot");
}

Vex.Flow.Test.StaveNote.centerAlignedRest = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 350);

  stave.addClef('treble');
  stave.addTimeSignature('4/4');

  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes0 = [
    { keys: ["b/4"], duration: "1r", align_center: true}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

  voice0.draw(ctx, stave);

  ok(true);
};

Vex.Flow.Test.StaveNote.centerAlignedRestFermata = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 350);

  stave.addClef('treble');
  stave.addTimeSignature('4/4');

  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes0 = [
    { keys: ["b/4"], duration: "1r", align_center: true}
  ].map(newNote);

  notes0[0].addArticulation(0, new Vex.Flow.Articulation('a@a').setPosition(3));

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

  voice0.draw(ctx, stave);

  ok(true);
};

Vex.Flow.Test.StaveNote.centerAlignedRestAnnotation = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 350);

  stave.addClef('treble');
  stave.addTimeSignature('4/4');

  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes0 = [
    { keys: ["b/4"], duration: "1r", align_center: true}
  ].map(newNote);

  notes0[0].addAnnotation(0, new Vex.Flow.Annotation('Whole measure rest').setPosition(3));

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

  voice0.draw(ctx, stave);

  ok(true);
};

Vex.Flow.Test.StaveNote.centerAlignedNoteMultiModifiers = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 350);

  function newFinger(num, pos) { return new Vex.Flow.FretHandFinger(num).setPosition(pos); }
  function newStringNumber(num, pos) { return new Vex.Flow.StringNumber(num).setPosition(pos);}


  stave.addClef('treble');
  stave.addTimeSignature('4/4');

  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes0 = [
    { keys: ["c/4", "e/4", "g/4"], duration: "4", align_center: true}
  ].map(newNote);

  notes0[0]
    .addAnnotation(0, new Vex.Flow.Annotation('Test').setPosition(3))
    .addStroke(0, new Vex.Flow.Stroke(2))
    .addAccidental(1, new Vex.Flow.Accidental('#'))
    .addModifier(0, newFinger("3", Vex.Flow.Modifier.Position.LEFT))
    .addModifier(2, newFinger("2", Vex.Flow.Modifier.Position.LEFT))
    .addModifier(1, newFinger("1", Vex.Flow.Modifier.Position.RIGHT))
    .addModifier(2, newStringNumber("4", Vex.Flow.Modifier.Position.BELOW))
    .addDotToAll();

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave);

  voice0.draw(ctx, stave);

  ok(true);
};

Vex.Flow.Test.StaveNote.centerAlignedMultiVoice = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 160);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 350);

  stave.addClef('treble');
  stave.addTimeSignature('3/8');
  
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  // Create custom duration
  var custom_duration = new Vex.Flow.Fraction(3, 8);

  var notes0 = [
    { keys: ["c/4"], duration: "1r", align_center: true, duration_override: custom_duration}
  ].map(newNote);

  var notes1 = [
    { keys: ["b/4"], duration: "8"},
    { keys: ["b/4"], duration: "8"},
    { keys: ["b/4"], duration: "8"},
  ].map(newNote);

  notes1[1].addAccidental(0, new Vex.Flow.Accidental('#'));

  var TIME3_8 = {
    num_beats: 3,
    beat_value: 8,
    resolution: Vex.Flow.RESOLUTION
  };

  var beam = new Vex.Flow.Beam(notes1);

  var voice0 = new Vex.Flow.Voice(TIME3_8).setStrict(false);
  voice0.addTickables(notes0);

  var voice1 = new Vex.Flow.Voice(TIME3_8).setStrict(false);
  voice1.addTickables(notes1);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

  voice0.draw(ctx, stave);
  voice1.draw(ctx, stave);

  beam.setContext(ctx).draw();

  ok(true);
};
