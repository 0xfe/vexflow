/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

Vex.Flow.Test.Percussion = {}

Vex.Flow.Test.Percussion.Start = function() {
  module("Percussion");
  Vex.Flow.Test.Percussion.runBoth("Percussion Clef", Vex.Flow.Test.Percussion.draw);

  Vex.Flow.Test.Percussion.runBoth("Percussion Notes", Vex.Flow.Test.Percussion.drawNotes);

  Vex.Flow.Test.Percussion.runBoth("Percussion Basic0", Vex.Flow.Test.Percussion.drawBasic0);
  Vex.Flow.Test.Percussion.runBoth("Percussion Basic1", Vex.Flow.Test.Percussion.drawBasic1);
  Vex.Flow.Test.Percussion.runBoth("Percussion Basic2", Vex.Flow.Test.Percussion.drawBasic2);

  Vex.Flow.Test.Percussion.runBoth("Percussion Snare0", Vex.Flow.Test.Percussion.drawSnare0);
}

Vex.Flow.Test.Percussion.runBoth = function(title, func) {
  Vex.Flow.Test.runTest(title, func);
  Vex.Flow.Test.runRaphaelTest(title + " (Raphael)", func);
}

Vex.Flow.Test.Percussion.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);

  var stave = new Vex.Flow.Stave(10, 10, 300);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  ok(true, "");
}


Vex.Flow.Test.Percussion.drawNotes = function(options, contextBuilder) {
  var notes = [
    { keys: ["f/5/dw"], duration: "w"},
    { keys: ["f/5/dh"], duration: "h"},
    { keys: ["f/5/dq"], duration: "q"},
    { keys: ["f/5/de"], duration: "8"},
    { keys: ["x/"], duration: "w"},

    { keys: ["f/5/tw"], duration: "w"},
    { keys: ["f/5/th"], duration: "h"},
    { keys: ["f/5/tq"], duration: "q"},
    { keys: ["f/5/te"], duration: "8"},
    { keys: ["x/"], duration: "w"},

    { keys: ["f/5/xw"], duration: "w"},
    { keys: ["f/5/xh"], duration: "h"},
    { keys: ["f/5/xq"], duration: "q"},
    { keys: ["f/5/xe"], duration: "8"},
  ];
  expect(notes.length * 2);

  var ctx = new contextBuilder(options.canvas_sel, notes.length * 25 + 100, 120);
  var stave = new Vex.Flow.Stave(10, 10, notes.length * 25 + 75);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  var showNote = Vex.Flow.Test.StaveNote.showNote;

  for (var i = 0; i < notes.length; ++i) {
    var note = notes[i];
    var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

    ok(staveNote.getX() > 0, "Note " + i + " has X value");
    ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
  }
}

Vex.Flow.Test.Percussion.drawBasic0 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221"; ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 50, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
  ];
  var beamUp = new Vex.Flow.Beam(notesUp.slice(0,8));
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "q", stem_direction: -1 }),
  ];
  var beamDown1 = new Vex.Flow.Beam(notesDown.slice(0,2));
  var beamDown2 = new Vex.Flow.Beam(notesDown.slice(3,6));
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voiceUp, voiceDown]).formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  beamUp.setContext(ctx).draw();
  beamDown1.setContext(ctx).draw();
  beamDown2.setContext(ctx).draw();

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawBasic1 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221"; ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 50, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["f/5/xq"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/xq"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/xq"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/xq"], duration: "q" }),
  ];
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "q", stem_direction: -1 }),
  ];
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voiceUp, voiceDown]).formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawBasic2 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221"; ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 50, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["a/5/xe"], duration: "8" }).addModifier(0, (new Vex.Flow.Annotation("<")).setFont()),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/xq"], duration: "8" }),
  ];
  var beamUp = new Vex.Flow.Beam(notesUp.slice(1,8));
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q", stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/xq"], duration: "8d", stem_direction: -1 }).addDotToAll(),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "16", stem_direction: -1 }),
  ];
  var beamDown1 = new Vex.Flow.Beam(notesDown.slice(0,2));
  var beamDown2 = new Vex.Flow.Beam(notesDown.slice(4,6));
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voiceUp, voiceDown]).formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  beamUp.setContext(ctx).draw();
  beamDown1.setContext(ctx).draw();
  beamDown2.setContext(ctx).draw();

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawSnare0 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221"; ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 50, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }).addModifier(0, (new Vex.Flow.Annotation("R")).setFont("Arial", 12)).addModifier(0, (new Vex.Flow.Annotation("<")).setFont("Arial", 15)),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }).addModifier(0, (new Vex.Flow.Annotation("L")).setFont("Arial", 12)),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }).addModifier(0, (new Vex.Flow.Annotation("R")).setFont("Arial", 12)),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q", stem_direction: -1 }).addModifier(0, (new Vex.Flow.Annotation("R")).setFont("Arial", 12)),
  ];
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voiceDown]).formatToStave([voiceDown], stave);

  voiceDown.draw(ctx, stave);

  ok(true, "");
}
