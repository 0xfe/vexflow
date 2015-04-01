/**
 * VexFlow - TabTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabTie = {}

Vex.Flow.Test.TabTie.Start = function() {
  module("TabTie");
  Vex.Flow.Test.runTests("Simple TabTie", Vex.Flow.Test.TabTie.simple);
  
  Vex.Flow.Test.runTests("Hammerons", Vex.Flow.Test.TabTie.simpleHammeron);
  
  Vex.Flow.Test.runTests("Pulloffs", Vex.Flow.Test.TabTie.simplePulloff);
  
  Vex.Flow.Test.runTests("Tapping", Vex.Flow.Test.TabTie.tap);
  
  Vex.Flow.Test.runTests("Continuous", Vex.Flow.Test.TabTie.continuous);
  
}

Vex.Flow.Test.TabTie.tieNotes = function(notes, indices, stave, ctx, text) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 100);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.TabTie({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: indices,
    last_indices: indices,
  }, text || "Annotation");

  tie.setContext(ctx);
  tie.draw();
}

Vex.Flow.Test.TabTie.setupContext = function(options, x, y) {
  var ctx = options.contextBuilder(options.canvas_sel, x || 350, y || 160);
  ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.setFont("Arial", Vex.Flow.Test.Font.size, "");
  var stave = new Vex.Flow.TabStave(10, 10, x || 350).addTabGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

Vex.Flow.Test.TabTie.drawTie = function(notes, indices, options, text) {
  var c = Vex.Flow.Test.TabTie.setupContext(options);
  Vex.Flow.Test.TabTie.tieNotes(notes, indices, c.stave, c.context, text);
}

Vex.Flow.Test.TabTie.simple = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }

  Vex.Flow.Test.TabTie.drawTie([
    newNote({ positions: [{str:4, fret:4}], duration: "h"}),
    newNote({ positions: [{str:4, fret:6}], duration: "h"})
  ], [0], options);

  ok(true, "Simple Test");
}
 
Vex.Flow.Test.TabTie.tap = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }

  Vex.Flow.Test.TabTie.drawTie([
    newNote({ positions: [{str:4, fret:12}], duration: "h"}).
      addModifier(new Vex.Flow.Annotation("T"), 0),
    newNote({ positions: [{str:4, fret:10}], duration: "h"})
  ], [0], options, "P");

  ok(true, "Tapping Test");
}

Vex.Flow.Test.TabTie.multiTest = function(options, factory) {
  var c = Vex.Flow.Test.TabTie.setupContext(options, 440, 140);
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

Vex.Flow.Test.TabTie.simpleHammeron = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  Vex.Flow.Test.TabTie.multiTest(options, Vex.Flow.TabTie.createHammeron);
}

Vex.Flow.Test.TabTie.simplePulloff = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  Vex.Flow.Test.TabTie.multiTest(options, Vex.Flow.TabTie.createPulloff);
}

Vex.Flow.Test.TabTie.continuous = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.TabTie.setupContext(options, 440, 140);
  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }

  var notes = [
    newNote({ positions: [{str:4, fret:4}], duration: "q"}),
    newNote({ positions: [{str:4, fret:5}], duration: "q"}),
    newNote({ positions: [{str:4, fret:6}], duration: "h"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).addTickables(notes);
  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 300);
  voice.draw(c.context, c.stave);

  Vex.Flow.TabTie.createHammeron({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0],
  }).setContext(c.context).draw();

  Vex.Flow.TabTie.createPulloff({
    first_note: notes[1],
    last_note: notes[2],
    first_indices: [0],
    last_indices: [0],
  }).setContext(c.context).draw();
  ok(true, "Continuous Hammeron");
}
