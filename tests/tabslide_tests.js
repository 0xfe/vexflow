/**
 * VexFlow - TabSlide Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabSlide = {}

Vex.Flow.Test.TabSlide.Start = function() {
  module("TabSlide");
  Vex.Flow.Test.runTests("Simple TabSlide", Vex.Flow.Test.TabSlide.simple);
  Vex.Flow.Test.runTests("Slide Up", Vex.Flow.Test.TabSlide.slideUp);
  Vex.Flow.Test.runTests("Slide Down", Vex.Flow.Test.TabSlide.slideDown);
}

Vex.Flow.Test.TabSlide.tieNotes = function(notes, indices, stave, ctx) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 100);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.TabSlide({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: indices,
    last_indices: indices,
  }, Vex.Flow.TabSlide.SLIDE_UP);

  tie.setContext(ctx);
  tie.draw();
}

Vex.Flow.Test.TabSlide.setupContext = function(options, x, y) {
  var ctx = options.contextBuilder(options.canvas_sel, 350, 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, x || 350).addTabGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}


Vex.Flow.Test.TabSlide.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.TabSlide.setupContext(options);
  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }

  Vex.Flow.Test.TabSlide.tieNotes([
    newNote({ positions: [{str:4, fret:4}], duration: "h"}),
    newNote({ positions: [{str:4, fret:6}], duration: "h"})
  ], [0], c.stave, c.context);
  ok(true, "Simple Test");
}

Vex.Flow.Test.TabSlide.multiTest = function(options, factory) {
  var c = Vex.Flow.Test.TabSlide.setupContext(options, 440, 100);
  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }

  var notes = [
    newNote({ positions: [{str:4, fret:4}], duration: "8"}),
    newNote({ positions: [{str:4, fret:4}], duration: "8"}),
    newNote({ positions: [{str:4, fret:4}, {str:5, fret:4}], duration: "8"}),
    newNote({ positions: [{str:4, fret:6}, {str:5, fret:6}], duration: "8"}),
    newNote({ positions: [{str:2, fret:14}], duration: "8"}),
    newNote({ positions: [{str:2, fret:16}], duration: "8"}),
    newNote({ positions: [{str:2, fret:14}, {str:3, fret:14}], duration: "8"}),
    newNote({ positions: [{str:2, fret:16}, {str:3, fret:16}], duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).addTickables(notes);
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  voice.draw(c.context, c.stave);

  factory({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0],
  }).setContext(c.context).draw();

  ok(true, "Single note");

  factory({
    first_note: notes[2],
    last_note: notes[3],
    first_indices: [0, 1],
    last_indices: [0, 1],
  }).setContext(c.context).draw();

  ok(true, "Chord");

  factory({
    first_note: notes[4],
    last_note: notes[5],
    first_indices: [0],
    last_indices: [0],
  }).setContext(c.context).draw();

  ok(true, "Single note high-fret");

  factory({
    first_note: notes[6],
    last_note: notes[7],
    first_indices: [0, 1],
    last_indices: [0, 1],
  }).setContext(c.context).draw();

  ok(true, "Chord high-fret");
}

Vex.Flow.Test.TabSlide.slideUp = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  Vex.Flow.Test.TabSlide.multiTest(options, Vex.Flow.TabSlide.createSlideUp);
}

Vex.Flow.Test.TabSlide.slideDown = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  Vex.Flow.Test.TabSlide.multiTest(options, Vex.Flow.TabSlide.createSlideDown);
}
