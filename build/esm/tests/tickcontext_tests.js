import { VexFlowTests } from './vexflow_test_helpers.js';
import { Flow } from '../src/flow.js';
import { TickContext } from '../src/tickcontext.js';
import { MockTickable } from './mocks.js';
const TickContextTests = {
    Start() {
        QUnit.module('TickContext');
        test('Current Tick Test', currentTick);
        test('Tracking Test', tracking);
    },
};
function currentTick() {
    const tc = new TickContext();
    equal(tc.getCurrentTick().value(), 0, 'New tick context has no ticks');
}
function tracking() {
    const BEAT = (1 * Flow.RESOLUTION) / 4;
    const tickables = [
        new MockTickable().setTicks(BEAT).setWidth(10),
        new MockTickable().setTicks(BEAT * 2).setWidth(20),
        new MockTickable().setTicks(BEAT).setWidth(30),
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
}
VexFlowTests.register(TickContextTests);
export { TickContextTests };
