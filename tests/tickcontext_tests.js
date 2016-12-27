/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TickContext = (function() {
  var TickContext = {
    Start: function() {
      QUnit.module('TickContext');
      test('Current Tick Test', VF.Test.TickContext.currentTick);
      test('Tracking Test', VF.Test.TickContext.tracking);
    },

    currentTick: function() {
      var tc = new VF.TickContext();
      equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
    },

    tracking: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT).setWidth(10),
        createTickable().setTicks(BEAT * 2).setWidth(20),
        createTickable().setTicks(BEAT).setWidth(30),
      ];

      var tc = new VF.TickContext();
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
    },
  };

  return TickContext;
})();
