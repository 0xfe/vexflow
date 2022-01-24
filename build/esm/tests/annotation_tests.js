import { VexFlowTests } from './vexflow_test_helpers.js';
import { Annotation, AnnotationVerticalJustify } from '../src/annotation.js';
import { Articulation } from '../src/articulation.js';
import { Beam } from '../src/beam.js';
import { Bend } from '../src/bend.js';
import { Flow } from '../src/flow.js';
import { Font, FontStyle, FontWeight } from '../src/font.js';
import { Formatter } from '../src/formatter.js';
import { ModifierPosition } from '../src/modifier.js';
import { Registry } from '../src/registry.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { Stem } from '../src/stem.js';
import { TabNote } from '../src/tabnote.js';
import { TabStave } from '../src/tabstave.js';
import { Vibrato } from '../src/vibrato.js';
import { Voice } from '../src/voice.js';
const AnnotationTests = {
    Start() {
        QUnit.module('Annotation');
        const run = VexFlowTests.runTests;
        run('Placement', placement);
        run('Lyrics', lyrics);
        run('Simple Annotation', simple);
        run('Standard Notation Annotation', standard);
        run('Harmonics', harmonic);
        run('Fingerpicking', picking);
        run('Bottom Annotation', bottom);
        run('Bottom Annotations with Beams', bottomWithBeam);
        run('Test Justification Annotation Stem Up', justificationStemUp);
        run('Test Justification Annotation Stem Down', justificationStemDown);
        run('TabNote Annotations', tabNotes);
    },
};
const FONT_SIZE = VexFlowTests.Font.size;
const tabNote = (noteStruct) => new TabNote(noteStruct);
const staveNote = (noteStruct) => new StaveNote(noteStruct);
function lyrics(options) {
    let fontSize = FONT_SIZE;
    let x = 10;
    let width = 170;
    let ratio = 1;
    const registry = new Registry();
    Registry.enableDefaultRegistry(registry);
    const f = VexFlowTests.makeFactory(options, 750, 260);
    for (let i = 0; i < 3; ++i) {
        const score = f.EasyScore();
        score.set({ time: '3/4' });
        const system = f.System({ width, x });
        system.addStave({
            voices: [
                score.voice(score.notes('(C4 F4)/2[id="n0"]').concat(score.beam(score.notes('(C4 A4)/8[id="n1"], (C#4 A4)/8[id="n2"]')))),
            ],
        });
        ['hand,', 'and', 'me', 'pears', 'lead', 'the'].forEach((text, ix) => {
            const verse = Math.floor(ix / 3);
            const noteGroupID = 'n' + (ix % 3);
            const noteGroup = registry.getElementById(noteGroupID);
            const lyricsAnnotation = f.Annotation({ text }).setFont('Roboto Slab', fontSize);
            lyricsAnnotation.setPosition(ModifierPosition.BELOW);
            noteGroup.addModifier(verse, lyricsAnnotation);
        });
        system.addStave({
            voices: [score.voice(score.notes('(F4 D5)/2').concat(score.beam(score.notes('(F4 F5)/8, (F4 F5)/8'))))],
        });
        f.draw();
        ratio = (fontSize + 2) / fontSize;
        width = width * ratio;
        x = x + width;
        fontSize = fontSize + 2;
    }
    ok(true);
}
function simple(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial, sans-serif';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 10 },
                { str: 4, fret: 9 },
            ],
            duration: 'h',
        }).addModifier(0, new Annotation('T')),
        tabNote({
            positions: [{ str: 2, fret: 10 }],
            duration: 'h',
        }).addModifier(0, new Bend('Full').setTap('T')),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Simple Annotation');
}
function standard(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const stave = new Stave(10, 10, 450).addClef('treble').setContext(ctx).draw();
    const annotation = (text) => new Annotation(text).setFont(Font.SERIF, FONT_SIZE, 'normal', 'italic');
    const notes = [
        staveNote({ keys: ['c/4', 'e/4'], duration: 'h' }).addModifier(0, annotation('quiet')),
        staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }).addModifier(2, annotation('Allegro')),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Standard Notation Annotation');
}
function harmonic(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const notes = [
        tabNote({
            positions: [
                { str: 2, fret: 12 },
                { str: 3, fret: 12 },
            ],
            duration: 'h',
        }).addModifier(0, new Annotation('Harm.')),
        tabNote({
            positions: [{ str: 2, fret: 9 }],
            duration: 'h',
        })
            .addModifier(0, new Annotation('(8va)').setFont(Font.SERIF, FONT_SIZE, FontWeight.NORMAL, FontStyle.ITALIC))
            .addModifier(0, new Annotation('A.H.')),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Simple Annotation');
}
function picking(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.setFillStyle('#221');
    ctx.setStrokeStyle('#221');
    ctx.setFont(Font.SANS_SERIF, FONT_SIZE);
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();
    const annotation = (text) => new Annotation(text).setFont(Font.SERIF, FONT_SIZE, FontWeight.NORMAL, FontStyle.ITALIC);
    const notes = [
        tabNote({
            positions: [
                { str: 1, fret: 0 },
                { str: 2, fret: 1 },
                { str: 3, fret: 2 },
                { str: 4, fret: 2 },
                { str: 5, fret: 0 },
            ],
            duration: 'h',
        }).addModifier(0, new Vibrato().setVibratoWidth(40)),
        tabNote({
            positions: [{ str: 6, fret: 9 }],
            duration: '8',
        }).addModifier(0, annotation('p').setVerticalJustification(AnnotationVerticalJustify.TOP)),
        tabNote({
            positions: [{ str: 3, fret: 9 }],
            duration: '8',
        }).addModifier(0, annotation('i').setVerticalJustification(AnnotationVerticalJustify.TOP)),
        tabNote({
            positions: [{ str: 2, fret: 9 }],
            duration: '8',
        }).addModifier(0, annotation('m').setVerticalJustification(AnnotationVerticalJustify.TOP)),
        tabNote({
            positions: [{ str: 1, fret: 9 }],
            duration: '8',
        }).addModifier(0, annotation('a').setVerticalJustification(AnnotationVerticalJustify.TOP)),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Fingerpicking');
}
function placement(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 750, 300);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const stave = new Stave(10, 50, 750).addClef('treble').setContext(ctx).draw();
    const annotation = (text, fontSize, vj) => new Annotation(text).setFont(Font.SERIF, fontSize).setVerticalJustification(vj);
    const notes = [
        staveNote({ keys: ['e/4'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, new Articulation('a.').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, new Articulation('a-').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 10, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['b/4'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, new Articulation('a.').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, new Articulation('a-').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 10, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['c/5'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, new Articulation('a.').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, new Articulation('a-').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 10, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['f/4'], duration: 'q' })
            .addModifier(0, annotation('v1', 14, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 14, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['f/4'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, new Articulation('am').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, new Articulation('a.').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, new Articulation('a-').setPosition(ModifierPosition.ABOVE))
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 20, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['f/5'], duration: 'q' })
            .addModifier(0, annotation('v1', 11, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 11, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['f/5'], duration: 'q' })
            .addModifier(0, annotation('v1', 11, AnnotationVerticalJustify.TOP))
            .addModifier(0, annotation('v2', 20, AnnotationVerticalJustify.TOP)),
        staveNote({ keys: ['f/4'], duration: 'q' })
            .addModifier(0, annotation('v1', 12, AnnotationVerticalJustify.BOTTOM))
            .addModifier(0, annotation('v2', 12, AnnotationVerticalJustify.BOTTOM)),
        staveNote({ keys: ['f/5'], duration: 'q' })
            .addModifier(0, new Articulation('a.').setPosition(ModifierPosition.BELOW))
            .addModifier(0, annotation('v1', 11, AnnotationVerticalJustify.BOTTOM))
            .addModifier(0, annotation('v2', 20, AnnotationVerticalJustify.BOTTOM)),
        staveNote({ keys: ['f/5'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, new Articulation('am').setPosition(ModifierPosition.BELOW))
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.BOTTOM))
            .addModifier(0, annotation('v2', 20, AnnotationVerticalJustify.BOTTOM)),
        staveNote({ keys: ['f/4'], duration: 'q', stem_direction: Stem.DOWN })
            .addModifier(0, annotation('v1', 10, AnnotationVerticalJustify.BOTTOM))
            .addModifier(0, annotation('v2', 20, AnnotationVerticalJustify.BOTTOM)),
        staveNote({ keys: ['f/5'], duration: 'w' })
            .addModifier(0, new Articulation('a@u').setPosition(ModifierPosition.BELOW))
            .addModifier(0, annotation('v1', 11, AnnotationVerticalJustify.BOTTOM))
            .addModifier(0, annotation('v2', 16, AnnotationVerticalJustify.BOTTOM)),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, ' Annotation Placement');
}
function bottom(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();
    const annotation = (text) => new Annotation(text).setFont(Font.SERIF, FONT_SIZE).setVerticalJustification(Annotation.VerticalJustify.BOTTOM);
    const notes = [
        staveNote({ keys: ['f/4'], duration: 'w' }).addModifier(0, annotation('F')),
        staveNote({ keys: ['a/4'], duration: 'w' }).addModifier(0, annotation('A')),
        staveNote({ keys: ['c/5'], duration: 'w' }).addModifier(0, annotation('C')),
        staveNote({ keys: ['e/5'], duration: 'w' }).addModifier(0, annotation('E')),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
    ok(true, 'Bottom Annotation');
}
function bottomWithBeam(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();
    const notes = [
        new StaveNote({ keys: ['a/3'], duration: '8' }).addModifier(0, new Annotation('good').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)),
        new StaveNote({ keys: ['g/3'], duration: '8' }).addModifier(0, new Annotation('even').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)),
        new StaveNote({ keys: ['c/4'], duration: '8' }).addModifier(0, new Annotation('under').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)),
        new StaveNote({ keys: ['d/4'], duration: '8' }).addModifier(0, new Annotation('beam').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)),
    ];
    const beam = new Beam(notes.slice(1));
    Formatter.FormatAndDraw(ctx, stave, notes);
    beam.setContext(ctx).draw();
    ok(true, 'Bottom Annotation with Beams');
}
function justificationStemUp(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 650, 950);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const annotation = (text, hJustification, vJustification) => new Annotation(text)
        .setFont(Font.SANS_SERIF, FONT_SIZE)
        .setJustification(hJustification)
        .setVerticalJustification(vJustification);
    for (let v = 1; v <= 4; ++v) {
        const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();
        const notes = [
            staveNote({ keys: ['c/3'], duration: 'q' }).addModifier(0, annotation('Text', 1, v)),
            staveNote({ keys: ['c/4'], duration: 'q' }).addModifier(0, annotation('Text', 2, v)),
            staveNote({ keys: ['c/5'], duration: 'q' }).addModifier(0, annotation('Text', 3, v)),
            staveNote({ keys: ['c/6'], duration: 'q' }).addModifier(0, annotation('Text', 4, v)),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    ok(true, 'Test Justification Annotation');
}
function justificationStemDown(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 650, 1000);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    const annotation = (text, hJustification, vJustification) => new Annotation(text)
        .setFont(Font.SANS_SERIF, FONT_SIZE)
        .setJustification(hJustification)
        .setVerticalJustification(vJustification);
    for (let v = 1; v <= 4; ++v) {
        const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();
        const notes = [
            staveNote({ keys: ['c/3'], duration: 'q', stem_direction: -1 }).addModifier(0, annotation('Text', 1, v)),
            staveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }).addModifier(0, annotation('Text', 2, v)),
            staveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }).addModifier(0, annotation('Text', 3, v)),
            staveNote({ keys: ['c/6'], duration: 'q', stem_direction: -1 }).addModifier(0, annotation('Text', 4, v)),
        ];
        Formatter.FormatAndDraw(ctx, stave, notes);
    }
    ok(true, 'Test Justification Annotation');
}
function tabNotes(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 600, 200);
    ctx.font = '10pt Arial, sans-serif';
    const stave = new TabStave(10, 10, 550);
    stave.setContext(ctx);
    stave.draw();
    const specs = [
        {
            positions: [
                { str: 3, fret: 6 },
                { str: 4, fret: 25 },
            ],
            duration: '8',
        },
        {
            positions: [
                { str: 2, fret: 10 },
                { str: 5, fret: 12 },
            ],
            duration: '8',
        },
        {
            positions: [
                { str: 1, fret: 6 },
                { str: 3, fret: 5 },
            ],
            duration: '8',
        },
        {
            positions: [
                { str: 1, fret: 6 },
                { str: 3, fret: 5 },
            ],
            duration: '8',
        },
    ];
    const notes1 = specs.map((noteSpec) => {
        const note = new TabNote(noteSpec);
        note.render_options.draw_stem = true;
        return note;
    });
    const notes2 = specs.map((noteSpec) => {
        const note = new TabNote(noteSpec);
        note.render_options.draw_stem = true;
        note.setStemDirection(-1);
        return note;
    });
    const notes3 = specs.map((noteSpec) => new TabNote(noteSpec));
    notes1[0].addModifier(0, new Annotation('Text').setJustification(1).setVerticalJustification(1));
    notes1[1].addModifier(0, new Annotation('Text').setJustification(2).setVerticalJustification(2));
    notes1[2].addModifier(0, new Annotation('Text').setJustification(3).setVerticalJustification(3));
    notes1[3].addModifier(0, new Annotation('Text').setJustification(4).setVerticalJustification(4));
    notes2[0].addModifier(0, new Annotation('Text').setJustification(3).setVerticalJustification(1));
    notes2[1].addModifier(0, new Annotation('Text').setJustification(3).setVerticalJustification(2));
    notes2[2].addModifier(0, new Annotation('Text').setJustification(3).setVerticalJustification(3));
    notes2[3].addModifier(0, new Annotation('Text').setJustification(3).setVerticalJustification(4));
    notes3[0].addModifier(0, new Annotation('Text').setVerticalJustification(1));
    notes3[1].addModifier(0, new Annotation('Text').setVerticalJustification(2));
    notes3[2].addModifier(0, new Annotation('Text').setVerticalJustification(3));
    notes3[3].addModifier(0, new Annotation('Text').setVerticalJustification(4));
    const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT);
    voice.addTickables(notes1);
    voice.addTickables(notes2);
    voice.addTickables(notes3);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave, { stave });
    voice.draw(ctx, stave);
    ok(true, 'TabNotes successfully drawn');
}
VexFlowTests.register(AnnotationTests);
export { AnnotationTests };
