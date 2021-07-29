/**
 * VexFlow - TickContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
import { Flow } from 'flow';
import { MockTickable } from './mocks';

const TickContextTests = {
  Start() {
    QUnit.module('TickContext');
    test('Current Tick Test', this.currentTick);
    test('Tracking Test', this.tracking);
  },

  currentTick() {
    var tc = new VF.TickContext();
    equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
  },

  tracking() {
    function createTickable() {
      return new MockTickable(VF.TIME4_4);
    }

    var R = Flow.RESOLUTION;
    var BEAT = (1 * R) / 4;

    var tickables = [
      createTickable().setTicks(BEAT).setWidth(10),
      createTickable()
        .setTicks(BEAT * 2)
        .setWidth(20),
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

export { TickContextTests };
