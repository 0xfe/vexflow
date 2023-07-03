import { VexFlowTests } from './vexflow_test_helpers.js';
import { Flow } from '../src/flow.js';
import { Formatter } from '../src/formatter.js';
import { Stave } from '../src/stave.js';
import { Barline } from '../src/stavebarline.js';
import { StaveNote } from '../src/stavenote.js';
import { Voice } from '../src/voice.js';
import { MockTickable } from './mocks.js';
const VoiceTests = {
    Start() {
        QUnit.module('Voice');
        QUnit.test('Strict Test', strict);
        QUnit.test('Ignore Test', ignore);
        VexFlowTests.runTests('Full Voice Mode Test', full);
    },
};
const BEAT = (1 * Flow.RESOLUTION) / 4;
const createTickable = () => new MockTickable().setTicks(BEAT);
function strict(assert) {
    assert.expect(8);
    const tickables = [createTickable(), createTickable(), createTickable()];
    const voice = new Voice(Flow.TIME4_4);
    assert.equal(voice.getTotalTicks().value(), BEAT * 4, '4/4 Voice has 4 beats');
    assert.equal(voice.getTicksUsed().value(), BEAT * 0, 'No beats in voice');
    voice.addTickables(tickables);
    assert.equal(voice.getTicksUsed().value(), BEAT * 3, 'Three beats in voice');
    voice.addTickable(createTickable());
    assert.equal(voice.getTicksUsed().value(), BEAT * 4, 'Four beats in voice');
    assert.equal(voice.isComplete(), true, 'Voice is complete');
    const numeratorBeforeException = voice.getTicksUsed().numerator;
    assert.throws(() => voice.addTickable(createTickable()), /BadArgument/, '"Too many ticks" exception');
    assert.equal(voice.getTicksUsed().numerator, numeratorBeforeException, 'Revert `ticksUsed` after a "Too many ticks" exception');
    assert.equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
}
function ignore(assert) {
    const tickables = [
        createTickable(),
        createTickable(),
        createTickable().setIgnoreTicks(true),
        createTickable(),
        createTickable().setIgnoreTicks(true),
        createTickable(),
    ];
    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(tickables);
    assert.ok(true, 'all pass');
}
function full(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 550, 200);
    const stave = new Stave(10, 50, 500).addClef('treble').addTimeSignature('4/4').setEndBarType(Barline.type.END);
    const notes = [
        new StaveNote({ keys: ['c/4'], duration: '4' }),
        new StaveNote({ keys: ['d/4'], duration: '4' }),
        new StaveNote({ keys: ['r/4'], duration: '4r' }),
    ];
    notes.forEach((note) => note.setStave(stave));
    const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.FULL).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    stave.setContext(ctx).draw();
    voice.draw(ctx);
    const bb = voice.getBoundingBox();
    if (bb) {
        ctx.rect(bb.getX(), bb.getY(), bb.getW(), bb.getH());
    }
    ctx.stroke();
    options.assert.throws(() => voice.addTickable(new StaveNote({ keys: ['c/4'], duration: '2' })), /BadArgument/, 'Voice cannot exceed full amount of ticks');
}
VexFlowTests.register(VoiceTests);
export { VoiceTests };
