/**
 * VexFlow - StaveNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveNote = {}

Vex.Flow.Test.StaveNote.Start = function() {
  module("StaveNote");
  test("Tick", Vex.Flow.Test.StaveNote.ticks);
  test("Stem", Vex.Flow.Test.StaveNote.stem);
  test("StaveLine", Vex.Flow.Test.StaveNote.staveLine);
  test("Width", Vex.Flow.Test.StaveNote.width);
  test("TickContext", Vex.Flow.Test.StaveNote.tickContext);
  Vex.Flow.Test.runTest("StaveNote Draw", Vex.Flow.Test.StaveNote.draw);
  Vex.Flow.Test.runRaphaelTest("StaveNote Draw (Raphael)",
      Vex.Flow.Test.StaveNote.draw);
  Vex.Flow.Test.runTest("Displacements", Vex.Flow.Test.StaveNote.displacements);
  Vex.Flow.Test.runRaphaelTest("Displacements (Raphael)",
      Vex.Flow.Test.StaveNote.displacements);
  Vex.Flow.Test.runTest("StaveNote Draw - Bass", Vex.Flow.Test.StaveNote.drawBass);
  Vex.Flow.Test.runRaphaelTest("StaveNote Draw - Bass(Raphael)",
      Vex.Flow.Test.StaveNote.drawBass);
}

Vex.Flow.Test.StaveNote.ticks = function(options) {
  var BEAT = 1 * Vex.Flow.RESOLUTION / 4;

  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "w"});
  equals(note.getTicks(), BEAT * 4, "Whole note has 4 beats");

  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "q"});
  equals(note.getTicks(), BEAT, "Quarter note has 1 beats");
}

Vex.Flow.Test.StaveNote.stem = function(options) {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "g/4"], duration: "w"});
  equals(note.getStemDirection(), Vex.Flow.StaveNote.STEM_UP,
      "Default note has UP stem");
}

Vex.Flow.Test.StaveNote.staveLine = function(options) {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});
  var props = note.getKeyProps();
  equals(props[0].line, 0, "C/4 on line 0");
  equals(props[1].line, 1, "E/4 on line 1");
  equals(props[2].line, 2.5, "A/4 on line 2.5");

  var stave = new Vex.Flow.Stave(10, 10, 300);
  note.setStave(stave);

  var ys = note.getYs();
  equals(ys.length, 3, "Chord should be rendered on three lines");
  equals(ys[0], 100, "Line for C/4");
  equals(ys[1], 90, "Line for E/4");
  equals(ys[2], 75, "Line for A/4");
}

Vex.Flow.Test.StaveNote.width = function(options) {
  expect(1);
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});

  try {
    var width = note.getWidth();
  } catch (e) {
    equals(e.code, "UnformattedNote",
        "Unformatted note should have no width");
  }
}

Vex.Flow.Test.StaveNote.tickContext = function(options) {
  var note = new Vex.Flow.StaveNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "w"});
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note);
  tickContext.preFormat();
  tickContext.setX(10);
  tickContext.setPadding(0);

  equals(tickContext.getWidth(), 16.5);
}

Vex.Flow.Test.StaveNote.showNote = function(note_struct, stave, ctx, x) {
  var note = new Vex.Flow.StaveNote(note_struct);
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();
  return note;
}

Vex.Flow.Test.StaveNote.draw = function(options, contextBuilder) {
  expect(42);
  var ctx = new contextBuilder(options.canvas_sel, 600, 280);
  var stave = new Vex.Flow.Stave(10, 10, 550);
  var stave2 = new Vex.Flow.Stave(10, 150, 550);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { keys: ["c/4", "e/4", "a/4"], duration: "w"},
    { keys: ["c/4", "e/4", "a/4"], duration: "h"},
    { keys: ["c/4", "e/4", "a/4"], duration: "q"},
    { keys: ["c/4", "e/4", "a/4"], duration: "8"},
    { keys: ["c/4", "e/4", "a/4"], duration: "16"},
    { keys: ["c/4", "e/4", "a/4"], duration: "32"},
    { keys: ["c/4", "e/4", "a/4"], duration: "64"},
    { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "q", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "8", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "16", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "32", stem_direction: -1},
    { keys: ["c/4", "e/4", "a/4"], duration: "64", stem_direction: -1},

    { keys: ["b/4"], duration: "wr"},
    { keys: ["b/4"], duration: "hr"},
    { keys: ["b/4"], duration: "qr"},
    { keys: ["b/4"], duration: "8r"},
    { keys: ["b/4"], duration: "16r"},
    { keys: ["b/4"], duration: "32r"},
    { keys: ["b/4"], duration: "64r"},
    { keys: ["x/4"], duration: "h"}
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawBass = function(options, contextBuilder) {
  expect(42);
  var ctx = new contextBuilder(options.canvas_sel, 600, 280);
  var stave = new Vex.Flow.Stave(10, 10, 550);
  var stave2 = new Vex.Flow.Stave(10, 150, 550);
  stave.setContext(ctx);
  stave.addClef('bass');
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "w"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "h"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "8"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "32"},
    { clef: 'bass', keys: ["c/3", "e/3", "a/3"], duration: "64"},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "h",
      stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "q",
      stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "8",
      stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "16",
      stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "32",
      stem_direction: -1},
    { clef: 'bass', keys: ["c/2", "e/2", "a/2"], duration: "64",
      stem_direction: -1},

    { keys: ["b/4"], duration: "wr"},
    { keys: ["b/4"], duration: "hr"},
    { keys: ["b/4"], duration: "qr"},
    { keys: ["b/4"], duration: "8r"},
    { keys: ["b/4"], duration: "16r"},
    { keys: ["b/4"], duration: "32r"},
    { keys: ["b/4"], duration: "64r"},
    { keys: ["x/4"], duration: "h"}
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.StaveNote.drawBass = function(options, contextBuilder) {
  expect(36);
  var ctx = new contextBuilder(options.canvas_sel, 600, 280);
  var stave = new Vex.Flow.Stave(10, 10, 550);
  var stave2 = new Vex.Flow.Stave(10, 150, 550);
  stave.setContext(ctx);
  stave.addClef('bass');
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
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

    { keys: ["b/4"], duration: "wr"},
    { keys: ["b/4"], duration: "hr"},
    { keys: ["b/4"], duration: "qr"},
    { keys: ["b/4"], duration: "8r"},
    { keys: ["b/4"], duration: "16r"},
    { keys: ["b/4"], duration: "32r"},
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
  expect(26);
  var ctx = new contextBuilder(options.canvas_sel, 600, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  var stave = new Vex.Flow.Stave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;
  var notes = [
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
      duration: "64", stem_direction: -1},
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 45);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}
