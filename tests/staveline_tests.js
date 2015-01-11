/**
 * VexFlow - StaveLine Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StaveLine = {};

Vex.Flow.Test.StaveLine.Start = function() {
  module("StaveLine");
  Vex.Flow.Test.runTests("Simple StaveLine", Vex.Flow.Test.StaveLine.simple0);
  
  Vex.Flow.Test.runTests("StaveLine Arrow Options", Vex.Flow.Test.StaveLine.simple1);
  
};

Vex.Flow.Test.StaveLine.simple0 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 650, 140);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave = new Vex.Flow.Stave(10, 10, 550).addTrebleGlyph();
  stave.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    {keys: ["c/4"], duration: "4", clef: "treble"},
    {keys: ["c/5"], duration: "4", clef: "treble"},
    {keys: ["c/4", "g/4", "b/4"], duration: "4", clef: "treble"},
    {keys: ["f/4", "a/4", "f/5"], duration: "4", clef: "treble"}
  ].map(newNote);


  var staveLine = new Vex.Flow.StaveLine({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0]
  });

  var staveLine2 = new Vex.Flow.StaveLine({
    first_note: notes[2],
    last_note: notes[3],
    first_indices: [2, 1, 0],
    last_indices: [0, 1, 2]
  });

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  staveLine.setText('gliss.');
  staveLine.setFont({
    family: "serif",
    size: 12,
    weight: "italic"
  });

  voice.draw(ctx, stave);
  staveLine.setContext(ctx).draw();
  staveLine2.setContext(ctx).draw();

  ok(true);
};


Vex.Flow.Test.StaveLine.simple1 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 770, 140);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave = new Vex.Flow.Stave(10, 10, 750).addTrebleGlyph();
  stave.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  var notes = [
    {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
    {keys: ["c/4"], duration: "4", clef: "treble"},
    {keys: ["c/4", "e/4", "g/4"], duration: "4", clef: "treble"},
    {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"},
    {keys: ["c/4",], duration: "4", clef: "treble"},
    {keys: ["c#/5", "d/5"], duration: "4", clef: "treble", stem_direction: -1},
    {keys: ["c/4", "d/4", "g/4"], duration: "4", clef: "treble"},
    {keys: ["f/4", "a/4", "c/5"], duration: "4", clef: "treble"}
  ].map(newNote);

  notes[0].addDotToAll();
  notes[1].addAccidental(0, new Vex.Flow.Accidental("#"));
  notes[3].addAccidental(2, new Vex.Flow.Accidental("#"));
  notes[4].addAccidental(0, new Vex.Flow.Accidental("#"));
  notes[7].addAccidental(2, new Vex.Flow.Accidental("#"));

  var staveLine0 = new Vex.Flow.StaveLine({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0]
  });

  var staveLine4 = new Vex.Flow.StaveLine({
    first_note: notes[2],
    last_note: notes[3],
    first_indices: [1],
    last_indices: [1]
  });

  var staveLine1 = new Vex.Flow.StaveLine({
    first_note: notes[4],
    last_note: notes[5],
    first_indices: [0],
    last_indices: [0]
  });

  var staveLine2 = new Vex.Flow.StaveLine({
    first_note: notes[6],
    last_note: notes[7],
    first_indices: [1],
    last_indices: [0]
  });

  var staveLine3 = new Vex.Flow.StaveLine({
    first_note: notes[6],
    last_note: notes[7],
    first_indices: [2],
    last_indices: [2]
  });


  staveLine0.render_options.draw_end_arrow = true;
  staveLine0.setText('Left');
  staveLine0.render_options.text_justification = 1;
  staveLine0.render_options.text_position_vertical = 2;

  staveLine1.render_options.draw_end_arrow = true;
  staveLine1.render_options.arrowhead_length = 30;
  staveLine1.render_options.line_width = 5;
  staveLine1.setText('Center');
  staveLine1.render_options.text_justification = 2;
  staveLine1.render_options.text_position_vertical = 2;


  staveLine4.render_options.line_width = 2;
  staveLine4.render_options.draw_end_arrow = true;
  staveLine4.render_options.draw_start_arrow = true;
  staveLine4.render_options.arrowhead_angle = 0.5;
  staveLine4.render_options.arrowhead_length = 20;
  staveLine4.setText('Right');
  staveLine4.render_options.text_justification = 3;
  staveLine4.render_options.text_position_vertical = 2;

  staveLine2.render_options.draw_start_arrow = true;
  staveLine2.render_options.line_dash = [5, 4];
  
  staveLine3.render_options.draw_end_arrow = true;
  staveLine3.render_options.draw_start_arrow = true;
  staveLine3.render_options.color = "red";
  staveLine3.setText('Top');
  staveLine3.render_options.text_position_vertical = 1;

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(ctx, stave);

  staveLine0.setContext(ctx).draw();
  staveLine1.setContext(ctx).draw();
  staveLine2.setContext(ctx).draw();
  staveLine3.setContext(ctx).draw();
  staveLine4.setContext(ctx).draw();

  ok(true);
};