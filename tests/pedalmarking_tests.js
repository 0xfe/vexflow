/**
 * VexFlow - PedalMarking Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.PedalMarking = {};

Vex.Flow.Test.PedalMarking.Start = function() {
  module("PedalMarking");
  Vex.Flow.Test.runTests("Simple Pedal", Vex.Flow.Test.PedalMarking.simpleText);
  Vex.Flow.Test.runTests("Simple Pedal", Vex.Flow.Test.PedalMarking.simpleBracket);
  Vex.Flow.Test.runTests("Simple Pedal", Vex.Flow.Test.PedalMarking.simpleMixed);
  Vex.Flow.Test.runTests("Release and Depress on Same Note", Vex.Flow.Test.PedalMarking.releaseDepressOnSameNoteBracketed);
  Vex.Flow.Test.runTests("Release and Depress on Same Note", Vex.Flow.Test.PedalMarking.releaseDepressOnSameNoteMixed);
  Vex.Flow.Test.runTests("Custom Text", Vex.Flow.Test.PedalMarking.customText);
  Vex.Flow.Test.runTests("Custom Text", Vex.Flow.Test.PedalMarking.customTextMixed);
};


Vex.Flow.Test.PedalMarking.simpleText = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.TEXT);

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();

};

Vex.Flow.Test.PedalMarking.simpleBracket = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.BRACKET);

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();

};

Vex.Flow.Test.PedalMarking.simpleMixed = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes0[2], notes0[3], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.MIXED);

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();

};

Vex.Flow.Test.PedalMarking.releaseDepressOnSameNoteBracketed = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.BRACKET);

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();

};

Vex.Flow.Test.PedalMarking.releaseDepressOnSameNoteMixed = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes0[3], notes0[3], notes1[1], notes1[1],  notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.MIXED);

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();

};

Vex.Flow.Test.PedalMarking.customText = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.TEXT);

  pedal.setCustomText("una corda", "tre corda");

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();
};

Vex.Flow.Test.PedalMarking.customTextMixed = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave0 = new Vex.Flow.Stave(10, 10, 250).addTrebleGlyph();
  var stave1 = new Vex.Flow.Stave(260, 10, 250);
  stave0.setContext(ctx).draw();
  stave1.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }


  var notes0 = [
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: 1},
    {keys: ["b/4"], duration: "4", stem_direction: -1}
  ].map(newNote);

  var notes1 = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);
  voice1.addTickables(notes1);

  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  var pedal = new Vex.Flow.PedalMarking([notes0[0], notes1[3]]);

  pedal.setStyle(Vex.Flow.PedalMarking.Styles.MIXED);
  pedal.setCustomText("Sost. Ped.");

  voice0.draw(ctx, stave0);
  voice1.draw(ctx, stave1);
  pedal.setContext(ctx).draw();
};