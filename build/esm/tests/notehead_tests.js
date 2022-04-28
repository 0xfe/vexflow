import { VexFlowTests } from './vexflow_test_helpers.js';
import { Flow } from '../src/flow.js';
import { Formatter } from '../src/formatter.js';
import { NoteHead } from '../src/notehead.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { TickContext } from '../src/tickcontext.js';
import { Voice } from '../src/voice.js';
const NoteHeadTests = {
    Start() {
        QUnit.module('NoteHead');
        const run = VexFlowTests.runTests;
        run('Basic', basic);
        run('Various Heads', variousHeads);
        run('Drum Chord Heads', drumChordHeads);
        run('Bounding Boxes', basicBoundingBoxes);
    },
};
function setContextStyle(ctx) {
    ctx.scale(1.8, 1.8);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
}
function basic(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 450, 250);
    setContextStyle(ctx);
    const stave = new Stave(10, 0, 250).addClef('treble');
    stave.setContext(ctx).draw();
    const formatter = new Formatter();
    const voice = new Voice(Flow.TIME4_4).setStrict(false);
    const note_head1 = new NoteHead({ duration: '4', line: 3 });
    const note_head2 = new NoteHead({ duration: '1', line: 2.5 });
    const note_head3 = new NoteHead({ duration: '2', line: 0 });
    voice.addTickables([note_head1, note_head2, note_head3]);
    formatter.joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(ctx, stave);
    ok('Basic NoteHead test');
}
function showNote(noteStruct, stave, ctx, x) {
    const note = new StaveNote(noteStruct).setStave(stave);
    new TickContext().addTickable(note).preFormat().setX(x);
    note.setContext(ctx).draw();
    return note;
}
function variousHeads(options, contextBuilder) {
    const notes = [
        { keys: ['g/5/d0'], duration: '4' },
        { keys: ['g/5/d1'], duration: '4' },
        { keys: ['g/5/d2'], duration: '4' },
        { keys: ['g/5/d3'], duration: '4' },
        { keys: ['x/'], duration: '1' },
        { keys: ['g/5/t0'], duration: '1' },
        { keys: ['g/5/t1'], duration: '4' },
        { keys: ['g/5/t2'], duration: '4' },
        { keys: ['g/5/t3'], duration: '4' },
        { keys: ['x/'], duration: '1' },
        { keys: ['g/5/x0'], duration: '1' },
        { keys: ['g/5/x1'], duration: '4' },
        { keys: ['g/5/x2'], duration: '4' },
        { keys: ['g/5/x3'], duration: '4' },
        { keys: ['x/'], duration: '1' },
        { keys: ['g/5/s1'], duration: '4' },
        { keys: ['g/5/s2'], duration: '4' },
        { keys: ['x/'], duration: '1' },
        { keys: ['g/5/r1'], duration: '4' },
        { keys: ['g/5/r2'], duration: '4' },
    ];
    const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);
    for (let staveNum = 0; staveNum < 2; ++staveNum) {
        const stave = new Stave(10, 10 + staveNum * 120, notes.length * 25 + 75)
            .addClef('percussion')
            .setContext(ctx)
            .draw();
        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];
            note.stem_direction = staveNum === 0 ? -1 : 1;
            const staveNote = showNote(note, stave, ctx, (i + 1) * 25);
            ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
            ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
    }
}
function drumChordHeads(options, contextBuilder) {
    const notes = [
        { keys: ['a/4/d0', 'g/5/x3'], duration: '4' },
        { keys: ['a/4/x3', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/d1', 'g/5/x2'], duration: '4' },
        { keys: ['a/4/x2', 'g/5/d1'], duration: '4' },
        { keys: ['a/4/d2', 'g/5/x1'], duration: '4' },
        { keys: ['a/4/x1', 'g/5/d2'], duration: '4' },
        { keys: ['a/4/d3', 'g/5/x0'], duration: '4' },
        { keys: ['a/4/x0', 'g/5/d3'], duration: '4' },
        { keys: ['a/4', 'g/5/d0'], duration: '4' },
        { keys: ['a/4/x3', 'g/5'], duration: '4' },
        { keys: ['a/4/t0', 'g/5/s1'], duration: '4' },
        { keys: ['a/4/s1', 'g/5/t0'], duration: '4' },
        { keys: ['a/4/t1', 'g/5/s2'], duration: '4' },
        { keys: ['a/4/s2', 'g/5/t1'], duration: '4' },
        { keys: ['a/4/t2', 'g/5/r1'], duration: '4' },
        { keys: ['a/4/r1', 'g/5/t2'], duration: '4' },
        { keys: ['a/4/t3', 'g/5/r2'], duration: '4' },
        { keys: ['a/4/r2', 'g/5/t3'], duration: '4' },
    ];
    const ctx = contextBuilder(options.elementId, notes.length * 25 + 100, 240);
    for (let h = 0; h < 2; ++h) {
        const stave = new Stave(10, 10 + h * 120, notes.length * 25 + 75).addClef('percussion').setContext(ctx).draw();
        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];
            note.stem_direction = h === 0 ? -1 : 1;
            const staveNote = showNote(note, stave, ctx, (i + 1) * 25);
            ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
            ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
    }
}
function basicBoundingBoxes(options, contextBuilder) {
    const ctx = contextBuilder(options.elementId, 450, 250);
    setContextStyle(ctx);
    const stave = new Stave(10, 0, 250).addClef('treble');
    stave.setContext(ctx).draw();
    const formatter = new Formatter();
    const voice = new Voice(Flow.TIME4_4).setStrict(false);
    const nh1 = new NoteHead({ duration: '4', line: 3 });
    const nh2 = new NoteHead({ duration: '2', line: 2.5 });
    const nh3 = new NoteHead({ duration: '1', line: 0 });
    voice.addTickables([nh1, nh2, nh3]);
    formatter.joinVoices([voice]).formatToStave([voice], stave);
    voice.draw(ctx, stave);
    for (const bb of [nh1.getBoundingBox(), nh2.getBoundingBox(), nh3.getBoundingBox()]) {
        ctx.rect(bb.getX(), bb.getY(), bb.getW(), bb.getH());
    }
    ctx.stroke();
    ok('NoteHead Bounding Boxes');
}
VexFlowTests.register(NoteHeadTests);
export { NoteHeadTests };
