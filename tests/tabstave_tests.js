/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabStave = {}

Vex.Flow.Test.TabStave.Start = function() {
  module("TabStave");
  Vex.Flow.Test.runRaphaelTest("TabStave Draw Test (Raphael)",
      Vex.Flow.Test.TabStave.draw);
  Vex.Flow.Test.runRaphaelTest("Vertical Bar Test (Raphael)",
      Vex.Flow.Test.TabStave.drawVerticalBar);
  Vex.Flow.Test.runTest("TabStave Draw Test", Vex.Flow.Test.TabStave.draw);
  Vex.Flow.Test.runTest("Vertical Bar Test",
      Vex.Flow.Test.TabStave.drawVerticalBar);
}

Vex.Flow.Test.TabStave.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel,
      400, 160);

  var stave = new Vex.Flow.TabStave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  equals(stave.getYForNote(0), 127, "getYForNote(0)");
  equals(stave.getYForLine(5), 127, "getYForLine(5)");
  equals(stave.getYForLine(0), 62, "getYForLine(0) - Top Line");
  equals(stave.getYForLine(4), 114, "getYForLine(4) - Bottom Line");

  ok(true, "all pass");
}

Vex.Flow.Test.TabStave.drawVerticalBar = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel,
      400, 160);

  var stave = new Vex.Flow.TabStave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();
  stave.drawVerticalBar(100);
  stave.drawVerticalBar(150);
  stave.drawVerticalBar(300);

  ok(true, "all pass");
}
