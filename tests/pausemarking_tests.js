Vex.Flow.Test.PauseMarking = {};

Vex.Flow.Test.PauseMarking.Start = function() {
  module("PauseMarking");
  Vex.Flow.Test.runTest("All Types", Vex.Flow.Test.PauseMarking.basic);
  Vex.Flow.Test.runTest("Custom Placement", Vex.Flow.Test.PauseMarking.customLinePlacement);
  Vex.Flow.Test.runTest("With Fermata", Vex.Flow.Test.PauseMarking.withFermata);
  Vex.Flow.Test.runTest("With Fermata Weird Placement", Vex.Flow.Test.PauseMarking.withFermataWeird);
};

Vex.Flow.Test.PauseMarking.basic = function(options, contextBuilder) {
  expect(0);

  var ctx = new contextBuilder(options.canvas_sel, 600, 140);
  ctx.scale(1, 1);
  ctx.fillStyle = "#221";
  ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, 550).addTrebleGlyph();
  stave.setContext(ctx).draw();

  var notes = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("tracks_straight"),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_curved"),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("comma"),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("tick"),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes);
  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(ctx, stave);
  
  beams.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });
};

Vex.Flow.Test.PauseMarking.customLinePlacement = function(options, contextBuilder) {
  expect(0);

  var ctx = new contextBuilder(options.canvas_sel, 600, 140);
  ctx.scale(1, 1);
  ctx.fillStyle = "#221";
  ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave = new Vex.Flow.Stave(10, 10, 550).addTrebleGlyph();
  stave.setContext(ctx).draw();

  var notes = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("tracks_straight").setLine(-2),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_curved").setLine(-2),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("comma").setLine(-1),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.PauseMarking("tick").setLine(-1),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"})
  ];

  var voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice.addTickables(notes);

  var beams = Vex.Flow.Beam.generateBeams(notes);
  new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(ctx, stave);
  
  beams.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });
};

Vex.Flow.Test.PauseMarking.withFermata = function(options, contextBuilder) {
  expect(0);

  var ctx = new contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1);
  ctx.fillStyle = "#221";
  ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave0 = new Vex.Flow.Stave(10, 40, 250).addTrebleGlyph();
  stave0.setContext(ctx).draw();

  var stave1 = new Vex.Flow.Stave(260, 40, 250);
  stave1.setContext(ctx).draw();

  var notes0 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_straight").setLine(-1.5).addModifier(new Vex.Flow.Articulation('a@a').setPosition(3), 0),
  ];

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var beams0 = Vex.Flow.Beam.generateBeams(notes0);
  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

  voice0.draw(ctx, stave0);
  
  beams0.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });

  var notes1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_curved").setLine(5.5).addModifier(new Vex.Flow.Articulation('a@u').setPosition(4), 0),
  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice1.addTickables(notes1);

  var beams1 = Vex.Flow.Beam.generateBeams(notes1);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  voice1.draw(ctx, stave1);
  
  beams1.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });
};

Vex.Flow.Test.PauseMarking.withFermataWeird = function(options, contextBuilder) {
  expect(0);

  var ctx = new contextBuilder(options.canvas_sel, 550, 200);
  ctx.scale(1, 1);
  ctx.fillStyle = "#221";
  ctx.strokeStyle = "#221";
  ctx.font = " 10pt Arial";
  var stave0 = new Vex.Flow.Stave(10, 40, 250).addTrebleGlyph();
  stave0.setContext(ctx).draw();

  var stave1 = new Vex.Flow.Stave(260, 40, 250);
  stave1.setContext(ctx).draw();

  var notes0 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_straight").setLine(1).addModifier(new Vex.Flow.Articulation('a@a').setPosition(3), 0),
  ];

  var voice0 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice0.addTickables(notes0);

  var beams0 = Vex.Flow.Beam.generateBeams(notes0);
  new Vex.Flow.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);

  voice0.draw(ctx, stave0);
  
  beams0.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });

  var notes1 = [
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "4"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "16"}),
    new Vex.Flow.StaveNote({ keys: ["b/4"], duration: "8"}),
    new Vex.Flow.PauseMarking("tracks_curved").setLine(3).addModifier(new Vex.Flow.Articulation('a@u').setPosition(4), 0),
  ];

  var voice1 = new Vex.Flow.Voice(Vex.Flow.TIME4_4).setStrict(false);
  voice1.addTickables(notes1);

  var beams1 = Vex.Flow.Beam.generateBeams(notes1);
  new Vex.Flow.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  voice1.draw(ctx, stave1);
  
  beams1.forEach(function(beam) {
    beam.setContext(ctx).draw();
  });
};