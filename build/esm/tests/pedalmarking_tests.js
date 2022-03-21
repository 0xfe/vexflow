import { VexFlowTests } from './vexflow_test_helpers.js';
const PedalMarkingTests = {
    Start() {
        QUnit.module('PedalMarking');
        const run = VexFlowTests.runTests;
        run('Simple Pedal 1', simple1);
        run('Simple Pedal 2', simple2);
        run('Simple Pedal 3', simple3);
        run('Release and Depress on Same Note 1', releaseDepress1);
        run('Release and Depress on Same Note 2', releaseDepress2);
        run('Custom Text 1', customTest1);
        run('Custom Text 2', customTest2);
    },
};
function createTest(makePedal) {
    return (options) => {
        const f = VexFlowTests.makeFactory(options, 550, 200);
        const score = f.EasyScore();
        const stave0 = f.Stave({ width: 250 }).addClef('treble');
        const voice0 = score.voice(score.notes('b4/4, b4, b4, b4[stem="down"]', { stem: 'up' }));
        f.Formatter().joinVoices([voice0]).formatToStave([voice0], stave0);
        const stave1 = f.Stave({ width: 260, x: 250 });
        const voice1 = score.voice(score.notes('c4/4, c4, c4, c4', { stem: 'up' }));
        f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);
        makePedal(f, voice0.getTickables(), voice1.getTickables());
        f.draw();
        ok(true, 'Must render');
    };
}
function withSimplePedal(style) {
    return (factory, notes0, notes1) => factory.PedalMarking({
        notes: [notes0[0], notes0[2], notes0[3], notes1[3]],
        options: { style },
    });
}
function withReleaseAndDepressedPedal(style) {
    return (factory, notes0, notes1) => factory.PedalMarking({
        notes: [notes0[0], notes0[3], notes0[3], notes1[1], notes1[1], notes1[3]],
        options: { style },
    });
}
const simple1 = createTest(withSimplePedal('text'));
const simple2 = createTest(withSimplePedal('bracket'));
const simple3 = createTest(withSimplePedal('mixed'));
const releaseDepress1 = createTest(withReleaseAndDepressedPedal('bracket'));
const releaseDepress2 = createTest(withReleaseAndDepressedPedal('mixed'));
const customTest1 = createTest((factory, notes0, notes1) => {
    const pedal = factory.PedalMarking({
        notes: [notes0[0], notes1[3]],
        options: { style: 'text' },
    });
    pedal.setCustomText('una corda', 'tre corda');
    return pedal;
});
const customTest2 = createTest((factory, notes0, notes1) => {
    const pedal = factory.PedalMarking({
        notes: [notes0[0], notes1[3]],
        options: { style: 'mixed' },
    });
    pedal.setCustomText('Sost. Ped.');
    return pedal;
});
VexFlowTests.register(PedalMarkingTests);
export { PedalMarkingTests };
