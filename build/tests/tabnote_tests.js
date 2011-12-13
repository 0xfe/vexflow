/**
 * VexFlow - TabNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabNote = {}

Vex.Flow.Test.TabNote.Start = function() {
  module("TabNote");
  test("Tick", Vex.Flow.Test.TabNote.ticks);
  test("TabStave Line", Vex.Flow.Test.TabNote.tabStaveLine);
  test("Width", Vex.Flow.Test.TabNote.width);
  test("TickContext", Vex.Flow.Test.TabNote.tickContext);
  Vex.Flow.Test.runTest("TabNote Draw", Vex.Flow.Test.TabNote.draw);
}

Vex.Flow.Test.TabNote.ticks = function() {
  var BEAT = 1 * Vex.Flow.RESOLUTION / 4;

  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }], duration: "w"});
  equals(note.getTicks(), BEAT * 4, "Whole note has 4 beats");

  var note = new Vex.Flow.TabNote(
      { positions: [{str: 3, fret: 4 }], duration: "q"});
  equals(note.getTicks(), BEAT, "Quarter note has 1 beat");
}

Vex.Flow.Test.TabNote.tabStaveLine = function() {
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
  var positions = note.getPositions();
  equals(positions[0].str, 6, "String 6, Fret 6");
  equals(positions[0].fret, 6, "String 6, Fret 6");
  equals(positions[1].str, 4, "String 4, Fret 5");
  equals(positions[1].fret, 5, "String 4, Fret 5");

  var stave = new Vex.Flow.Stave(10, 10, 300);
  note.setStave(stave);

  var ys = note.getYs();
  equals(ys.length, 2, "Chord should be rendered on two lines");
  equals(ys[0], 100, "Line for String 6, Fret 6");
  equals(ys[1], 80, "Line for String 4, Fret 5");
}

Vex.Flow.Test.TabNote.width = function(options) {
  expect(1);
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});

  try {
    var width = note.getWidth();
  } catch (e) {
    equals(e.code, "UnformattedNote",
        "Unformatted note should have no width");
  }
}

Vex.Flow.Test.TabNote.tickContext = function(options) {
  var note = new Vex.Flow.TabNote(
      { positions: [{str: 6, fret: 6 }, {str: 4, fret: 5}], duration: "w"});
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note);
  tickContext.preFormat();
  tickContext.setX(10);
  tickContext.setPadding(0);

  equals(tickContext.getWidth(), 6);
}

Vex.Flow.Test.TabNote.showNote = function(tab_struct, stave, ctx, x) {
  var note = new Vex.Flow.TabNote(tab_struct);
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();
  return note;
}

Vex.Flow.Test.TabNote.draw = function(options) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, 600, 140);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.TabNote.showNote;
  var notes = [
    { positions: [{str: 6, fret: 6 }], duration: "q"},
    { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "q"},
    { positions: [{str: 2, fret: "x" }, {str: 5, fret: 15}], duration: "q"},
    { positions: [{str: 2, fret: "x" }, {str: 5, fret: 5}], duration: "q"},
    { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "q"},
    { positions: [{str: 6, fret: 0},
                  {str: 5, fret: 5},
                  {str: 4, fret: 5},
                  {str: 3, fret: 4},
                  {str: 2, fret: 3},
                  {str: 1, fret: 0}],
                  duration: "q"},
    { positions: [{str: 1, fret: 6 }, {str: 4, fret: 5}], duration: "q"}
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}
