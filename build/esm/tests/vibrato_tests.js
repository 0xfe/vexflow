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
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(0, new Vibrato()),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(0, new Vibrato()),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Simple Vibrato');
}
function harsh(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(0, new Vibrato().setHarsh(true)),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(0, new Vibrato().setHarsh(true)),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Harsh Vibrato');
}
function withBend(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.3, 1.3);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');
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
            .addModifier(0, new Bend('1/2', true))
            .addModifier(1, new Bend('1/2', true))
            .addModifier(0, new Vibrato()),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'q',
        })
            .addModifier(0, new Bend('Full', false))
            .addModifier(0, new Vibrato().setVibratoWidth(60)),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(0, new Vibrato().setVibratoWidth(120).setHarsh(true)),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Vibrato with Bend');
}
VexFlowTests.register(VibratoTests);
export { VibratoTests };
