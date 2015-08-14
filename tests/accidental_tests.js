/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Accidental = {}

Vex.Flow.Test.Accidental.Start = function() {
  module("Accidental");
  Vex.Flow.Test.runTests("Basic", Vex.Flow.Test.Accidental.basic);
  Vex.Flow.Test.runTests("Stem Down", Vex.Flow.Test.Accidental.basicStemDown);
  Vex.Flow.Test.runTests("Accidental Arrangement Special Cases", Vex.Flow.Test.Accidental.specialCases);
  Vex.Flow.Test.runTests("Multi Voice", Vex.Flow.Test.Accidental.multiVoice);
  Vex.Flow.Test.runTests("Microtonal", Vex.Flow.Test.Accidental.microtonal);
  test("Automatic Accidentals - Simple Tests", Vex.Flow.Test.Accidental.autoAccidentalWorking);
  Vex.Flow.Test.runTests("Automatic Accidentals", Vex.Flow.Test.Accidental.automaticAccidentals0);
  Vex.Flow.Test.runTests("Automatic Accidentals - C major scale in Ab", Vex.Flow.Test.Accidental.automaticAccidentals1);
  Vex.Flow.Test.runTests("Automatic Accidentals - No Accidentals Necsesary", Vex.Flow.Test.Accidental.automaticAccidentals2);
  Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Inline", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceInline);
  Vex.Flow.Test.runTests("Automatic Accidentals - Multi Voice Offset", Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceOffset);
}

function hasAccidental(note) {
  return note.modifiers.reduce(function(hasAcc, modifier) {
    if (hasAcc) return hasAcc;

    return modifier.getCategory() === "accidentals";
  }, false);
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

Vex.Flow.Test.Accidental.specialCases = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 700, 240);
  ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  var stave = new Vex.Flow.Stave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/4", "d/5"], duration: "w"}).
      addAccidental(0, newAcc("#")).
      addAccidental(1, newAcc("b")),

    newNote({ keys: ["c/4", "g/4"], duration: "h"}).
      addAccidental(0, newAcc("##")).
      addAccidental(1, newAcc("##")),

    newNote({ keys: ["b/3", "d/4", "f/4"],
        duration: "16"}).
      addAccidental(0, newAcc("#")).
      addAccidental(1, newAcc("#")).
      addAccidental(2, newAcc("##")),

    newNote({ keys: ["g/4", "a/4", "c/5", "e/5"],
        duration: "16"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("b")).
      addAccidental(3, newAcc("n")),

    newNote({ keys: ["e/4", "g/4", "b/4", "c/5"], duration: "4"}).
      addAccidental(0, newAcc("b").setAsCautionary()).
      addAccidental(1, newAcc("b").setAsCautionary()).
      addAccidental(2, newAcc("bb")).
      addAccidental(3, newAcc("b")),

    newNote({ keys: ["b/3", "e/4", "a/4", "d/5", "g/5"], duration: "8"}).
      addAccidental(0, newAcc("bb")).
      addAccidental(1, newAcc("b").setAsCautionary()).
      addAccidental(2, newAcc("n").setAsCautionary()).
      addAccidental(3, newAcc("#")).
      addAccidental(4, newAcc("n").setAsCautionary())
  ];

  for (var i = 0; i < notes.length; ++i) {
    Vex.Flow.Test.Accidental.showNote(notes[i], stave, ctx, 30 + (i * 70));
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

Vex.Flow.Test.Accidental.automaticAccidentals0 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 200);

  var notes = [
    newNote({ keys: ["c/4", "c/5"], duration: "4"}),
    newNote({ keys: ["c#/4", "c#/5"], duration: "4"}),
    newNote({ keys: ["c#/4", "c#/5"], duration: "4"}),
    newNote({ keys: ["c##/4", "c##/5"], duration: "4"}),
    newNote({ keys: ["c##/4", "c##/5"], duration: "4"}),
    newNote({ keys: ["c/4", "c/5"], duration: "4"}),
    newNote({ keys: ["cn/4", "cn/5"], duration: "4"}),
    newNote({ keys: ["cbb/4", "cbb/5"], duration: "4"}),
    newNote({ keys: ["cbb/4", "cbb/5"], duration: "4"}),
    newNote({ keys: ["cb/4", "cb/5"], duration: "4"}),
    newNote({ keys: ["cb/4", "cb/5"], duration: "4"}),
    newNote({ keys: ["c/4", "c/5"], duration: "4"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  Vex.Flow.Accidental.applyAccidentals([voice], "C");

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);
  ok(true);
};

Vex.Flow.Test.Accidental.automaticAccidentals1 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

  c.context.clear();
  c.stave.addKeySignature("Ab");
  c.stave.draw();
  var notes = [
    newNote({ keys: ["c/4"], duration: "4"}),
    newNote({ keys: ["d/4"], duration: "4"}),
    newNote({ keys: ["e/4"], duration: "4"}),
    newNote({ keys: ["f/4"], duration: "4"}),
    newNote({ keys: ["g/4"], duration: "4"}),
    newNote({ keys: ["a/4"], duration: "4"}),
    newNote({ keys: ["b/4"], duration: "4"}),
    newNote({ keys: ["c/5"], duration: "4"}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  Vex.Flow.Accidental.applyAccidentals([voice], "Ab");

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);
  ok(true);
};

Vex.Flow.Test.Accidental.automaticAccidentals2 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

  c.context.clear();
  c.stave.addKeySignature("A");
  c.stave.draw();
  var notes = [
    newNote({ keys: ["a/4"], duration: "4"}),
    newNote({ keys: ["b/4"], duration: "4"}),
    newNote({ keys: ["c#/5"], duration: "4"}),
    newNote({ keys: ["d/5"], duration: "4"}),
    newNote({ keys: ["e/5"], duration: "4"}),
    newNote({ keys: ["f#/5"], duration: "4"}),
    newNote({ keys: ["g#/5"], duration: "4"}),
    newNote({ keys: ["a/5"], duration: "4"}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  Vex.Flow.Accidental.applyAccidentals([voice], "A");

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);
  ok(true);
};

Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceInline = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

  c.context.clear();
  c.stave.addKeySignature("Ab");
  c.stave.draw();
  var notes0 = [
    newNote({ keys: ["c/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["d/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["e/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["f/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["g/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["a/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["c/5"], duration: "4", stem_direction: -1})
  ];

  var notes1 = [
    newNote({ keys: ["c/5"], duration: "4"}),
    newNote({ keys: ["d/5"], duration: "4"}),
    newNote({ keys: ["e/5"], duration: "4"}),
    newNote({ keys: ["f/5"], duration: "4"}),
    newNote({ keys: ["g/5"], duration: "4"}),
    newNote({ keys: ["a/5"], duration: "4"}),
    newNote({ keys: ["b/5"], duration: "4"}),
    newNote({ keys: ["c/6"], duration: "4"})
  ];

  var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice0.addTickables(notes0);

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice1.addTickables(notes1);

  // Ab Major
  Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Ab");

  equal(hasAccidental(notes0[0]), false);
  equal(hasAccidental(notes0[1]), true);
  equal(hasAccidental(notes0[2]), true);
  equal(hasAccidental(notes0[3]), false);
  equal(hasAccidental(notes0[4]), false);
  equal(hasAccidental(notes0[5]), true);
  equal(hasAccidental(notes0[6]), true);
  equal(hasAccidental(notes0[7]), false);

  equal(hasAccidental(notes1[0]), false);
  equal(hasAccidental(notes1[1]), true);
  equal(hasAccidental(notes1[2]), true);
  equal(hasAccidental(notes1[3]), false);
  equal(hasAccidental(notes1[4]), false);
  equal(hasAccidental(notes1[5]), true);
  equal(hasAccidental(notes1[6]), true);
  equal(hasAccidental(notes1[7]), false);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0, voice1]).
    formatToStave([voice0, voice1], c.stave);

  voice0.draw(c.context, c.stave);
  voice1.draw(c.context, c.stave);
  ok(true);
};

Vex.Flow.Test.Accidental.automaticAccidentalsMultiVoiceOffset = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 700, 150);

  c.context.clear();
  c.stave.addKeySignature("Cb");
  c.stave.draw();
  var notes0 = [
    newNote({ keys: ["c/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["d/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["e/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["f/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["g/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["a/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "4", stem_direction: -1}),
    newNote({ keys: ["c/5"], duration: "4", stem_direction: -1})
  ];

  var notes1 = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "4"}),
    newNote({ keys: ["d/5"], duration: "4"}),
    newNote({ keys: ["e/5"], duration: "4"}),
    newNote({ keys: ["f/5"], duration: "4"}),
    newNote({ keys: ["g/5"], duration: "4"}),
    newNote({ keys: ["a/5"], duration: "4"}),
    newNote({ keys: ["b/5"], duration: "4"}),
    newNote({ keys: ["c/6"], duration: "4"})
  ];

  var voice0 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice0.addTickables(notes0);

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice1.addTickables(notes1);

  // Cb Major (All flats)
  Vex.Flow.Accidental.applyAccidentals([voice0, voice1], "Cb");

  equal(hasAccidental(notes0[0]), true);
  equal(hasAccidental(notes0[1]), true);
  equal(hasAccidental(notes0[2]), true);
  equal(hasAccidental(notes0[3]), true);
  equal(hasAccidental(notes0[4]), true);
  equal(hasAccidental(notes0[5]), true);
  equal(hasAccidental(notes0[6]), true);
  equal(hasAccidental(notes0[7]), false, "Natural Remembered");

  equal(hasAccidental(notes1[0]), true);
  equal(hasAccidental(notes1[1]), false);
  equal(hasAccidental(notes1[2]), false);
  equal(hasAccidental(notes1[3]), false);
  equal(hasAccidental(notes1[4]), false);
  equal(hasAccidental(notes1[5]), false);
  equal(hasAccidental(notes1[6]), false);
  equal(hasAccidental(notes1[7]), false);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice0, voice1]).
    formatToStave([voice0, voice1], c.stave);

  voice0.draw(c.context, c.stave);
  voice1.draw(c.context, c.stave);
  ok(true);
};

Vex.Flow.Test.Accidental.autoAccidentalWorking = function(options, contextBuilder) {
  var notes = [
    newNote({ keys: ["bb/4"], duration: "4"}),
    newNote({ keys: ["bb/4"], duration: "4"}),
    newNote({ keys: ["g#/4"], duration: "4"}),
    newNote({ keys: ["g/4"], duration: "4"}),
    newNote({ keys: ["b/4"], duration: "4"}),
    newNote({ keys: ["b/4"], duration: "4"}),
    newNote({ keys: ["a#/4"], duration: "4"}),
    newNote({ keys: ["g#/4"], duration: "4"}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  // F Major (Bb)
  Vex.Flow.Accidental.applyAccidentals([voice], "F");

  equal(hasAccidental(notes[0]), false, "No flat because of key signature");
  equal(hasAccidental(notes[1]), false, "No flat because of key signature");
  equal(hasAccidental(notes[2]), true, "Added a sharp");
  equal(hasAccidental(notes[3]), true, "Back to natural");
  equal(hasAccidental(notes[4]), true, "Back to natural");
  equal(hasAccidental(notes[5]), false, "Natural remembered");
  equal(hasAccidental(notes[6]), true, "Added sharp");
  equal(hasAccidental(notes[7]), true, "Added sharp");

  notes = [
    newNote({ keys: ["e#/4"], duration: "4"}),
    newNote({ keys: ["cb/4"], duration: "4"}),
    newNote({ keys: ["fb/4"], duration: "4"}),
    newNote({ keys: ["b#/4"], duration: "4"}),
    newNote({ keys: ["b#/4"], duration: "4"}),
    newNote({ keys: ["cb/5"], duration: "4"}),
    newNote({ keys: ["fb/5"], duration: "4"}),
    newNote({ keys: ["e#/4"], duration: "4"}),
  ];

  voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  // A Major (F#,G#,C#)
  Vex.Flow.Accidental.applyAccidentals([voice], "A");

  equal(hasAccidental(notes[0]), true, "Added sharp");
  equal(hasAccidental(notes[1]), true, "Added flat");
  equal(hasAccidental(notes[2]), true, "Added flat");
  equal(hasAccidental(notes[3]), true, "Added sharp");
  equal(hasAccidental(notes[4]), false, "Sharp remembered");
  equal(hasAccidental(notes[5]), false, "Flat remembered");
  equal(hasAccidental(notes[6]), false, "Flat remembered");
  equal(hasAccidental(notes[7]), false, "sharp remembered");

  notes = [
    newNote({ keys: ["c/4"], duration: "4"}),
    newNote({ keys: ["cb/4"], duration: "4"}),
    newNote({ keys: ["cb/4"], duration: "4"}),
    newNote({ keys: ["c#/4"], duration: "4"}),
    newNote({ keys: ["c#/4"], duration: "4"}),
    newNote({ keys: ["cbb/4"], duration: "4"}),
    newNote({ keys: ["cbb/4"], duration: "4"}),
    newNote({ keys: ["c##/4"], duration: "4"}),
    newNote({ keys: ["c##/4"], duration: "4"}),
    newNote({ keys: ["c/4"], duration: "4"}),
    newNote({ keys: ["c/4"], duration: "4"}),
  ];

  voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  // C Major (no sharps/flats)
  Vex.Flow.Accidental.applyAccidentals([voice], "C");

  equal(hasAccidental(notes[0]), false, "No accidental");
  equal(hasAccidental(notes[1]), true, "Added flat");
  equal(hasAccidental(notes[2]), false, "Flat remembered");
  equal(hasAccidental(notes[3]), true, "Sharp added");
  equal(hasAccidental(notes[4]), false, "Sharp remembered");
  equal(hasAccidental(notes[5]), true, "Added doubled flat");
  equal(hasAccidental(notes[6]), false, "Double flat remembered");
  equal(hasAccidental(notes[7]), true, "Added double sharp");
  equal(hasAccidental(notes[8]), false, "Double sharp rememberd");
  equal(hasAccidental(notes[9]), true, "Added natural");
  equal(hasAccidental(notes[10]), false, "Natural remembered");

};