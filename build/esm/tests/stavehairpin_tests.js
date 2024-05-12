import { VexFlowTests } from './vexflow_test_helpers.js';
import { StaveHairpin } from '../src/stavehairpin.js';
const StaveHairpinTests = {
    Start() {
        QUnit.module('StaveHairpin');
        const run = VexFlowTests.runTests;
        run('Simple StaveHairpin', simple);
        run('Horizontal Offset StaveHairpin', horizontal);
        run('Vertical Offset StaveHairpin', vertical);
        run('Height StaveHairpin', height);
    },
};
function drawHairpin(first_note, last_note, ctx, type, position, options) {
    const hairpin = new StaveHairpin({ first_note, last_note }, type);
    hairpin.setContext(ctx);
    hairpin.setPosition(position);
    if (options) {
        hairpin.setRenderOptions(options);
    }
    hairpin.draw();
}
function createTest(drawTwoHairpins) {
    return (options) => {
        const factory = VexFlowTests.makeFactory(options);
        const ctx = factory.getContext();
        const stave = factory.Stave();
        const notes = [
            factory
                .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
                .addModifier(factory.Accidental({ type: 'b' }), 0)
                .addModifier(factory.Accidental({ type: '#' }), 1),
            factory.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
            factory.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
        ];
        const voice = factory.Voice().addTickables(notes);
        factory.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        factory.draw();
        drawTwoHairpins(ctx, notes);
        options.assert.ok(true, 'Simple Test');
    };
}
const simple = createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4);
    drawHairpin(notes[1], notes[3], ctx, 2, 3);
});
const horizontal = createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 3, {
        height: 10,
        vo: 20,
        left_ho: 20,
        right_ho: -20,
    });
    drawHairpin(notes[3], notes[3], ctx, 2, 4, {
        height: 10,
        y_shift: 0,
        left_shift_px: 0,
        right_shift_px: 120,
    });
});
const vertical = createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
        height: 10,
        y_shift: 0,
        left_shift_px: 0,
        right_shift_px: 0,
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
        height: 10,
        y_shift: -15,
        left_shift_px: 2,
        right_shift_px: 0,
    });
});
const height = createTest((ctx, notes) => {
    drawHairpin(notes[0], notes[2], ctx, 1, 4, {
        height: 10,
        y_shift: 0,
        left_shift_px: 0,
        right_shift_px: 0,
    });
    drawHairpin(notes[2], notes[3], ctx, 2, 4, {
        height: 15,
        y_shift: 0,
        left_shift_px: 2,
        right_shift_px: 0,
    });
});
VexFlowTests.register(StaveHairpinTests);
export { StaveHairpinTests };
