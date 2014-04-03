// VexFlow - Basic Tests

Vex.Flow.Test.Clef = {}

Vex.Flow.Test.Clef.Start = function() {
  module("Clef");
  Vex.Flow.Test.runTest("Clef Test", Vex.Flow.Test.Clef.draw);
  Vex.Flow.Test.runRaphaelTest("Clef Test (Raphael)", 
      Vex.Flow.Test.Clef.draw);
  Vex.Flow.Test.runTest("Small Clef Test", Vex.Flow.Test.Clef.drawSmall);
  Vex.Flow.Test.runRaphaelTest("Small Clef Test (Raphael)",
      Vex.Flow.Test.Clef.drawSmall);
  Vex.Flow.Test.runTest("Clef Change Test", Vex.Flow.Test.Clef.drawClefChange);
  Vex.Flow.Test.runRaphaelTest("Clef Change Test (Raphael)", Vex.Flow.Test.Clef.drawClefChange);
}

Vex.Flow.Test.Clef.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);

  stave.addClef("treble");
  stave.addClef("alto");
  stave.addClef("tenor");
  stave.addClef("soprano");
  stave.addClef("bass");
  stave.addClef("mezzo-soprano");
  stave.addClef("baritone-c");
  stave.addClef("baritone-f");
  stave.addClef("subbass");
  stave.addClef("french");

  stave.addEndClef("treble");
  stave.addEndClef("alto");
  stave.addEndClef("tenor");
  stave.addEndClef("soprano");
  stave.addEndClef("bass");
  stave.addEndClef("mezzo-soprano");
  stave.addEndClef("baritone-c");
  stave.addEndClef("baritone-f");
  stave.addEndClef("subbass");
  stave.addEndClef("french");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.Clef.drawSmall = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);

  stave.addClef("treble_small");
  stave.addClef("alto_small");
  stave.addClef("tenor_small");
  stave.addClef("soprano_small");
  stave.addClef("bass_small");
  stave.addClef("mezzo-soprano_small");
  stave.addClef("baritone-c_small");
  stave.addClef("baritone-f_small");
  stave.addClef("subbass_small");
  stave.addClef("french_small");

  stave.addEndClef("treble_small");
  stave.addEndClef("alto_small");
  stave.addEndClef("tenor_small");
  stave.addEndClef("soprano_small");
  stave.addEndClef("bass_small");
  stave.addEndClef("mezzo-soprano_small");
  stave.addEndClef("baritone-c_small");
  stave.addEndClef("baritone-f_small");
  stave.addEndClef("subbass_small");
  stave.addEndClef("french_small");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.Clef.drawClefChange = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);
  stave.addClef("treble").setContext(ctx).draw();

  var notes = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
    new Vex.Flow.ClefNote("alto_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "alto" }),
    new Vex.Flow.ClefNote("tenor_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "tenor" }),
    new Vex.Flow.ClefNote("soprano_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "soprano" }),
    new Vex.Flow.ClefNote("bass_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "bass" }),
    new Vex.Flow.ClefNote("mezzo-soprano_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "mezzo-soprano" }),
    new Vex.Flow.ClefNote("baritone-c_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-c" }),
    new Vex.Flow.ClefNote("baritone-f_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-f" }),
    new Vex.Flow.ClefNote("subbass_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "subbass" }),
    new Vex.Flow.ClefNote("french_small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "french" })
  ];

  var voice = new Vex.Flow.Voice({
    num_beats: 10,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  });

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

  voice.draw(ctx, stave);
  ok(true, "all pass");
}

