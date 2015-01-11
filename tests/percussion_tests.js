/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

Vex.Flow.Test.Percussion = {}

Vex.Flow.Test.Percussion.Start = function() {
  module("Percussion");
  Vex.Flow.Test.Percussion.runBoth("Percussion Clef",
    Vex.Flow.Test.Percussion.draw);

  Vex.Flow.Test.Percussion.runBoth("Percussion Notes",
    Vex.Flow.Test.Percussion.drawNotes);

  Vex.Flow.Test.Percussion.runBoth("Percussion Basic0",
    Vex.Flow.Test.Percussion.drawBasic0);
  Vex.Flow.Test.Percussion.runBoth("Percussion Basic1",
    Vex.Flow.Test.Percussion.drawBasic1);
  Vex.Flow.Test.Percussion.runBoth("Percussion Basic2",
    Vex.Flow.Test.Percussion.drawBasic2);

  Vex.Flow.Test.Percussion.runBoth("Percussion Snare0",
    Vex.Flow.Test.Percussion.drawSnare0);
  Vex.Flow.Test.Percussion.runBoth("Percussion Snare1",
    Vex.Flow.Test.Percussion.drawSnare1);
  Vex.Flow.Test.Percussion.runBoth("Percussion Snare2",
    Vex.Flow.Test.Percussion.drawSnare2);
}

Vex.Flow.Test.Percussion.runBoth = function(title, func) {
  Vex.Flow.Test.runTests(title, func);
  
}

Vex.Flow.Test.Percussion.newModifier = function(s) {
  return new Vex.Flow.Annotation(s).setFont("Arial", 12)
    .setVerticalJustification(Vex.Flow.Annotation.VerticalJustify.BOTTOM);
}

Vex.Flow.Test.Percussion.newArticulation = function(s) {
  return new Vex.Flow.Articulation(s).setPosition(Vex.Flow.Modifier.Position.ABOVE);
}

Vex.Flow.Test.Percussion.newTremolo = function(s) {
  return new Vex.Flow.Tremolo(s);
}

Vex.Flow.Test.Percussion.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);

  var stave = new Vex.Flow.Stave(10, 10, 300);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  ok(true, "");
}

Vex.Flow.Test.Percussion.showNote = function(note_struct, stave, ctx, x) {
  var note = new Vex.Flow.StaveNote(note_struct);
  var tickContext = new Vex.Flow.TickContext();
  tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
  note.setContext(ctx).setStave(stave);
  note.draw();
  return note;
}

Vex.Flow.Test.Percussion.drawNotes = function(options, contextBuilder) {
  var notes = [
    { keys: ["g/5/d0"], duration: "q"},
    { keys: ["g/5/d1"], duration: "q"},
    { keys: ["g/5/d2"], duration: "q"},
    { keys: ["g/5/d3"], duration: "q"},
    { keys: ["x/"], duration: "w"},

    { keys: ["g/5/t0"], duration: "w"},
    { keys: ["g/5/t1"], duration: "q"},
    { keys: ["g/5/t2"], duration: "q"},
    { keys: ["g/5/t3"], duration: "q"},
    { keys: ["x/"], duration: "w"},

    { keys: ["g/5/x0"], duration: "w"},
    { keys: ["g/5/x1"], duration: "q"},
    { keys: ["g/5/x2"], duration: "q"},
    { keys: ["g/5/x3"], duration: "q"}
  ];
  expect(notes.length * 4);

  var ctx = new contextBuilder(options.canvas_sel,
    notes.length * 25 + 100, 240);

  // Draw two staves, one with up-stems and one with down-stems.
  for (var h = 0; h < 2; ++h) {
    var stave = new Vex.Flow.Stave(10, 10 + h * 120, notes.length * 25 + 75);
    stave.addClef("percussion");
    stave.setContext(ctx);
    stave.draw();

    var showNote = Vex.Flow.Test.Percussion.showNote;

    for (var i = 0; i < notes.length; ++i) {
      var note = notes[i];
      note.stem_direction = (h == 0 ? -1 : 1);
      var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

      ok(staveNote.getX() > 0, "Note " + i + " has X value");
      ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
    }
  }
}

Vex.Flow.Test.Percussion.drawBasic0 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 10, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" })
  ];
  var beamUp = new Vex.Flow.Beam(notesUp.slice(0,8));
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "q",
      stem_direction: -1 })
  ];
  var beamDown1 = new Vex.Flow.Beam(notesDown.slice(0,2));
  var beamDown2 = new Vex.Flow.Beam(notesDown.slice(3,6));
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().joinVoices([voiceUp, voiceDown]).
     formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  beamUp.setContext(ctx).draw();
  beamDown1.setContext(ctx).draw();
  beamDown2.setContext(ctx).draw();

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawBasic1 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 10, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
    new Vex.Flow.StaveNote({ keys: ["f/5/x2"], duration: "q" })
  ];
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "q",
      stem_direction: -1 })
  ];
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().joinVoices([voiceUp, voiceDown]).
      formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawBasic2 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");
  var stave = new Vex.Flow.Stave(10, 10, 420);
  stave.addClef("percussion");
  stave.setContext(ctx);
  stave.draw();

  notesUp = [
    new Vex.Flow.StaveNote({ keys: ["a/5/x3"], duration: "8" }).
      addModifier(0, (new Vex.Flow.Annotation("<")).setFont()),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
    new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "8" })
  ];
  var beamUp = new Vex.Flow.Beam(notesUp.slice(1,8));
  var voiceUp = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceUp.addTickables(notesUp);

  notesDown = [
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "8",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["f/4"], duration: "q",
      stem_direction: -1 }),
    new Vex.Flow.StaveNote({ keys: ["c/5", "d/4/x2"], duration: "8d",
      stem_direction: -1 }).addDotToAll(),
    new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "16",
      stem_direction: -1 })
  ];
  var beamDown1 = new Vex.Flow.Beam(notesDown.slice(0,2));
  var beamDown2 = new Vex.Flow.Beam(notesDown.slice(4,6));
  var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
    resolution: Vex.Flow.RESOLUTION });
  voiceDown.addTickables(notesDown);

  var formatter = new Vex.Flow.Formatter().joinVoices([voiceUp, voiceDown]).
    formatToStave([voiceUp, voiceDown], stave);

  voiceUp.draw(ctx, stave);
  voiceDown.draw(ctx, stave);

  beamUp.setContext(ctx).draw();
  beamDown1.setContext(ctx).draw();
  beamDown2.setContext(ctx).draw();

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawSnare0 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 600, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");

  x = 10;
  y = 10;
  w = 280;

  {
    var stave = new Vex.Flow.Stave(x, y, w);
    stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
    stave.setEndBarType(Vex.Flow.Barline.type.SINGLE);
    stave.addClef("percussion");
    stave.setContext(ctx);
    stave.draw();

    notesDown = [
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newArticulation("a>")).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("L")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("R")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("L")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("L"))
    ];
    var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
        resolution: Vex.Flow.RESOLUTION });
    voiceDown.addTickables(notesDown);

    var formatter = new Vex.Flow.Formatter().
      joinVoices([voiceDown]).formatToStave([voiceDown], stave);

    voiceDown.draw(ctx, stave);

    x += stave.width;
  }

  {
    var stave = new Vex.Flow.Stave(x, y, w);
    stave.setBegBarType(Vex.Flow.Barline.type.NONE);
    stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
    stave.setContext(ctx);
    stave.draw();

    notesDown = [
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newArticulation("a>")).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("R")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("L")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("R")),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addModifier(0, Vex.Flow.Test.Percussion.newModifier("R"))
    ];
    var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
      resolution: Vex.Flow.RESOLUTION });
    voiceDown.addTickables(notesDown);

    var formatter = new Vex.Flow.Formatter().
      joinVoices([voiceDown]).formatToStave([voiceDown], stave);

    voiceDown.draw(ctx, stave);

    x += stave.width;
  }

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawSnare1 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 600, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");

  x = 10;
  y = 10;
  w = 280;

  {
    var stave = new Vex.Flow.Stave(x, y, w);
    stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
    stave.setEndBarType(Vex.Flow.Barline.type.SINGLE);
    stave.addClef("percussion");
    stave.setContext(ctx);
    stave.draw();

    notesDown = [
      new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newArticulation("ah")),
      new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "q",
        stem_direction: -1 }),
      new Vex.Flow.StaveNote({ keys: ["g/5/x2"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newArticulation("ah")),
      new Vex.Flow.StaveNote({ keys: ["a/5/x3"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newArticulation("a,")),
    ];
    var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
        resolution: Vex.Flow.RESOLUTION });
    voiceDown.addTickables(notesDown);

    var formatter = new Vex.Flow.Formatter().
      joinVoices([voiceDown]).formatToStave([voiceDown], stave);

    voiceDown.draw(ctx, stave);

    x += stave.width;
  }

  ok(true, "");
}

Vex.Flow.Test.Percussion.drawSnare2 = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 600, 120);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
    ctx.setFont("Arial", 15, "");

  x = 10;
  y = 10;
  w = 280;

  {
    var stave = new Vex.Flow.Stave(x, y, w);
    stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
    stave.setEndBarType(Vex.Flow.Barline.type.SINGLE);
    stave.addClef("percussion");
    stave.setContext(ctx);
    stave.draw();

    notesDown = [
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newTremolo(0)),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newTremolo(1)),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newTremolo(3)),
      new Vex.Flow.StaveNote({ keys: ["c/5"], duration: "q",
        stem_direction: -1 }).
        addArticulation(0, Vex.Flow.Test.Percussion.newTremolo(5)),
    ];
    var voiceDown = new Vex.Flow.Voice({ num_beats: 4, beat_value: 4,
        resolution: Vex.Flow.RESOLUTION });
    voiceDown.addTickables(notesDown);

    var formatter = new Vex.Flow.Formatter().
      joinVoices([voiceDown]).formatToStave([voiceDown], stave);

    voiceDown.draw(ctx, stave);

    x += stave.width;
  }

  ok(true, "");
}
