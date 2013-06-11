/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.TickContext = {}

Vex.Flow.Test.TickContext.Start = function() {
  module("TickContext");
  test("Current Tick Test", Vex.Flow.Test.TickContext.currentTick);
  test("Tracking Test", Vex.Flow.Test.TickContext.tracking);
}

Vex.Flow.Test.TickContext.currentTick = function() {
  var tc = new Vex.Flow.TickContext();
  equal(tc.getCurrentTick().value(), 0, "New tick context has no ticks");
}

Vex.Flow.Test.TickContext.tracking = function() {
  function createTickable() {
    return new Vex.Flow.Test.MockTickable(Vex.Flow.Test.TIME4_4);
  }

  var R = Vex.Flow.RESOLUTION;
  var BEAT = 1 * R / 4;

  var tickables = [
    createTickable().setTicks(BEAT).setWidth(10),
    createTickable().setTicks(BEAT * 2).setWidth(20),
    createTickable().setTicks(BEAT).setWidth(30)
  ];

  var tc = new Vex.Flow.TickContext();
  tc.setPadding(0);

  tc.addTickable(tickables[0]);
  equal(tc.getMaxTicks().value(), BEAT);

  tc.addTickable(tickables[1]);
  equal(tc.getMaxTicks().value(), BEAT * 2);

  tc.addTickable(tickables[2]);
  equal(tc.getMaxTicks().value(), BEAT * 2);

  equal(tc.getWidth(), 0);
  tc.preFormat();
  equal(tc.getWidth(), 30);
}
