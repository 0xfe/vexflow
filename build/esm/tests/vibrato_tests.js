import { VexFlowTests } from './vexflow_test_helpers.js';
import { Bend, Font, Formatter, TabNote, TabStave, Vibrato } from '../src/index.js';
const VibratoTests = {
    Start() {
        QUnit.module('Vibrato');
        const run = VexFlowTests.runTests;
        run('Simple Vibrato', simple);
        run('Harsh Vibrato', harsh);
        run('Vibrato with Bend', withBend);
    },
};
const tabNote = (noteStruct) => new TabNote(noteStruct);
function simple(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(new Vibrato(), 0),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(new Vibrato(), 0),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    options.assert.ok(true, 'Simple Vibrato');
}
function harsh(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(new Vibrato().setHarsh(true), 0),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(new Vibrato().setHarsh(true), 0),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    options.assert.ok(true, 'Harsh Vibrato');
}
function withBend(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.3, 1.3);
    ctx.setFont(Font.SANS_SERIF, VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 9 },
                { str: 3, fret: 9 },
            ],
            duration: 'q',
        })
            .addModifier(new Bend('1/2', true), 0)
            .addModifier(new Bend('1/2', true), 1)
            .addModifier(new Vibrato(), 0),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'q',
        })
            .addModifier(new Bend('Full', false), 0)
            .addModifier(new Vibrato().setVibratoWidth(60), 0),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(new Vibrato().setVibratoWidth(120).setHarsh(true), 0),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    options.assert.ok(true, 'Vibrato with Bend');
}
VexFlowTests.register(VibratoTests);
export { VibratoTests };
