import { VexFlowTests } from './vexflow_test_helpers.js';
import { Beam } from '../src/beam.js';
import { Dot } from '../src/dot.js';
import { Flow } from '../src/flow.js';
import { Formatter } from '../src/formatter.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { Tuplet } from '../src/tuplet.js';
import { Voice } from '../src/voice.js';
const RestsTests = {
    Start() {
        QUnit.module('Rests');
        const run = VexFlowTests.runTests;
        run('Outside Stave', ledgerRest);
        run('Dotted', basic);
        run('Auto Align - Beamed Notes Stems Up', beamsUp);
        run('Auto Align - Beamed Notes Stems Down', beamsDown);
        run('Auto Align - Tuplets Stems Up', tupletsUp);
        run('Auto Align - Tuplets Stems Down', tupletsDown);
        run('Auto Align - Single Voice (Default)', singleVoiceDefaultAlignment);
        run('Auto Align - Single Voice (Align All)', singleVoiceAlignAll);
        run('Auto Align - Multi Voice', multiVoice);
    },
};
function setupContext(options, contextBuilder, width = 350, height = 150) {
    const context = contextBuilder(options.elementId, width, height);
    context.scale(0.9, 0.9);
    context.font = '10pt Arial';
    const stave = new Stave(10, 30, width).addClef('treble').addTimeSignature('4/4').setContext(context).draw();
    return { context, stave };
}
function basic(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 700);
    const notes = [
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '16r' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '32r' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '64r' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: '128r' }),
    ];
    Dot.buildAndAttach(notes, { all: true });
    Formatter.FormatAndDraw(context, stave, notes);
    options.assert.ok(true, 'Dotted Rest Test');
}
function ledgerRest(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 700);
    const notes = [
        new StaveNote({ keys: ['a/5'], stem_direction: 1, duration: 'wr' }),
        new StaveNote({ keys: ['c/6'], stem_direction: 1, duration: 'hr' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'hr' }),
        new StaveNote({ keys: ['a/3'], stem_direction: 1, duration: 'wr' }),
        new StaveNote({ keys: ['f/3'], stem_direction: 1, duration: 'hr' }),
        new StaveNote({ keys: ['b/4'], stem_direction: 1, duration: 'wr' }),
    ];
    Formatter.FormatAndDraw(context, stave, notes);
    options.assert.ok(true, 'Leger/Ledger Rest Test');
}
const note = (noteStruct) => new StaveNote(noteStruct);
function beamsUp(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['e/5'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        note({ keys: ['b/5'], stem_direction: 1, duration: '8' }),
        note({ keys: ['c/5'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '8r' }),
        note({ keys: ['c/4'], stem_direction: 1, duration: '8' }),
    ];
    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));
    Formatter.FormatAndDraw(context, stave, notes);
    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Beams Up Test');
}
function beamsDown(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['c/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4', 'd/5', 'a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['e/4'], stem_direction: -1, duration: '8' }),
    ];
    const beam1 = new Beam(notes.slice(0, 4));
    const beam2 = new Beam(notes.slice(4, 8));
    const beam3 = new Beam(notes.slice(8, 12));
    Formatter.FormatAndDraw(context, stave, notes);
    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Beams Down Test');
}
function tupletsUp(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['g/5'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
    ];
    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_TOP);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);
    Formatter.FormatAndDraw(context, stave, notes);
    tuplet1.setContext(context).draw();
    tuplet2.setContext(context).draw();
    tuplet3.setContext(context).draw();
    tuplet4.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Tuplets Stem Up Test');
}
function tupletsDown(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['a/5'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
    ];
    const beam1 = new Beam(notes.slice(0, 3));
    const beam2 = new Beam(notes.slice(3, 6));
    const beam3 = new Beam(notes.slice(6, 9));
    const beam4 = new Beam(notes.slice(9, 12));
    const tuplet1 = new Tuplet(notes.slice(0, 3)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet2 = new Tuplet(notes.slice(3, 6)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet3 = new Tuplet(notes.slice(6, 9)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    const tuplet4 = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_BOTTOM);
    Formatter.FormatAndDraw(context, stave, notes);
    tuplet1.setContext(context).draw();
    tuplet2.setContext(context).draw();
    tuplet3.setContext(context).draw();
    tuplet4.setContext(context).draw();
    beam1.setContext(context).draw();
    beam2.setContext(context).draw();
    beam3.setContext(context).draw();
    beam4.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Tuplets Stem Down Test');
}
function singleVoiceDefaultAlignment(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    ];
    const beam = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);
    Formatter.FormatAndDraw(context, stave, notes);
    tuplet.setContext(context).draw();
    beam.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Default Test');
}
function singleVoiceAlignAll(options, contextBuilder) {
    const { context, stave } = setupContext(options, contextBuilder, 600, 160);
    const notes = [
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['f/4'], stem_direction: -1, duration: '4' }),
        note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['a/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '8' }),
        note({ keys: ['e/5'], stem_direction: -1, duration: '8' }),
        note({ keys: ['a/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: 1, duration: '4r' }),
        note({ keys: ['b/5'], stem_direction: 1, duration: '4' }),
        note({ keys: ['d/5'], stem_direction: -1, duration: '4' }),
        note({ keys: ['g/5'], stem_direction: -1, duration: '4' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
        note({ keys: ['b/4'], stem_direction: -1, duration: '4r' }),
    ];
    const beam = new Beam(notes.slice(5, 9));
    const tuplet = new Tuplet(notes.slice(9, 12)).setTupletLocation(Tuplet.LOCATION_TOP);
    Formatter.FormatAndDraw(context, stave, notes, { align_rests: true });
    tuplet.setContext(context).draw();
    beam.setContext(context).draw();
    options.assert.ok(true, 'Auto Align Rests - Align All Test');
}
function multiVoice(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 600, 200);
    const stave = new Stave(50, 10, 500).addClef('treble').setContext(ctx).addTimeSignature('4/4').draw();
    const noteOnStave = (noteStruct) => new StaveNote(noteStruct).setStave(stave);
    const notes1 = [
        noteOnStave({ keys: ['c/4', 'e/4', 'g/4'], duration: '4' }),
        noteOnStave({ keys: ['b/4'], duration: '4r' }),
        noteOnStave({ keys: ['c/4', 'd/4', 'a/4'], duration: '4' }),
        noteOnStave({ keys: ['b/4'], duration: '4r' }),
    ];
    const notes2 = [
        noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        noteOnStave({ keys: ['b/4'], stem_direction: -1, duration: '8r' }),
        noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
        noteOnStave({ keys: ['e/3'], stem_direction: -1, duration: '8' }),
    ];
    const voice1 = new Voice(Flow.TIME4_4).addTickables(notes1);
    const voice2 = new Voice(Flow.TIME4_4).addTickables(notes2);
    new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave, { align_rests: true });
    const beam2_1 = new Beam(notes2.slice(0, 4));
    const beam2_2 = new Beam(notes2.slice(4, 8));
    voice2.draw(ctx);
    voice1.draw(ctx);
    beam2_1.setContext(ctx).draw();
    beam2_2.setContext(ctx).draw();
    options.assert.ok(true, 'Strokes Test Multi Voice');
}
VexFlowTests.register(RestsTests);
export { RestsTests };
