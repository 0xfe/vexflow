import { VexFlowTests } from './vexflow_test_helpers.js';
import { Annotation } from '../src/annotation.js';
import { Articulation } from '../src/articulation.js';
import { Bend } from '../src/bend.js';
import { Formatter } from '../src/formatter.js';
import { KeySignature } from '../src/keysignature.js';
import { NoteSubGroup } from '../src/notesubgroup.js';
import { Ornament } from '../src/ornament.js';
import { StaveModifierPosition } from '../src/stavemodifier.js';
import { Stroke } from '../src/strokes.js';
import { TabNote } from '../src/tabnote.js';
import { TabStave } from '../src/tabstave.js';
import { TimeSignature } from '../src/timesignature.js';
const StyleTests = {
    Start() {
        QUnit.module('Style');
        const run = VexFlowTests.runTests;
        run('Basic Style', stave);
        run('TabNote modifiers Style', tab);
    },
};
function FS(fillStyle, strokeStyle) {
    const ret = { fillStyle };
    if (strokeStyle) {
        ret.strokeStyle = strokeStyle;
    }
    return ret;
}
function stave(options) {
    const f = VexFlowTests.makeFactory(options, 600, 150);
    const stave = f.Stave({ x: 25, y: 20, width: 500 });
    const keySig = new KeySignature('D');
    keySig.addToStave(stave);
    keySig.setStyle(FS('blue'));
    stave.addTimeSignature('4/4');
    const timeSig = stave.getModifiers(StaveModifierPosition.BEGIN, TimeSignature.CATEGORY);
    timeSig[0].setStyle(FS('brown'));
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
            .addModifier(f.Accidental({ type: 'b' }), 0)
            .addModifier(f.Accidental({ type: '#' }), 1),
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
            .addModifier(f.Accidental({ type: 'b' }), 0)
            .addModifier(f.Accidental({ type: '#' }), 1),
        f.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
        f.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),
        f.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),
        f.GhostNote({ duration: '16' }).addModifier(new Annotation('GhostNote green text').setStyle(FS('green')), 0),
    ];
    const notes0 = notes[0];
    const notes1 = notes[1];
    notes0.setKeyStyle(0, FS('red'));
    notes1.setKeyStyle(0, FS('red'));
    const mods1 = notes1.getModifiers();
    mods1[0].setStyle(FS('green'));
    notes0.addModifier(new Articulation('a.').setPosition(4).setStyle(FS('green')), 0);
    notes0.addModifier(new Ornament('mordent').setStyle(FS('lightgreen')), 0);
    notes1.addModifier(new Annotation('blue').setStyle(FS('blue')), 0);
    notes1.addModifier(new NoteSubGroup([f.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]), 0);
    const voice = f.Voice().addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Basic Style');
}
function tab(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 140);
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph();
    stave.getModifiers()[2].setStyle(FS('blue'));
    stave.setContext(ctx).draw();
    const tabNote = (noteStruct) => new TabNote(noteStruct);
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(new Annotation('green text').setStyle(FS('green')), 0),
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        })
            .addModifier(new Bend('Full').setStyle(FS('brown')), 0)
            .addStroke(0, new Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    options.assert.ok(true, 'TabNote Modifiers Style');
}
VexFlowTests.register(StyleTests);
export { StyleTests };
