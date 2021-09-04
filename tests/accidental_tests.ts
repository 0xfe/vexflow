// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Accidental Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Flow } from 'flow';
import { Accidental } from 'accidental';
import { Beam } from 'beam';
import { Formatter } from 'formatter';
import { Modifier } from 'modifier';
import { ModifierContext } from 'modifiercontext';
import { Stave } from 'stave';
import { StaveNote, StaveNoteStruct } from 'stavenote';
import { Stem } from 'stem';
import { TickContext } from 'tickcontext';
import { TimeSigNote } from 'timesignote';
import { RenderContext } from 'types/common';
import { Voice } from 'voice';
import { Factory } from 'factory';
import { isCategory } from 'typeguard';
import { Note } from 'note';

const AccidentalTests = {
  Start(): void {
    QUnit.module('Accidental');
    test('Automatic Accidentals - Simple Tests', autoAccidentalWorking);
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
    run('Factory API', factoryAPI);
  },
};

// Check that at least one of the note's modifiers is an Accidental.
function hasAccidental(note: StaveNote) {
  return note.getModifiers().some((modifier) => isCategory(modifier, Accidental));
}

// Return a convenience function for building accidentals from a string.
function makeNewAccid(factory: Factory) {
  return (type: string) => factory.Accidental({ type });
}

/**
 *
 */
function autoAccidentalWorking(): void {
  const createStaveNote = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct);

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

  // F Major (Bb)
  Accidental.applyAccidentals([voice], 'F');

  equal(hasAccidental(notes[0]), false, 'No flat because of key signature');
  equal(hasAccidental(notes[1]), false, 'No flat because of key signature');
  equal(hasAccidental(notes[2]), true, 'Added a sharp');
  equal(hasAccidental(notes[3]), true, 'Back to natural');
  equal(hasAccidental(notes[4]), true, 'Back to natural');
  equal(hasAccidental(notes[5]), false, 'Natural remembered');
  equal(hasAccidental(notes[6]), true, 'Added sharp');
  equal(hasAccidental(notes[7]), true, 'Added sharp');

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

  // A Major (F#,G#,C#)
  Accidental.applyAccidentals([voice], 'A');

  equal(hasAccidental(notes[0]), true, 'Added sharp');
  equal(hasAccidental(notes[1]), true, 'Added flat');
  equal(hasAccidental(notes[2]), true, 'Added flat');
  equal(hasAccidental(notes[3]), true, 'Added sharp');
  equal(hasAccidental(notes[4]), false, 'Sharp remembered');
  equal(hasAccidental(notes[5]), false, 'Flat remembered');
  equal(hasAccidental(notes[6]), false, 'Flat remembered');
  equal(hasAccidental(notes[7]), false, 'sharp remembered');

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

  // C Major (no sharps/flats)
  Accidental.applyAccidentals([voice], 'C');

  equal(hasAccidental(notes[0]), false, 'No accidental');
  equal(hasAccidental(notes[1]), true, 'Added flat');
  equal(hasAccidental(notes[2]), false, 'Flat remembered');
  equal(hasAccidental(notes[3]), true, 'Sharp added');
  equal(hasAccidental(notes[4]), false, 'Sharp remembered');
  equal(hasAccidental(notes[5]), true, 'Added doubled flat');
  equal(hasAccidental(notes[6]), false, 'Double flat remembered');
  equal(hasAccidental(notes[7]), true, 'Added double sharp');
  equal(hasAccidental(notes[8]), false, 'Double sharp rememberd');
  equal(hasAccidental(notes[9]), true, 'Added natural');
  equal(hasAccidental(notes[10]), false, 'Natural remembered');
}

/**
 *
 */
function formatAccidentalSpaces(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 750, 280);
  const context = f.getContext();
  const softmaxFactor = 100;
  // Create the notes
  const notes = [
    new StaveNote({
      keys: ['e##/5'],
      duration: '8d',
    })
      .addAccidental(0, new Accidental('##'))
      .addDotToAll(),
    new StaveNote({
      keys: ['b/4'],
      duration: '16',
    }).addAccidental(0, new Accidental('b')),
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
      .addAccidental(0, new Accidental('bb'))
      .addAccidental(1, new Accidental('bb')),
    new StaveNote({
      keys: ['d/4'],
      duration: '16',
    }),
    new StaveNote({
      keys: ['e/4', 'g/4'],
      duration: '16',
    })
      .addAccidental(0, new Accidental('#'))
      .addAccidental(1, new Accidental('#')),
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
  ok(true);
}

function basic(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  f.Stave({ x: 10, y: 10, width: 550 });

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
      .addAccidental(0, accid('b'))
      .addAccidental(1, accid('#')),

    f
      .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
      .addAccidental(0, accid('##'))
      .addAccidental(1, accid('n'))
      .addAccidental(2, accid('bb'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('#'))
      .addAccidental(5, accid('n'))
      .addAccidental(6, accid('bb')),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
      .addAccidental(0, accid('n'))
      .addAccidental(1, accid('#'))
      .addAccidental(2, accid('#'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb'))
      .addAccidental(5, accid('##'))
      .addAccidental(6, accid('#')),

    f
      .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('##').setAsCautionary())
      .addAccidental(2, accid('#').setAsCautionary())
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb').setAsCautionary())
      .addAccidental(5, accid('b').setAsCautionary()),
  ];

  Formatter.SimpleFormat(notes, 10, { paddingBetween: 45 });

  notes.forEach((note, index) => {
    Note.plotMetrics(f.getContext(), note, 140);
    ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
    note.getAccidentals().forEach((accid: Modifier, index: number) => {
      ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

  ok(true, 'Full Accidental');
}

function cautionary(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 800, 240);
  const stave = f.Stave({ x: 0, y: 10, width: 780 });
  const score = f.EasyScore();

  const accids = Object.keys(Flow.accidentalMap).filter((accid) => accid !== '{' && accid !== '}');

  const notes = accids.map((accidType: string) =>
    f
      .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: Stem.UP })
      .addAccidental(0, f.Accidental({ type: accidType }))
  );

  const voice = score.voice(notes, { time: accids.length + '/4' });

  voice.getTickables().forEach((tickable) => {
    tickable
      .getModifiers()
      .filter((modifier) => modifier.getAttribute('type') === 'Accidental')
      .forEach((accid) => (accid as Accidental).setAsCautionary());
  });

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true, 'Must successfully render cautionary accidentals');
}

function specialCases(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  f.Stave({ x: 10, y: 10, width: 550 });

  const notes = [
    f
      .StaveNote({ keys: ['f/4', 'd/5'], duration: '1' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('b')),

    f
      .StaveNote({ keys: ['c/4', 'g/4'], duration: '2' })
      .addAccidental(0, accid('##'))
      .addAccidental(1, accid('##')),

    f
      .StaveNote({ keys: ['b/3', 'd/4', 'f/4'], duration: '16' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('#'))
      .addAccidental(2, accid('##')),

    f
      .StaveNote({ keys: ['g/4', 'a/4', 'c/5', 'e/5'], duration: '16' })
      .addAccidental(0, accid('b'))
      .addAccidental(1, accid('b'))
      .addAccidental(3, accid('n')),

    f
      .StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4' })
      .addAccidental(0, accid('b').setAsCautionary())
      .addAccidental(1, accid('b').setAsCautionary())
      .addAccidental(2, accid('bb'))
      .addAccidental(3, accid('b')),

    f
      .StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5', 'g/5'], duration: '8' })
      .addAccidental(0, accid('bb'))
      .addAccidental(1, accid('b').setAsCautionary())
      .addAccidental(2, accid('n').setAsCautionary())
      .addAccidental(3, accid('#'))
      .addAccidental(4, accid('n').setAsCautionary()),
  ];

  Formatter.SimpleFormat(notes, 0, { paddingBetween: 20 });

  notes.forEach((note, index) => {
    Note.plotMetrics(f.getContext(), note, 140);
    ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
    note.getAccidentals().forEach((accid, index) => {
      ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

  ok(true, 'Full Accidental');
}

function basicStemDown(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  f.Stave({ x: 10, y: 10, width: 550 });

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w', stem_direction: -1 })
      .addAccidental(0, accid('b'))
      .addAccidental(1, accid('#')),

    f
      .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2', stem_direction: -1 })
      .addAccidental(0, accid('##'))
      .addAccidental(1, accid('n'))
      .addAccidental(2, accid('bb'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('#'))
      .addAccidental(5, accid('n'))
      .addAccidental(6, accid('bb')),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
      .addAccidental(0, accid('n'))
      .addAccidental(1, accid('#'))
      .addAccidental(2, accid('#'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb'))
      .addAccidental(5, accid('##'))
      .addAccidental(6, accid('#')),
  ];

  Formatter.SimpleFormat(notes, 0, { paddingBetween: 30 });

  notes.forEach((note, noteIndex) => {
    Note.plotMetrics(f.getContext(), note, 140);
    ok(note.getAccidentals().length > 0, 'Note ' + noteIndex + ' has accidentals');
    note.getAccidentals().forEach((accid, accidIndex) => {
      ok(accid.getWidth() > 0, 'Accidental ' + accidIndex + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

  ok(true, 'Full Accidental');
}

function multiVoice(options: TestOptions): void {
  // Helper function for visualizing
  function showNotes(note1: StaveNote, note2: StaveNote, stave: Stave, ctx: RenderContext, x: number): void {
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
    .addAccidental(0, accid('b'))
    .addAccidental(1, accid('n'))
    .addAccidental(2, accid('#'))
    .setStave(stave);

  let note2 = f
    .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
    .addAccidental(0, accid('b'))
    .addAccidental(1, accid('bb'))
    .addAccidental(2, accid('##'))
    .setStave(stave);

  showNotes(note1, note2, stave, ctx, 60);

  note1 = f
    .StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
    .addAccidental(0, accid('b'))
    .addAccidental(1, accid('n'))
    .addAccidental(2, accid('#'))
    .setStave(stave);

  note2 = f
    .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
    .addAccidental(0, accid('b'))
    .setStave(stave);

  showNotes(note1, note2, stave, ctx, 150);

  note1 = f
    .StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
    .addAccidental(0, accid('b'))
    .addAccidental(1, accid('n'))
    .addAccidental(2, accid('#'))
    .setStave(stave);

  note2 = f
    .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
    .addAccidental(0, accid('b'))
    .setStave(stave);

  showNotes(note1, note2, stave, ctx, 250);
  VexFlowTests.plotLegendForNoteWidth(ctx, 350, 150);

  ok(true, 'Full Accidental');
}

function microtonal(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  const ctx = f.getContext();
  f.Stave({ x: 10, y: 10, width: 650 });

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
      .addAccidental(0, accid('db'))
      .addAccidental(1, accid('d')),

    f
      .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
      .addAccidental(0, accid('bbs'))
      .addAccidental(1, accid('++'))
      .addAccidental(2, accid('+'))
      .addAccidental(3, accid('d'))
      .addAccidental(4, accid('db'))
      .addAccidental(5, accid('+'))
      .addAccidental(6, accid('##')),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
      .addAccidental(0, accid('++'))
      .addAccidental(1, accid('bbs'))
      .addAccidental(2, accid('+'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('db'))
      .addAccidental(5, accid('##'))
      .addAccidental(6, accid('#')),

    f
      .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('db').setAsCautionary())
      .addAccidental(2, accid('bbs').setAsCautionary())
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('++').setAsCautionary())
      .addAccidental(5, accid('d').setAsCautionary()),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'd/5', 'g/5'], duration: '16' })
      .addAccidental(0, accid('++-'))
      .addAccidental(1, accid('+-'))
      .addAccidental(2, accid('bs'))
      .addAccidental(3, accid('bss'))
      .addAccidental(4, accid('afhf'))
      .addAccidental(5, accid('ashs')),
  ];

  Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

  notes.forEach((note, index) => {
    Note.plotMetrics(f.getContext(), note, 140);
    ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
    note.getAccidentals().forEach((accid: Accidental, index: number) => {
      ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
  ok(true, 'Microtonal Accidental');
}

function microtonal_iranian(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  const ctx = f.getContext();
  f.Stave({ x: 10, y: 10, width: 650 });

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
      .addAccidental(0, accid('k'))
      .addAccidental(1, accid('o')),

    f
      .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
      .addAccidental(0, accid('b'))
      .addAccidental(1, accid('k'))
      .addAccidental(2, accid('n'))
      .addAccidental(3, accid('o'))
      .addAccidental(4, accid('#'))
      .addAccidental(5, accid('bb'))
      .addAccidental(6, accid('##')),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
      .addAccidental(0, accid('o'))
      .addAccidental(1, accid('k'))
      .addAccidental(2, accid('n'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb'))
      .addAccidental(5, accid('##'))
      .addAccidental(6, accid('#')),

    f
      .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('o').setAsCautionary())
      .addAccidental(2, accid('n').setAsCautionary())
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('k').setAsCautionary()),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
      .addAccidental(0, accid('k'))
      .addAccidental(1, accid('k'))
      .addAccidental(2, accid('k'))
      .addAccidental(3, accid('k')),
  ];

  Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

  notes.forEach((note, index) => {
    Note.plotMetrics(f.getContext(), note, 140);
    ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
    note.getAccidentals().forEach((accid: Accidental, index: number) => {
      ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
  ok(true, 'Microtonal Accidental (Iranian)');
}

function sagittal(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  const accid = makeNewAccid(f);
  const ctx = f.getContext();
  f.Stave({ x: 10, y: 10, width: 650 });

  const notes = [
    f
      .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
      .addAccidental(1, accid('accSagittal11MediumDiesisUp'))
      .addAccidental(2, accid('accSagittal5CommaDown'))
      .addAccidental(3, accid('b'))
      .addAccidental(3, accid('accSagittal7CommaDown')),

    f
      .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
      .addAccidental(2, accid('accSagittal35LargeDiesisDown')),

    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' }).addAccidental(1, accid('accSagittal5CommaDown')),

    f
      .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
      .addAccidental(1, accid('b'))
      .addAccidental(1, accid('accSagittal7CommaDown'))
      .addAccidental(3, accid('accSagittal11LargeDiesisDown')),

    f
      .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
      .addAccidental(1, accid('accSagittal11MediumDiesisUp'))
      .addAccidental(2, accid('accSagittal5CommaDown'))
      .addAccidental(3, accid('accSagittalFlat7CDown')),

    f
      .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
      .addAccidental(2, accid('accSagittal35LargeDiesisDown')),

    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' }).addAccidental(1, accid('accSagittal5CommaDown')),

    f
      .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
      .addAccidental(1, accid('accSagittalFlat7CDown'))
      .addAccidental(3, accid('accSagittal11LargeDiesisDown')),
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
    ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
    note.getAccidentals().forEach((accid: Accidental, index: number) => {
      ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
    });
  });

  f.draw();

  VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
  ok(true, 'Sagittal');
}

function automaticAccidentals0(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 200);
  const stave = f.Stave();

  const notes: StaveNote[] = [
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

  ok(true);
}

function automaticAccidentals1(options: TestOptions): void {
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

  ok(true);
}

function automaticAccidentals2(options: TestOptions): void {
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

  ok(true);
}

function automaticAccidentals3(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 150);
  const stave = f.Stave().addKeySignature('A');

  const score = f.EasyScore();
  score.set({ time: '8/4' });
  const notes = score.notes('A4/q, B4/q, C#5/q, D5/q, E5/q,F#5/q, G#5/q, A5/q', { stem: 'UP' });

  const voice = f.Voice().setMode(Voice.Mode.SOFT).addTickables(notes);

  Accidental.applyAccidentals([voice], 'A');

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true);
}

function automaticAccidentalsMultiVoiceInline(options: TestOptions): void {
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

  // Ab Major
  Accidental.applyAccidentals([voice0, voice1], 'Ab');

  equal(hasAccidental(notes0[0]), false);
  equal(hasAccidental(notes0[1]), true);
  equal(hasAccidental(notes0[2]), true);
  equal(hasAccidental(notes0[3]), false);
  equal(hasAccidental(notes0[4]), false);
  equal(hasAccidental(notes0[5]), true);
  equal(hasAccidental(notes0[6]), true);
  equal(hasAccidental(notes0[7]), false);

  equal(hasAccidental(notes1[0]), false);
  equal(hasAccidental(notes1[1]), true);
  equal(hasAccidental(notes1[2]), true);
  equal(hasAccidental(notes1[3]), false);
  equal(hasAccidental(notes1[4]), false);
  equal(hasAccidental(notes1[5]), true);
  equal(hasAccidental(notes1[6]), true);
  equal(hasAccidental(notes1[7]), false);

  new Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

  f.draw();

  ok(true);
}

function automaticAccidentalsMultiVoiceOffset(options: TestOptions): void {
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

  // Cb Major (All flats)
  Accidental.applyAccidentals([voice0, voice1], 'Cb');

  equal(hasAccidental(notes0[0]), true);
  equal(hasAccidental(notes0[1]), true);
  equal(hasAccidental(notes0[2]), true);
  equal(hasAccidental(notes0[3]), true);
  equal(hasAccidental(notes0[4]), true);
  equal(hasAccidental(notes0[5]), true);
  equal(hasAccidental(notes0[6]), true);
  equal(hasAccidental(notes0[7]), false, 'Natural Remembered');

  equal(hasAccidental(notes1[0]), true);
  equal(hasAccidental(notes1[1]), false);
  equal(hasAccidental(notes1[2]), false);
  equal(hasAccidental(notes1[3]), false);
  equal(hasAccidental(notes1[4]), false);
  equal(hasAccidental(notes1[5]), false);
  equal(hasAccidental(notes1[6]), false);
  equal(hasAccidental(notes1[7]), false);

  new Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

  f.draw();

  ok(true);
}

function factoryAPI(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 240);
  f.Stave({ x: 10, y: 10, width: 550 });

  const accid = makeNewAccid(f);

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' })
      .addAccidental(0, accid('b'))
      .addAccidental(1, accid('#')),

    f
      .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' })
      .addAccidental(0, accid('##'))
      .addAccidental(1, accid('n'))
      .addAccidental(2, accid('bb'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('#'))
      .addAccidental(5, accid('n'))
      .addAccidental(6, accid('bb')),

    f
      .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
      .addAccidental(0, accid('n'))
      .addAccidental(1, accid('#'))
      .addAccidental(2, accid('#'))
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb'))
      .addAccidental(5, accid('##'))
      .addAccidental(6, accid('#')),

    f
      .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: 'w' })
      .addAccidental(0, accid('#'))
      .addAccidental(1, accid('##').setAsCautionary())
      .addAccidental(2, accid('#').setAsCautionary())
      .addAccidental(3, accid('b'))
      .addAccidental(4, accid('bb').setAsCautionary())
      .addAccidental(5, accid('b').setAsCautionary()),
  ];

  Formatter.SimpleFormat(notes);

  notes.forEach((n, i) => {
    ok(n.getAccidentals().length > 0, 'Note ' + i + ' has accidentals');
    n.getAccidentals().forEach((accid: Accidental, i: number) => {
      ok(accid.getWidth() > 0, 'Accidental ' + i + ' has set width');
    });
  });

  f.draw();
  ok(true, 'Factory API');
}

export { AccidentalTests };
