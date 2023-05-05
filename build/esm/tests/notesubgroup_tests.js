import { VexFlowTests } from './vexflow_test_helpers.js';
import { BarNote } from '../src/barnote.js';
import { Note } from '../src/note.js';
import { BarlineType } from '../src/stavebarline.js';
const NoteSubGroupTests = {
    Start() {
        QUnit.module('NoteSubGroup');
        const run = VexFlowTests.runTests;
        run('Basic - ClefNote, TimeSigNote and BarNote', basic);
        run('Multi Voice', multiVoiceSingleDraw);
        run('Multi Voice Multiple Draws', multiVoiceDoubleDraw);
        run('Multi Staff', multiStaff);
    },
};
function createShortcuts(f) {
    return {
        createStaveNote: (noteStruct) => f.StaveNote(noteStruct),
        addAccidental: (note, accid) => note.addModifier(f.Accidental({ type: accid }), 0),
        addSubGroup: (note, subNotes) => note.addModifier(f.NoteSubGroup({ notes: subNotes }), 0),
    };
}
function basic(options) {
    const f = VexFlowTests.makeFactory(options, 750, 200);
    const ctx = f.getContext();
    const stave = f.Stave({ width: 600 }).addClef('treble');
    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);
    const notes = [
        { keys: ['f/5'], stem_direction: -1, duration: '4' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['g/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['a/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['c/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['c/3'], stem_direction: +1, duration: '4', clef: 'tenor' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'tenor' },
    ].map(createStaveNote);
    addAccidental(notes[1], '#');
    addAccidental(notes[2], 'n');
    addSubGroup(notes[1], [f.ClefNote({ type: 'bass', options: { size: 'small' } })]);
    addSubGroup(notes[2], [f.ClefNote({ type: 'alto', options: { size: 'small' } })]);
    addSubGroup(notes[4], [f.ClefNote({ type: 'tenor', options: { size: 'small' } }), new BarNote()]);
    addSubGroup(notes[5], [f.TimeSigNote({ time: '6/8' })]);
    addSubGroup(notes[6], [new BarNote(BarlineType.REPEAT_BEGIN)]);
    addAccidental(notes[4], 'b');
    addAccidental(notes[6], 'bb');
    const voice = f.Voice().setStrict(false).addTickables(notes);
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    notes.forEach((note) => Note.plotMetrics(ctx, note, 150));
    VexFlowTests.plotLegendForNoteWidth(ctx, 620, 120);
    options.assert.ok(true, 'all pass');
}
function multiVoiceSingleDraw(options) {
    multiVoiceHelper(options, 1);
}
function multiVoiceDoubleDraw(options) {
    multiVoiceHelper(options, 2);
}
function multiVoiceHelper(options, numDraws) {
    const f = VexFlowTests.makeFactory(options, 550, 200);
    const ctx = f.getContext();
    const stave = f.Stave().addClef('treble');
    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);
    const notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);
    const notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);
    addAccidental(notes1[1], '#');
    addSubGroup(notes1[1], [
        f.ClefNote({ type: 'bass', options: { size: 'small' } }),
        new BarNote(BarlineType.REPEAT_BEGIN),
        f.TimeSigNote({ time: '3/4' }),
    ]);
    addSubGroup(notes2[2], [
        f.ClefNote({ type: 'alto', options: { size: 'small' } }),
        f.TimeSigNote({ time: '9/8' }),
        new BarNote(BarlineType.DOUBLE),
    ]);
    addSubGroup(notes1[3], [f.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
    addAccidental(notes1[2], 'b');
    addAccidental(notes2[3], '#');
    const voices = [f.Voice().addTickables(notes1), f.Voice().addTickables(notes2)];
    f.Formatter().joinVoices(voices).formatToStave(voices, stave);
    for (let i = 0; i < numDraws; i++) {
        f.draw();
    }
    notes1.forEach((note) => Note.plotMetrics(ctx, note, 150));
    options.assert.ok(true, 'all pass');
}
function multiStaff(options) {
    const f = VexFlowTests.makeFactory(options, 550, 400);
    const { createStaveNote, addAccidental, addSubGroup } = createShortcuts(f);
    const stave1 = f.Stave({ x: 15, y: 30, width: 500 }).setClef('treble');
    const notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);
    const notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(createStaveNote);
    const stave2 = f.Stave({ x: 15, y: 150, width: 500 }).setClef('bass');
    const notes3 = [
        { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    ].map(createStaveNote);
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });
    f.Beam({ notes: notes3.slice(1, 4) });
    f.Beam({ notes: notes3.slice(5) });
    addAccidental(notes1[1], '#');
    addSubGroup(notes1[1], [f.ClefNote({ type: 'bass', options: { size: 'small' } }), f.TimeSigNote({ time: '3/4' })]);
    addSubGroup(notes2[2], [f.ClefNote({ type: 'alto', options: { size: 'small' } }), f.TimeSigNote({ time: '9/8' })]);
    addSubGroup(notes1[3], [f.ClefNote({ type: 'soprano', options: { size: 'small' } })]);
    addSubGroup(notes3[1], [f.ClefNote({ type: 'treble', options: { size: 'small' } })]);
    addSubGroup(notes3[5], [f.ClefNote({ type: 'bass', options: { size: 'small' } })]);
    addAccidental(notes3[0], '#');
    addAccidental(notes3[3], 'b');
    addAccidental(notes3[5], '#');
    addAccidental(notes1[2], 'b');
    addAccidental(notes2[3], '#');
    const voice1 = f.Voice().addTickables(notes1);
    const voice2 = f.Voice().addTickables(notes2);
    const voice3 = f.Voice().addTickables(notes3);
    f.Formatter().joinVoices([voice1, voice2]).joinVoices([voice3]).formatToStave([voice1, voice2, voice3], stave1);
    f.draw();
    options.assert.ok(true, 'all pass');
}
VexFlowTests.register(NoteSubGroupTests);
export { NoteSubGroupTests };
