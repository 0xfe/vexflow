/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Annotation = {}

Vex.Flow.Test.Annotation.Start = function() {
  module("Annotation");
  Vex.Flow.Test.runTest("Simple Annotation", Vex.Flow.Test.Annotation.simple);
  Vex.Flow.Test.runRaphaelTest("Simple Annotation",
      Vex.Flow.Test.Annotation.simple);
  Vex.Flow.Test.runTest("Harmonics", Vex.Flow.Test.Annotation.harmonic);
  Vex.Flow.Test.runRaphaelTest("Harmonics", Vex.Flow.Test.Annotation.harmonic);
  Vex.Flow.Test.runTest("Fingerpicking", Vex.Flow.Test.Annotation.picking);
  Vex.Flow.Test.runRaphaelTest("Fingerpicking (Raphael)",
      Vex.Flow.Test.Annotation.picking);
}

Vex.Flow.Test.Annotation.simple = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "bold 8pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }
  function newAnnotation(text) { return new Vex.Flow.Annotation(text); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 10}, {str: 4, fret: 9}], duration: "h" }).
      addModifier(newAnnotation("T"), 0),
    newNote({
      positions: [{str: 2, fret: 10}], duration: "h" }).
        addModifier(newAnnotation("T"), 0).
        addModifier(newBend("Full"), 0),
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 200);
  ok(true, "Simple Annotation");
}

Vex.Flow.Test.Annotation.harmonic = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = "bold 8pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }
  function newAnnotation(text) { return new Vex.Flow.Annotation(text); }

  var notes = [
    newNote({
      positions: [{str: 2, fret: 12}, {str: 3, fret: 12}], duration: "h" }).
      addModifier(newAnnotation("Harm."), 0),
    newNote({
      positions: [{str: 2, fret: 9}], duration: "h" }).
        addModifier(newAnnotation("(8va)").setFont("Times", 8, "italic"), 0).
        addModifier(newAnnotation("A.H."), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 200);
  ok(true, "Simple Annotation");
}

Vex.Flow.Test.Annotation.picking = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  ctx.setFont("Arial", 8, "bold");
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }
  function newAnnotation(text) { return new Vex.Flow.Annotation(text).
    setFont("Times", 8, "italic"); }

  var notes = [
    newNote({
      positions: [
        {str: 1, fret: 0},
        {str: 2, fret: 1},
        {str: 3, fret: 2},
        {str: 4, fret: 2},
        {str: 5, fret: 0}
        ], duration: "h" }).
      addModifier(new Vex.Flow.Vibrato().setVibratoWidth(40)),
    newNote({
      positions: [{str: 6, fret: 9}], duration: "8" }).
        addModifier(newAnnotation("p"), 0),
    newNote({
      positions: [{str: 3, fret: 9}], duration: "8" }).
        addModifier(newAnnotation("i"), 0),
    newNote({
      positions: [{str: 2, fret: 9}], duration: "8" }).
        addModifier(newAnnotation("m"), 0),
    newNote({
      positions: [{str: 1, fret: 9}], duration: "8" }).
        addModifier(newAnnotation("a"), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 200);
  ok(true, "Fingerpicking");
}
