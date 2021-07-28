// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

import { Vex } from 'vex';
import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, equal } from './declarations';
import { Beam } from 'beam';
import { Formatter } from 'formatter';
import { Stave } from 'stave';
import { StaveNote } from 'stavenote';
import { Voice } from 'voice';
import { Stem } from 'stem';
import { TickContext } from 'tickcontext';
import { TimeSigNote } from 'timesignote';
import { ModifierContext } from 'modifiercontext';
import { Accidental } from 'accidental';

function hasAccidental(note: any) {
  return note.modifiers.reduce(function (hasAcc: any, modifier: any) {
    return hasAcc || modifier.getCategory() === 'accidentals';
  }, false);
}

function makeNewAccid(factory: any) {
  return function (accidType: any) {
    return factory.Accidental({ type: accidType });
  };
}

/**
 * Accidental Tests
 */
const AccidentalTests = {
  Start() {
    QUnit.module('Accidental');
    VexFlowTests.runTests('Accidental Padding', AccidentalTests.formatAccidentalSpaces);
    VexFlowTests.runTests('Basic', AccidentalTests.basic);
    VexFlowTests.runTests('Stem Down', AccidentalTests.basicStemDown);
    VexFlowTests.runTests('Cautionary Accidental', AccidentalTests.cautionary);
    VexFlowTests.runTests('Accidental Arrangement Special Cases', AccidentalTests.specialCases);
    VexFlowTests.runTests('Multi Voice', AccidentalTests.multiVoice);
    VexFlowTests.runTests('Microtonal', AccidentalTests.microtonal);
    VexFlowTests.runTests('Microtonal (Iranian)', AccidentalTests.microtonal_iranian);
    VexFlowTests.runTests('Sagittal', AccidentalTests.sagittal);
    QUnit.test('Automatic Accidentals - Simple Tests', AccidentalTests.autoAccidentalWorking);
    VexFlowTests.runTests('Automatic Accidentals', AccidentalTests.automaticAccidentals0);
    VexFlowTests.runTests('Automatic Accidentals - C major scale in Ab', AccidentalTests.automaticAccidentals1);
    VexFlowTests.runTests('Automatic Accidentals - No Accidentals Necsesary', AccidentalTests.automaticAccidentals2);
    VexFlowTests.runTests(
      'Automatic Accidentals - Multi Voice Inline',
      AccidentalTests.automaticAccidentalsMultiVoiceInline
    );
    VexFlowTests.runTests(
      'Automatic Accidentals - Multi Voice Offset',
      AccidentalTests.automaticAccidentalsMultiVoiceOffset
    );
    VexFlowTests.runTests('Factory API', AccidentalTests.factoryAPI);
  },

  formatAccidentalSpaces(options: TestOptions) {
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
    beams.forEach(function (b) {
      b.setContext(context).draw();
    });

    notes.forEach(function (note) {
      VexFlowTests.plotNoteWidth(context, note, 30);
    });

    VexFlowTests.plotLegendForNoteWidth(context, 300, 150);
    ok(true);
  },

  basic(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('#')),

      f
        .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
        .addAccidental(0, newAccid('##'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('bb'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('#'))
        .addAccidental(5, newAccid('n'))
        .addAccidental(6, newAccid('bb')),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
        .addAccidental(0, newAccid('n'))
        .addAccidental(1, newAccid('#'))
        .addAccidental(2, newAccid('#'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('bb'))
        .addAccidental(5, newAccid('##'))
        .addAccidental(6, newAccid('#')),

      f
        .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
        .addAccidental(0, newAccid('#'))
        .addAccidental(1, newAccid('##').setAsCautionary())
        .addAccidental(2, newAccid('#').setAsCautionary())
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('bb').setAsCautionary())
        .addAccidental(5, newAccid('b').setAsCautionary()),
    ];

    Formatter.SimpleFormat(notes, 10, { paddingBetween: 45 });

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid: any, index: any) {
        ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

    ok(true, 'Full Accidental');
  },

  cautionary(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 800, 240);
    const stave = f.Stave({ x: 0, y: 10, width: 780 });
    const score = f.EasyScore();

    const accids = Object.keys(Vex.Flow.accidentalMap).filter(function (accid) {
      return accid !== '{' && accid !== '}';
    });

    const notes = accids.map(function (accid) {
      return f
        .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: Stem.UP })
        .addAccidental(0, f.Accidental({ type: accid }));
    });

    const voice = score.voice(notes, { time: accids.length + '/4' });

    voice.getTickables().forEach(function (tickable: any): void {
      tickable.modifiers
        .filter(function (modifier: any) {
          return modifier.getAttribute('type') === 'Accidental';
        })
        .forEach(function (accid: any): void {
          accid.setAsCautionary();
        });
    });

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();

    ok(true, 'Must successfully render cautionary accidentals');
  },

  specialCases(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });

    const notes = [
      f
        .StaveNote({ keys: ['f/4', 'd/5'], duration: '1' })
        .addAccidental(0, newAccid('#'))
        .addAccidental(1, newAccid('b')),

      f
        .StaveNote({ keys: ['c/4', 'g/4'], duration: '2' })
        .addAccidental(0, newAccid('##'))
        .addAccidental(1, newAccid('##')),

      f
        .StaveNote({ keys: ['b/3', 'd/4', 'f/4'], duration: '16' })
        .addAccidental(0, newAccid('#'))
        .addAccidental(1, newAccid('#'))
        .addAccidental(2, newAccid('##')),

      f
        .StaveNote({ keys: ['g/4', 'a/4', 'c/5', 'e/5'], duration: '16' })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('b'))
        .addAccidental(3, newAccid('n')),

      f
        .StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4' })
        .addAccidental(0, newAccid('b').setAsCautionary())
        .addAccidental(1, newAccid('b').setAsCautionary())
        .addAccidental(2, newAccid('bb'))
        .addAccidental(3, newAccid('b')),

      f
        .StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5', 'g/5'], duration: '8' })
        .addAccidental(0, newAccid('bb'))
        .addAccidental(1, newAccid('b').setAsCautionary())
        .addAccidental(2, newAccid('n').setAsCautionary())
        .addAccidental(3, newAccid('#'))
        .addAccidental(4, newAccid('n').setAsCautionary()),
    ];

    Formatter.SimpleFormat(notes, 0, { paddingBetween: 20 });

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid: any, index: any): void {
        ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

    ok(true, 'Full Accidental');
  },

  basicStemDown(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    f.Stave({ x: 10, y: 10, width: 550 });

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('#')),

      f
        .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('##'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('bb'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('#'))
        .addAccidental(5, newAccid('n'))
        .addAccidental(6, newAccid('bb')),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
        .addAccidental(0, newAccid('n'))
        .addAccidental(1, newAccid('#'))
        .addAccidental(2, newAccid('#'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('bb'))
        .addAccidental(5, newAccid('##'))
        .addAccidental(6, newAccid('#')),
    ];

    Formatter.SimpleFormat(notes, 0, { paddingBetween: 30 });

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid: any, index: any) {
        ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(f.getContext(), 480, 140);

    ok(true, 'Full Accidental');
  },

  showNotes(note1: any, note2: any, stave: any, ctx: any, x: any): void {
    const modifierContext = new ModifierContext();
    note1.addToModifierContext(modifierContext);
    note2.addToModifierContext(modifierContext);

    new TickContext().addTickable(note1).addTickable(note2).preFormat().setX(x);

    note1.setContext(ctx).draw();
    note2.setContext(ctx).draw();

    VexFlowTests.plotNoteWidth(ctx, note1, 180);
    VexFlowTests.plotNoteWidth(ctx, note2, 15);
  },

  multiVoice(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 460, 250);
    const newAccid = makeNewAccid(f);
    const stave = f.Stave({ x: 10, y: 45, width: 420 });
    const ctx = f.getContext();

    stave.draw();

    let note1 = f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
      .addAccidental(0, newAccid('b'))
      .addAccidental(1, newAccid('n'))
      .addAccidental(2, newAccid('#'))
      .setStave(stave);

    let note2 = f
      .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
      .addAccidental(0, newAccid('b'))
      .addAccidental(1, newAccid('bb'))
      .addAccidental(2, newAccid('##'))
      .setStave(stave);

    AccidentalTests.showNotes(note1, note2, stave, ctx, 60);

    note1 = f
      .StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
      .addAccidental(0, newAccid('b'))
      .addAccidental(1, newAccid('n'))
      .addAccidental(2, newAccid('#'))
      .setStave(stave);

    note2 = f
      .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
      .addAccidental(0, newAccid('b'))
      .setStave(stave);

    AccidentalTests.showNotes(note1, note2, stave, ctx, 150);

    note1 = f
      .StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
      .addAccidental(0, newAccid('b'))
      .addAccidental(1, newAccid('n'))
      .addAccidental(2, newAccid('#'))
      .setStave(stave);

    note2 = f
      .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
      .addAccidental(0, newAccid('b'))
      .setStave(stave);

    AccidentalTests.showNotes(note1, note2, stave, ctx, 250);
    VexFlowTests.plotLegendForNoteWidth(ctx, 350, 150);

    ok(true, 'Full Accidental');
  },

  microtonal(options: TestOptions): void {
    const assert = options.assert;
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
        .addAccidental(0, newAccid('db'))
        .addAccidental(1, newAccid('d')),

      f
        .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
        .addAccidental(0, newAccid('bbs'))
        .addAccidental(1, newAccid('++'))
        .addAccidental(2, newAccid('+'))
        .addAccidental(3, newAccid('d'))
        .addAccidental(4, newAccid('db'))
        .addAccidental(5, newAccid('+'))
        .addAccidental(6, newAccid('##')),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
        .addAccidental(0, newAccid('++'))
        .addAccidental(1, newAccid('bbs'))
        .addAccidental(2, newAccid('+'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('db'))
        .addAccidental(5, newAccid('##'))
        .addAccidental(6, newAccid('#')),

      f
        .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
        .addAccidental(0, newAccid('#'))
        .addAccidental(1, newAccid('db').setAsCautionary())
        .addAccidental(2, newAccid('bbs').setAsCautionary())
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('++').setAsCautionary())
        .addAccidental(5, newAccid('d').setAsCautionary()),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'd/5', 'g/5'], duration: '16' })
        .addAccidental(0, newAccid('++-'))
        .addAccidental(1, newAccid('+-'))
        .addAccidental(2, newAccid('bs'))
        .addAccidental(3, newAccid('bss'))
        .addAccidental(4, newAccid('afhf'))
        .addAccidental(5, newAccid('ashs')),
    ];

    Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid: any, index: any): void {
        assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    ok(true, 'Microtonal Accidental');
  },

  microtonal_iranian(options: TestOptions) {
    const assert = options.assert;
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
        .addAccidental(0, newAccid('k'))
        .addAccidental(1, newAccid('o')),

      f
        .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('k'))
        .addAccidental(2, newAccid('n'))
        .addAccidental(3, newAccid('o'))
        .addAccidental(4, newAccid('#'))
        .addAccidental(5, newAccid('bb'))
        .addAccidental(6, newAccid('##')),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
        .addAccidental(0, newAccid('o'))
        .addAccidental(1, newAccid('k'))
        .addAccidental(2, newAccid('n'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('bb'))
        .addAccidental(5, newAccid('##'))
        .addAccidental(6, newAccid('#')),

      f
        .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
        .addAccidental(0, newAccid('#'))
        .addAccidental(1, newAccid('o').setAsCautionary())
        .addAccidental(2, newAccid('n').setAsCautionary())
        .addAccidental(3, newAccid('b'))
        .addAccidental(4, newAccid('k').setAsCautionary()),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
        .addAccidental(0, newAccid('k'))
        .addAccidental(1, newAccid('k'))
        .addAccidental(2, newAccid('k'))
        .addAccidental(3, newAccid('k')),
    ];

    Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid, index) {
        assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    ok(true, 'Microtonal Accidental (Iranian)');
  },

  sagittal(options: TestOptions): void {
    const assert = options.assert;
    const f = VexFlowTests.makeFactory(options, 700, 240);
    const newAccid = makeNewAccid(f);
    const ctx = f.getContext();
    f.Stave({ x: 10, y: 10, width: 650 });

    const notes = [
      f
        .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
        .addAccidental(1, newAccid('accSagittal11MediumDiesisUp'))
        .addAccidental(2, newAccid('accSagittal5CommaDown'))
        .addAccidental(3, newAccid('b'))
        .addAccidental(3, newAccid('accSagittal7CommaDown')),

      f
        .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
        .addAccidental(2, newAccid('accSagittal35LargeDiesisDown')),

      f
        .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' })
        .addAccidental(1, newAccid('accSagittal5CommaDown')),

      f
        .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
        .addAccidental(1, newAccid('b'))
        .addAccidental(1, newAccid('accSagittal7CommaDown'))
        .addAccidental(3, newAccid('accSagittal11LargeDiesisDown')),

      f
        .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
        .addAccidental(1, newAccid('accSagittal11MediumDiesisUp'))
        .addAccidental(2, newAccid('accSagittal5CommaDown'))
        .addAccidental(3, newAccid('accSagittalFlat7CDown')),

      f
        .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
        .addAccidental(2, newAccid('accSagittal35LargeDiesisDown')),

      f
        .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' })
        .addAccidental(1, newAccid('accSagittal5CommaDown')),

      f
        .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
        .addAccidental(1, newAccid('accSagittalFlat7CDown'))
        .addAccidental(3, newAccid('accSagittal11LargeDiesisDown')),
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

    notes.forEach(function (note, index) {
      VexFlowTests.plotNoteWidth(f.getContext(), note, 140);
      assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
      note.getAccidentals().forEach(function (accid, index) {
        assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
      });
    });

    f.draw();

    VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
    ok(true, 'Sagittal');
  },

  automaticAccidentals0(options: TestOptions): void {
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

    ok(true);
  },

  automaticAccidentals1(options: TestOptions): void {
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
  },

  automaticAccidentals2(options: TestOptions): void {
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
  },

  automaticAccidentalsMultiVoiceInline(options: TestOptions): void {
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
  },

  automaticAccidentalsMultiVoiceOffset(options: TestOptions): void {
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
  },

  /**
   *
   */
  autoAccidentalWorking(): void {
    function makeNote(noteStruct: any) {
      return new StaveNote(noteStruct);
    }

    let notes = [
      { keys: ['bb/4'], duration: '4' },
      { keys: ['bb/4'], duration: '4' },
      { keys: ['g#/4'], duration: '4' },
      { keys: ['g/4'], duration: '4' },
      { keys: ['b/4'], duration: '4' },
      { keys: ['b/4'], duration: '4' },
      { keys: ['a#/4'], duration: '4' },
      { keys: ['g#/4'], duration: '4' },
    ].map(makeNote);

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
    ].map(makeNote);

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
    ].map(makeNote);

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
  },

  factoryAPI(options: TestOptions): void {
    const assert = options.assert;
    const f = VexFlowTests.makeFactory(options, 700, 240);
    f.Stave({ x: 10, y: 10, width: 550 });

    function newAcc(type: any) {
      return f.Accidental({ type: type });
    }

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' })
        .addAccidental(0, newAcc('b'))
        .addAccidental(1, newAcc('#')),

      f
        .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' })
        .addAccidental(0, newAcc('##'))
        .addAccidental(1, newAcc('n'))
        .addAccidental(2, newAcc('bb'))
        .addAccidental(3, newAcc('b'))
        .addAccidental(4, newAcc('#'))
        .addAccidental(5, newAcc('n'))
        .addAccidental(6, newAcc('bb')),

      f
        .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
        .addAccidental(0, newAcc('n'))
        .addAccidental(1, newAcc('#'))
        .addAccidental(2, newAcc('#'))
        .addAccidental(3, newAcc('b'))
        .addAccidental(4, newAcc('bb'))
        .addAccidental(5, newAcc('##'))
        .addAccidental(6, newAcc('#')),

      f
        .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: 'w' })
        .addAccidental(0, newAcc('#'))
        .addAccidental(1, newAcc('##').setAsCautionary())
        .addAccidental(2, newAcc('#').setAsCautionary())
        .addAccidental(3, newAcc('b'))
        .addAccidental(4, newAcc('bb').setAsCautionary())
        .addAccidental(5, newAcc('b').setAsCautionary()),
    ];

    Formatter.SimpleFormat(notes);

    notes.forEach(function (n, i) {
      assert.ok(n.getAccidentals().length > 0, 'Note ' + i + ' has accidentals');
      n.getAccidentals().forEach(function (accid: any, i: any) {
        assert.ok(accid.getWidth() > 0, 'Accidental ' + i + ' has set width');
      });
    });

    f.draw();
    assert.ok(true, 'Factory API');
  },
};

export { AccidentalTests };
