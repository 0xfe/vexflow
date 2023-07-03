import { VexFlowTests } from './vexflow_test_helpers.js';
import { Annotation } from '../src/annotation.js';
import { Flow } from '../src/flow.js';
import { Formatter } from '../src/formatter.js';
import { TabNote } from '../src/tabnote.js';
import { TabStave } from '../src/tabstave.js';
import { TabTie } from '../src/tabtie.js';
import { Voice } from '../src/voice.js';
const TabTieTests = {
    Start() {
        QUnit.module('TabTie');
        const run = VexFlowTests.runTests;
        run('Simple TabTie', simple);
        run('Hammerons', simpleHammerOn);
        run('Pulloffs', simplePullOff);
        run('Tapping', tap);
        run('Continuous', continuous);
    },
};
const tabNote = (noteStruct) => new TabNote(noteStruct);
function setupContext(options, w = 0, h = 0) {
    const context = options.contextBuilder(options.elementId, w || 350, h || 160);
    context.setFont('Arial', VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, w || 350).addTabGlyph().setContext(context).draw();
    return { context, stave };
}
function tieNotes(notes, indices, stave, ctx, text) {
    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 100);
    voice.draw(ctx, stave);
    const tie = new TabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
    }, text !== null && text !== void 0 ? text : 'Annotation');
    tie.setContext(ctx);
    tie.draw();
}
function simple(options, contextBuilder) {
    options.contextBuilder = contextBuilder;
    const { context, stave } = setupContext(options);
    const note1 = tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' });
    const note2 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context);
    options.assert.ok(true, 'Simple Test');
}
function simpleHammerOn(options, contextBuilder) {
    options.contextBuilder = contextBuilder;
    multiTest(options, TabTie.createHammeron);
}
function simplePullOff(options, contextBuilder) {
    options.contextBuilder = contextBuilder;
    multiTest(options, TabTie.createPulloff);
}
function multiTest(options, createTabTie) {
    const { context, stave } = setupContext(options, 440, 140);
    const notes = [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
        tabNote({
            positions: [
                { str: 4, fret: 4 },
                { str: 5, fret: 4 },
            ],
            duration: '8',
        }),
        tabNote({
            positions: [
                { str: 4, fret: 6 },
                { str: 5, fret: 6 },
            ],
            duration: '8',
        }),
        tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
        tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
        tabNote({
            positions: [
                { str: 2, fret: 14 },
                { str: 3, fret: 14 },
            ],
            duration: '8',
        }),
        tabNote({
            positions: [
                { str: 2, fret: 16 },
                { str: 3, fret: 16 },
            ],
            duration: '8',
        }),
    ];
    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(context, stave);
    createTabTie({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
    })
        .setContext(context)
        .draw();
    options.assert.ok(true, 'Single note');
    createTabTie({
        first_note: notes[2],
        last_note: notes[3],
        first_indices: [0, 1],
        last_indices: [0, 1],
    })
        .setContext(context)
        .draw();
    options.assert.ok(true, 'Chord');
    createTabTie({
        first_note: notes[4],
        last_note: notes[5],
        first_indices: [0],
        last_indices: [0],
    })
        .setContext(context)
        .draw();
    options.assert.ok(true, 'Single note high-fret');
    createTabTie({
        first_note: notes[6],
        last_note: notes[7],
        first_indices: [0, 1],
        last_indices: [0, 1],
    })
        .setContext(context)
        .draw();
    options.assert.ok(true, 'Chord high-fret');
}
function tap(options, contextBuilder) {
    options.contextBuilder = contextBuilder;
    const { context, stave } = setupContext(options);
    const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0);
    const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });
    tieNotes([note1, note2], [0], stave, context, 'P');
    options.assert.ok(true, 'Tapping Test');
}
function continuous(options, contextBuilder) {
    options.contextBuilder = contextBuilder;
    const { context, stave } = setupContext(options, 440, 140);
    const notes = [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
        tabNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
        tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
    ];
    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(context, stave);
    TabTie.createHammeron({
        first_note: notes[0],
        last_note: notes[1],
        first_indices: [0],
        last_indices: [0],
    })
        .setContext(context)
        .draw();
    TabTie.createPulloff({
        first_note: notes[1],
        last_note: notes[2],
        first_indices: [0],
        last_indices: [0],
    })
        .setContext(context)
        .draw();
    options.assert.ok(true, 'Continuous Hammeron');
}
VexFlowTests.register(TabTieTests);
export { TabTieTests };
