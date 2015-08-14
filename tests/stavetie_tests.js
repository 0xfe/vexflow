/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveTie = {}

Vex.Flow.Test.StaveTie.Start = function() {
  module("StaveTie");
  Vex.Flow.Test.runTests("Simple StaveTie", Vex.Flow.Test.StaveTie.simple);
  Vex.Flow.Test.runTests("Chord StaveTie", Vex.Flow.Test.StaveTie.chord);
  Vex.Flow.Test.runTests("Stem Up StaveTie", Vex.Flow.Test.StaveTie.stemUp);
  Vex.Flow.Test.runTests("No End Note", Vex.Flow.Test.StaveTie.noEndNote);
  Vex.Flow.Test.runTests("No Start Note", Vex.Flow.Test.StaveTie.noStartNote);
}

Vex.Flow.Test.StaveTie.tieNotes = function(notes, indices, stave, ctx) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 250);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.StaveTie({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: indices,
    last_indices: indices,
  });

  tie.setContext(ctx);
  tie.draw();
}

Vex.Flow.Test.StaveTie.drawTie = function(notes, indices, options) {
  var ctx = new options.contextBuilder(options.canvas_sel, 350, 140);

  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 350).setContext(ctx).draw();

  Vex.Flow.Test.StaveTie.tieNotes(notes, indices, stave, ctx);
}

Vex.Flow.Test.StaveTie.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  Vex.Flow.Test.StaveTie.drawTie([
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
  ], [0, 1], options);
  ok(true, "Simple Test");
}

Vex.Flow.Test.StaveTie.chord = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  Vex.Flow.Test.StaveTie.drawTie([
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"}),
    newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "h"}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#")),
  ], [0, 1, 2], options);
  ok(true, "Chord test");
}

Vex.Flow.Test.StaveTie.stemUp = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  Vex.Flow.Test.StaveTie.drawTie([
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: 1, duration: "h"}),
    newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: 1, duration: "h"}).
      addAccidental(0, newAcc("n")).
      addAccidental(1, newAcc("#")),
  ], [0, 1, 2], options);
  ok(true, "Stem up test");
}

Vex.Flow.Test.StaveTie.noEndNote = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, 350).setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 250);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.StaveTie({
    first_note: notes[1],
    last_note: null,
    first_indices: [2],
    last_indices: [2]
  }, "slow.").setContext(ctx).draw();

  ok(true, "No end note");
}

Vex.Flow.Test.StaveTie.noStartNote = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, 350).addTrebleGlyph().
    setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  notes = [
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: -1, duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 250);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.StaveTie({
    first_note: null,
    last_note: notes[0],
    first_indices: [2],
    last_indices: [2],
  }, "H").setContext(ctx).draw();

  ok(true, "No end note");
}
