/**
 * VexFlow - Vibrato Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Vibrato = {}

Vex.Flow.Test.Vibrato.Start = function() {
  module("Vibrato");
  Vex.Flow.Test.runTests("Simple Vibrato", Vex.Flow.Test.Vibrato.simple);
  Vex.Flow.Test.runTests("Harsh Vibrato", Vex.Flow.Test.Vibrato.harsh);
  Vex.Flow.Test.runTests("Vibrato with Bend", Vex.Flow.Test.Vibrato.withBend);
  
}

Vex.Flow.Test.Vibrato.simple = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 140);

  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newVibrato() { return new Vex.Flow.Vibrato(); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
      addModifier(newVibrato(), 0),
    newNote({
      positions: [{str: 2, fret: 10}], duration: "h" }).
      addModifier(newVibrato(), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, "Simple Vibrato");
}

Vex.Flow.Test.Vibrato.harsh = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 240);

  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newVibrato() { return new Vex.Flow.Vibrato(); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
      addModifier(newVibrato().setHarsh(true), 0),
    newNote({
      positions: [{str: 2, fret: 10}], duration: "h" }).
      addModifier(newVibrato().setHarsh(true), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, "Harsh Vibrato");
}

Vex.Flow.Test.Vibrato.withBend = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.3, 1.3); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  ctx.setFont("Arial", Vex.Flow.Test.Font.size, "");
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text, release) { return new Vex.Flow.Bend(text, release); }
  function newVibrato() { return new Vex.Flow.Vibrato(); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 9}, {str: 3, fret: 9}], duration: "q" }).
      addModifier(newBend("1/2", true), 0).
      addModifier(newBend("1/2", true), 1).
      addModifier(newVibrato(), 0),
    newNote({
      positions: [{str: 2, fret: 10}], duration: "q" }).
      addModifier(newBend("Full", false), 0).
      addModifier(newVibrato().setVibratoWidth(60), 0),
    newNote({
      positions: [{str: 2, fret: 10}], duration: "h" }).
      addModifier(newVibrato().setVibratoWidth(120).setHarsh(true), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, "Vibrato with Bend");
}
