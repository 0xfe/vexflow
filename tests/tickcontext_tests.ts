// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { Flow } from 'flow';
import { QUnit, test, equal } from './declarations';
import { TickContext } from 'tickcontext';
import { MockTickable } from './mocks';

/**
 * TickContext Tests
 */
const TickContextTests = {
  Start() {
    QUnit.module('TickContext');
    test('Current Tick Test', this.currentTick);
    test('Tracking Test', this.tracking);
  },

  currentTick() {
    const tc = new VF.TickContext();
    equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
  },

  tracking() {
    function createTickable() {
      return new MockTickable(Flow.TIME4_4);
    }

    const R = Flow.RESOLUTION;
    const BEAT = (1 * R) / 4;

    const tickables = [
      createTickable().setTicks(BEAT).setWidth(10),
      createTickable()
        .setTicks(BEAT * 2)
        .setWidth(20),
      createTickable().setTicks(BEAT).setWidth(30),
    ];

    const tc = new TickContext();
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
