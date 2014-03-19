/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Accidental = {}

Vex.Flow.Test.Accidental.Start = function() {
  module("Accidental");
  Vex.Flow.Test.runTest("Basic", Vex.Flow.Test.Accidental.basic);
  Vex.Flow.Test.runRaphaelTest("Basic (Raphael)",
      Vex.Flow.Test.Accidental.basic);
  Vex.Flow.Test.runTest("Stem Down", Vex.Flow.Test.Accidental.basicStemDown);
  Vex.Flow.Test.runRaphaelTest("Stem Down (Raphael)",
      Vex.Flow.Test.Accidental.basicStemDown);
  Vex.Flow.Test.runTest("Multi Voice", Vex.Flow.Test.Accidental.multiVoice);
  Vex.Flow.Test.runTest("Microtonal", Vex.Flow.Test.Accidental.microtonal);
}

Vex.Flow.Test.Accidental.showNote = function(note, stave, ctx, x) {
  var mc = new Vex.Flow.ModifierContext();
  note.addToModifierContext(mc);

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(65);

  note.setContext(ctx).setStave(stave);
  note.draw();

  ctx.save();
  ctx.font = "10pt Arial"; ctx.strokeStyle = "#579"; ctx.fillStyle = "#345";
  ctx.fillText("w: " + note.getWidth(), note.getAbsoluteX() - 25, 200 / 1.5);

  ctx.beginPath();
  ctx.moveTo(note.getAbsoluteX() - (note.getWidth() / 2), 210/1.5);
  ctx.lineTo(note.getAbsoluteX() + (note.getWidth() / 2), 210/1.5);
  ctx.stroke();
  ctx.restore();
  return note;
}

Vex.Flow.Test.Accidental.basic = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 240);
  ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),

    newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
        duration: "h"}).
      addAccidental(0, newAcc("##")).
      addAccidental(1, newAcc("n")).
      addAccidental(2, newAcc("bb")).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("#")).
      addAccidental(5, newAcc("n")).
      addAccidental(6, newAcc("bb")),

    newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
        duration: "16"}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#")).
      addAccidental(2, newAcc("#")).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("bb")).
      addAccidental(5, newAcc("##")).
      addAccidental(6, newAcc("#")),

    newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: "w"}).
      addAccidental(0, newAcc("#")).
      addAccidental(1, newAcc("##").setAsCautionary()).
      addAccidental(2, newAcc("#").setAsCautionary()).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("bb").setAsCautionary()).
      addAccidental(5, newAcc("b").setAsCautionary()),
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
    var accidentals = notes[i].getAccidentals();
    ok(accidentals.length > 0, "Note " + i + " has accidentals");

    for (var j = 0; j < accidentals.length; ++j) {
      ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
    }
  }

  ok(true, "Full Accidental");
}

Vex.Flow.Test.Accidental.basicStemDown = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 240);
  ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w", stem_direction: -1}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),

    newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
        duration: "h", stem_direction: -1}).
      addAccidental(0, newAcc("##")).
      addAccidental(1, newAcc("n")).
      addAccidental(2, newAcc("bb")).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("#")).
      addAccidental(5, newAcc("n")).
      addAccidental(6, newAcc("bb")),

    newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
        duration: "16", stem_direction: -1}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#")).
      addAccidental(2, newAcc("#")).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("bb")).
      addAccidental(5, newAcc("##")).
      addAccidental(6, newAcc("#")),
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
    var accidentals = notes[i].getAccidentals();
    ok(accidentals.length > 0, "Note " + i + " has accidentals");

    for (var j = 0; j < accidentals.length; ++j) {
      ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
    }
  }

  ok(true, "Full Accidental");
}


Vex.Flow.Test.Accidental.showNotes = function(note1, note2, stave, ctx, x) {
  var mc = new Vex.Flow.ModifierContext();
  note1.addToModifierContext(mc);
  note2.addToModifierContext(mc);

  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note1).addTickable(note2).
    preFormat().setX(x).setPixelsUsed(65);

  note1.setContext(ctx).setStave(stave).draw();
  note2.setContext(ctx).setStave(stave).draw();
  note1.getBoundingBox().draw(ctx);
  note2.getBoundingBox().draw(ctx);

  ctx.save();
  ctx.font = "10pt Arial"; ctx.strokeStyle = "#579"; ctx.fillStyle = "#345";
  ctx.fillText("w: " + note2.getWidth(), note2.getAbsoluteX() + 15, 20 / 1.5);
  ctx.fillText("w: " + note1.getWidth(), note1.getAbsoluteX() - 25, 220 / 1.5);

  ctx.beginPath();
  ctx.moveTo(note1.getAbsoluteX() - (note1.getWidth() / 2), 230/1.5);
  ctx.lineTo(note1.getAbsoluteX() + (note1.getWidth() / 2), 230/1.5);
  ctx.stroke();
  ctx.restore();
}

Vex.Flow.Test.Accidental.multiVoice = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 150);

  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 420);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var note1 = newNote(
      { keys: ["c/4", "e/4", "a/4"], duration: "h", stem_direction: -1}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("n")).
      addAccidental(2, newAcc("#"));
  var note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "h", stem_direction: 1}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("bb")).
      addAccidental(2, newAcc("##"));

  Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 60);

  note1 = newNote(
      { keys: ["c/4", "e/4", "c/5"], duration: "h", stem_direction: -1}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("n")).
      addAccidental(2, newAcc("#"));
  note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
      addAccidental(0, newAcc("b"));

  Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 150);

  note1 = newNote(
      { keys: ["d/4", "c/5", "d/5"], duration: "h", stem_direction: -1}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("n")).
      addAccidental(2, newAcc("#"));
  note2 = newNote(
      { keys: ["d/5", "a/5", "b/5"], duration: "q", stem_direction: 1}).
      addAccidental(0, newAcc("b"));

  Vex.Flow.Test.Accidental.showNotes(note1, note2, stave, ctx, 250);
  ok(true, "Full Accidental");
}

Vex.Flow.Test.Accidental.microtonal = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 240);
  ctx.scale(1.0, 1.0); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], duration: "w"}).
      addAccidental(0, newAcc("db")).
      addAccidental(1, newAcc("d")),

    newNote({ keys: ["d/4", "e/4", "f/4", "a/4", "c/5", "e/5", "g/5"],
        duration: "h"}).
      addAccidental(0, newAcc("bbs")).
      addAccidental(1, newAcc("++")).
      addAccidental(2, newAcc("+")).
      addAccidental(3, newAcc("d")).
      addAccidental(4, newAcc("db")).
      addAccidental(5, newAcc("+")).
      addAccidental(6, newAcc("##")),

    newNote({ keys: ["f/4", "g/4", "a/4", "b/4", "c/5", "e/5", "g/5"],
        duration: "16"}).
      addAccidental(0, newAcc("++")).
      addAccidental(1, newAcc("bbs")).
      addAccidental(2, newAcc("+")).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("db")).
      addAccidental(5, newAcc("##")).
      addAccidental(6, newAcc("#")),

    newNote({ keys: ["a/3", "c/4", "e/4", "b/4", "d/5", "g/5"], duration: "w"}).
      addAccidental(0, newAcc("#")).
      addAccidental(1, newAcc("db").setAsCautionary()).
      addAccidental(2, newAcc("bbs").setAsCautionary()).
      addAccidental(3, newAcc("b")).
      addAccidental(4, newAcc("++").setAsCautionary()).
      addAccidental(5, newAcc("d").setAsCautionary()),
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 125));
    var accidentals = notes[i].getAccidentals();
    ok(accidentals.length > 0, "Note " + i + " has accidentals");

    for (var j = 0; j < accidentals.length; ++j) {
      ok(accidentals[j].width > 0, "Accidental " + j + " has set width");
    }
  }

  ok(true, "Microtonal Accidental");
}

