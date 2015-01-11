// VexFlow - Basic Tests

Vex.Flow.Test.Clef = {}

Vex.Flow.Test.Clef.Start = function() {
  module("Clef");
  Vex.Flow.Test.runTests("Clef Test", Vex.Flow.Test.Clef.draw);
  Vex.Flow.Test.runTests("Clef End Test", Vex.Flow.Test.Clef.drawEnd);
  Vex.Flow.Test.runTests("Small Clef Test", Vex.Flow.Test.Clef.drawSmall);
  Vex.Flow.Test.runTests("Small Clef End Test", Vex.Flow.Test.Clef.drawSmallEnd);
  Vex.Flow.Test.runTests("Clef Change Test", Vex.Flow.Test.Clef.drawClefChange);
  
}

Vex.Flow.Test.Clef.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);

  stave.addClef("treble");
  stave.addClef("treble", "default", "8va");
  stave.addClef("treble", "default", "8vb");
  stave.addClef("alto");
  stave.addClef("tenor");
  stave.addClef("soprano");
  stave.addClef("bass");
  stave.addClef("bass", "default", "8vb");
  stave.addClef("mezzo-soprano");
  stave.addClef("baritone-c");
  stave.addClef("baritone-f");
  stave.addClef("subbass");
  stave.addClef("percussion");
  stave.addClef("french");

  stave.addEndClef("treble");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.Clef.drawEnd = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);

  stave.addClef("bass");

  stave.addEndClef("treble");
  stave.addEndClef("treble", "default", "8va");
  stave.addEndClef("treble", "default", "8vb");
  stave.addEndClef("alto");
  stave.addEndClef("tenor");   
  stave.addEndClef("soprano"); 
  stave.addEndClef("bass");
  stave.addEndClef("bass", "default", "8vb");
  stave.addEndClef("mezzo-soprano");
  stave.addEndClef("baritone-c");
  stave.addEndClef("baritone-f");
  stave.addEndClef("subbass");
  stave.addEndClef("percussion");
  stave.addEndClef("french");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}


Vex.Flow.Test.Clef.drawSmall = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);

  stave.addClef("treble", "small");
  stave.addClef("treble", "small", "8va");
  stave.addClef("treble", "small", "8vb");
  stave.addClef("alto", "small");
  stave.addClef("tenor", "small");
  stave.addClef("soprano", "small");
  stave.addClef("bass", "small");
  stave.addClef("bass", "small", "8vb");
  stave.addClef("mezzo-soprano", "small");
  stave.addClef("baritone-c", "small");
  stave.addClef("baritone-f", "small");
  stave.addClef("subbass", "small");
  stave.addClef("percussion", "small");
  stave.addClef("french", "small");

  stave.addEndClef("treble", "small");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}
Vex.Flow.Test.Clef.drawSmallEnd = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 120);
  var stave = new Vex.Flow.Stave(10, 10, 700);
    
  stave.addClef("bass", "small");
    
  stave.addEndClef("treble", "small");
  stave.addEndClef("treble", "small", "8va");
  stave.addEndClef("treble", "small", "8vb");
  stave.addEndClef("alto", "small");
  stave.addEndClef("tenor", "small");
  stave.addEndClef("soprano", "small");
  stave.addEndClef("bass", "small");
  stave.addEndClef("bass", "small", "8vb");
  stave.addEndClef("mezzo-soprano", "small");
  stave.addEndClef("baritone-c", "small");
  stave.addEndClef("baritone-f", "small");
  stave.addEndClef("subbass", "small");
  stave.addEndClef("percussion", "small");
  stave.addEndClef("french", "small");
    
  stave.setContext(ctx);
  stave.draw();
    
  ok(true, "all pass");
}


Vex.Flow.Test.Clef.drawClefChange = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 800, 180);
  var stave = new Vex.Flow.Stave(10, 10, 700);
  stave.addClef("treble").setContext(ctx).draw();

  var notes = [
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
    new Vex.Flow.ClefNote("alto", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "alto" }),
    new Vex.Flow.ClefNote("tenor", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "tenor" }),
    new Vex.Flow.ClefNote("soprano", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "soprano" }),
    new Vex.Flow.ClefNote("bass", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "bass" }),
    new Vex.Flow.ClefNote("mezzo-soprano", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "mezzo-soprano" }),
    new Vex.Flow.ClefNote("baritone-c","small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-c" }),
    new Vex.Flow.ClefNote("baritone-f", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-f" }),
    new Vex.Flow.ClefNote("subbass", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "subbass" }),
    new Vex.Flow.ClefNote("french", "small"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "french" }),
    new Vex.Flow.ClefNote("treble", "small", "8vb"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: -1}),
    new Vex.Flow.ClefNote("treble", "small", "8va"),
    new Vex.Flow.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: 1 })
  ];

  var voice = new Vex.Flow.Voice({
    num_beats: 12,
    beat_value: 4,
    resolution: Vex.Flow.RESOLUTION
  });

  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().
    joinVoices([voice]).format([voice], 500);

  voice.draw(ctx, stave);
  ok(true, "all pass");
}

