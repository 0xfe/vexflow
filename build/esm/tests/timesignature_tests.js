import { VexFlowTests } from './vexflow_test_helpers.js';
import { Stave } from '../src/stave.js';
import { StaveConnector } from '../src/staveconnector.js';
import { TimeSignature } from '../src/timesignature.js';
const TimeSignatureTests = {
    Start() {
        QUnit.module('TimeSignature');
        QUnit.test('Time Signature Parser', parser);
        const run = VexFlowTests.runTests;
        run('Basic Time Signatures', basic);
        run('Big Signature Test', big);
        run('Additive Signature Test', additive);
        run('Alternating Signature Test', alternating);
        run('Interchangeable Signature Test', interchangeable);
        run('Aggregate Signature Test', agregate);
        run('Complex Signature Test', complex);
        run('Time Signature multiple staves alignment test', multiple);
        run('Time Signature Change Test', change);
    },
};
function parser(assert) {
    const timeSig = new TimeSignature();
    assert.equal(timeSig.getTimeSpec(), '4/4', 'default time signature is 4/4');
    const mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+', '1+', '+1', '(3+', '+3)', '()', '(+)'];
    mustFail.forEach((invalidString) => {
        assert.throws(() => timeSig.parseTimeSpec(invalidString), /BadTimeSignature/);
    });
    const mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|', '+'];
    mustPass.forEach((validString) => timeSig.parseTimeSpec(validString));
    timeSig.setTimeSig('4/4');
    assert.equal(timeSig.getIsNumeric(), true, '4/4 is numeric');
    assert.equal(timeSig.getLine(), 0, 'digits are on line 0');
    timeSig.setTimeSig('C|');
    assert.equal(timeSig.getTimeSpec(), 'C|', 'timeSpec changed to C|');
    assert.equal(timeSig.getIsNumeric(), false, 'cut time is not numeric');
    assert.equal(timeSig.getLine(), 2, 'cut/common are on line 2');
    assert.ok(true, 'all pass');
}
function basic(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 600, 120);
    new Stave(10, 10, 500)
        .addTimeSignature('2/2')
        .addTimeSignature('3/4')
        .addTimeSignature('4/4')
        .addTimeSignature('6/8')
        .addTimeSignature('C')
        .addTimeSignature('C|')
        .addEndTimeSignature('2/2')
        .addEndTimeSignature('3/4')
        .addEndTimeSignature('4/4')
        .addEndClef('treble')
        .addEndTimeSignature('6/8')
        .addEndTimeSignature('C')
        .addEndTimeSignature('C|')
        .setContext(ctx)
        .draw();
    options.assert.ok(true, 'all pass');
}
function big(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300)
        .addTimeSignature('12/8')
        .addTimeSignature('7/16')
        .addTimeSignature('1234567/890')
        .addTimeSignature('987/654321')
        .setContext(ctx)
        .draw();
    options.assert.ok(true, 'all pass');
}
function additive(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300).addTimeSignature('2+3+2/8').setContext(ctx).draw();
    options.assert.ok(true, 'all pass');
}
function alternating(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300).addTimeSignature('6/8').addTimeSignature('+').addTimeSignature('3/4').setContext(ctx).draw();
    options.assert.ok(true, 'all pass');
}
function interchangeable(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300).addTimeSignature('3/4').addTimeSignature('-').addTimeSignature('2/4').setContext(ctx).draw();
    options.assert.ok(true, 'all pass');
}
function agregate(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300)
        .addTimeSignature('2/4')
        .addTimeSignature('+')
        .addTimeSignature('3/8')
        .addTimeSignature('+')
        .addTimeSignature('5/4')
        .setContext(ctx)
        .draw();
    options.assert.ok(true, 'all pass');
}
function complex(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 120);
    new Stave(10, 10, 300)
        .addTimeSignature('(2+3)/16')
        .addTimeSignature('+')
        .addTimeSignature('3/8')
        .setContext(ctx)
        .draw();
    options.assert.ok(true, 'all pass');
}
function multiple(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 350);
    const stave1LineConfig = [false, false, true, false, false].map((visible) => ({ visible }));
    const stave1 = new Stave(15, 0, 300)
        .setConfigForLines(stave1LineConfig)
        .addClef('percussion')
        .addTimeSignature('4/4', 25)
        .setContext(ctx)
        .draw();
    const stave2 = new Stave(15, 110, 300).addClef('treble').addTimeSignature('4/4').setContext(ctx).draw();
    const stave3 = new Stave(15, 220, 300).addClef('bass').addTimeSignature('4/4').setContext(ctx).draw();
    Stave.formatBegModifiers([stave1, stave2, stave3]);
    new StaveConnector(stave1, stave2).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('single').setContext(ctx).draw();
    new StaveConnector(stave2, stave3).setType('brace').setContext(ctx).draw();
    options.assert.ok(true, 'all pass');
}
function change(options) {
    const f = VexFlowTests.makeFactory(options, 900);
    const stave = f.Stave({ x: 0, y: 0 }).addClef('treble').addTimeSignature('C|');
    const tickables = [
        f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        f.TimeSigNote({ time: '3/4' }),
        f.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
        f.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
        f.TimeSigNote({ time: 'C' }),
        f.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
        f.TimeSigNote({ time: '9/8' }),
        f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
    ];
    const voice = f.Voice().setStrict(false).addTickables(tickables);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'all pass');
}
VexFlowTests.register(TimeSignatureTests);
export { TimeSignatureTests };
