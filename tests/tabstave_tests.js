/**
 * VexFlow - Basic Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TabStave = {}

Vex.Flow.Test.TabStave.Start = function() {
  module("TabStave");
  
  
  Vex.Flow.Test.runTests("TabStave Draw Test", Vex.Flow.Test.TabStave.draw);
  Vex.Flow.Test.runTests("Vertical Bar Test",
      Vex.Flow.Test.TabStave.drawVerticalBar);
}

Vex.Flow.Test.TabStave.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel,
      400, 160);

  var stave = new Vex.Flow.TabStave(10, 10, 300);
  stave.setNumLines(6);
  stave.setContext(ctx);
  stave.draw();

  equal(stave.getYForNote(0), 127, "getYForNote(0)");
  equal(stave.getYForLine(5), 126, "getYForLine(5)");
  equal(stave.getYForLine(0), 61, "getYForLine(0) - Top Line");
  equal(stave.getYForLine(4), 113, "getYForLine(4) - Bottom Line");

  ok(true, "all pass");
}

Vex.Flow.Test.TabStave.drawVerticalBar = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel,
      400, 160);

  var stave = new Vex.Flow.TabStave(10, 10, 300);
  stave.setNumLines(6);
  stave.setContext(ctx);
  stave.drawVerticalBar(50, true);
  stave.drawVerticalBar(100, true);
  stave.drawVerticalBar(150, false);
  stave.setEndBarType(Vex.Flow.Barline.type.END);
  stave.draw();

  ok(true, "all pass");
}
