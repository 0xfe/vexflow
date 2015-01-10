Vex.Flow.Test.AutoBeamFormatting = {};

Vex.Flow.Test.AutoBeamFormatting.Start = function() {
  module('Auto-Beaming');
  Vex.Flow.Test.runTests("Simple Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.simpleAuto);
  Vex.Flow.Test.runTests("Even Group Stem Directions",
                        Vex.Flow.Test.AutoBeamFormatting.evenGroupStemDirections);
  Vex.Flow.Test.runTests("Odd Group Stem Directions",
                        Vex.Flow.Test.AutoBeamFormatting.oddGroupStemDirections);
  Vex.Flow.Test.runTests("Odd Beam Groups Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.oddBeamGroups);
  Vex.Flow.Test.runTests("More Simple Auto Beaming 0",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimple0);
  Vex.Flow.Test.runTests("More Simple Auto Beaming 1",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimple1);
  Vex.Flow.Test.runTests("Beam Across All Rests",
                        Vex.Flow.Test.AutoBeamFormatting.beamAcrossAllRests);
  Vex.Flow.Test.runTests("Beam Across All Rests with Stemlets",
                        Vex.Flow.Test.AutoBeamFormatting.beamAcrossAllRestsWithStemlets);
  Vex.Flow.Test.runTests("Break Beams on Middle Rests Only",
                        Vex.Flow.Test.AutoBeamFormatting.beamAcrossMiddleRests);
  Vex.Flow.Test.runTests("Break Beams on Rest",
                        Vex.Flow.Test.AutoBeamFormatting.breakBeamsOnRests);
  Vex.Flow.Test.runTests("Maintain Stem Directions",
                        Vex.Flow.Test.AutoBeamFormatting.maintainStemDirections);
  Vex.Flow.Test.runTests("Maintain Stem Directions - Beam Over Rests",
                        Vex.Flow.Test.AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests);
  Vex.Flow.Test.runTests("Beat group with unbeamable note - 2/2",
                        Vex.Flow.Test.AutoBeamFormatting.groupWithUnbeamableNote);
  Vex.Flow.Test.runTests("Offset beat grouping - 6/8 ",
                        Vex.Flow.Test.AutoBeamFormatting.groupWithUnbeamableNote1);
  Vex.Flow.Test.runTests("Odd Time - Guessing Default Beam Groups",
                        Vex.Flow.Test.AutoBeamFormatting.autoOddBeamGroups);
  Vex.Flow.Test.runTests("Custom Beam Groups",
                        Vex.Flow.Test.AutoBeamFormatting.customBeamGroups);
  Vex.Flow.Test.runTests("Simple Tuplet Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.simpleTuplets);
  Vex.Flow.Test.runTests("More Simple Tuplet Auto Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.moreSimpleTuplets);
  Vex.Flow.Test.runTests("More Automatic Beaming",
                        Vex.Flow.Test.AutoBeamFormatting.moreBeaming);
}

Vex.Flow.Test.AutoBeamFormatting.setupContext = function(options, x, y) {
  var ctx = new options.contextBuilder(options.canvas_sel, x || 450, y || 140);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 40, x || 450).addTrebleGlyph().
    setContext(ctx).draw();

  return {context: ctx, stave: stave};
}

function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

Vex.Flow.Test.AutoBeamFormatting.simpleAuto = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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

  ok(true, "Auto Beaming Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.evenGroupStemDirections = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["a/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["f/4"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["e/4"], duration: "8"}),
    newNote({ keys: ["e/5"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  // Takes a voice and returns it's auto beamsj
  var beams = Vex.Flow.Beam.applyAndGetBeams(voice);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  var UP = Vex.Flow.Stem.UP;
  var DOWN = Vex.Flow.Stem.DOWN;

  equal(beams[0].stem_direction, UP);
  equal(beams[1].stem_direction, UP);
  equal(beams[2].stem_direction, UP);
  equal(beams[3].stem_direction, UP);
  equal(beams[4].stem_direction, DOWN);
  equal(beams[5].stem_direction, DOWN);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  ok(true, "Auto Beaming Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.oddGroupStemDirections = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["f/4"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["e/4"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"}),
    newNote({ keys: ["d/5"], duration: "8"}),
    newNote({ keys: ["a/4"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["a/4"], duration: "8"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var groups = [
    new Vex.Flow.Fraction(3, 8)
  ];

  // Takes a voice and returns it's auto beamsj
  var beams = Vex.Flow.Beam.applyAndGetBeams(voice, null, groups);

  var UP = Vex.Flow.Stem.UP;
  var DOWN = Vex.Flow.Stem.DOWN;

  equal(beams[0].stem_direction, DOWN, "Notes are equa-distant from middle line");
  equal(beams[1].stem_direction, DOWN);
  equal(beams[2].stem_direction, UP);
  equal(beams[3].stem_direction, DOWN, "Notes are equadistant from middle line");

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });

  ok(true, "Auto Beaming Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.oddBeamGroups = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16r"}),
    newNote({ keys: ["c/5"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
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

Vex.Flow.Test.AutoBeamFormatting.breakBeamsOnRests = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["g/4", "e/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["a/4"], duration: "32"}),
    newNote({ keys: ["a/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: false
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}
Vex.Flow.Test.AutoBeamFormatting.beamAcrossAllRestsWithStemlets = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["g/4", "e/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["a/4"], duration: "32"}),
    newNote({ keys: ["a/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: true,
    show_stemlets: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.beamAcrossAllRests = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["g/4", "e/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["a/4"], duration: "32"}),
    newNote({ keys: ["a/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}
Vex.Flow.Test.AutoBeamFormatting.beamAcrossMiddleRests = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["g/4", "e/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["a/4"], duration: "32"}),
    newNote({ keys: ["a/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: true,
    beam_middle_only: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.breakBeamsOnRests = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

  var notes = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["c/4", "e/4", "g/4"], duration: "16"}),
    newNote({ keys: ["d/4"], duration: "16"}),
    newNote({ keys: ["a/5"], duration: "16"}),
    newNote({ keys: ["c/4"], duration: "16"}),
    newNote({ keys: ["g/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["g/4", "e/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["b/4"], duration: "32r"}),
    newNote({ keys: ["a/4"], duration: "32"}),
    newNote({ keys: ["a/4"], duration: "16r"}),
    newNote({ keys: ["a/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: false
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.maintainStemDirections = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 450, 200);

  var notes = [
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: false,
    maintain_stem_directions: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.maintainStemDirectionsBeamAcrossRests = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 450, 200);

  var notes = [
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "32", stem_direction: -1}),
    newNote({ keys: ["b/4"], duration: "32"}),
    newNote({ keys: ["b/4"], duration: "16r"}),
    newNote({ keys: ["b/4"], duration: "16"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    beam_rests: true,
    maintain_stem_directions: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.groupWithUnbeamableNote = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 450, 200);

  c.stave.addTimeSignature('2/2');

  c.context.clear();
  c.stave.draw();

  var notes = [
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "16", stem_direction: 1}),
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    groups: [new Vex.Flow.Fraction(2, 2)],
    beam_rests: false,
    maintain_stem_directions: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.groupWithUnbeamableNote1 = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options, 450, 200);

  c.stave.addTimeSignature('6/8');

  c.context.clear();
  c.stave.draw();

  var notes = [
    newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "4", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "8", stem_direction: 1}),
    newNote({ keys: ["b/4"], duration: "8", stem_direction: 1})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes, {
    groups: [new Vex.Flow.Fraction(3, 8)],
    beam_rests: false,
    maintain_stem_directions: true
  });

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    formatToStave([voice], c.stave);

  voice.draw(c.context, c.stave);

  beams.forEach(function(beam){
    beam.setContext(c.context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.autoOddBeamGroups = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;

  var context = new options.contextBuilder(options.canvas_sel, 450, 400);

  context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

  var stave1 = new Vex.Flow.Stave(10, 10, 450).addTrebleGlyph().
    setContext(context);
  stave1.addTimeSignature('5/4');

  var stave2 = new Vex.Flow.Stave(10, 150, 450).addTrebleGlyph().
    setContext(context);
  stave2.addTimeSignature('5/8');

  var stave3 = new Vex.Flow.Stave(10, 290, 450).addTrebleGlyph().
    setContext(context);
  stave3.addTimeSignature('13/16');

  var notes1 = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["d/4"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"})
  ];

  var notes2 = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"})
  ];

  var notes3 = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"})
  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice1.addTickables(notes1);

  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice2.addTickables(notes2);

  var voice3 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice3.addTickables(notes3);

  stave1.draw();
  stave2.draw();
  stave3.draw();

  var groups1316 = [
    new Vex.Flow.Fraction(3, 16),
    new Vex.Flow.Fraction(2, 16)
  ];

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice1, undefined, Vex.Flow.Beam.getDefaultBeamGroups('5/4'));
  var beams2 = Vex.Flow.Beam.applyAndGetBeams(voice2, undefined, Vex.Flow.Beam.getDefaultBeamGroups('5/8'));
  var beams3 = Vex.Flow.Beam.applyAndGetBeams(voice3, undefined, Vex.Flow.Beam.getDefaultBeamGroups('13/16'));

  var formatter1 = new Vex.Flow.Formatter().
    formatToStave([voice1], stave1).
    formatToStave([voice2], stave2).
    formatToStave([voice3], stave3);

  voice1.draw(context, stave1);
  voice2.draw(context, stave2);
  voice3.draw(context, stave3);

  beams.forEach(function(beam){
    beam.setContext(context).draw();
  });

  beams2.forEach(function(beam){
    beam.setContext(context).draw();
  });

  beams3.forEach(function(beam){
    beam.setContext(context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
};

Vex.Flow.Test.AutoBeamFormatting.customBeamGroups = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;

  var context = new options.contextBuilder(options.canvas_sel, 450, 400);

  context.scale(0.9, 0.9); context.fillStyle = "#221"; context.strokeStyle = "#221";

  var stave1 = new Vex.Flow.Stave(10, 10, 450).addTrebleGlyph().
    setContext(context);
  stave1.addTimeSignature('5/4');

  var stave2 = new Vex.Flow.Stave(10, 150, 450).addTrebleGlyph().
    setContext(context);
  stave2.addTimeSignature('5/8');

  var stave3 = new Vex.Flow.Stave(10, 290, 450).addTrebleGlyph().
    setContext(context);
  stave3.addTimeSignature('13/16');

  var notes1 = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["d/4"], duration: "8"}),
    newNote({ keys: ["a/5"], duration: "8"}),
    newNote({ keys: ["c/4"], duration: "8"}),
    newNote({ keys: ["g/4"], duration: "8"})
  ];

  var notes2 = [
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["g/5"], duration: "8"}),
    newNote({ keys: ["c/5"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"}),
    newNote({ keys: ["b/4"], duration: "8"})
  ];

  var notes3 = [
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["g/5"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["c/5"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"}),
    newNote({ keys: ["b/4"], duration: "16"})
  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice1.addTickables(notes1);

  var voice2 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice2.addTickables(notes2);

  var voice3 = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4)
    .setMode(Vex.Flow.Voice.Mode.SOFT);
  voice3.addTickables(notes3);

  stave1.draw();
  stave2.draw();
  stave3.draw();

  var group1 = [
    new Vex.Flow.Fraction(5, 8)
  ];

  var group2 = [
    new Vex.Flow.Fraction(3, 8),
    new Vex.Flow.Fraction(2, 8)
  ];

  var group3 = [
    new Vex.Flow.Fraction(7, 16),
    new Vex.Flow.Fraction(2, 16),
    new Vex.Flow.Fraction(4, 16)
  ];

  var beams = Vex.Flow.Beam.applyAndGetBeams(voice1, undefined, group1);
  var beams2 = Vex.Flow.Beam.applyAndGetBeams(voice2, undefined, group2);
  var beams3 = Vex.Flow.Beam.applyAndGetBeams(voice3, undefined, group3);

  var formatter1 = new Vex.Flow.Formatter().
    formatToStave([voice1], stave1).
    formatToStave([voice2], stave2).
    formatToStave([voice3], stave3);

  voice1.draw(context, stave1);
  voice2.draw(context, stave2);
  voice3.draw(context, stave3);

  beams.forEach(function(beam){
    beam.setContext(context).draw();
  });

  beams2.forEach(function(beam){
    beam.setContext(context).draw();
  });

  beams3.forEach(function(beam){
    beam.setContext(context).draw();
  });
  ok(true, "Auto Beam Applicator Test");
}

Vex.Flow.Test.AutoBeamFormatting.simpleTuplets = function(options, contextBuilder) {
  options.contextBuilder = contextBuilder;
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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
  var c = Vex.Flow.Test.AutoBeamFormatting.setupContext(options);

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
