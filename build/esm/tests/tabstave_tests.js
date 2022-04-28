import { VexFlowTests } from './vexflow_test_helpers.js';
import { TabStave } from '../src/tabstave.js';
const TabStaveTests = {
    Start() {
        QUnit.module('TabStave');
        const run = VexFlowTests.runTests;
        run('TabStave Draw Test', draw);
    },
};
function draw(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 160);
    const stave = new TabStave(10, 10, 300);
    stave.setNumLines(6);
    stave.setContext(ctx);
    stave.draw();
    equal(stave.getYForNote(0), 127, 'getYForNote(0)');
    equal(stave.getYForLine(5), 127, 'getYForLine(5)');
    equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
    equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');
    ok(true, 'all pass');
}
VexFlowTests.register(TabStaveTests);
export { TabStaveTests };
