/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Dot = {}

Vex.Flow.Test.Dot.Start = function() {
  module("Dot");
  Vex.Flow.Test.runTests("Basic", Vex.Flow.Test.Dot.basic);
  Vex.Flow.Test.runTests("Multi Voice", Vex.Flow.Test.Dot.multiVoice);
}

Vex.Flow.Test.Dot.showNote = function(note, stave, ctx, x) {
  var mc = new Vex.Flow.ModifierContext();
  note.addToModifierContext(mc);

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

  note.setContext(ctx).setStave(stave);
  note.draw();

  Vex.Flow.Test.plotNoteWidth(ctx, note, 140);
  return note;
}

Vex.Flow.Test.Dot.basic = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 1000, 240);
  ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 975);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var notes = [
    newNote({ keys: ["c/4", "e/4", "a/4", "b/4"], duration: "w"}).
      addDotToAll(),

    newNote({ keys: ["a/4", "b/4", "c/5"],
        duration: "q", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["g/4", "a/4", "b/4"],
        duration: "q", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/4", "f/4", "b/4", "c/5"],
        duration: "q"}).
      addDotToAll(),

    newNote({ keys: ["g/4", "a/4", "d/5", "e/5", "g/5"],
        duration: "q", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["g/4", "b/4", "d/5", "e/5"],
        duration: "q", stem_direction: -1}).
      addDotToAll(),

    newNote({ keys: ["e/4", "g/4", "b/4", "c/5"],
        duration: "q", stem_direction: 1}).
      addDotToAll(),

    newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
        duration: "h"}).
      addDotToAll().
      addDotToAll(),

    newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
        duration: "16", stem_direction: -1}).
      addDotToAll().
      addDotToAll().
      addDotToAll()
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.Dot.showNote(notes[i], stave, ctx, 30 + (i * 65));
    var accidentals = notes[i].getDots();
    ok(accidentals.length > 0, "Note " + i + " has accidentals");

    for (var j = 0; j < accidentals.length; ++j) {
      ok(accidentals[j].width > 0, "Dot " + j + " has set width");
    }
  }

  Vex.Flow.Test.plotLegendForNoteWidth(ctx, 620, 140);
  ok(true, "Full Dot");
}

Vex.Flow.Test.Dot.showNotes = function(note1, note2, stave, ctx, x) {
  var mc = new Vex.Flow.ModifierContext();
  note1.addToModifierContext(mc);
  note2.addToModifierContext(mc);

  var tickContext = new Vex.Flow.TickContext();
  tickContext
    .addTickable(note1)
    .addTickable(note2)
    .setX(x)
    .preFormat()
    .setPixelsUsed(65);

  note1.setContext(ctx).setStave(stave).draw();
  note2.setContext(ctx).setStave(stave).draw();

  Vex.Flow.Test.plotNoteWidth(ctx, note1, 180);
  Vex.Flow.Test.plotNoteWidth(ctx, note2, 20);
}

Vex.Flow.Test.Dot.multiVoice = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 300);

  ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(30, 40, 420);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Dot(type); }

  var note1 = newNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1}).
      addDotToAll().
      addDotToAll();
  var note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "h", stem_direction: 1}).
      addDotToAll();

  Vex.Flow.Test.Dot.showNotes(note1, note2, stave, ctx, 60);

  note1 = newNote(
      { keys: ["c/4", "e/4", "c/5"], duration: "h", stem_direction: -1}).
      addDot(0).
      addDot(0).
      addDot(1).
      addDot(1).
      addDot(2).
      addDot(2).
      addDot(2);
  note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
      addDotToAll().
      addDotToAll();

  Vex.Flow.Test.Dot.showNotes(note1, note2, stave, ctx, 150);

  note1 = newNote(
      { keys: ["d/4", "c/5", "d/5"], duration: "h", stem_direction: -1}).
      addDotToAll().
      addDotToAll().
      addDot(0);
  note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
      addDotToAll();

  Vex.Flow.Test.Dot.showNotes(note1, note2, stave, ctx, 250);
  Vex.Flow.Test.plotLegendForNoteWidth(ctx, 400, 180);
  ok(true, "Full Dot");
}
