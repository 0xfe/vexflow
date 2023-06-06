import { VexFlowTests } from './vexflow_test_helpers.js';
import { Dot } from '../src/dot.js';
import { Formatter } from '../src/formatter.js';
import { Stem } from '../src/stem.js';
import { Tuplet } from '../src/tuplet.js';
const TupletTests = {
    Start() {
        QUnit.module('Tuplet');
        const run = VexFlowTests.runTests;
        run('Simple Tuplet', simple);
        run('Beamed Tuplet', beamed);
        run('Ratioed Tuplet', ratio);
        run('Bottom Tuplet', bottom);
        run('Bottom Ratioed Tuplet', bottomRatio);
        run('Awkward Tuplet', awkward);
        run('Complex Tuplet', complex);
        run('Mixed Stem Direction Tuplet', mixedTop);
        run('Mixed Stem Direction Bottom Tuplet', mixedBottom);
        run('Nested Tuplets', nested);
        run('Single Tuplets', single);
    },
};
const set = (key) => (value) => (object) => {
    object[key] = value;
    return object;
};
const setStemDirection = set('stem_direction');
const setStemUp = setStemDirection(Stem.UP);
const setStemDown = setStemDirection(Stem.DOWN);
const setDurationToQuarterNote = set('duration')('4');
function simple(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/4');
    const notes = [
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Tuplet({ notes: notes.slice(0, 3) });
    f.Tuplet({ notes: notes.slice(3, 6) });
    const voice = f
        .Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Simple Test');
}
function beamed(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('3/8');
    const notes = [
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Beam({ notes: notes.slice(0, 3) });
    f.Beam({ notes: notes.slice(3, 10) });
    f.Tuplet({ notes: notes.slice(0, 3) });
    f.Tuplet({ notes: notes.slice(3, 10) });
    const voice = f
        .Voice({ time: { num_beats: 3, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Beamed Test');
}
function ratio(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10, width: 350 }).addTimeSignature('4/4');
    const notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Beam({
        notes: notes.slice(3, 6),
    });
    f.Tuplet({
        notes: notes.slice(0, 3),
        options: {
            ratioed: true,
        },
    });
    f.Tuplet({
        notes: notes.slice(3, 6),
        options: {
            ratioed: true,
            notes_occupied: 4,
        },
    });
    const voice = f.Voice().setStrict(true).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Ratioed Test');
}
function bottom(options) {
    const f = VexFlowTests.makeFactory(options, 350, 160);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('3/4');
    const notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/3'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
    ]
        .map(setStemDown)
        .map(f.StaveNote.bind(f));
    f.Beam({
        notes: notes.slice(3, 6),
    });
    f.Tuplet({
        notes: notes.slice(0, 3),
        options: { location: Tuplet.LOCATION_BOTTOM },
    });
    f.Tuplet({
        notes: notes.slice(3, 6),
        options: { location: Tuplet.LOCATION_BOTTOM },
    });
    const voice = f
        .Voice({ time: { num_beats: 3, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Bottom Test');
}
function bottomRatio(options) {
    const f = VexFlowTests.makeFactory(options, 350, 160);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('5/8');
    const notes = [
        { keys: ['f/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['d/5'], duration: '8' },
        { keys: ['g/5'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
    ]
        .map(setStemDown)
        .map(f.StaveNote.bind(f));
    f.Beam({
        notes: notes.slice(3, 6),
    });
    f.Tuplet({
        notes: notes.slice(0, 3),
        options: {
            location: Tuplet.LOCATION_BOTTOM,
            ratioed: true,
        },
    });
    f.Tuplet({
        notes: notes.slice(3, 6),
        options: {
            location: Tuplet.LOCATION_BOTTOM,
            notes_occupied: 1,
        },
    });
    const voice = f
        .Voice({ time: { num_beats: 5, beat_value: 8 } })
        .setStrict(true)
        .addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Bottom Ratioed Test');
}
function awkward(options) {
    const f = VexFlowTests.makeFactory(options, 370, 160);
    const stave = f.Stave({ x: 10, y: 10 });
    const notes = [
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['e/4'], duration: '16' },
        { keys: ['c/4'], duration: '8' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Beam({ notes: notes.slice(0, 12) });
    f.Tuplet({
        notes: notes.slice(0, 12),
        options: {
            notes_occupied: 142,
            ratioed: true,
        },
    });
    f.Tuplet({
        notes: notes.slice(12, 15),
        options: {
            ratioed: true,
        },
    }).setBracketed(true);
    const voice = f.Voice().setStrict(false).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Awkward Test');
}
function complex(options) {
    const f = VexFlowTests.makeFactory(options, 600);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');
    const notes1 = [
        { keys: ['b/4'], duration: '8d' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['b/4'], duration: '16r' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['g/4'], duration: '32' },
        { keys: ['f/4'], duration: '32' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['b/4'], duration: '8' },
        { keys: ['a/4'], duration: '8' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    Dot.buildAndAttach([notes1[0]], { all: true });
    const notes2 = [{ keys: ['c/4'] }, { keys: ['c/4'] }, { keys: ['c/4'] }, { keys: ['c/4'] }]
        .map(setDurationToQuarterNote)
        .map(setStemDown)
        .map(f.StaveNote.bind(f));
    f.Beam({ notes: notes1.slice(0, 3) });
    f.Beam({ notes: notes1.slice(5, 9) });
    f.Beam({ notes: notes1.slice(11, 16) });
    f.Tuplet({
        notes: notes1.slice(0, 3),
    });
    f.Tuplet({
        notes: notes1.slice(3, 11),
        options: {
            num_notes: 7,
            notes_occupied: 4,
            ratioed: false,
        },
    });
    f.Tuplet({
        notes: notes1.slice(11, 16),
        options: {
            notes_occupied: 4,
        },
    });
    const voice1 = f.Voice().setStrict(true).addTickables(notes1);
    const voice2 = f.Voice().setStrict(true).addTickables(notes2);
    new Formatter().joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);
    f.draw();
    options.assert.ok(true, 'Complex Test');
}
function mixedTop(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10 });
    const notes = [
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['c/6'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/5'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/6'], stem_direction: -1 },
    ]
        .map(setDurationToQuarterNote)
        .map(f.StaveNote.bind(f));
    f.Tuplet({
        notes: notes.slice(0, 2),
        options: {
            notes_occupied: 3,
        },
    });
    f.Tuplet({
        notes: notes.slice(2, 4),
        options: {
            notes_occupied: 3,
        },
    });
    f.Tuplet({
        notes: notes.slice(4, 6),
        options: {
            notes_occupied: 3,
        },
    });
    const voice = f.Voice().setStrict(false).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Mixed Stem Direction Tuplet');
}
function mixedBottom(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10 });
    const notes = [
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/5'], stem_direction: -1 },
        { keys: ['a/4'], stem_direction: 1 },
        { keys: ['f/3'], stem_direction: 1 },
        { keys: ['a/4'], stem_direction: -1 },
        { keys: ['c/4'], stem_direction: -1 },
    ]
        .map(setDurationToQuarterNote)
        .map(f.StaveNote.bind(f));
    f.Tuplet({
        notes: notes.slice(0, 2),
        options: {
            notes_occupied: 3,
        },
    });
    f.Tuplet({
        notes: notes.slice(2, 4),
        options: {
            notes_occupied: 3,
        },
    });
    f.Tuplet({
        notes: notes.slice(4, 6),
        options: {
            notes_occupied: 3,
        },
    });
    const voice = f.Voice().setStrict(false).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Mixed Stem Direction Bottom Tuplet');
}
function nested(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');
    const notes = [
        { keys: ['b/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['f/4'], duration: '16' },
        { keys: ['a/4'], duration: '16' },
        { keys: ['g/4'], duration: '16' },
        { keys: ['b/4'], duration: '2' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Beam({
        notes: notes.slice(2, 7),
    });
    f.Tuplet({
        notes: notes.slice(0, 7),
        options: {
            notes_occupied: 2,
            num_notes: 3,
        },
    });
    f.Tuplet({
        notes: notes.slice(2, 7),
        options: {
            notes_occupied: 4,
            num_notes: 5,
        },
    });
    const voice = f.Voice().setStrict(true).addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Nested Tuplets');
}
function single(options) {
    const f = VexFlowTests.makeFactory(options);
    const stave = f.Stave({ x: 10, y: 10 }).addTimeSignature('4/4');
    const notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '8' },
        { keys: ['e/4'], duration: '8' },
        { keys: ['f/4'], duration: '8' },
        { keys: ['g/4'], duration: '8' },
        { keys: ['a/4'], duration: '2' },
        { keys: ['b/4'], duration: '4' },
    ]
        .map(setStemUp)
        .map(f.StaveNote.bind(f));
    f.Beam({
        notes: notes.slice(1, 4),
    });
    f.Tuplet({
        notes: notes.slice(0, -1),
        options: {
            num_notes: 4,
            notes_occupied: 3,
            ratioed: true,
            bracketed: true,
        },
    });
    f.Tuplet({
        notes: notes.slice(0, 1),
        options: {
            num_notes: 3,
            notes_occupied: 2,
            ratioed: true,
        },
    });
    f.Tuplet({
        notes: notes.slice(1, 4),
        options: {
            num_notes: 3,
            notes_occupied: 2,
        },
    });
    f.Tuplet({
        notes: notes.slice(4, 5),
        options: {
            num_notes: 3,
            notes_occupied: 2,
            ratioed: true,
            bracketed: true,
        },
    });
    const voice = f
        .Voice({ time: { num_beats: 4, beat_value: 4 } })
        .setStrict(true)
        .addTickables(notes);
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true, 'Nested Tuplets');
}
VexFlowTests.register(TupletTests);
export { TupletTests };
