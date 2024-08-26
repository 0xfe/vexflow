import { VexFlowTests } from './vexflow_test_helpers.js';
import { Annotation } from '../src/annotation.js';
import { Beam } from '../src/beam.js';
import { Formatter } from '../src/formatter.js';
import { Stave } from '../src/stave.js';
import { BarlineType } from '../src/stavebarline.js';
import { StaveNote } from '../src/stavenote.js';
const RhythmTests = {
    Start() {
        QUnit.module('Rhythm');
        const run = VexFlowTests.runTests;
        run('Rhythm Draw - slash notes', drawBasic);
        run('Rhythm Draw - beamed slash notes', drawBeamedSlashNotes);
        run('Rhythm Draw - beamed slash notes, some rests', drawSlashAndBeamAndRests);
        run('Rhythm Draw - 16th note rhythm with scratches', drawSixtenthWithScratches);
        run('Rhythm Draw - 32nd note rhythm with scratches', drawThirtySecondWithScratches);
    },
};
function drawBasic(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 800, 150);
    const staveBar1 = new Stave(10, 30, 150);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('C');
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [new StaveNote({ keys: ['b/4'], duration: '1s', stem_direction: -1 })];
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 120);
    staveBar2.setBegBarType(BarlineType.SINGLE);
    staveBar2.setEndBarType(BarlineType.SINGLE);
    staveBar2.setContext(ctx).draw();
    const notesBar2 = [
        new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
        new StaveNote({ keys: ['b/4'], duration: '2s', stem_direction: -1 }),
    ];
    Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 170);
    staveBar3.setContext(ctx).draw();
    const notesBar3 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '4s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '4s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '4s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '4s',
            stem_direction: -1,
        }),
    ];
    Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
    const staveBar4 = new Stave(staveBar3.getWidth() + staveBar3.getX(), staveBar3.getY(), 200);
    staveBar4.setContext(ctx).draw();
    const notesBar4 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
    ];
    Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
    options.assert.expect(0);
}
function drawBeamedSlashNotes(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 800, 150);
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('C');
    staveBar1.setContext(ctx).draw();
    const notesBar1_part1 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
    ];
    const notesBar1_part2 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
    ];
    const beam1 = new Beam(notesBar1_part1);
    const beam2 = new Beam(notesBar1_part2);
    const notesBar1 = notesBar1_part1.concat(notesBar1_part2);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();
    options.assert.expect(0);
}
function drawSlashAndBeamAndRests(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 800, 150);
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();
    const notesBar1_part1 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({ keys: ['b/4'], duration: '8s', stem_direction: -1 }),
    ];
    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 2), 0);
    const notesBar1_part2 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '8r',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8r',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8r',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '8s',
            stem_direction: -1,
        }),
    ];
    const beam1 = new Beam(notesBar1_part1);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));
    beam1.setContext(ctx).draw();
    const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 220);
    staveBar2.setContext(ctx).draw();
    const notesBar2 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '1s',
            stem_direction: -1,
        }),
    ];
    notesBar2[0].addModifier(new Annotation('F').setFont('Times', VexFlowTests.Font.size + 2), 0);
    Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
    options.assert.expect(0);
}
function drawSixtenthWithScratches(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 800, 150);
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();
    const notesBar1_part1 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '16s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16m',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16s',
            stem_direction: -1,
        }),
    ];
    const notesBar1_part2 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '16m',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16s',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16r',
            stem_direction: -1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '16s',
            stem_direction: -1,
        }),
    ];
    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 3), 0);
    const beam1 = new Beam(notesBar1_part1);
    const beam2 = new Beam(notesBar1_part2);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1.concat(notesBar1_part2));
    beam1.setContext(ctx).draw();
    beam2.setContext(ctx).draw();
    options.assert.expect(0);
}
function drawThirtySecondWithScratches(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 800, 150);
    const staveBar1 = new Stave(10, 30, 300);
    staveBar1.setBegBarType(BarlineType.DOUBLE);
    staveBar1.setEndBarType(BarlineType.SINGLE);
    staveBar1.addClef('treble');
    staveBar1.addTimeSignature('4/4');
    staveBar1.addKeySignature('F');
    staveBar1.setContext(ctx).draw();
    const notesBar1_part1 = [
        new StaveNote({
            keys: ['b/4'],
            duration: '32s',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32s',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32m',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32s',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32m',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32s',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32r',
            stem_direction: 1,
        }),
        new StaveNote({
            keys: ['b/4'],
            duration: '32s',
            stem_direction: 1,
        }),
    ];
    notesBar1_part1[0].addModifier(new Annotation('C7').setFont('Times', VexFlowTests.Font.size + 3), 0);
    const beam1 = new Beam(notesBar1_part1);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);
    beam1.setContext(ctx).draw();
    options.assert.expect(0);
}
VexFlowTests.register(RhythmTests);
export { RhythmTests };
