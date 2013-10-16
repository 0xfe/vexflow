/**
 * VexFlow - Beam Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Beam = {}

Vex.Flow.Test.Beam.Start = function() {
  module("Beam");
  Vex.Flow.Test.runTest("Simple Beam", Vex.Flow.Test.Beam.simple);
  Vex.Flow.Test.runTest("Multi Beam", Vex.Flow.Test.Beam.multi);
  Vex.Flow.Test.runTest("Sixteenth Beam", Vex.Flow.Test.Beam.sixteenth);
  Vex.Flow.Test.runTest("Slopey Beam", Vex.Flow.Test.Beam.slopey);
  Vex.Flow.Test.runTest("Automatic Beam", Vex.Flow.Test.Beam.auto);
  Vex.Flow.Test.runTest("Mixed Beam", Vex.Flow.Test.Beam.mixed);
  Vex.Flow.Test.runTest("Dotted Beam", Vex.Flow.Test.Beam.dotted);
  Vex.Flow.Test.runTest("Close Trade-offs Beam", Vex.Flow.Test.Beam.tradeoffs);
  Vex.Flow.Test.runTest("Insane Beam", Vex.Flow.Test.Beam.insane);
  Vex.Flow.Test.runTest("Lengthy Beam", Vex.Flow.Test.Beam.lenghty);
  Vex.Flow.Test.runTest("Outlier Beam", Vex.Flow.Test.Beam.outlier);
}

Vex.Flow.Test.Beam.beamNotes = function(notes, stave, ctx) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam = new Vex.Flow.Beam(notes.slice(1, notes.length));

  voice.draw(ctx, stave);
  beam.setContext(ctx).draw();
}

Vex.Flow.Test.Beam.setupContext = function(options, x, y) {
  var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, x || 450).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.Beam.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  Vex.Flow.Test.Beam.beamNotes([
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["c/4", "e/4", "a/4"], stem_direction: 1, duration: "8"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4", "f/4", "a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/4", "g/4", "b/4"], stem_direction: 1, duration: "8"}).
      addAccidental(0, newAcc("bb")).
      addAccidental(1, newAcc("##")),
    newNote({ keys: ["f/4", "a/4", "c/5"], stem_direction: 1, duration: "8"})
  ], c.stave, c.context);
  ok(true, "Simple Test");
}

Vex.Flow.Test.Beam.multi = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"})
  ];

  var notes2 = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice2.addTickables(notes2);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2]).
    format([voice, voice2], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  var beam2_1 = new Vex.Flow.Beam(notes2.slice(0, 4));
  var beam2_2 = new Vex.Flow.Beam(notes2.slice(4, 8));

  voice.draw(c.context, c.stave);
  voice2.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  beam2_1.setContext(c.context).draw();
  beam2_2.setContext(c.context).draw();
  ok(true, "Multi Test");
}

Vex.Flow.Test.Beam.sixteenth = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "h"})
  ];

  var notes2 = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "h"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice2.addTickables(notes2);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2]).
    format([voice, voice2], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  var beam2_1 = new Vex.Flow.Beam(notes2.slice(0, 4));
  var beam2_2 = new Vex.Flow.Beam(notes2.slice(4, 8));

  voice.draw(c.context, c.stave);
  voice2.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  beam2_1.setContext(c.context).draw();
  beam2_2.setContext(c.context).draw();
  ok(true, "Sixteenth Test");
}

Vex.Flow.Test.Beam.slopey = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 30, 350).addTrebleGlyph().
    setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/3"], stem_direction: 1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  voice.draw(ctx, stave);
  beam1_1.setContext(ctx).draw();
  beam1_2.setContext(ctx).draw();

  ok(true, "Slopey Test");
}

Vex.Flow.Test.Beam.auto = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 30, 350).addTrebleGlyph().
    setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4), true);
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8), true);

  voice.draw(ctx, stave);
  beam1_1.setContext(ctx).draw();
  beam1_2.setContext(ctx).draw();

  ok(true, "Slopey Test");
}

Vex.Flow.Test.Beam.mixed = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),

    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),

    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "8"})
  ];

  var notes2 = [
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),

    newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["e/4"], stem_direction: -1, duration: "8"}),

    newNote({ keys: ["d/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["c/4"], stem_direction: -1, duration: "16"}),
    newNote({ keys: ["d/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: -1, duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);
  voice2.addTickables(notes2);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice, voice2]).
    format([voice, voice2], 390);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  var beam2_1 = new Vex.Flow.Beam(notes2.slice(0, 4));
  var beam2_2 = new Vex.Flow.Beam(notes2.slice(4, 8));

  voice.draw(c.context, c.stave);
  voice2.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  beam2_1.setContext(c.context).draw();
  beam2_2.setContext(c.context).draw();
  ok(true, "Multi Test");
}

Vex.Flow.Test.Beam.dotted = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8d"}).
        addDotToAll(),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),

    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8d"}).
        addDotToAll(),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),

    newNote({ keys: ["c/5"], stem_direction: 1, duration: "8d"}).
        addDotToAll(),
    newNote({ keys: ["c/5"], stem_direction: 1, duration: "16"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8d"}).
        addDotToAll(),
    newNote({ keys: ["e/5"], stem_direction: 1, duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).
    setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 390);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));
  var beam1_3 = new Vex.Flow.Beam(notes.slice(8, 12));

  voice.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();
  beam1_3.setContext(c.context).draw();

  ok(true, "Dotted Test");
}

Vex.Flow.Test.Beam.tradeoffs = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
  newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).
    setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  voice.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  ok(true, "Close Trade-offs Test");
}

Vex.Flow.Test.Beam.insane = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["b/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["a/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["b/4"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).
    setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 7));

  voice.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  ok(true, "Insane Test");
}

Vex.Flow.Test.Beam.lenghty = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
  newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
  newNote({ keys: ["a/4"], stem_direction: 1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).
    setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));

  voice.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();

  ok(true, "Lengthy Test");
}

Vex.Flow.Test.Beam.outlier = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    newNote({ keys: ["g/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["e/4"], stem_direction: 1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["c/5"], stem_direction: -1, duration: "8"}),
    newNote({ keys: ["d/5"], stem_direction: -1, duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).
    setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().
                    joinVoices([voice]).
                    format([voice], 300);
  var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4));
  var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8));

  voice.draw(c.context, c.stave);
  beam1_1.setContext(c.context).draw();
  beam1_2.setContext(c.context).draw();

  ok(true, "Outlier Test");
}
