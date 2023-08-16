import { concat, VexFlowTests } from './vexflow_test_helpers.js';
import { CurvePosition } from '../src/curve.js';
const CurveTests = {
    Start() {
        QUnit.module('Curve');
        const run = VexFlowTests.runTests;
        run('Simple Curve', simple);
        run('Rounded Curve', rounded);
        run('Thick Thin Curves', thickThin);
        run('Top Curve', top);
    },
};
function createTest(noteGroup1, noteGroup2, setupCurves) {
    return (options) => {
        const factory = VexFlowTests.makeFactory(options, 350, 200);
        const stave = factory.Stave({ y: 50 });
        const score = factory.EasyScore();
        const staveNotes = [
            score.beam(score.notes(...noteGroup1)),
            score.beam(score.notes(...noteGroup2)),
        ].reduce(concat);
        setupCurves(factory, staveNotes);
        const voices = [score.voice(staveNotes, { time: '4/4' })];
        factory.Formatter().joinVoices(voices).formatToStave(voices, stave);
        factory.draw();
        options.assert.ok('Simple Curve');
    };
}
const simple = createTest(['c4/8, f5, d5, g5', { stem: 'up' }], ['d6/8, f5, d5, g5', { stem: 'down' }], (f, notes) => {
    f.Curve({
        from: notes[0],
        to: notes[3],
        options: {
            cps: [
                { x: 0, y: 10 },
                { x: 0, y: 50 },
            ],
        },
    });
    f.Curve({
        from: notes[4],
        to: notes[7],
        options: {
            cps: [
                { x: 0, y: 10 },
                { x: 0, y: 20 },
            ],
        },
    });
});
const rounded = createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], (f, notes) => {
    f.Curve({
        from: notes[0],
        to: notes[3],
        options: {
            x_shift: -10,
            y_shift: 30,
            cps: [
                { x: 0, y: 20 },
                { x: 0, y: 50 },
            ],
        },
    });
    f.Curve({
        from: notes[4],
        to: notes[7],
        options: {
            cps: [
                { x: 0, y: 50 },
                { x: 0, y: 50 },
            ],
        },
    });
});
const thickThin = createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], (f, notes) => {
    f.Curve({
        from: notes[0],
        to: notes[3],
        options: {
            thickness: 10,
            x_shift: -10,
            y_shift: 30,
            cps: [
                { x: 0, y: 20 },
                { x: 0, y: 50 },
            ],
        },
    });
    f.Curve({
        from: notes[4],
        to: notes[7],
        options: {
            thickness: 0,
            cps: [
                { x: 0, y: 50 },
                { x: 0, y: 50 },
            ],
        },
    });
});
const top = createTest(['c5/8, f4, d4, g5', { stem: 'up' }], ['d5/8, d6, d6, g5', { stem: 'down' }], (f, notes) => {
    f.Curve({
        from: notes[0],
        to: notes[7],
        options: {
            x_shift: -3,
            y_shift: 10,
            position: CurvePosition.NEAR_TOP,
            position_end: CurvePosition.NEAR_HEAD,
            cps: [
                { x: 0, y: 20 },
                { x: 40, y: 80 },
            ],
        },
    });
});
VexFlowTests.register(CurveTests);
export { CurveTests };
