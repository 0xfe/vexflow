import { VexFlowTests } from './vexflow_test_helpers.js';
import { Accidental } from '../src/accidental.js';
import { Beam } from '../src/beam.js';
import { Dot } from '../src/dot.js';
import { Flow } from '../src/flow.js';
import { Formatter } from '../src/formatter.js';
import { ModifierContext } from '../src/modifiercontext.js';
import { Note } from '../src/note.js';
import { Stave } from '../src/stave.js';
import { StaveNote } from '../src/stavenote.js';
import { Stem } from '../src/stem.js';
import { TickContext } from '../src/tickcontext.js';
import { TimeSigNote } from '../src/timesignote.js';
import { isAccidental } from '../src/typeguard.js';
import { Voice } from '../src/voice.js';
const AccidentalTests = {
    Start() {
        QUnit.module('Accidental');
        QUnit.test('Automatic Accidentals - Simple Tests', autoAccidentalWorking);
        const run = VexFlowTests.runTests;
        run('Accidental Padding', formatAccidentalSpaces);
        run('Basic', basic);
        run('Stem Down', basicStemDown);
        run('Cautionary Accidental', cautionary);
        run('Accidental Arrangement Special Cases', specialCases);
        run('Multi Voice', multiVoice);
        run('Microtonal', microtonal);
        run('Microtonal (Iranian)', microtonal_iranian);
        run('Sagittal', sagittal);
        run('Automatic Accidentals', automaticAccidentals0);
        run('Automatic Accidentals - C major scale in Ab', automaticAccidentals1);
        run('Automatic Accidentals - No Accidentals Necessary', automaticAccidentals2);
        run('Automatic Accidentals - No Accidentals Necessary (EasyScore)', automaticAccidentals3);
        run('Automatic Accidentals - Multi Voice Inline', automaticAccidentalsMultiVoiceInline);
        run('Automatic Accidentals - Multi Voice Offset', automaticAccidentalsMultiVoiceOffset);
        run('Automatic Accidentals - Key C, Single Octave', automaticAccidentalsCornerCases1);
        run('Automatic Accidentals - Key C, Two Octaves', automaticAccidentalsCornerCases2);
        run('Automatic Accidentals - Key C#, Single Octave', automaticAccidentalsCornerCases3);
        run('Automatic Accidentals - Key C#, Two Octaves', automaticAccidentalsCornerCases4);
        run('Factory API', factoryAPI);
    },
};
function hasAccidental(note) {
    return note.getModifiers().some((modifier) => isAccidental(modifier));
}
function makeNewAccid(factory) {
    return (type) => factory.Accidental({ type });
}
function autoAccidentalWorking(assert) {
    const createStaveNote = (noteStruct) => new StaveNote(noteStruct);
    let notes = [
        { keys: ['bb/4'], duration: '4' },
        { keys: ['bb/4'], duration: '4' },
        { keys: ['g#/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['a#/4'], duration: '4' },
        { keys: ['g#/4'], duration: '4' },
    ].map(createStaveNote);
    let voice = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'F');
    assert.equal(hasAccidental(notes[0]), false, 'No flat because of key signature');
    assert.equal(hasAccidental(notes[1]), false, 'No flat because of key signature');
    assert.equal(hasAccidental(notes[2]), true, 'Added a sharp');
    assert.equal(hasAccidental(notes[3]), true, 'Back to natural');
    assert.equal(hasAccidental(notes[4]), true, 'Back to natural');
    assert.equal(hasAccidental(notes[5]), false, 'Natural remembered');
    assert.equal(hasAccidental(notes[6]), true, 'Added sharp');
    assert.equal(hasAccidental(notes[7]), true, 'Added sharp');
    notes = [
        { keys: ['e#/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['fb/4'], duration: '4' },
        { keys: ['b#/4'], duration: '4' },
        { keys: ['b#/4'], duration: '4' },
        { keys: ['cb/5'], duration: '4' },
        { keys: ['fb/5'], duration: '4' },
        { keys: ['e#/4'], duration: '4' },
    ].map(createStaveNote);
    voice = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'A');
    assert.equal(hasAccidental(notes[0]), true, 'Added sharp');
    assert.equal(hasAccidental(notes[1]), true, 'Added flat');
    assert.equal(hasAccidental(notes[2]), true, 'Added flat');
    assert.equal(hasAccidental(notes[3]), true, 'Added sharp');
    assert.equal(hasAccidental(notes[4]), false, 'Sharp remembered');
    assert.equal(hasAccidental(notes[5]), true, 'Added flat(different octave)');
    assert.equal(hasAccidental(notes[6]), true, 'Added flat(different octave)');
    assert.equal(hasAccidental(notes[7]), false, 'sharp remembered');
    notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['cb/4'], duration: '4' },
        { keys: ['c#/4'], duration: '4' },
        { keys: ['c#/4'], duration: '4' },
        { keys: ['cbb/4'], duration: '4' },
        { keys: ['cbb/4'], duration: '4' },
        { keys: ['c##/4'], duration: '4' },
        { keys: ['c##/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
        { keys: ['c/4'], duration: '4' },
    ].map(createStaveNote);
    voice = new Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'C');
    assert.equal(hasAccidental(notes[0]), false, 'No accidental');
    assert.equal(hasAccidental(notes[1]), true, 'Added flat');
    assert.equal(hasAccidental(notes[2]), false, 'Flat remembered');
    assert.equal(hasAccidental(notes[3]), true, 'Sharp added');
    assert.equal(hasAccidental(notes[4]), false, 'Sharp remembered');
    assert.equal(hasAccidental(notes[5]), true, 'Added doubled flat');
    assert.equal(hasAccidental(notes[6]), false, 'Double flat remembered');
    assert.equal(hasAccidental(notes[7]), true, 'Added double sharp');
    assert.equal(hasAccidental(notes[8]), false, 'Double sharp rememberd');
    assert.equal(hasAccidental(notes[9]), true, 'Added natural');
    assert.equal(hasAccidental(notes[10]), false, 'Natural remembered');
}
function formatAccidentalSpaces(options) {
    const f = VexFlowTests.makeFactory(options, 750, 280);
    const context = f.getContext();
    const softmaxFactor = 100;
    const notes = [
        new StaveNote({
            keys: ['e##/5'],
            duration: '8d',
        }).addModifier(new Accidental('##'), 0),
        new StaveNote({
            keys: ['b/4'],
            duration: '16',
        }).addModifier(new Accidental('b'), 0),
        new StaveNote({
            keys: ['f/3'],
            duration: '8',
        }),
        new StaveNote({
            keys: ['a/3'],
            duration: '16',
        }),
        new StaveNote({
            keys: ['e/4', 'g/4'],
            duration: '16',
        })
            .addModifier(new Accidental('bb'), 0)
            .addModifier(new Accidental('bb'), 1),
        new StaveNote({
            keys: ['d/4'],
            duration: '16',
        }),
        new StaveNote({
            keys: ['e/4', 'g/4'],
            duration: '16',
        })
            .addModifier(new Accidental('#'), 0)
            .addModifier(new Accidental('#'), 1),
        new StaveNote({
            keys: ['g/4'],
            duration: '32',
        }),
        new StaveNote({
            keys: ['a/4'],
            duration: '32',
        }),
        new StaveNote({
            keys: ['g/4'],
            duration: '16',
        }),
        new StaveNote({
            keys: ['d/4'],
            duration: 'q',
        }),
    ];
    Dot.buildAndAttach([notes[0]], { all: true });
    const beams = Beam.generateBeams(notes);
    const voice = new Voice({
        num_beats: 4,
        beat_value: 4,
    });
    voice.addTickables(notes);
    const formatter = new Formatter({ softmaxFactor }).joinVoices([voice]);
    const width = formatter.preCalculateMinTotalWidth([voice]);
    const stave = new Stave(10, 40, width + 20);
    stave.setContext(context).draw();
    formatter.format([voice], width);
    voice.draw(context, stave);
    beams.forEach((b) => b.setContext(context).draw());
    notes.forEach((note) => Note.plotMetrics(context, note, 30));
    VexFlowTests.plotLegendForNoteWidth(context, 300, 150);
    options.assert.ok(true);
}
function basic(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
            .addModifier(accid('b'), 0)
            .addModifier(accid('#'), 1),
        f
            .StaveNote({ keys: ['e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5', 'd/4'], duration: '2' })
            .addModifier(accid('##'), 6)
            .addModifier(accid('n'), 0)
            .addModifier(accid('bb'), 1)
            .addModifier(accid('b'), 2)
            .addModifier(accid('#'), 3)
            .addModifier(accid('n'), 4)
            .addModifier(accid('bb'), 5),
        f
            .StaveNote({ keys: ['g/5', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5'], duration: '16' })
            .addModifier(accid('n'), 1)
            .addModifier(accid('#'), 2)
            .addModifier(accid('#'), 3)
            .addModifier(accid('b'), 4)
            .addModifier(accid('bb'), 5)
            .addModifier(accid('##'), 6)
            .addModifier(accid('#'), 0),
        f
            .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('##').setAsCautionary(), 1)
            .addModifier(accid('#').setAsCautionary(), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('bb').setAsCautionary(), 4)
            .addModifier(accid('b').setAsCautionary(), 5),
    ];
    Formatter.SimpleFormat(notes, 10, { paddingBetween: 45 });
    notes.forEach((note, index) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + index + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, index) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);
    options.assert.ok(true, 'Full Accidental');
}
function cautionary(options) {
    const staveCount = 12;
    const scale = 0.85;
    const staveWidth = 840;
    let i = 0;
    let j = 0;
    const f = VexFlowTests.makeFactory(options, staveWidth + 10, 175 * staveCount + 10);
    f.getContext().scale(scale, scale);
    const accids = Object.keys(Flow.accidentalMap).filter((accid) => accid !== '{' && accid !== '}');
    const mod = Math.round(accids.length / staveCount);
    for (i = 0; i < staveCount; ++i) {
        const stave = f.Stave({ x: 0, y: 10 + 200 * i, width: staveWidth / scale });
        const score = f.EasyScore();
        const rowMap = [];
        for (j = 0; j < mod && j + i * staveCount < accids.length; ++j) {
            rowMap.push(accids[j + i * staveCount]);
        }
        const notes = rowMap.map((accidType) => f
            .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: Stem.UP })
            .addModifier(f.Accidental({ type: accidType }), 0));
        const voice = score.voice(notes, { time: rowMap.length + '/4' });
        voice.getTickables().forEach((tickable) => {
            tickable
                .getModifiers()
                .filter((modifier) => modifier.getAttribute('type') === Accidental.CATEGORY)
                .forEach((accid) => accid.setAsCautionary());
        });
        f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
        f.draw();
    }
    options.assert.ok(true, 'Must successfully render cautionary accidentals');
}
function specialCases(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });
    const notes = [
        f
            .StaveNote({ keys: ['f/4', 'd/5'], duration: '1' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('b'), 1),
        f
            .StaveNote({ keys: ['c/4', 'g/4'], duration: '2' })
            .addModifier(accid('##'), 0)
            .addModifier(accid('##'), 1),
        f
            .StaveNote({ keys: ['b/3', 'd/4', 'f/4'], duration: '16' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('#'), 1)
            .addModifier(accid('##'), 2),
        f
            .StaveNote({ keys: ['g/4', 'a/4', 'c/5', 'e/5'], duration: '16' })
            .addModifier(accid('b'), 0)
            .addModifier(accid('b'), 1)
            .addModifier(accid('n'), 3),
        f
            .StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4' })
            .addModifier(accid('b').setAsCautionary(), 0)
            .addModifier(accid('b').setAsCautionary(), 1)
            .addModifier(accid('bb'), 2)
            .addModifier(accid('b'), 3),
        f
            .StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5', 'g/5'], duration: '8' })
            .addModifier(accid('bb'), 0)
            .addModifier(accid('b').setAsCautionary(), 1)
            .addModifier(accid('n').setAsCautionary(), 2)
            .addModifier(accid('#'), 3)
            .addModifier(accid('n').setAsCautionary(), 4),
    ];
    Formatter.SimpleFormat(notes, 0, { paddingBetween: 20 });
    notes.forEach((note, index) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + index + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, index) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);
    options.assert.ok(true, 'Full Accidental');
}
function basicStemDown(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w', stem_direction: -1 })
            .addModifier(accid('b'), 0)
            .addModifier(accid('#'), 1),
        f
            .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2', stem_direction: -1 })
            .addModifier(accid('##'), 0)
            .addModifier(accid('n'), 1)
            .addModifier(accid('bb'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('#'), 4)
            .addModifier(accid('n'), 5)
            .addModifier(accid('bb'), 6),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
            .addModifier(accid('n'), 0)
            .addModifier(accid('#'), 1)
            .addModifier(accid('#'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('bb'), 4)
            .addModifier(accid('##'), 5)
            .addModifier(accid('#'), 6),
    ];
    Formatter.SimpleFormat(notes, 0, { paddingBetween: 30 });
    notes.forEach((note, noteIndex) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + noteIndex + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, accidIndex) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + accidIndex + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);
    options.assert.ok(true, 'Full Accidental');
}
function multiVoice(options) {
    function showNotes(note1, note2, stave, ctx, x) {
        const modifierContext = new ModifierContext();
        note1.addToModifierContext(modifierContext);
        note2.addToModifierContext(modifierContext);
        new TickContext().addTickable(note1).addTickable(note2).preFormat().setX(x);
        note1.setContext(ctx).draw();
        note2.setContext(ctx).draw();
        Note.plotMetrics(ctx, note1, 180);
        Note.plotMetrics(ctx, note2, 15);
    }
    const f = VexFlowTests.makeFactory(options, 460, 250);
    const accid = makeNewAccid(f);
    const stave = f.Stave({ x: 10, y: 45, width: 420 });
    const ctx = f.getContext();
    stave.draw();
    let note1 = f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
        .addModifier(accid('b'), 0)
        .addModifier(accid('n'), 1)
        .addModifier(accid('#'), 2)
        .setStave(stave);
    let note2 = f
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
        .addModifier(accid('b'), 0)
        .addModifier(accid('bb'), 1)
        .addModifier(accid('##'), 2)
        .setStave(stave);
    showNotes(note1, note2, stave, ctx, 60);
    note1 = f
        .StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
        .addModifier(accid('b'), 0)
        .addModifier(accid('n'), 1)
        .addModifier(accid('#'), 2)
        .setStave(stave);
    note2 = f
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addModifier(accid('b'), 0)
        .setStave(stave);
    showNotes(note1, note2, stave, ctx, 150);
    note1 = f
        .StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
        .addModifier(accid('b'), 0)
        .addModifier(accid('n'), 1)
        .addModifier(accid('#'), 2)
        .setStave(stave);
    note2 = f
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addModifier(accid('b'), 0)
        .setStave(stave);
    showNotes(note1, note2, stave, ctx, 250);
    VexFlowTests.plotLegendForNoteWidth(ctx, 350, 150);
    options.assert.ok(true, 'Full Accidental');
}
function microtonal(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
            .addModifier(accid('db'), 0)
            .addModifier(accid('d'), 1),
        f
            .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
            .addModifier(accid('bbs'), 0)
            .addModifier(accid('++'), 1)
            .addModifier(accid('+'), 2)
            .addModifier(accid('d'), 3)
            .addModifier(accid('db'), 4)
            .addModifier(accid('+'), 5)
            .addModifier(accid('##'), 6),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
            .addModifier(accid('++'), 0)
            .addModifier(accid('bbs'), 1)
            .addModifier(accid('+'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('db'), 4)
            .addModifier(accid('##'), 5)
            .addModifier(accid('#'), 6),
        f
            .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('db').setAsCautionary(), 1)
            .addModifier(accid('bbs').setAsCautionary(), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('++').setAsCautionary(), 4)
            .addModifier(accid('d').setAsCautionary(), 5),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'd/5', 'g/5'], duration: '16' })
            .addModifier(accid('++-'), 0)
            .addModifier(accid('+-'), 1)
            .addModifier(accid('bs'), 2)
            .addModifier(accid('bss'), 3)
            .addModifier(accid('afhf'), 4)
            .addModifier(accid('ashs'), 5),
    ];
    Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });
    notes.forEach((note, index) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + index + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, index) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    options.assert.ok(true, 'Microtonal Accidental');
}
function microtonal_iranian(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
            .addModifier(accid('k'), 0)
            .addModifier(accid('o'), 1),
        f
            .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
            .addModifier(accid('b'), 0)
            .addModifier(accid('k'), 1)
            .addModifier(accid('n'), 2)
            .addModifier(accid('o'), 3)
            .addModifier(accid('#'), 4)
            .addModifier(accid('bb'), 5)
            .addModifier(accid('##'), 6),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
            .addModifier(accid('o'), 0)
            .addModifier(accid('k'), 1)
            .addModifier(accid('n'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('bb'), 4)
            .addModifier(accid('##'), 5)
            .addModifier(accid('#'), 6),
        f
            .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('o').setAsCautionary(), 1)
            .addModifier(accid('n').setAsCautionary(), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('k').setAsCautionary(), 4),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
            .addModifier(accid('k'), 0)
            .addModifier(accid('k'), 1)
            .addModifier(accid('k'), 2)
            .addModifier(accid('k'), 3),
    ];
    Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });
    notes.forEach((note, index) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + index + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, index) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    options.assert.ok(true, 'Microtonal Accidental (Iranian)');
}
function sagittal(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const accid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });
    const notes = [
        f
            .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
            .addModifier(accid('accSagittal11MediumDiesisUp'), 1)
            .addModifier(accid('accSagittal5CommaDown'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('accSagittal7CommaDown'), 3),
        f
            .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
            .addModifier(accid('accSagittal35LargeDiesisDown'), 2),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' }).addModifier(accid('accSagittal5CommaDown'), 1),
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
            .addModifier(accid('b'), 1)
            .addModifier(accid('accSagittal7CommaDown'), 1)
            .addModifier(accid('accSagittal11LargeDiesisDown'), 3),
        f
            .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
            .addModifier(accid('accSagittal11MediumDiesisUp'), 1)
            .addModifier(accid('accSagittal5CommaDown'), 2)
            .addModifier(accid('accSagittalFlat7CDown'), 3),
        f
            .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
            .addModifier(accid('accSagittal35LargeDiesisDown'), 2),
        f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' }).addModifier(accid('accSagittal5CommaDown'), 1),
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
            .addModifier(accid('accSagittalFlat7CDown'), 1)
            .addModifier(accid('accSagittal11LargeDiesisDown'), 3),
    ];
    f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
    });
    f.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [3],
        last_indices: [3],
        options: {
            direction: Stem.DOWN,
        },
    });
    f.StaveTie({
        from: notes[4],
        to: notes[5],
        first_indices: [0, 1],
        last_indices: [0, 1],
    });
    f.StaveTie({
        from: notes[4],
        to: notes[5],
        first_indices: [3],
        last_indices: [3],
        options: {
            direction: Stem.DOWN,
        },
    });
    f.Beam({ notes: notes.slice(2, 4) });
    f.Beam({ notes: notes.slice(6, 8) });
    Formatter.SimpleFormat(notes);
    notes.forEach((note, index) => {
        Note.plotMetrics(f.getContext(), note, 140);
        options.assert.ok(note.getModifiersByType('Accidental').length > 0, 'Note ' + index + ' has accidentals');
        note.getModifiersByType('Accidental').forEach((accid, index) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
    });
    f.draw();
    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    options.assert.ok(true, 'Sagittal');
}
function automaticAccidentals0(options) {
    const f = VexFlowTests.makeFactory(options, 700, 200);
    const stave = f.Stave();
    const notes = [
        { keys: ['c/4', 'c/5'], duration: '4' },
        { keys: ['c#/4', 'c#/5'], duration: '4' },
        { keys: ['c#/4', 'c#/5'], duration: '4' },
        { keys: ['c##/4', 'c##/5'], duration: '4' },
        { keys: ['c##/4', 'c##/5'], duration: '4' },
        { keys: ['c/4', 'c/5'], duration: '4' },
        { keys: ['cn/4', 'cn/5'], duration: '4' },
        { keys: ['cbb/4', 'cbb/5'], duration: '4' },
        { keys: ['cbb/4', 'cbb/5'], duration: '4' },
        { keys: ['cb/4', 'cb/5'], duration: '4' },
        { keys: ['cb/4', 'cb/5'], duration: '4' },
        { keys: ['c/4', 'c/5'], duration: '4' },
    ].map(f.StaveNote.bind(f));
    const gracenotes = [{ keys: ['d#/4'], duration: '16', slash: true }].map(f.GraceNote.bind(f));
    notes[0].addModifier(f.GraceNoteGroup({ notes: gracenotes }).beamNotes(), 0);
    const voice = f
        .Voice()
        .setMode(Voice.Mode.SOFT)
        .addTickable(new TimeSigNote('12/4').setStave(stave))
        .addTickables(notes);
    Accidental.applyAccidentals([voice], 'C');
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentals1(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('Ab');
    const notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['e/4'], duration: '4' },
        { keys: ['f/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c/5'], duration: '4' },
    ].map(f.StaveNote.bind(f));
    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'Ab');
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentals2(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('A');
    const notes = [
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c#/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f#/5'], duration: '4' },
        { keys: ['g#/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
    ].map(f.StaveNote.bind(f));
    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'A');
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentals3(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('A');
    const score = f.EasyScore();
    score.set({ time: '8/4' });
    const notes = score.notes('A4/q, B4/q, C#5/q, D5/q, E5/q,F#5/q, G#5/q, A5/q', { stem: 'UP' });
    const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);
    Accidental.applyAccidentals([voice], 'A');
    new Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsMultiVoiceInline(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('Ab');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const notes1 = [
        { keys: ['c/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f/5'], duration: '4' },
        { keys: ['g/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
        { keys: ['b/5'], duration: '4' },
        { keys: ['c/6'], duration: '4' },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    const voice1 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes1);
    Accidental.applyAccidentals([voice0, voice1], 'Ab');
    options.assert.equal(hasAccidental(notes0[0]), false);
    options.assert.equal(hasAccidental(notes0[1]), true);
    options.assert.equal(hasAccidental(notes0[2]), true);
    options.assert.equal(hasAccidental(notes0[3]), false);
    options.assert.equal(hasAccidental(notes0[4]), false);
    options.assert.equal(hasAccidental(notes0[5]), true);
    options.assert.equal(hasAccidental(notes0[6]), true);
    options.assert.equal(hasAccidental(notes0[7]), false);
    options.assert.equal(hasAccidental(notes1[0]), false);
    options.assert.equal(hasAccidental(notes1[1]), true);
    options.assert.equal(hasAccidental(notes1[2]), true);
    options.assert.equal(hasAccidental(notes1[3]), false);
    options.assert.equal(hasAccidental(notes1[4]), false);
    options.assert.equal(hasAccidental(notes1[5]), true);
    options.assert.equal(hasAccidental(notes1[6]), true);
    options.assert.equal(hasAccidental(notes1[7]), false);
    new Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsMultiVoiceOffset(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('Cb');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const notes1 = [
        { keys: ['c/5'], duration: '8' },
        { keys: ['c/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f/5'], duration: '4' },
        { keys: ['g/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
        { keys: ['b/5'], duration: '4' },
        { keys: ['c/6'], duration: '4' },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    const voice1 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes1);
    Accidental.applyAccidentals([voice0, voice1], 'Cb');
    options.assert.equal(hasAccidental(notes0[0]), true);
    options.assert.equal(hasAccidental(notes0[1]), true);
    options.assert.equal(hasAccidental(notes0[2]), true);
    options.assert.equal(hasAccidental(notes0[3]), true);
    options.assert.equal(hasAccidental(notes0[4]), true);
    options.assert.equal(hasAccidental(notes0[5]), true);
    options.assert.equal(hasAccidental(notes0[6]), true);
    options.assert.equal(hasAccidental(notes0[7]), false, 'Natural Remembered');
    options.assert.equal(hasAccidental(notes1[0]), true);
    options.assert.equal(hasAccidental(notes1[1]), false);
    options.assert.equal(hasAccidental(notes1[2]), true);
    options.assert.equal(hasAccidental(notes1[3]), true);
    options.assert.equal(hasAccidental(notes1[4]), true);
    options.assert.equal(hasAccidental(notes1[5]), true);
    options.assert.equal(hasAccidental(notes1[6]), true);
    options.assert.equal(hasAccidental(notes1[7]), true);
    new Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsCornerCases1(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('C');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    Accidental.applyAccidentals([voice0], 'C');
    options.assert.equal(hasAccidental(notes0[0]), false);
    options.assert.equal(hasAccidental(notes0[1]), true);
    options.assert.equal(hasAccidental(notes0[2]), false);
    options.assert.equal(hasAccidental(notes0[3]), true);
    options.assert.equal(hasAccidental(notes0[4]), false);
    options.assert.equal(hasAccidental(notes0[5]), true);
    options.assert.equal(hasAccidental(notes0[6]), false);
    options.assert.equal(hasAccidental(notes0[7]), true);
    options.assert.equal(hasAccidental(notes0[8]), false);
    new Formatter().joinVoices([voice0]).formatToStave([voice0], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsCornerCases2(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('C');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/5'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/5'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    Accidental.applyAccidentals([voice0], 'C');
    options.assert.equal(hasAccidental(notes0[0]), false);
    options.assert.equal(hasAccidental(notes0[2]), true);
    options.assert.equal(hasAccidental(notes0[4]), false);
    options.assert.equal(hasAccidental(notes0[6]), true);
    options.assert.equal(hasAccidental(notes0[8]), false);
    options.assert.equal(hasAccidental(notes0[10]), true);
    options.assert.equal(hasAccidental(notes0[12]), false);
    options.assert.equal(hasAccidental(notes0[14]), true);
    options.assert.equal(hasAccidental(notes0[16]), false);
    options.assert.equal(hasAccidental(notes0[1]), false);
    options.assert.equal(hasAccidental(notes0[3]), true);
    options.assert.equal(hasAccidental(notes0[5]), false);
    options.assert.equal(hasAccidental(notes0[7]), true);
    options.assert.equal(hasAccidental(notes0[9]), false);
    options.assert.equal(hasAccidental(notes0[11]), true);
    options.assert.equal(hasAccidental(notes0[13]), false);
    options.assert.equal(hasAccidental(notes0[15]), true);
    options.assert.equal(hasAccidental(notes0[17]), false);
    new Formatter().joinVoices([voice0]).formatToStave([voice0], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsCornerCases3(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('C#');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    Accidental.applyAccidentals([voice0], 'C#');
    options.assert.equal(hasAccidental(notes0[0]), true);
    options.assert.equal(hasAccidental(notes0[1]), true);
    options.assert.equal(hasAccidental(notes0[2]), false);
    options.assert.equal(hasAccidental(notes0[3]), true);
    options.assert.equal(hasAccidental(notes0[4]), false);
    options.assert.equal(hasAccidental(notes0[5]), true);
    options.assert.equal(hasAccidental(notes0[6]), false);
    options.assert.equal(hasAccidental(notes0[7]), true);
    options.assert.equal(hasAccidental(notes0[8]), false);
    new Formatter().joinVoices([voice0]).formatToStave([voice0], stave);
    f.draw();
    options.assert.ok(true);
}
function automaticAccidentalsCornerCases4(options) {
    const f = VexFlowTests.makeFactory(options, 700, 150);
    const stave = f.Stave().addKeySignature('C#');
    const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/5'], duration: '4', stem_direction: -1 },
        { keys: ['c#/4'], duration: '4', stem_direction: -1 },
        { keys: ['c#/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/5'], duration: '4', stem_direction: -1 },
        { keys: ['cb/4'], duration: '4', stem_direction: -1 },
        { keys: ['cb/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
    ].map(f.StaveNote.bind(f));
    const voice0 = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes0);
    Accidental.applyAccidentals([voice0], 'C#');
    options.assert.equal(hasAccidental(notes0[0]), true);
    options.assert.equal(hasAccidental(notes0[2]), true);
    options.assert.equal(hasAccidental(notes0[4]), false);
    options.assert.equal(hasAccidental(notes0[6]), true);
    options.assert.equal(hasAccidental(notes0[8]), false);
    options.assert.equal(hasAccidental(notes0[10]), true);
    options.assert.equal(hasAccidental(notes0[12]), false);
    options.assert.equal(hasAccidental(notes0[14]), true);
    options.assert.equal(hasAccidental(notes0[16]), false);
    options.assert.equal(hasAccidental(notes0[1]), true);
    options.assert.equal(hasAccidental(notes0[3]), true);
    options.assert.equal(hasAccidental(notes0[5]), false);
    options.assert.equal(hasAccidental(notes0[7]), true);
    options.assert.equal(hasAccidental(notes0[9]), false);
    options.assert.equal(hasAccidental(notes0[11]), true);
    options.assert.equal(hasAccidental(notes0[13]), false);
    options.assert.equal(hasAccidental(notes0[15]), true);
    options.assert.equal(hasAccidental(notes0[17]), false);
    new Formatter().joinVoices([voice0]).formatToStave([voice0], stave);
    f.draw();
    options.assert.ok(true);
}
function factoryAPI(options) {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    f.Stave({ x: 10, y: 10, width: 550 });
    const accid = makeNewAccid(f);
    const notes = [
        f
            .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' })
            .addModifier(accid('b'), 0)
            .addModifier(accid('#'), 1),
        f
            .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' })
            .addModifier(accid('##'), 0)
            .addModifier(accid('n'), 1)
            .addModifier(accid('bb'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('#'), 4)
            .addModifier(accid('n'), 5)
            .addModifier(accid('bb'), 6),
        f
            .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
            .addModifier(accid('n'), 0)
            .addModifier(accid('#'), 1)
            .addModifier(accid('#'), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('bb'), 4)
            .addModifier(accid('##'), 5)
            .addModifier(accid('#'), 6),
        f
            .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: 'w' })
            .addModifier(accid('#'), 0)
            .addModifier(accid('##').setAsCautionary(), 1)
            .addModifier(accid('#').setAsCautionary(), 2)
            .addModifier(accid('b'), 3)
            .addModifier(accid('bb').setAsCautionary(), 4)
            .addModifier(accid('b').setAsCautionary(), 5),
    ];
    Formatter.SimpleFormat(notes);
    notes.forEach((n, i) => {
        options.assert.ok(n.getModifiersByType('Accidental').length > 0, 'Note ' + i + ' has accidentals');
        n.getModifiersByType('Accidental').forEach((accid, i) => {
            options.assert.ok(accid.getWidth() > 0, 'Accidental ' + i + ' has set width');
        });
    });
    f.draw();
    options.assert.ok(true, 'Factory API');
}
VexFlowTests.register(AccidentalTests);
export { AccidentalTests };
