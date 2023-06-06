"use strict";
const VF = Vex.Flow;
function subgroup(el, iterations, params) {
    const options = Object.assign({ systemWidth: 550, debug: true }, params);
    const f = new VF.Factory({
        renderer: {
            elementId: el,
            width: options.width,
            height: options.height,
        },
    });
    f.StaveNote = f.StaveNote.bind(f);
    const stave1 = f.Stave({ x: 15, y: 40, width: options.systemWidth }).setClef('treble');
    const notes1 = [
        { keys: ['f/5'], stem_direction: 1, duration: '4' },
        { keys: ['d/4'], stem_direction: 1, duration: '4', clef: 'bass' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'alto' },
        { keys: ['c/5'], stem_direction: 1, duration: '4', clef: 'soprano' },
    ].map(f.StaveNote);
    const notes2 = [
        { keys: ['c/4'], stem_direction: -1, duration: '4' },
        { keys: ['c/3'], stem_direction: -1, duration: '4', clef: 'bass' },
        { keys: ['d/4'], stem_direction: -1, duration: '4', clef: 'alto' },
        { keys: ['f/4'], stem_direction: -1, duration: '4', clef: 'soprano' },
    ].map(f.StaveNote);
    const stave2 = f.Stave({ x: 15, y: 160, width: options.systemWidth }).setClef('bass');
    const notes3 = [
        { keys: ['e/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['g/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['d/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['f/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['c/4'], duration: '8', stem_direction: 1, clef: 'treble' },
        { keys: ['g/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['d/3'], duration: '8', stem_direction: -1, clef: 'bass' },
        { keys: ['f/3'], duration: '8', stem_direction: -1, clef: 'bass' },
    ].map(f.StaveNote);
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'brace' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleLeft' });
    f.StaveConnector({ top_stave: stave1, bottom_stave: stave2, type: 'singleRight' });
    function addAccidental(note, acc) {
        return note.addModifier(f.Accidental({ type: acc }), 0);
    }
    function addSubGroup(note, subNotes) {
        return note.addModifier(f.NoteSubGroup({ notes: subNotes }), 0);
    }
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
    const voice = f.Voice().addTickables(notes1);
    const voice2 = f.Voice().addTickables(notes2);
    const voice3 = f.Voice().addTickables(notes3);
    const formatter = f.Formatter();
    formatter.joinVoices([voice, voice2]).joinVoices([voice3]).formatToStave([voice, voice2, voice3], stave1);
    for (let i = 0; i < iterations; i++) {
        formatter.tune({ alpha: 0.01 });
    }
    f.draw();
    if (options.debug) {
        VF.Formatter.plotDebugging(f.getContext(), formatter, stave1.getNoteStartX(), 20, 320);
    }
}
function tuplets(el, iterations, params) {
    const options = Object.assign({ systemWidth: 500, debug: true }, params);
    const f = new VF.Factory({
        renderer: {
            elementId: el,
            width: options.width,
            height: options.height,
        },
    });
    const system = f.System({
        x: 50,
        width: options.systemWidth,
        debugFormatter: options.debug,
        formatIterations: iterations,
    });
    const score = f.EasyScore();
    const newVoice = function (notes) {
        return score.voice(notes, { time: '1/4' });
    };
    const newStave = function (voice) {
        return system
            .addStave({ voices: [voice], debugNoteMetrics: options.debug })
            .addClef('treble')
            .addTimeSignature('1/4');
    };
    const voices = [
        score.notes('c5/8, c5'),
        score.tuplet(score.notes('a4/8, a4, a4'), { notes_occupied: 2 }),
        score.notes('c5/16, c5, c5, c5'),
        score.tuplet(score.notes('a4/16, a4, a4, a4, a4'), { notes_occupied: 4 }),
        score.tuplet(score.notes('a4/32, a4, a4, a4, a4, a4, a4'), { notes_occupied: 8 }),
    ];
    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(VF.StaveConnector.type.BRACKET);
    f.draw();
}
function multistave(el, iterations, params) {
    const options = Object.assign({ systemWidth: 550, debug: true, justify: true, alpha: 0.1 }, params);
    const f = new VF.Factory({
        renderer: {
            elementId: el,
            width: options.width,
            height: options.height,
        },
    });
    const score = f.EasyScore();
    const stave11 = f.Stave({ y: 20, width: 275 }).addTrebleGlyph().addTimeSignature('6/8');
    const notes11 = score.notes('f4/4, d4/8, g4/4, eb4/8');
    const voice11 = score.voice(notes11, { time: '6/8' });
    const stave21 = f.Stave({ y: 130, width: 275 }).addTrebleGlyph().addTimeSignature('6/8');
    const notes21 = score.notes('d4/8, d4, d4, d4, eb4, eb4');
    const voice21 = score.voice(notes21, { time: '6/8' });
    const stave31 = f.Stave({ y: 250, width: 275 }).addClef('bass').addTimeSignature('6/8');
    const notes31 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    const voice31 = score.voice(notes31, { time: '6/8' });
    f.StaveConnector({
        top_stave: stave21,
        bottom_stave: stave31,
        type: 'brace',
    });
    f.Beam({ notes: notes21.slice(0, 3) });
    f.Beam({ notes: notes21.slice(3, 6) });
    f.Beam({ notes: notes31.slice(0, 3) });
    f.Beam({ notes: notes31.slice(3, 6) });
    let formatter = f.Formatter().joinVoices([voice11]).joinVoices([voice21]).joinVoices([voice31]);
    if (options.justify) {
        formatter.formatToStave([voice11, voice21, voice31], stave11);
    }
    else {
        formatter.format([voice11, voice21, voice31], 0);
    }
    for (let i = 0; i < iterations; i++) {
        formatter.tune({ alphs: options.alpha });
    }
    if (options.debug) {
        VF.Formatter.plotDebugging(f.getContext(), formatter, stave11.getNoteStartX(), 20, 320);
    }
    const stave12 = f.Stave({
        x: stave11.width + stave11.x,
        y: stave11.y,
        width: stave11.width,
    });
    var notes12 = score.notes('ab4/4, bb4/8, (cb5 eb5)/4[stem="down"], d5/8[stem="down"]');
    var voice12 = score.voice(notes12, { time: '6/8' });
    f.Stave({
        x: stave21.width + stave21.x,
        y: stave21.y,
        width: stave21.width,
    });
    var notes22 = score.notes('(eb4 ab4)/4., (c4 eb4 ab4)/4, db5/8', { stem: 'up' });
    var voice22 = score.voice(notes22, { time: '6/8' });
    f.Stave({
        x: stave31.width + stave31.x,
        y: stave31.y,
        width: stave31.width,
    });
    var notes32 = score.notes('a5/8, a5, a5, a5, a5, a5', { stem: 'down' });
    var voice32 = score.voice(notes32, { time: '6/8' });
    formatter = f.Formatter().joinVoices([voice12]).joinVoices([voice22]).joinVoices([voice32]);
    if (options.justify) {
        formatter.formatToStave([voice12, voice22, voice32], stave12);
    }
    else {
        formatter.format([voice12, voice22, voice32], 0);
    }
    for (var j = 0; j < iterations; j++) {
        formatter.tune({ alpha: options.alpha });
    }
    f.Beam({ notes: notes32.slice(0, 3) });
    f.Beam({ notes: notes32.slice(3, 6) });
    f.draw();
    if (options.debug) {
        VF.Formatter.plotDebugging(f.getContext(), formatter, stave12.getNoteStartX(), 20, 320);
    }
}
const Tests = {
    tuplets: {
        options: { width: 600, height: 750, debug: true },
        fn: tuplets,
    },
    subgroup: {
        options: { width: 650, height: 350, debug: true },
        fn: subgroup,
    },
    multistave: {
        options: { width: 650, height: 350, debug: true },
        fn: multistave,
    },
};
if (typeof module != 'undefined') {
    module.exports = Tests;
}
