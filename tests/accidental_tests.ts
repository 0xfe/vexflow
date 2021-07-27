// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { QUnit, ok } from './declarations';
import { VexFlowTests } from './vexflow_test_helpers';

/**
 * Accidental Tests
 */
const AccidentalTests = (function () {
  function hasAccidental(note) {
    return note.modifiers.reduce(function (hasAcc, modifier) {
      return hasAcc || modifier.getCategory() === 'accidentals';
    }, false);
  }

  // newAccid factory
  function makeNewAccid(factory) {
    return function (accidType) {
      return factory.Accidental({ type: accidType });
    };
  }

  const Accidental = {
    Start: function () {
      QUnit.module('Accidental');
      VexFlowTests.runTests('Accidental Padding', Accidental.formatAccidentalSpaces);
      VexFlowTests.runTests('Basic', Accidental.basic);
      VexFlowTests.runTests('Stem Down', Accidental.basicStemDown);
      VexFlowTests.runTests('Cautionary Accidental', Accidental.cautionary);
      VexFlowTests.runTests('Accidental Arrangement Special Cases', Accidental.specialCases);
      VexFlowTests.runTests('Multi Voice', Accidental.multiVoice);
      VexFlowTests.runTests('Microtonal', Accidental.microtonal);
      VexFlowTests.runTests('Microtonal (Iranian)', Accidental.microtonal_iranian);
      VexFlowTests.runTests('Sagittal', Accidental.sagittal);
      QUnit.test('Automatic Accidentals - Simple Tests', Accidental.autoAccidentalWorking);
      VexFlowTests.runTests('Automatic Accidentals', Accidental.automaticAccidentals0);
      VexFlowTests.runTests('Automatic Accidentals - C major scale in Ab', Accidental.automaticAccidentals1);
      VexFlowTests.runTests('Automatic Accidentals - No Accidentals Necsesary', Accidental.automaticAccidentals2);
      VexFlowTests.runTests(
        'Automatic Accidentals - Multi Voice Inline',
        Accidental.automaticAccidentalsMultiVoiceInline
      );
      VexFlowTests.runTests(
        'Automatic Accidentals - Multi Voice Offset',
        Accidental.automaticAccidentalsMultiVoiceOffset
      );
      VexFlowTests.runTests('Factory API', Accidental.factoryAPI);
    },
    formatAccidentalSpaces: function (options) {
      const vf = VF.Test.makeFactory(options, 750, 280);
      const context = vf.getContext();
      const softmaxFactor = 100;
      // Create the notes
      const notes = [
        new VF.StaveNote({
          keys: ['e##/5'],
          duration: '8d',
        })
          .addAccidental(0, new VF.Accidental('##'))
          .addDotToAll(),
        new VF.StaveNote({
          keys: ['b/4'],
          duration: '16',
        }).addAccidental(0, new VF.Accidental('b')),
        new VF.StaveNote({
          keys: ['f/3'],
          duration: '8',
        }),
        new VF.StaveNote({
          keys: ['a/3'],
          duration: '16',
        }),
        new VF.StaveNote({
          keys: ['e/4', 'g/4'],
          duration: '16',
        })
          .addAccidental(0, new VF.Accidental('bb'))
          .addAccidental(1, new VF.Accidental('bb')),
        new VF.StaveNote({
          keys: ['d/4'],
          duration: '16',
        }),
        new VF.StaveNote({
          keys: ['e/4', 'g/4'],
          duration: '16',
        })
          .addAccidental(0, new VF.Accidental('#'))
          .addAccidental(1, new VF.Accidental('#')),
        new VF.StaveNote({
          keys: ['g/4'],
          duration: '32',
        }),
        new VF.StaveNote({
          keys: ['a/4'],
          duration: '32',
        }),
        new VF.StaveNote({
          keys: ['g/4'],
          duration: '16',
        }),
        new VF.StaveNote({
          keys: ['d/4'],
          duration: 'q',
        }),
      ];
      const beams = VF.Beam.generateBeams(notes);
      const voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
      });
      voice.addTickables(notes);
      const formatter = new VF.Formatter({ softmaxFactor }).joinVoices([voice]);
      const width = formatter.preCalculateMinTotalWidth([voice]);
      const stave = new VF.Stave(10, 40, width + 20);
      stave.setContext(context).draw();
      formatter.format([voice], width);
      voice.draw(context, stave);
      beams.forEach(function (b) {
        b.setContext(context).draw();
      });

      notes.forEach(function (note) {
        VF.Test.plotNoteWidth(context, note, 30);
      });

      VF.Test.plotLegendForNoteWidth(context, 300, 150);
      ok(true);
    },

    basic: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      const notes = [
        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('#')),

        vf
          .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('n'))
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('n'))
          .addAccidental(6, newAccid('bb')),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('n'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('#'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf
          .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('##').setAsCautionary())
          .addAccidental(2, newAccid('#').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb').setAsCautionary())
          .addAccidental(5, newAccid('b').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes, 10, { paddingBetween: 45 });

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    cautionary: function (options) {
      const vf = VF.Test.makeFactory(options, 800, 240);
      const stave = vf.Stave({ x: 0, y: 10, width: 780 });
      const score = vf.EasyScore();

      const accids = Object.keys(VF.accidentalMap).filter(function (accid) {
        return accid !== '{' && accid !== '}';
      });

      const notes = accids.map(function (accid) {
        return vf
          .StaveNote({ keys: ['a/4'], duration: '4', stem_direction: VF.Stem.UP })
          .addAccidental(0, vf.Accidental({ type: accid }));
      });

      const voice = score.voice(notes, { time: accids.length + '/4' });

      voice.getTickables().forEach(function (tickable) {
        tickable.modifiers
          .filter(function (modifier) {
            return modifier.getAttribute('type') === 'Accidental';
          })
          .forEach(function (accid) {
            accid.setAsCautionary();
          });
      });

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Must successfully render cautionary accidentals');
    },

    specialCases: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      const notes = [
        vf
          .StaveNote({ keys: ['f/4', 'd/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('b')),

        vf
          .StaveNote({ keys: ['c/4', 'g/4'], duration: '2' })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('##')),

        vf
          .StaveNote({ keys: ['b/3', 'd/4', 'f/4'], duration: '16' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('##')),

        vf
          .StaveNote({ keys: ['g/4', 'a/4', 'c/5', 'e/5'], duration: '16' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('b'))
          .addAccidental(3, newAccid('n')),

        vf
          .StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4' })
          .addAccidental(0, newAccid('b').setAsCautionary())
          .addAccidental(1, newAccid('b').setAsCautionary())
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b')),

        vf
          .StaveNote({ keys: ['b/3', 'e/4', 'a/4', 'd/5', 'g/5'], duration: '8' })
          .addAccidental(0, newAccid('bb'))
          .addAccidental(1, newAccid('b').setAsCautionary())
          .addAccidental(2, newAccid('n').setAsCautionary())
          .addAccidental(3, newAccid('#'))
          .addAccidental(4, newAccid('n').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 20 });

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    basicStemDown: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      vf.Stave({ x: 10, y: 10, width: 550 });

      const notes = [
        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w', stem_direction: -1 })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('#')),

        vf
          .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2', stem_direction: -1 })
          .addAccidental(0, newAccid('##'))
          .addAccidental(1, newAccid('n'))
          .addAccidental(2, newAccid('bb'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('n'))
          .addAccidental(6, newAccid('bb')),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
          .addAccidental(0, newAccid('n'))
          .addAccidental(1, newAccid('#'))
          .addAccidental(2, newAccid('#'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 30 });

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(vf.getContext(), 480, 140);

      ok(true, 'Full Accidental');
    },

    showNotes: function (note1, note2, stave, ctx, x) {
      const modifierContext = new Vex.Flow.ModifierContext();
      note1.addToModifierContext(modifierContext);
      note2.addToModifierContext(modifierContext);

      new VF.TickContext().addTickable(note1).addTickable(note2).preFormat().setX(x);

      note1.setContext(ctx).draw();
      note2.setContext(ctx).draw();

      VexFlowTests.plotNoteWidth(ctx, note1, 180);
      VexFlowTests.plotNoteWidth(ctx, note2, 15);
    },

    multiVoice: function (options) {
      const vf = VF.Test.makeFactory(options, 460, 250);
      const newAccid = makeNewAccid(vf);
      const stave = vf.Stave({ x: 10, y: 45, width: 420 });
      const ctx = vf.getContext();

      stave.draw();

      let note1 = vf
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      let note2 = vf
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('bb'))
        .addAccidental(2, newAccid('##'))
        .setStave(stave);

      Accidental.showNotes(note1, note2, stave, ctx, 60);

      note1 = vf
        .StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      note2 = vf
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .setStave(stave);

      Accidental.showNotes(note1, note2, stave, ctx, 150);

      note1 = vf
        .StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
        .addAccidental(0, newAccid('b'))
        .addAccidental(1, newAccid('n'))
        .addAccidental(2, newAccid('#'))
        .setStave(stave);

      note2 = vf
        .StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addAccidental(0, newAccid('b'))
        .setStave(stave);

      Accidental.showNotes(note1, note2, stave, ctx, 250);
      VexFlowTests.plotLegendForNoteWidth(ctx, 350, 150);

      ok(true, 'Full Accidental');
    },

    microtonal: function (options) {
      const assert = options.assert;
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      const ctx = vf.getContext();
      vf.Stave({ x: 10, y: 10, width: 650 });

      const notes = [
        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('db'))
          .addAccidental(1, newAccid('d')),

        vf
          .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('bbs'))
          .addAccidental(1, newAccid('++'))
          .addAccidental(2, newAccid('+'))
          .addAccidental(3, newAccid('d'))
          .addAccidental(4, newAccid('db'))
          .addAccidental(5, newAccid('+'))
          .addAccidental(6, newAccid('##')),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('++'))
          .addAccidental(1, newAccid('bbs'))
          .addAccidental(2, newAccid('+'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('db'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf
          .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('db').setAsCautionary())
          .addAccidental(2, newAccid('bbs').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('++').setAsCautionary())
          .addAccidental(5, newAccid('d').setAsCautionary()),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'd/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('++-'))
          .addAccidental(1, newAccid('+-'))
          .addAccidental(2, newAccid('bs'))
          .addAccidental(3, newAccid('bss'))
          .addAccidental(4, newAccid('afhf'))
          .addAccidental(5, newAccid('ashs')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, 'Microtonal Accidental');
    },

    microtonal_iranian: function (options) {
      const assert = options.assert;
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      const ctx = vf.getContext();
      vf.Stave({ x: 10, y: 10, width: 650 });

      const notes = [
        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '1' })
          .addAccidental(0, newAccid('k'))
          .addAccidental(1, newAccid('o')),

        vf
          .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addAccidental(0, newAccid('b'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('n'))
          .addAccidental(3, newAccid('o'))
          .addAccidental(4, newAccid('#'))
          .addAccidental(5, newAccid('bb'))
          .addAccidental(6, newAccid('##')),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAccid('o'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('n'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('bb'))
          .addAccidental(5, newAccid('##'))
          .addAccidental(6, newAccid('#')),

        vf
          .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: '1' })
          .addAccidental(0, newAccid('#'))
          .addAccidental(1, newAccid('o').setAsCautionary())
          .addAccidental(2, newAccid('n').setAsCautionary())
          .addAccidental(3, newAccid('b'))
          .addAccidental(4, newAccid('k').setAsCautionary()),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4'], duration: '16' })
          .addAccidental(0, newAccid('k'))
          .addAccidental(1, newAccid('k'))
          .addAccidental(2, newAccid('k'))
          .addAccidental(3, newAccid('k')),
      ];

      VF.Formatter.SimpleFormat(notes, 0, { paddingBetween: 35 });

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, 'Microtonal Accidental (Iranian)');
    },

    sagittal: function (options) {
      const assert = options.assert;
      const vf = VF.Test.makeFactory(options, 700, 240);
      const newAccid = makeNewAccid(vf);
      const ctx = vf.getContext();
      vf.Stave({ x: 10, y: 10, width: 650 });

      const notes = [
        vf
          .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
          .addAccidental(1, newAccid('accSagittal11MediumDiesisUp'))
          .addAccidental(2, newAccid('accSagittal5CommaDown'))
          .addAccidental(3, newAccid('b'))
          .addAccidental(3, newAccid('accSagittal7CommaDown')),

        vf
          .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
          .addAccidental(2, newAccid('accSagittal35LargeDiesisDown')),

        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' })
          .addAccidental(1, newAccid('accSagittal5CommaDown')),

        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
          .addAccidental(1, newAccid('b'))
          .addAccidental(1, newAccid('accSagittal7CommaDown'))
          .addAccidental(3, newAccid('accSagittal11LargeDiesisDown')),

        vf
          .StaveNote({ keys: ['d/4', 'f/4', 'b/4', 'b/4'], duration: '4' })
          .addAccidental(1, newAccid('accSagittal11MediumDiesisUp'))
          .addAccidental(2, newAccid('accSagittal5CommaDown'))
          .addAccidental(3, newAccid('accSagittalFlat7CDown')),

        vf
          .StaveNote({ keys: ['d/4', 'f/4', 'a/4', 'b/4'], duration: '4' })
          .addAccidental(2, newAccid('accSagittal35LargeDiesisDown')),

        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5'], duration: '8' })
          .addAccidental(1, newAccid('accSagittal5CommaDown')),

        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'b/4'], duration: '8' })
          .addAccidental(1, newAccid('accSagittalFlat7CDown'))
          .addAccidental(3, newAccid('accSagittal11LargeDiesisDown')),
      ];

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
      });

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [3],
        last_indices: [3],
        options: {
          direction: VF.Stem.DOWN,
        },
      });

      vf.StaveTie({
        from: notes[4],
        to: notes[5],
        first_indices: [0, 1],
        last_indices: [0, 1],
      });

      vf.StaveTie({
        from: notes[4],
        to: notes[5],
        first_indices: [3],
        last_indices: [3],
        options: {
          direction: VF.Stem.DOWN,
        },
      });

      vf.Beam({ notes: notes.slice(2, 4) });
      vf.Beam({ notes: notes.slice(6, 8) });

      VF.Formatter.SimpleFormat(notes);

      notes.forEach(function (note, index) {
        VexFlowTests.plotNoteWidth(vf.getContext(), note, 140);
        assert.ok(note.getAccidentals().length > 0, 'Note ' + index + ' has accidentals');
        note.getAccidentals().forEach(function (accid, index) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + index + ' has set width');
        });
      });

      vf.draw();

      VexFlowTests.plotLegendForNoteWidth(ctx, 580, 140);
      ok(true, 'Sagittal');
    },

    automaticAccidentals0: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 200);
      const stave = vf.Stave();

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
      ].map(vf.StaveNote.bind(vf));

      const gracenotes = [{ keys: ['d#/4'], duration: '16', slash: true }].map(vf.GraceNote.bind(vf));
      notes[0].addModifier(vf.GraceNoteGroup({ notes: gracenotes }).beamNotes(), 0);

      const voice = vf
        .Voice()
        .setMode(Vex.Flow.Voice.Mode.SOFT)
        .addTickable(new Vex.Flow.TimeSigNote('12/4').setStave(stave))
        .addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'C');

      new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentals1: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 150);
      const stave = vf.Stave().addKeySignature('Ab');

      const notes = [
        { keys: ['c/4'], duration: '4' },
        { keys: ['d/4'], duration: '4' },
        { keys: ['e/4'], duration: '4' },
        { keys: ['f/4'], duration: '4' },
        { keys: ['g/4'], duration: '4' },
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c/5'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      const voice = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'Ab');

      new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentals2: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 150);
      const stave = vf.Stave().addKeySignature('A');

      const notes = [
        { keys: ['a/4'], duration: '4' },
        { keys: ['b/4'], duration: '4' },
        { keys: ['c#/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f#/5'], duration: '4' },
        { keys: ['g#/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      const voice = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

      Vex.Flow.Accidental.applyAccidentals([voice], 'A');

      new Vex.Flow.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentalsMultiVoiceInline: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 150);
      const stave = vf.Stave().addKeySignature('Ab');

      const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
      ].map(vf.StaveNote.bind(vf));

      const notes1 = [
        { keys: ['c/5'], duration: '4' },
        { keys: ['d/5'], duration: '4' },
        { keys: ['e/5'], duration: '4' },
        { keys: ['f/5'], duration: '4' },
        { keys: ['g/5'], duration: '4' },
        { keys: ['a/5'], duration: '4' },
        { keys: ['b/5'], duration: '4' },
        { keys: ['c/6'], duration: '4' },
      ].map(vf.StaveNote.bind(vf));

      const voice0 = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes0);

      const voice1 = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes1);

      // Ab Major
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], 'Ab');

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

      new Vex.Flow.Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },

    automaticAccidentalsMultiVoiceOffset: function (options) {
      const vf = VF.Test.makeFactory(options, 700, 150);
      const stave = vf.Stave().addKeySignature('Cb');

      const notes0 = [
        { keys: ['c/4'], duration: '4', stem_direction: -1 },
        { keys: ['d/4'], duration: '4', stem_direction: -1 },
        { keys: ['e/4'], duration: '4', stem_direction: -1 },
        { keys: ['f/4'], duration: '4', stem_direction: -1 },
        { keys: ['g/4'], duration: '4', stem_direction: -1 },
        { keys: ['a/4'], duration: '4', stem_direction: -1 },
        { keys: ['b/4'], duration: '4', stem_direction: -1 },
        { keys: ['c/5'], duration: '4', stem_direction: -1 },
      ].map(vf.StaveNote.bind(vf));

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
      ].map(vf.StaveNote.bind(vf));

      const voice0 = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes0);

      const voice1 = vf.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes1);

      // Cb Major (All flats)
      Vex.Flow.Accidental.applyAccidentals([voice0, voice1], 'Cb');

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

      new Vex.Flow.Formatter().joinVoices([voice0, voice1]).formatToStave([voice0, voice1], stave);

      vf.draw();

      ok(true);
    },

    /**
     *
     */
    autoAccidentalWorking: function () {
      function makeNote(noteStruct) {
        return new VF.StaveNote(noteStruct);
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

      let voice = new VF.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

      // F Major (Bb)
      Vex.Flow.Accidental.applyAccidentals([voice], 'F');

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

      voice = new VF.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

      // A Major (F#,G#,C#)
      Vex.Flow.Accidental.applyAccidentals([voice], 'A');

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

      voice = new VF.Voice().setMode(Vex.Flow.Voice.Mode.SOFT).addTickables(notes);

      // C Major (no sharps/flats)
      Vex.Flow.Accidental.applyAccidentals([voice], 'C');

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

    factoryAPI: function (options) {
      const assert = options.assert;
      const vf = VF.Test.makeFactory(options, 700, 240);
      vf.Stave({ x: 10, y: 10, width: 550 });

      function newAcc(type) {
        return vf.Accidental({ type: type });
      }

      const notes = [
        vf
          .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'w' })
          .addAccidental(0, newAcc('b'))
          .addAccidental(1, newAcc('#')),

        vf
          .StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' })
          .addAccidental(0, newAcc('##'))
          .addAccidental(1, newAcc('n'))
          .addAccidental(2, newAcc('bb'))
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('#'))
          .addAccidental(5, newAcc('n'))
          .addAccidental(6, newAcc('bb')),

        vf
          .StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16' })
          .addAccidental(0, newAcc('n'))
          .addAccidental(1, newAcc('#'))
          .addAccidental(2, newAcc('#'))
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('bb'))
          .addAccidental(5, newAcc('##'))
          .addAccidental(6, newAcc('#')),

        vf
          .StaveNote({ keys: ['a/3', 'c/4', 'e/4', 'b/4', 'd/5', 'g/5'], duration: 'w' })
          .addAccidental(0, newAcc('#'))
          .addAccidental(1, newAcc('##').setAsCautionary())
          .addAccidental(2, newAcc('#').setAsCautionary())
          .addAccidental(3, newAcc('b'))
          .addAccidental(4, newAcc('bb').setAsCautionary())
          .addAccidental(5, newAcc('b').setAsCautionary()),
      ];

      VF.Formatter.SimpleFormat(notes);

      notes.forEach(function (n, i) {
        assert.ok(n.getAccidentals().length > 0, 'Note ' + i + ' has accidentals');
        n.getAccidentals().forEach(function (accid, i) {
          assert.ok(accid.getWidth() > 0, 'Accidental ' + i + ' has set width');
        });
      });

      vf.draw();
      assert.ok(true, 'Factory API');
    },
  };

  return Accidental;
})();

export { AccidentalTests };