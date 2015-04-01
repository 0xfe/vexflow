/**
 * VexFlow - TextBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TextBracket = {};

Vex.Flow.Test.TextBracket.Start = function() {
  module("TextBracket");
  Vex.Flow.Test.runTests("Simple TextBracket", Vex.Flow.Test.TextBracket.simple0);
  Vex.Flow.Test.runTests("TextBracket Styles", Vex.Flow.Test.TextBracket.simple1);
  
  
};

Vex.Flow.Test.TextBracket.simple0 = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave = new Vex.Flow.Stave(10, 40, 550).addTrebleGlyph();
  stave.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var octave_top = new Vex.Flow.TextBracket({
    start: notes[0],
    stop: notes[3],
    text: "15",
    superscript: "va",
    position: 1
  });

  var octave_bottom = new Vex.Flow.TextBracket({
    start: notes[0],
    stop: notes[3],
    text: "8",
    superscript: "vb",
    position: -1
  });

  octave_bottom.setLine(3);

  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);

  octave_top.setContext(ctx).draw();
  octave_bottom.setContext(ctx).draw();
};

Vex.Flow.Test.TextBracket.simple1 = function(options, contextBuilder) {
  expect(0);

  options.contextBuilder = contextBuilder;
  var ctx = new options.contextBuilder(options.canvas_sel, 650, 200);
  ctx.scale(1, 1); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  //ctx.translate(0.5, 0.5);
  var stave = new Vex.Flow.Stave(10, 40, 550).addTrebleGlyph();
  stave.setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  var notes = [
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"},
    {keys: ["c/4"], duration: "4"}
  ].map(newNote);

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var octave_top0 = new Vex.Flow.TextBracket({
    start: notes[0],
    stop: notes[1],
    text: "Cool notes",
    superscript: "",
    position: 1
  });

  var octave_bottom0 = new Vex.Flow.TextBracket({
    start: notes[2],
    stop: notes[4],
    text: "Not cool notes",
    superscript: " super uncool",
    position: -1
  });

  octave_bottom0.render_options.bracket_height = 40;
  octave_bottom0.setLine(4);

  var octave_top1 = new Vex.Flow.TextBracket({
    start: notes[2],
    stop: notes[4],
    text: "Testing",
    superscript: "superscript",
    position: 1
  });

  var octave_bottom1 = new Vex.Flow.TextBracket({
    start: notes[0],
    stop: notes[1],
    text: "8",
    superscript: "vb",
    position: -1
  });

  octave_top1.render_options.line_width = 2;
  octave_top1.render_options.show_bracket = false;
  octave_bottom1.setDashed(true, [2, 2]);
  octave_top1.setFont({
    weight: "",
    family: "Arial",
    size: 15
  });

  octave_bottom1.font.size = 30;
  octave_bottom1.setDashed(false);
  octave_bottom1.render_options.underline_superscript = false;

  octave_bottom1.setLine(3);

  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);

  octave_top0.setContext(ctx).draw();
  octave_bottom0.setContext(ctx).draw();

  octave_top1.setContext(ctx).draw();
  octave_bottom1.setContext(ctx).draw();
};