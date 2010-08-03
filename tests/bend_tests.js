/**
 * VexFlow - Accidental Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Bend = {}

Vex.Flow.Test.Bend.Start = function() {
  module("Bend");
  Vex.Flow.Test.runTest("Double Bends", Vex.Flow.Test.Bend.doubleBends);
  Vex.Flow.Test.runRaphaelTest("Double Bends (Raphael)",
      Vex.Flow.Test.Bend.doubleBends);
  Vex.Flow.Test.runTest("Reverse Bends", Vex.Flow.Test.Bend.reverseBends);
  Vex.Flow.Test.runTest("Double Bends With Release",
      Vex.Flow.Test.Bend.doubleBendsWithRelease);
  Vex.Flow.Test.runRaphaelTest("Double Bends With Release (Raphael)",
      Vex.Flow.Test.Bend.doubleBendsWithRelease);
}

Vex.Flow.Test.Bend.doubleBends = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "bold 8pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
      addModifier(newBend("Full"), 0).
      addModifier(newBend("1/2"), 1),

    newNote({
      positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "q" }).
      addModifier(newBend("1/4"), 0).
      addModifier(newBend("1/4"), 1),

    newNote({
      positions: [{str: 4, fret: 7}], duration: "h" })
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, "Double Bends");
}

Vex.Flow.Test.Bend.doubleBendsWithRelease = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.setFont("Arial", 8);
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text, release) { return new Vex.Flow.Bend(text, release); }

  var notes = [
    newNote({
      positions: [{str: 1, fret: 10}, {str: 4, fret: 9}], duration: "q" }).
      addModifier(newBend("1/2", true), 0).
      addModifier(newBend("Full", true), 1),

    newNote({
      positions: [{str: 2, fret: 5},
                  {str: 3, fret: 5},
                  {str: 4, fret: 5}], duration: "q" }).
      addModifier(newBend("1/4", true), 0).
      addModifier(newBend("Monstrous", true), 1).
      addModifier(newBend("1/4", true), 2),

    newNote({
      positions: [{str: 4, fret: 7}], duration: "q" }),
    newNote({
      positions: [{str: 4, fret: 7}], duration: "q" })
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, "Bend Release");
}

Vex.Flow.Test.Bend.reverseBends = function(options) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, 500, 240);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "bold 8pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "w" }).
      addModifier(newBend("Full"), 1).
      addModifier(newBend("1/2"), 0),

    newNote({
      positions: [{str: 2, fret: 5}, {str: 3, fret: 5}], duration: "w" }).
      addModifier(newBend("1/4"), 1).
      addModifier(newBend("1/4"), 0),

    newNote({
      positions: [{str: 4, fret: 7}], duration: "w" })
  ];

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var mc = new Vex.Flow.ModifierContext();
    note.addToModifierContext(mc);

    var tickContext = new Vex.Flow.TickContext();
    tickContext.addTickable(note).preFormat().setX(50 * i).setPixelsUsed(95);

    note.setStave(stave).setContext(ctx).draw();
    ok(true, "Bend " + i);
  }
}
