/**
 * VexFlow - Annotation Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Annotation = {}

Vex.Flow.Test.Annotation.Start = function() {
  module("Annotation");
  Vex.Flow.Test.runTests("Simple Annotation", Vex.Flow.Test.Annotation.simple);
  Vex.Flow.Test.runTests("Standard Notation Annotation",
      Vex.Flow.Test.Annotation.standard);
  Vex.Flow.Test.runTests("Harmonics", Vex.Flow.Test.Annotation.harmonic);
  Vex.Flow.Test.runTests("Fingerpicking", Vex.Flow.Test.Annotation.picking);
  Vex.Flow.Test.runTests("Bottom Annotation",
      Vex.Flow.Test.Annotation.bottom);
  Vex.Flow.Test.runTests("Test Justification Annotation Stem Up",
      Vex.Flow.Test.Annotation.justificationStemUp);
  Vex.Flow.Test.runTests("Test Justification Annotation Stem Down",
      Vex.Flow.Test.Annotation.justificationStemDown);
  Vex.Flow.Test.runTests("TabNote Annotations",
      Vex.Flow.Test.Annotation.tabNotes);
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
    return (
        new Vex.Flow.Annotation(text)).
        setFont("Times", Vex.Flow.Test.Font.size).
        setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM);
    }

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

Vex.Flow.Test.Annotation.justificationStemUp = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 650, 950);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAnnotation(text, hJustifcation, vJustifcation) {
    return (
        new Vex.Flow.Annotation(text)).
          setFont("Arial", Vex.Flow.Test.Font.size).
          setJustification(hJustifcation).
          setVerticalJustification(vJustifcation); }

  for (var v = 1; v <= 4; ++v) {
    var stave = new Vex.Flow.Stave(10, (v-1) * 150 + 40, 400).
      addClef("treble").setContext(ctx).draw();

    notes = [];

    notes.push(newNote({ keys: ["c/3"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 1, v)));
    notes.push(newNote({ keys: ["c/4"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 2, v)));
    notes.push(newNote({ keys: ["c/5"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 3, v)));
    notes.push(newNote({ keys: ["c/6"], duration: "q"}).addAnnotation(0, newAnnotation("Text", 4, v)));

    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 100);
  }

  ok(true, "Test Justification Annotation");
}

Vex.Flow.Test.Annotation.justificationStemDown = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 650, 1000);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAnnotation(text, hJustifcation, vJustifcation) {
    return (
        new Vex.Flow.Annotation(text)).
          setFont("Arial", Vex.Flow.Test.Font.size).
          setJustification(hJustifcation).
          setVerticalJustification(vJustifcation); }

  for (var v = 1; v <= 4; ++v) {
    var stave = new Vex.Flow.Stave(10, (v-1) * 150 + 40, 400).
      addClef("treble").setContext(ctx).draw();

    notes = [];

    notes.push(newNote({ keys: ["c/3"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 1, v)));
    notes.push(newNote({ keys: ["c/4"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 2, v)));
    notes.push(newNote({ keys: ["c/5"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 3, v)));
    notes.push(newNote({ keys: ["c/6"], duration: "q", stem_direction: -1}).addAnnotation(0, newAnnotation("Text", 4, v)));

    Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 100);
  }

  ok(true, "Test Justification Annotation");
}

Vex.Flow.Test.Annotation.tabNotes = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 600, 200);
  ctx.font = "10pt Arial";
  var stave = new Vex.Flow.TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  var specs = [
    { positions: [{str: 3, fret: 6 }, {str: 4, fret: 25}], duration: "8"},
    { positions: [{str: 2, fret: 10 }, {str: 5, fret: 12}], duration: "8"},
    { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"},
    { positions: [{str: 1, fret: 6 }, {str: 3, fret: 5}], duration: "8"}
  ];

  var notes = specs.map(function(noteSpec) {
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    return tabNote;
  });

  var notes2 = specs.map(function(noteSpec){
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  var notes3 = specs.map(function(noteSpec){
    var tabNote = new Vex.Flow.TabNote(noteSpec);
    return tabNote;
  });

  notes[0].addModifier(new Vex.Flow.Annotation("Text").setJustification(1).setVerticalJustification(1), 0); // U
  notes[1].addModifier(new Vex.Flow.Annotation("Text").setJustification(2).setVerticalJustification(2), 0); // D
  notes[2].addModifier(new Vex.Flow.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
  notes[3].addModifier(new Vex.Flow.Annotation("Text").setJustification(4).setVerticalJustification(4), 0); // D

  notes2[0].addModifier(new Vex.Flow.Annotation("Text").setJustification(3).setVerticalJustification(1), 0); // U
  notes2[1].addModifier(new Vex.Flow.Annotation("Text").setJustification(3).setVerticalJustification(2), 0); // D
  notes2[2].addModifier(new Vex.Flow.Annotation("Text").setJustification(3).setVerticalJustification(3), 0); // U
  notes2[3].addModifier(new Vex.Flow.Annotation("Text").setJustification(3).setVerticalJustification(4), 0); // D

  notes3[0].addModifier(new Vex.Flow.Annotation("Text").setVerticalJustification(1), 0); // U
  notes3[1].addModifier(new Vex.Flow.Annotation("Text").setVerticalJustification(2), 0); // D
  notes3[2].addModifier(new Vex.Flow.Annotation("Text").setVerticalJustification(3), 0); // U
  notes3[3].addModifier(new Vex.Flow.Annotation("Text").setVerticalJustification(4), 0); // D

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode(Vex.Flow.Voice.Mode.SOFT);

  voice.addTickables(notes);
  voice.addTickables(notes2);
  voice.addTickables(notes3);


  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], stave);


  voice.draw(ctx, stave);

  ok (true, 'TabNotes successfully drawn');

};