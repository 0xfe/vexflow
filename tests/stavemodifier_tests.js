// VexFlow - Basic Tests

Vex.Flow.Test.StaveModifier = {}

Vex.Flow.Test.StaveModifier.Start = function() {
  module("StaveModifier");
  Vex.Flow.Test.runTests("Stave Draw Test", Vex.Flow.Test.Stave.draw);
  Vex.Flow.Test.runTests("Vertical Bar Test",
      Vex.Flow.Test.Stave.drawVerticalBar);
  
  
}

Vex.Flow.Test.Stave.draw = function(options, contextBuilder) {
  var ctx = new contextBuilder(options.canvas_sel, 400, 120);
  var stave = new Vex.Flow.Stave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  equal(stave.getYForNote(0), 100, "getYForNote(0)");
  equal(stave.getYForLine(5), 100, "getYForLine(5)");
  equal(stave.getYForLine(0), 50, "getYForLine(0) - Top Line");
  equal(stave.getYForLine(4), 90, "getYForLine(4) - Bottom Line");

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
