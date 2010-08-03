/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Stave = {}

Vex.Flow.Test.Stave.Start = function() {
  module("Stave");
  Vex.Flow.Test.runTest("Stave Draw Test (Canvas)", Vex.Flow.Test.Stave.draw);
  Vex.Flow.Test.runTest("Vertical Bar Test (Canvas)",
      Vex.Flow.Test.Stave.drawVerticalBar);
  Vex.Flow.Test.runRaphaelTest("Stave Draw Test (Raphael)",
      Vex.Flow.Test.Stave.draw);
  Vex.Flow.Test.runRaphaelTest("Vertical Bar Test (Raphael)",
      Vex.Flow.Test.Stave.drawVerticalBar);
}

Vex.Flow.Test.Stave.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);
  var stave = new Vex.Flow.Stave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  equals(stave.getYForNote(0), 100, "getYForNote(0)");
  equals(stave.getYForLine(5), 100, "getYForLine(5)");
  equals(stave.getYForLine(0), 50, "getYForLine(0) - Top Line");
  equals(stave.getYForLine(4), 90, "getYForLine(4) - Bottom Line");

  ok(true, "all pass");
}

Vex.Flow.Test.Stave.drawVerticalBar = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 400, 120);
  var stave = new Vex.Flow.Stave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();
  stave.drawVerticalBar(100);
  stave.drawVerticalBar(150);
  stave.drawVerticalBar(300);

  ok(true, "all pass");
}
