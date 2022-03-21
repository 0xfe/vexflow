import { VexFlowTests } from './vexflow_test_helpers.js';
import { Stave } from '../src/stave.js';
import { BarlineType } from '../src/stavebarline.js';
import { StaveModifierPosition } from '../src/stavemodifier.js';
const StaveModifierTests = {
    Start() {
        QUnit.module('StaveModifier');
        const run = VexFlowTests.runTests;
        run('Stave Draw Test', draw);
        run('Begin & End StaveModifier Test', drawBeginAndEnd);
    },
};
function draw(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    const stave = new Stave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();
    equal(stave.getYForNote(0), 100, 'getYForNote(0)');
    equal(stave.getYForLine(5), 100, 'getYForLine(5)');
    equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
    equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');
    ok(true, 'all pass');
}
function drawBeginAndEnd(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    const stave = new Stave(10, 10, 400);
    stave.setContext(ctx);
    stave.setTimeSignature('C|');
    stave.setKeySignature('Db');
    stave.setClef('treble');
    stave.setBegBarType(BarlineType.REPEAT_BEGIN);
    stave.setEndClef('alto');
    stave.setEndTimeSignature('9/8');
    stave.setEndKeySignature('G', 'C#');
    stave.setEndBarType(BarlineType.DOUBLE);
    stave.draw();
    const END = StaveModifierPosition.END;
    stave.setY(100);
    stave.setTimeSignature('3/4');
    stave.setKeySignature('G', 'C#');
    stave.setClef('bass');
    stave.setBegBarType(BarlineType.SINGLE);
    stave.setClef('treble', undefined, undefined, END);
    stave.setTimeSignature('C', undefined, END);
    stave.setKeySignature('F', undefined, END);
    stave.setEndBarType(BarlineType.SINGLE);
    stave.draw();
    ok(true, 'all pass');
}
VexFlowTests.register(StaveModifierTests);
export { StaveModifierTests };
