// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit } from './declarations';
import { Registry } from 'registry';
import { Glyph } from 'glyph';
import { ChordSymbol } from 'chordsymbol';
import { StaveConnector } from 'staveconnector';

/**
 * GlyphNote Tests
 */
const GlyphNoteTests = {
  Start: function () {
    const run = VexFlowTests.runTests;
    QUnit.module('GlyphNote');
    run('GlyphNote with ChordSymbols', GlyphNoteTests.chordChanges, { debug: false, noPadding: false });
    run('GlyphNote Positioning', GlyphNoteTests.basic, { debug: false, noPadding: false });
    run('GlyphNote No Stave Padding', GlyphNoteTests.basic, { debug: true, noPadding: true });
    run('GlyphNote RepeatNote', GlyphNoteTests.repeatNote, { debug: false, noPadding: true });
  },
  chordChanges: function (options) {
    Registry.enableDefaultRegistry(new Registry());

    const f = VexFlowTests.makeFactory(options, 300, 200);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: options.params.debug,
      noPadding: options.params.noPadding,
      options: { alpha: options.params.alpha },
    });

    const score = f.EasyScore();

    const notes = [
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
      f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: 'q' }),
    ];
    const chord1 = f
      .ChordSymbol({ reportWidth: false })
      .addText('F7')
      .setHorizontal('left')
      .addGlyphOrText('(#11b9)', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT });
    const chord2 = f
      .ChordSymbol()
      .addText('F7')
      .setHorizontal('left')
      .addGlyphOrText('#11', { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT })
      .addGlyphOrText('b9', { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT });

    notes[0].addModifier(chord1, 0);
    notes[2].addModifier(chord2, 0);
    const voice = score.voice(notes);
    system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
    system.addConnector().setType(StaveConnector.type.BRACKET);
    f.draw();
    VF.Registry.disableDefaultRegistry();
    ok(true);
  },
  basic: function (options) {
    VF.Registry.enableDefaultRegistry(new VF.Registry());

    const f = VexFlowTests.makeFactory(options, 300, 400);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: options.params.debug,
      noPadding: options.params.noPadding,
      options: { alpha: options.params.alpha },
    });

    const score = f.EasyScore();

    const newVoice = function (notes) {
      return score.voice(notes, { time: '1/4' });
    };

    const newStave = function (voice) {
      return system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
    };

    const voices = [
      [f.GlyphNote(new VF.Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
      [f.GlyphNote(new VF.Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
      [
        f.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new VF.Glyph('repeat4Bars', 40), { duration: '16' }),
        f.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
      ],
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(VF.StaveConnector.type.BRACKET);

    f.draw();

    VF.Registry.disableDefaultRegistry();
    ok(true);
  },

  repeatNote: function (options) {
    VF.Registry.enableDefaultRegistry(new VF.Registry());

    const f = VexFlowTests.makeFactory(options, 300, 500);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: options.params.debug,
      noPadding: options.params.noPadding,
      options: { alpha: options.params.alpha },
    });

    const score = f.EasyScore();

    const newVoice = function (notes) {
      return score.voice(notes, { time: '1/4' });
    };

    const newStave = function (voice) {
      return system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
    };

    const voices = [
      [f.RepeatNote('1')],
      [f.RepeatNote('2')],
      [f.RepeatNote('4')],
      [
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
        f.RepeatNote('slash', { duration: '16' }),
      ],
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(VF.StaveConnector.type.BRACKET);

    f.draw();

    VF.Registry.disableDefaultRegistry();
    ok(true);
  },
};

export { GlyphNoteTests };
