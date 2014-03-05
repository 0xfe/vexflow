Vex.Flow.Test.AutoBeamFormatting = {};

Vex.Flow.Test.AutoBeamFormatting.Start = function() {
  Vex.Flow.Test.runTest("Simple Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.simpleAuto);
  Vex.Flow.Test.runTest("Odd Beam Groups Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.oddBeamGroups);
  Vex.Flow.Test.runTest("More Simple Auto Beaming 0",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimple0);
  Vex.Flow.Test.runTest("More Simple Auto Beaming 1",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimple1);
  Vex.Flow.Test.runTest("Simple Tuplet Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.simpleTuplets);
  Vex.Flow.Test.runTest("More Simple Tuplet Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimpleTuplets);
  Vex.Flow.Test.runTest("More Automatic Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.moreBeaming);
}

Vex.Flow.Test.AutoBeamFormatting.setupContext = function(options, x, y) {
  var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, x || 450).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

Vex.Flow.Test.AutoBeamFormatting.simpleAuto = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["f/5"], duration: "8"}),
    newNote({ keys: ["e/5"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["e/5"], duration: "8"}),
    newNote({ keys: ["f/5"], duration: "8"}),
    newNote({ keys: ["f/5"], duration: "32"}),
    newNote({ keys: ["f/5"], duration: "32"}),
    newNote({ keys: ["f/5"], duration: "32"}),
    newNote({ keys: ["f/5"], duration: "32"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  // Takes a voice and returns it's auto beamsj
  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.oddBeamGroups = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["f/5"], duration: "8"}),
    newNote({ keys: ["e/5"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["e/5"], duration: "8"}),
    newNote({ keys: ["f/5"], duration: "8"}),
    newNote({ keys: ["f/5"], duration: "8"}),
    newNote({ keys: ["f/4"], duration: "8"}),
    newNote({ keys: ["f/3"], duration: "8"}),
    newNote({ keys: ["f/5"], duration: "16"}),
    newNote({ keys: ["f/5"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setMode();
  voice.addTickables(notes);

  var Fraction = Vex.Flow.Fraction;

  var groups = [
    new Fraction(2, 8), 
    new Fraction(3, 8), 
    new Fraction(1, 8)
  ];

  // Takes a voice and returns it's auto beamsj
  var beams = Vex.Flow.Beam.applyAndGetBeams(voice, undefined, groups);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.moreSimple0 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["d/4"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.moreSimple1 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["a/5"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.simpleTuplets = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["c/5", "e/5"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"})
    ];

  var triplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));
  var quintuplet = new Vex.Flow.Tuplet(notes.slice(5));

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.setStrict(false);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  triplet1.setContext(c.context).draw();
  quintuplet.setContext(c.context).draw();
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.moreSimpleTuplets = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["d/4"], duration: "4"}),
    newNote({ keys: ["g/4"], duration: "4"}),
    newNote({ keys: ["c/5"], duration: "4"}),

    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/5", "e/5"], duration: "16"})
    ];

  var triplet1 = new Vex.Flow.Tuplet(notes.slice(0, 3));

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.setStrict(false);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  triplet1.setContext(c.context).draw();
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.moreBeaming = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.Beam.setupContext(options);

  var notes = [
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "4"}),
    newNote({ keys: ["c/5"], duration: "8"}).addDotToAll(),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "4"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/5", "e/5"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "8"})
    ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.setStrict(false);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  ok(true, "Auto Beam Applicator Test");
}
