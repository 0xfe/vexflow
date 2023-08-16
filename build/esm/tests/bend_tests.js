import { VexFlowTests } from './vexflow_test_helpers.js';
import { Bend } from '../src/bend.js';
import { Font } from '../src/font.js';
import { Formatter } from '../src/formatter.js';
import { ModifierContext } from '../src/modifiercontext.js';
import { Note } from '../src/note.js';
import { TabNote } from '../src/tabnote.js';
import { TabStave } from '../src/tabstave.js';
import { TickContext } from '../src/tickcontext.js';
const BendTests = {
    Start() {
        QUnit.module('Bend');
        const run = VexFlowTests.runTests;
        run('Double Bends', doubleBends);
        run('Reverse Bends', reverseBends);
        run('Bend Phrase', bendPhrase);
        run('Double Bends With Release', doubleBendsWithRelease);
        run('Whako Bend', whackoBends);
    },
};
const note = (noteStruct) => new TabNote(noteStruct);
const bendWithText = (text, release = false) => new Bend(text, release);
const bendWithPhrase = (phrase) => new Bend('', false, phrase);
function doubleBends(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        note({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'q',
        })
            .addModifier(bendWithText('Full'), 0)
            .addModifier(bendWithText('1/2'), 1),
        note({
            positions: [
                { str: 2, fret: 5 },
                { str: 3, fret: 5 },
            ],
            duration: 'q',
        })
            .addModifier(bendWithText('1/4'), 0)
            .addModifier(bendWithText('1/4'), 1),
        note({
            positions: [{ str: 4, fret: 7 }],
            duration: 'h',
        }),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach((note) => Note.plotMetrics(ctx, note, 140));
    options.assert.ok(true, 'Double Bends');
}
function doubleBendsWithRelease(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 550, 240);
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, 550).addTabGlyph().setContext(ctx).draw();
    const notes = [
        note({
            positions: [
                { str: 1, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'q',
        })
            .addModifier(bendWithText('1/2', true), 0)
            .addModifier(bendWithText('Full', true), 1),
        note({
            positions: [
                { str: 2, fret: 5 },
                { str: 3, fret: 5 },
                { str: 4, fret: 5 },
            ],
            duration: 'q',
        })
            .addModifier(bendWithText('1/4', true), 0)
            .addModifier(bendWithText('Monstrous', true), 1)
            .addModifier(bendWithText('1/4', true), 2),
        note({
            positions: [{ str: 4, fret: 7 }],
            duration: 'q',
        }),
        note({
            positions: [{ str: 4, fret: 7 }],
            duration: 'q',
        }),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach((note) => Note.plotMetrics(ctx, note, 140));
    options.assert.ok(true, 'Bend Release');
}
function reverseBends(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.setFont('10pt Arial');
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        note({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'w',
        })
            .addModifier(bendWithText('Full'), 1)
            .addModifier(bendWithText('1/2'), 0),
        note({
            positions: [
                { str: 2, fret: 5 },
                { str: 3, fret: 5 },
            ],
            duration: 'w',
        })
            .addModifier(bendWithText('1/4'), 1)
            .addModifier(bendWithText('1/4'), 0),
        note({
            positions: [{ str: 4, fret: 7 }],
            duration: 'w',
        }),
    ];
    for (let i = 0; i < notes.length; ++i) {
        const note = notes[i];
        const mc = new ModifierContext();
        note.addToModifierContext(mc);
        const tickContext = new TickContext();
        tickContext
            .addTickable(note)
            .preFormat()
            .setX(75 * i);
        note.setStave(stave).setContext(ctx).draw();
        Note.plotMetrics(ctx, note, 140);
        options.assert.ok(true, 'Bend ' + i);
    }
}
function bendPhrase(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.font = Font.SIZE + 'pt ' + Font.SANS_SERIF;
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const phrase1 = [
        { type: Bend.UP, text: 'Full' },
        { type: Bend.DOWN, text: 'Monstrous' },
        { type: Bend.UP, text: '1/2' },
        { type: Bend.DOWN, text: '' },
    ];
    const bend1 = bendWithPhrase(phrase1).setContext(ctx);
    const notes = [
        note({
            positions: [{ str: 2, fret: 10 }],
            duration: 'w',
        }).addModifier(bend1, 0),
    ];
    for (let i = 0; i < notes.length; ++i) {
        const note = notes[i];
        note.addToModifierContext(new ModifierContext());
        const tickContext = new TickContext();
        tickContext
            .addTickable(note)
            .preFormat()
            .setX(75 * i);
        note.setStave(stave).setContext(ctx).draw();
        Note.plotMetrics(ctx, note, 140);
        options.assert.ok(true, 'Bend ' + i);
    }
}
function whackoBends(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 400, 240);
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();
    const phrase1 = [
        { type: Bend.UP, text: 'Full' },
        { type: Bend.DOWN, text: '' },
        { type: Bend.UP, text: '1/2' },
        { type: Bend.DOWN, text: '' },
    ];
    const phrase2 = [
        { type: Bend.UP, text: 'Full' },
        { type: Bend.UP, text: 'Full' },
        { type: Bend.UP, text: '1/2' },
        { type: Bend.DOWN, text: '' },
        { type: Bend.DOWN, text: 'Full' },
        { type: Bend.DOWN, text: 'Full' },
        { type: Bend.UP, text: '1/2' },
        { type: Bend.DOWN, text: '' },
    ];
    const notes = [
        note({
            positions: [
                { str: 2, fret: 10 },
                { str: 3, fret: 9 },
            ],
            duration: 'q',
        })
            .addModifier(bendWithPhrase(phrase1), 0)
            .addModifier(bendWithPhrase(phrase2), 1),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    Note.plotMetrics(ctx, notes[0], 140);
    options.assert.ok(true, 'Whacko Bend & Release');
}
VexFlowTests.register(BendTests);
export { BendTests };
