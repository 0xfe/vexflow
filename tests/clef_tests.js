// VexFlow - Basic Tests

Vex.Flow.Test.Clef = {}

Vex.Flow.Test.Clef.Start = function() {
  module("Clef");
  Vex.Flow.Test.runTest("Clef Test", Vex.Flow.Test.Clef.draw);
  Vex.Flow.Test.runRaphaelTest("Clef Test (Raphael)", 
      Vex.Flow.Test.Clef.draw);
  Vex.Flow.Test.runTest("Small Clef Test", Vex.Flow.Test.Clef.drawSmall);
  Vex.Flow.Test.runTest("Small Clef Test (Raphael)",
      Vex.Flow.Test.Clef.drawSmall);
}

Vex.Flow.Test.Clef.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);
  var stave = new Vex.Flow.Stave(10, 10, 300);

  stave.addClef("treble");
  stave.addClef("alto");
  stave.addClef("tenor");
  stave.addClef("bass");

  stave.addEndClef("treble");
  stave.addEndClef("alto");
  stave.addEndClef("tenor");
  stave.addEndClef("bass");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}

Vex.Flow.Test.Clef.drawSmall = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);
  var stave = new Vex.Flow.Stave(10, 10, 300);

  stave.addClef("treble_small");
  stave.addClef("alto_small");
  stave.addClef("tenor_small");
  stave.addClef("bass_small");

  stave.addEndClef("treble_small");
  stave.addEndClef("alto_small");
  stave.addEndClef("tenor_small");
  stave.addEndClef("bass_small");

  stave.setContext(ctx);
  stave.draw();

  ok(true, "all pass");
}

