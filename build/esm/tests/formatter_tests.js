import { VexFlowTests } from './vexflow_test_helpers.js';
import { Accidental } from '../src/accidental.js';
import { Annotation, AnnotationVerticalJustify } from '../src/annotation.js';
import { Articulation } from '../src/articulation.js';
import { Beam } from '../src/beam.js';
import { Bend } from '../src/bend.js';
import { Dot } from '../src/dot.js';
import { Flow } from '../src/flow.js';
import { Font, FontWeight } from '../src/font.js';
import { Formatter } from '../src/formatter.js';
import { FretHandFinger } from '../src/frethandfinger.js';
import { ModifierPosition } from '../src/modifier.js';
import { Note } from '../src/note.js';
import { Registry } from '../src/registry.js';
import { Stave } from '../src/stave.js';
import { StaveConnector } from '../src/staveconnector.js';
import { StaveNote } from '../src/stavenote.js';
import { Stem } from '../src/stem.js';
import { StringNumber } from '../src/stringnumber.js';
import { Tables } from '../src/tables.js';
import { Tuplet } from '../src/tuplet.js';
import { Voice } from '../src/voice.js';
import { MockTickable } from './mocks.js';
const FormatterTests = {
    Start() {
        QUnit.module('Formatter');
        QUnit.test('TickContext Building', buildTickContexts);
        const run = VexFlowTests.runTests;
        run('Penultimate Note Padding', penultimateNote);
        run('Whitespace and justify', rightJustify);
        run('Notehead padding', noteHeadPadding);
        run('Justification and alignment with accidentals', accidentalJustification);
        run('Long measure taking full space', longMeasureProblems);
        run('Vertical alignment - few unaligned beats', unalignedNoteDurations1);
        run('Vertical alignment - many unaligned beats', unalignedNoteDurations2, { globalSoftmax: false });
        run('Vertical alignment - many unaligned beats (global softmax)', unalignedNoteDurations2, { globalSoftmax: true });
        run('Vertical alignment - many mixed elements', alignedMixedElements, { globalSoftmax: true });
        run('StaveNote - Justification', justifyStaveNotes);
        run('Notes with Tab', notesWithTab);
        run('Multiple Staves - Justified', multiStaves, { debug: true });
        run('Softmax', softMax);
        run('Mixtime', mixTime);
        run('Tight', tightNotes1);
        run('Tight 2', tightNotes2);
        run('Annotations', annotations);
        run('Proportional Formatting - No Tuning', proportional, { debug: true, iterations: 0 });
        run('Proportional Formatting - No Justification', proportional, { justify: false, debug: true, iterations: 0 });
        run('Proportional Formatting (20 iterations)', proportional, { debug: true, iterations: 20, alpha: 0.5 });
    },
};
function getGlyphWidth(glyphName) {
    const musicFont = Tables.currentMusicFont();
    const glyph = musicFont.getGlyphs()[glyphName];
    const widthInEm = (glyph.x_max - glyph.x_min) / musicFont.getResolution();
    return widthInEm * 38 * Font.scaleToPxFrom.pt;
}
function buildTickContexts(assert) {
    function createTickable(beat) {
        return new MockTickable().setTicks(beat);
    }
    const BEAT = (1 * Flow.RESOLUTION) / 4;
    const tickables1 = [
        createTickable(BEAT).setWidth(10),
        createTickable(BEAT * 2).setWidth(20),
        createTickable(BEAT).setWidth(30),
    ];
    const tickables2 = [
        createTickable(BEAT * 2).setWidth(10),
        createTickable(BEAT).setWidth(20),
        createTickable(BEAT).setWidth(30),
    ];
    const voice1 = new Voice(Flow.TIME4_4);
    const voice2 = new Voice(Flow.TIME4_4);
    voice1.addTickables(tickables1);
    voice2.addTickables(tickables2);
    const formatter = new Formatter();
    const tContexts = formatter.createTickContexts([voice1, voice2]);
    assert.equal(tContexts.list.length, 4, 'Voices should have four tick contexts');
    assert.throws(() => formatter.getMinTotalWidth(), /NoMinTotalWidth/, 'Expected to throw exception');
    assert.ok(formatter.preCalculateMinTotalWidth([voice1, voice2]), 'Successfully runs preCalculateMinTotalWidth');
    assert.equal(formatter.getMinTotalWidth(), 88, 'Get minimum total width without passing voices');
    formatter.preFormat();
    assert.equal(formatter.getMinTotalWidth(), 88, 'Minimum total width');
    assert.equal(tickables1[0].getX(), tickables2[0].getX(), 'First notes of both voices have the same X');
    assert.equal(tickables1[2].getX(), tickables2[2].getX(), 'Last notes of both voices have the same X');
    assert.ok(tickables1[1].getX() < tickables2[1].getX(), 'Second note of voice 2 is to the right of the second note of voice 1');
}
function rightJustify(options) {
    const f = VexFlowTests.makeFactory(options, 1200, 150);
    const getTickables = (time, n, duration, duration2) => {
        const tickar = [];
        let i = 0;
        for (i = 0; i < n; ++i) {
            const dd = i === n - 1 ? duration2 : duration;
            tickar.push(new StaveNote({ keys: ['f/4'], duration: dd }));
        }
        return new Voice(time).addTickables(tickar);
    };
    const renderTest = (time, n, duration, duration2, x, width) => {
        const formatter = f.Formatter();
        const stave = f.Stave({ x, y: 20, width });
        const voice = getTickables(time, n, duration, duration2);
        formatter.joinVoices([voice]).formatToStave([voice], stave);
        stave.draw();
        voice.draw(f.getContext(), stave);
    };
    renderTest({ num_beats: 4, beat_value: 4, resolution: 4 * 4096 }, 3, '4', '2', 10, 300);
    renderTest({ num_beats: 4, beat_value: 4, resolution: 4 * 4096 }, 1, 'w', 'w', 310, 300);
    renderTest({ num_beats: 3, beat_value: 4, resolution: 4 * 4096 }, 3, '4', '4', 610, 300);
    renderTest({ num_beats: 3, beat_value: 4, resolution: 4 * 4096 }, 6, '8', '8', 910, 300);
    options.assert.ok(true);
}
function penultimateNote(options) {
    const f = VexFlowTests.makeFactory(options, 500, 550);
    const score = f.EasyScore();
    const staffWidth = 310;
    let system = undefined;
    let voices = [];
    let notes = [];
    let note = undefined;
    let stave = undefined;
    let y = 10;
    const draw = (softmax) => {
        system = f.System({
            width: staffWidth,
            y,
            formatOptions: { align_rests: true },
            details: { softmaxFactor: softmax },
        });
        notes = [];
        voices = [];
        note = score.notes('C4/8/r', { clef: 'bass' })[0];
        notes.push(note);
        note = score.notes('A3/8', { stem: 'up', clef: 'bass' })[0];
        notes.push(note);
        note = score.notes('C4/4', { stem: 'up', clef: 'bass' })[0];
        notes.push(note);
        voices.push(score.voice(notes).setMode(2));
        notes = [];
        note = score.notes('( F3 A3 )/4', { stem: 'down', clef: 'bass' })[0];
        notes.push(note);
        note = score.notes('B4/4/r', {})[0];
        notes.push(note);
        voices.push(score.voice(notes).setMode(2));
        notes = [];
        stave = system.addStave({ voices: voices });
        stave.addClef('bass');
        stave.addTimeSignature('2/4');
        voices = [];
        f.draw();
        f.getContext().fillText(`softmax: ${softmax.toString()}`, staffWidth + 20, y + 50);
        y += 100;
    };
    draw(15);
    draw(10);
    draw(5);
    draw(2);
    draw(1);
    options.assert.ok(true);
}
function noteHeadPadding(options) {
    const registry = new Registry();
    Registry.enableDefaultRegistry(registry);
    const f = VexFlowTests.makeFactory(options, 600, 300);
    const score = f.EasyScore();
    score.set({ time: '9/8' });
    const notes1 = score.notes('(d5 f5)/8,(c5 e5)/8,(d5 f5)/8,(c5 e5)/2.');
    const beams = [new Beam(notes1.slice(0, 3), true)];
    const voice1 = new Voice().setMode(Voice.Mode.SOFT);
    const notes2 = score.notes('(g4 an4)/2.,(g4 a4)/4.', { clef: 'treble' });
    const voice2 = new Voice().setMode(Voice.Mode.SOFT);
    voice2.addTickables(notes2);
    voice1.addTickables(notes1);
    const formatter = f.Formatter().joinVoices([voice1]).joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);
    formatter.format([voice1, voice2], width);
    const staveWidth = width + Stave.defaultPadding;
    const stave1 = f.Stave({ y: 50, width: staveWidth });
    const stave2 = f.Stave({ y: 150, width: staveWidth });
    stave1.draw();
    stave2.draw();
    voice1.draw(f.getContext(), stave1);
    voice2.draw(f.getContext(), stave2);
    beams.forEach((b) => b.setContext(f.getContext()).draw());
    options.assert.ok(true);
}
function longMeasureProblems(options) {
    const registry = new Registry();
    Registry.enableDefaultRegistry(registry);
    const f = VexFlowTests.makeFactory(options, 1500, 300);
    const score = f.EasyScore();
    score.set({ time: '4/4' });
    const notes1 = score.notes('b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/8,b4/8,b4/4,b4/4,b4/2,b4/2,b4/4,b4/2,b4/8,b4/8');
    const voice1 = new Voice().setMode(Voice.Mode.SOFT);
    const notes2 = score.notes('d3/4,(ab3 f4)/2,d3/4,ab3/4,d3/2,ab3/4,d3/4,ab3/2,d3/4,ab3/4,d3/2,ab3/4,d3/4,ab3/2,d3/4,ab3/4,d3/2,ab3/4,d4/4,d4/2,d4/4', { clef: 'bass' });
    const voice2 = new Voice().setMode(Voice.Mode.SOFT);
    voice2.addTickables(notes2);
    voice1.addTickables(notes1);
    const formatter = f.Formatter().joinVoices([voice1]).joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);
    formatter.format([voice1, voice2], width);
    const stave1 = f.Stave({ y: 50, width: width + Stave.defaultPadding });
    const stave2 = f.Stave({ y: 200, width: width + Stave.defaultPadding });
    stave1.draw();
    stave2.draw();
    voice1.draw(f.getContext(), stave1);
    voice2.draw(f.getContext(), stave2);
    options.assert.ok(true);
}
function accidentalJustification(options) {
    const f = VexFlowTests.makeFactory(options, 600, 300);
    const score = f.EasyScore();
    const notes11 = score.notes('a4/2, a4/4, a4/8, ab4/16, an4/16');
    const voice11 = score.voice(notes11, { time: '4/4' });
    const notes21 = score.notes('c4/2, d4/8, d4/8, e4/8, e4/8');
    const voice21 = score.voice(notes21, { time: '4/4' });
    let beams = Beam.generateBeams(notes11.slice(2));
    beams = beams.concat(beams, Beam.generateBeams(notes21.slice(1, 3)));
    beams = beams.concat(Beam.generateBeams(notes21.slice(3)));
    const formatter = f.Formatter({}).joinVoices([voice11]).joinVoices([voice21]);
    const width = formatter.preCalculateMinTotalWidth([voice11, voice21]);
    const stave11 = f.Stave({ y: 20, width: width + Stave.defaultPadding });
    const stave21 = f.Stave({ y: 130, width: width + Stave.defaultPadding });
    formatter.format([voice11, voice21], width);
    const ctx = f.getContext();
    stave11.setContext(ctx).draw();
    stave21.setContext(ctx).draw();
    voice11.draw(ctx, stave11);
    voice21.draw(ctx, stave21);
    beams.forEach((b) => b.setContext(ctx).draw());
    options.assert.ok(true);
}
function unalignedNoteDurations1(options) {
    const f = VexFlowTests.makeFactory(options, 600, 250);
    const score = f.EasyScore();
    const notes11 = [
        new StaveNote({ keys: ['a/4'], duration: '8' }),
        new StaveNote({ keys: ['b/4'], duration: '4' }),
        new StaveNote({ keys: ['b/4'], duration: '8' }),
    ];
    const notes21 = [
        new StaveNote({ keys: ['a/4'], duration: '16' }),
        new StaveNote({ keys: ['b/4.'], duration: '4' }),
        new StaveNote({ keys: ['a/4'], duration: '8d' }),
    ];
    Dot.buildAndAttach([notes21[2]], { all: true });
    const ctx = f.getContext();
    const voice11 = score.voice(notes11, { time: '2/4' }).setMode(Voice.Mode.SOFT);
    const voice21 = score.voice(notes21, { time: '2/4' }).setMode(Voice.Mode.SOFT);
    const beams21 = Beam.generateBeams(notes21);
    const beams11 = Beam.generateBeams(notes11);
    const formatter = new Formatter();
    formatter.joinVoices([voice11]);
    formatter.joinVoices([voice21]);
    const width = formatter.preCalculateMinTotalWidth([voice11, voice21]);
    const stave11 = f.Stave({ y: 20, width: width + Stave.defaultPadding });
    const stave21 = f.Stave({ y: 130, width: width + Stave.defaultPadding });
    formatter.format([voice11, voice21], width);
    stave11.setContext(ctx).draw();
    stave21.setContext(ctx).draw();
    voice11.draw(ctx, stave11);
    voice21.draw(ctx, stave21);
    beams21.forEach((b) => b.setContext(ctx).draw());
    beams11.forEach((b) => b.setContext(ctx).draw());
    options.assert.ok(voice11.getTickables()[1].getX() > voice21.getTickables()[1].getX());
}
function unalignedNoteDurations2(options) {
    const notes1 = [
        new StaveNote({ keys: ['b/4'], duration: '8r' }),
        new StaveNote({ keys: ['g/4'], duration: '16' }),
        new StaveNote({ keys: ['c/5'], duration: '16' }),
        new StaveNote({ keys: ['e/5'], duration: '16' }),
        new StaveNote({ keys: ['g/4'], duration: '16' }),
        new StaveNote({ keys: ['c/5'], duration: '16' }),
        new StaveNote({ keys: ['e/5'], duration: '16' }),
        new StaveNote({ keys: ['b/4'], duration: '8r' }),
        new StaveNote({ keys: ['g/4'], duration: '16' }),
        new StaveNote({ keys: ['c/5'], duration: '16' }),
        new StaveNote({ keys: ['e/5'], duration: '16' }),
        new StaveNote({ keys: ['g/4'], duration: '16' }),
        new StaveNote({ keys: ['c/5'], duration: '16' }),
        new StaveNote({ keys: ['e/5'], duration: '16' }),
    ];
    const notes2 = [
        new StaveNote({ keys: ['a/4'], duration: '16r' }),
        new StaveNote({ keys: ['e/4.'], duration: '8d' }),
        new StaveNote({ keys: ['e/4'], duration: '4' }),
        new StaveNote({ keys: ['a/4'], duration: '16r' }),
        new StaveNote({ keys: ['e/4.'], duration: '8d' }),
        new StaveNote({ keys: ['e/4'], duration: '4' }),
    ];
    const f = VexFlowTests.makeFactory(options, 750, 280);
    const context = f.getContext();
    const voice1 = new Voice({ num_beats: 4, beat_value: 4 });
    voice1.addTickables(notes1);
    const voice2 = new Voice({ num_beats: 4, beat_value: 4 });
    voice2.addTickables(notes2);
    const formatter = new Formatter({ globalSoftmax: options.params.globalSoftmax });
    formatter.joinVoices([voice1]);
    formatter.joinVoices([voice2]);
    const width = formatter.preCalculateMinTotalWidth([voice1, voice2]);
    formatter.format([voice1, voice2], width);
    const stave1 = new Stave(10, 40, width + Stave.defaultPadding);
    const stave2 = new Stave(10, 100, width + Stave.defaultPadding);
    stave1.setContext(context).draw();
    stave2.setContext(context).draw();
    voice1.draw(context, stave1);
    voice2.draw(context, stave2);
    options.assert.ok(voice1.getTickables()[1].getX() > voice2.getTickables()[1].getX());
}
function alignedMixedElements(options) {
    const f = VexFlowTests.makeFactory(options, 800, 500);
    const context = f.getContext();
    const stave = new Stave(10, 200, 400);
    const stave2 = new Stave(410, 200, 400);
    const notes = [
        new StaveNote({ keys: ['c/5'], duration: '8' })
            .addModifier(new Accidental('##'), 0)
            .addModifier(new FretHandFinger('4').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new StringNumber('3').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a.').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a>').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a^').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('am').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a@u').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Annotation('yyyy').setVerticalJustification(AnnotationVerticalJustify.BOTTOM), 0)
            .addModifier(new Annotation('xxxx').setVerticalJustification(AnnotationVerticalJustify.BOTTOM).setFont('sans-serif', 20), 0)
            .addModifier(new Annotation('ttt').setVerticalJustification(AnnotationVerticalJustify.BOTTOM).setFont('sans-serif', 20), 0),
        new StaveNote({ keys: ['c/5'], duration: '8', stem_direction: Stem.DOWN })
            .addModifier(new StringNumber('3').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a.').setPosition(ModifierPosition.BELOW), 0)
            .addModifier(new Articulation('a>').setPosition(ModifierPosition.BELOW), 0),
        new StaveNote({ keys: ['c/5'], duration: '8' }),
    ];
    const notes2 = [
        new StaveNote({ keys: ['c/5'], duration: '8' })
            .addModifier(new StringNumber('3').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Annotation('yyyy').setVerticalJustification(AnnotationVerticalJustify.TOP), 0),
        new StaveNote({ keys: ['c/5'], duration: '8', stem_direction: Stem.DOWN })
            .addModifier(new FretHandFinger('4').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new StringNumber('3').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('a>').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('a^').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('am').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Articulation('a@u').setPosition(ModifierPosition.ABOVE), 0)
            .addModifier(new Annotation('yyyy').setVerticalJustification(AnnotationVerticalJustify.TOP), 0)
            .addModifier(new Annotation('xxxx').setVerticalJustification(AnnotationVerticalJustify.TOP).setFont('sans-serif', 20), 0)
            .addModifier(new Annotation('ttt').setVerticalJustification(AnnotationVerticalJustify.TOP).setFont('sans-serif', 20), 0),
        new StaveNote({ keys: ['c/5'], duration: '8' }),
    ];
    const tuplet = new Tuplet(notes).setTupletLocation(-1);
    const tuplet2 = new Tuplet(notes2).setTupletLocation(1);
    Formatter.FormatAndDraw(context, stave, notes);
    Formatter.FormatAndDraw(context, stave2, notes2);
    stave.setContext(context).draw();
    stave2.setContext(context).draw();
    tuplet.setContext(context).draw();
    tuplet2.setContext(context).draw();
    options.assert.ok(true);
}
function justifyStaveNotes(options) {
    const f = VexFlowTests.makeFactory(options, 520, 280);
    const ctx = f.getContext();
    const score = f.EasyScore();
    let y = 30;
    function justifyToWidth(width) {
        f.Stave({ y: y }).addClef('treble');
        const voices = [
            score.voice(score.notes('(cbb4 en4 a4)/2, (d4 e4 f4)/8, (d4 f4 a4)/8, (cn4 f#4 a4)/4', { stem: 'down' })),
            score.voice(score.notes('(bb4 e#5 a5)/4, (d5 e5 f5)/2, (c##5 fb5 a5)/4', { stem: 'up' })),
        ];
        f.Formatter()
            .joinVoices(voices)
            .format(voices, width - (Stave.defaultPadding + getGlyphWidth('gClef')));
        voices[0].getTickables().forEach((note) => Note.plotMetrics(ctx, note, y + 140));
        voices[1].getTickables().forEach((note) => Note.plotMetrics(ctx, note, y - 20));
        y += 210;
    }
    justifyToWidth(520);
    f.draw();
    options.assert.ok(true);
}
function notesWithTab(options) {
    const f = VexFlowTests.makeFactory(options, 420, 580);
    const score = f.EasyScore();
    let y = 10;
    function justifyToWidth(width) {
        const stave = f.Stave({ y: y }).addClef('treble');
        const voice = score.voice(score.notes('d#4/2, (c4 d4)/8, d4/8, (c#4 e4 a4)/4', { stem: 'up' }));
        y += 100;
        f.TabStave({ y: y }).addTabGlyph().setNoteStartX(stave.getNoteStartX());
        const tabVoice = score.voice([
            f.TabNote({ positions: [{ str: 3, fret: 6 }], duration: '2' }).addModifier(new Bend('Full'), 0),
            f
                .TabNote({
                positions: [
                    { str: 2, fret: 3 },
                    { str: 3, fret: 5 },
                ],
                duration: '8',
            })
                .addModifier(new Bend('Unison'), 1),
            f.TabNote({ positions: [{ str: 3, fret: 7 }], duration: '8' }),
            f.TabNote({
                positions: [
                    { str: 3, fret: 6 },
                    { str: 4, fret: 7 },
                    { str: 2, fret: 5 },
                ],
                duration: '4',
            }),
        ]);
        f.Formatter().joinVoices([voice]).joinVoices([tabVoice]).format([voice, tabVoice], width);
        y += 150;
    }
    justifyToWidth(0);
    justifyToWidth(300);
    f.draw();
    options.assert.ok(true);
}
function multiStaves(options) {
    const f = VexFlowTests.makeFactory(options, 600, 400);
    const ctx = f.getContext();
    const score = f.EasyScore();
    const notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
    const notes21 = score.notes('d4/8, d4, d4, d4, e4, eb4');
    const notes31 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    let voices = [
        score.voice(notes11, { time: '6/8' }),
        score.voice(notes21, { time: '6/8' }),
        score.voice(notes31, { time: '6/8' }),
    ];
    let formatter = f.Formatter();
    voices.forEach((v) => formatter.joinVoices([v]));
    let width = formatter.preCalculateMinTotalWidth(voices);
    formatter.format(voices, width);
    let beams = [
        new Beam(notes21.slice(0, 3), true),
        new Beam(notes21.slice(3, 6), true),
        new Beam(notes31.slice(0, 3), true),
        new Beam(notes31.slice(3, 6), true),
    ];
    const staveYs = [20, 130, 250];
    let staveWidth = width + getGlyphWidth('gClef') + getGlyphWidth('timeSig8') + Stave.defaultPadding;
    let staves = [
        f.Stave({ y: staveYs[0], width: staveWidth }).addClef('treble').addTimeSignature('6/8'),
        f.Stave({ y: staveYs[1], width: staveWidth }).addClef('treble').addTimeSignature('6/8'),
        f.Stave({ y: staveYs[2], width: staveWidth }).addClef('bass').addTimeSignature('6/8'),
    ];
    f.StaveConnector({
        top_stave: staves[1],
        bottom_stave: staves[2],
        type: 'brace',
    });
    for (let i = 0; i < staves.length; ++i) {
        staves[i].setContext(ctx).draw();
        voices[i].draw(ctx, staves[i]);
    }
    beams.forEach((beam) => beam.setContext(ctx).draw());
    const notes12 = score.notes('ab4/4, bb4/8, (cb5 eb5)/4[stem="down"], d5/8[stem="down"]');
    const notes22 = score.notes('(eb4 ab4)/4., (c4 eb4 ab4)/4, db5/8', { stem: 'up' });
    const notes32 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    voices = [
        score.voice(notes12, { time: '6/8' }),
        score.voice(notes22, { time: '6/8' }),
        score.voice(notes32, { time: '6/8' }),
    ];
    formatter = f.Formatter();
    voices.forEach((v) => formatter.joinVoices([v]));
    width = formatter.preCalculateMinTotalWidth(voices);
    const staveX = staves[0].getX() + staves[0].getWidth();
    staveWidth = width + Stave.defaultPadding;
    staves = [
        f.Stave({ x: staveX, y: staveYs[0], width: staveWidth }),
        f.Stave({ x: staveX, y: staveYs[1], width: staveWidth }),
        f.Stave({ x: staveX, y: staveYs[2], width: staveWidth }),
    ];
    formatter.format(voices, width);
    beams = [
        new Beam(notes32.slice(0, 3), true),
        new Beam(notes32.slice(3, 6), true),
    ];
    for (let i = 0; i < staves.length; ++i) {
        staves[i].setContext(ctx).draw();
        voices[i].draw(ctx, staves[i]);
        voices[i].getTickables().forEach((note) => Note.plotMetrics(ctx, note, staveYs[i] - 20));
    }
    beams.forEach((beam) => beam.setContext(ctx).draw());
    options.assert.ok(true);
}
function proportional(options) {
    const debug = options.params.debug;
    Registry.enableDefaultRegistry(new Registry());
    const f = VexFlowTests.makeFactory(options, 775, 750);
    const system = f.System({
        x: 50,
        autoWidth: true,
        debugFormatter: debug,
        noJustification: !(options.params.justify === undefined && true),
        formatIterations: options.params.iterations,
        details: { alpha: options.params.alpha },
    });
    const score = f.EasyScore();
    const voices = [
        score.notes('c5/8, c5'),
        score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
        score.notes('c5/16, c5, c5, c5'),
        score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
        score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
    ];
    const createVoice = (notes) => score.voice(notes, { time: '1/4' });
    const createStave = (voice) => system
        .addStave({ voices: [voice], debugNoteMetrics: debug })
        .addClef('treble')
        .addTimeSignature('1/4');
    voices.map(createVoice).forEach(createStave);
    system.addConnector().setType(StaveConnector.type.BRACKET);
    f.draw();
    Registry.disableDefaultRegistry();
    options.assert.ok(true);
}
function softMax(options) {
    const f = VexFlowTests.makeFactory(options, 550, 500);
    const textX = 450 / 0.8;
    f.getContext().scale(0.8, 0.8);
    function draw(y, factor) {
        const score = f.EasyScore();
        const system = f.System({
            x: 100,
            y,
            details: { softmaxFactor: factor },
            autoWidth: true,
        });
        system
            .addStave({
            voices: [
                score.voice(score
                    .notes('C#5/h, a4/q')
                    .concat(score.beam(score.notes('Abb4/8, A4/8')))
                    .concat(score.beam(score.notes('A4/16, A#4, A4, Ab4/32, A4'))), { time: '5/4' }),
            ],
        })
            .addClef('treble')
            .addTimeSignature('5/4');
        f.draw();
        f.getContext().fillText(`softmax: ${factor.toString()}`, textX, y + 50);
        options.assert.ok(true);
    }
    draw(50, 1);
    draw(150, 2);
    draw(250, 5);
    draw(350, 10);
    draw(450, 15);
}
function mixTime(options) {
    const f = VexFlowTests.makeFactory(options, 400 + Stave.defaultPadding, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
        details: {},
        autoWidth: true,
        debugFormatter: true,
    });
    system
        .addStave({
        voices: [score.voice(score.notes('C#5/q, B4').concat(score.beam(score.notes('A4/8, E4, C4, D4'))))],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    system
        .addStave({
        voices: [score.voice(score.notes('C#5/q, B4, B4').concat(score.tuplet(score.beam(score.notes('A4/8, E4, C4')))))],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    f.draw();
    options.assert.ok(true);
}
function tightNotes1(options) {
    const f = VexFlowTests.makeFactory(options, 440, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
        autoWidth: true,
        debugFormatter: true,
        details: { maxIterations: 10 },
    });
    system
        .addStave({
        voices: [
            score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
        ],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    system
        .addStave({
        voices: [
            score.voice(score.notes('B4/q, B4').concat(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')))),
        ],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    f.draw();
    options.assert.ok(true);
}
function tightNotes2(options) {
    const f = VexFlowTests.makeFactory(options, 440, 250);
    f.getContext().scale(0.8, 0.8);
    const score = f.EasyScore();
    const system = f.System({
        autoWidth: true,
        debugFormatter: true,
    });
    system
        .addStave({
        voices: [
            score.voice(score.beam(score.notes('B4/16, B4, B4, B4, B4, B4, B4, B4')).concat(score.notes('B4/q, B4'))),
        ],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    system
        .addStave({
        voices: [score.voice(score.notes('B4/w'))],
    })
        .addClef('treble')
        .addTimeSignature('4/4');
    f.draw();
    options.assert.ok(true);
}
function annotations(options) {
    const pageWidth = 916;
    const pageHeight = 600;
    const f = VexFlowTests.makeFactory(options, pageWidth, pageHeight);
    const context = f.getContext();
    const lyrics1 = ['ipso', 'ipso-', 'ipso', 'ipso', 'ipsoz', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];
    const lyrics2 = ['ipso', 'ipso-', 'ipsoz', 'ipso', 'ipso', 'ipso-', 'ipso', 'ipso', 'ipso', 'ip', 'ipso'];
    const smar = [
        {
            sm: 5,
            width: 550,
            lyrics: lyrics1,
            title: '550px,softMax:5',
        },
        {
            sm: 5,
            width: 550,
            lyrics: lyrics2,
            title: '550px,softmax:5,different word order',
        },
        {
            sm: 10,
            width: 550,
            lyrics: lyrics2,
            title: '550px,softmax:10',
        },
        {
            sm: 15,
            width: 550,
            lyrics: lyrics2,
            title: '550px,softmax:15',
        },
    ];
    const rowSize = 140;
    const beats = 12;
    const beatsPer = 8;
    const beamGroup = 3;
    const durations = ['8d', '16', '8', '8d', '16', '8', '8d', '16', '8', '4', '8'];
    const beams = [];
    let y = 40;
    smar.forEach((sm) => {
        const stave = new Stave(10, y, sm.width);
        const notes = [];
        let iii = 0;
        context.fillText(sm.title, 100, y);
        y += rowSize;
        durations.forEach((dd) => {
            const note = new StaveNote({ keys: ['b/4'], duration: dd });
            if (dd.indexOf('d') >= 0) {
                Dot.buildAndAttach([note], { all: true });
            }
            if (sm.lyrics.length > iii) {
                note.addModifier(new Annotation(sm.lyrics[iii])
                    .setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
                    .setFont(Font.SERIF, 12, FontWeight.NORMAL));
            }
            notes.push(note);
            iii += 1;
        });
        notes.forEach((note) => {
            if (note.getDuration().indexOf('d') >= 0) {
                Dot.buildAndAttach([note], { all: true });
            }
        });
        let notesToBeam = [];
        notes.forEach((note) => {
            if (note.getIntrinsicTicks() < 4096) {
                notesToBeam.push(note);
                if (notesToBeam.length >= beamGroup) {
                    beams.push(new Beam(notesToBeam));
                    notesToBeam = [];
                }
            }
            else {
                notesToBeam = [];
            }
        });
        const voice1 = new Voice({ num_beats: beats, beat_value: beatsPer }).setMode(Voice.Mode.SOFT).addTickables(notes);
        const fmt = new Formatter({ softmaxFactor: sm.sm, maxIterations: 2 }).joinVoices([voice1]);
        fmt.format([voice1], sm.width - 11);
        stave.setContext(context).draw();
        voice1.draw(context, stave);
        beams.forEach((b) => b.setContext(context).draw());
    });
    options.assert.ok(true);
}
VexFlowTests.register(FormatterTests);
export { FormatterTests };
