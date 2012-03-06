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
  Vex.Flow.Test.runTest("Standard Notation Annotation",
      Vex.Flow.Test.Annotation.standard);
  Vex.Flow.Test.runTest("Harmonics", Vex.Flow.Test.Annotation.harmonic);
  Vex.Flow.Test.runRaphaelTest("Harmonics", Vex.Flow.Test.Annotation.harmonic);
  Vex.Flow.Test.runTest("Fingerpicking", Vex.Flow.Test.Annotation.picking);
  Vex.Flow.Test.runRaphaelTest("Fingerpicking (Raphael)",
      Vex.Flow.Test.Annotation.picking);
  Vex.Flow.Test.runTest("Bottom Annotation",
      Vex.Flow.Test.Annotation.bottom);
  Vex.Flow.Test.runTest("Test Justification Annotation",
      Vex.Flow.Test.Annotation.justification);
}

Vex.Flow.Test.Annotation.simple = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
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

Vex.Flow.Test.Annotation.standard = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 450).
    addClef("treble").setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAnnotation(text) {
    return (new Vex.Flow.Annotation(text)).setFont("Times",
        Vex.Flow.Test.Font.size, "italic"); }

  var notes = [
    newNote({ keys: ["c/4", "e/4"], duration: "h"}).
      addAnnotation(0, newAnnotation("quiet")),
    newNote({ keys: ["c/4", "e/4", "c/5"], duration: "h"}).
      addAnnotation(2, newAnnotation("Allegro"))
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 200);
  ok(true, "Standard Notation Annotation");
}

Vex.Flow.Test.Annotation.harmonic = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
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
        addModifier(newAnnotation("(8va)").setFont("Times",
              Vex.Flow.Test.Font.size, "italic"), 0).
        addModifier(newAnnotation("A.H."), 0)
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 200);
  ok(true, "Simple Annotation");
}

Vex.Flow.Test.Annotation.picking = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.setFillStyle("#221"); ctx.setStrokeStyle("#221");
  ctx.setFont("Arial", Vex.Flow.Test.Font.size, "");
  var stave = new Vex.Flow.TabStave(10, 10, 450).
    addTabGlyph().setContext(ctx).draw();

  function newNote(tab_struct) { return new Vex.Flow.TabNote(tab_struct); }
  function newBend(text) { return new Vex.Flow.Bend(text); }
  function newAnnotation(text) { return new Vex.Flow.Annotation(text).
    setFont("Times", Vex.Flow.Test.Font.size, "italic"); }

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

Vex.Flow.Test.Annotation.bottom = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 300).
    addClef("treble").setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAnnotation(text) {
    return (new Vex.Flow.Annotation(text)).setFont("Times",
        Vex.Flow.Test.Font.size).
	setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM); }

  var notes = [
    newNote({ keys: ["f/4"], duration: "w"}).
      addAnnotation(0, newAnnotation("F")),
    newNote({ keys: ["a/4"], duration: "w"}).
      addAnnotation(0, newAnnotation("A")),
    newNote({ keys: ["c/5"], duration: "w"}).
      addAnnotation(0, newAnnotation("C")),
    newNote({ keys: ["e/5"], duration: "w"}).
      addAnnotation(0, newAnnotation("E"))
  ];

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 100);
  ok(true, "Bottom Annotation");
}

Vex.Flow.Test.Annotation.justification = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 650, 650);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAnnotation(text, hJustifcation, vJustifcation) {
    return (
        new Vex.Flow.Annotation(text)).
          setFont("Arial", Vex.Flow.Test.Font.size).
          setJustification(hJustifcation).
          setVerticalJustification(vJustifcation); }

  for (var v = 1; v <= 4; ++v) {
    var stave = new Vex.Flow.Stave(10, (v-1) * 100 + 10, 400).
      addClef("treble").setContext(ctx).draw();

    notes = [];

    for (var h = 1; h <= 4; ++h) {
      notes.push(newNote({ keys: ["a/4"], duration: "q"}).
        addAnnotation(0, newAnnotation("Text", h, v)));
    }

    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 100);
  }

  ok(true, "Test Justification Annotation");
}
