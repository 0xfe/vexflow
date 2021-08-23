// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GlyphNote Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ok, QUnit } from './support/qunit_api';
import { Registry } from 'registry';
import { Glyph } from 'glyph';
import { ChordSymbol } from 'chordsymbol';
import { StaveConnector } from 'staveconnector';

const GlyphNoteTests = {
  Start(): void {
    QUnit.module('GlyphNote');
    const run = VexFlowTests.runTests;
    run('GlyphNote with ChordSymbols', this.chordChanges, { debug: false, noPadding: false });
    run('GlyphNote Positioning', this.basic, { debug: false, noPadding: false });
    run('GlyphNote No Stave Padding', this.basic, { debug: true, noPadding: true });
    run('GlyphNote RepeatNote', this.repeatNote, { debug: false, noPadding: true });
  },

  chordChanges(options: TestOptions): void {
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
    Registry.disableDefaultRegistry();
    ok(true);
  },

  basic(options: TestOptions): void {
    Registry.enableDefaultRegistry(new Registry());

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
      [f.GlyphNote(new Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
      [f.GlyphNote(new Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
      [
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeat4Bars', 40), { duration: '16' }),
        f.GlyphNote(new Glyph('repeatBarSlash', 40), { duration: '16' }),
      ],
    ];

    voices.map(newVoice).forEach(newStave);
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    Registry.disableDefaultRegistry();
    ok(true);
  },

  repeatNote(options: TestOptions): void {
    Registry.enableDefaultRegistry(new Registry());

    const f = VexFlowTests.makeFactory(options, 300, 500);
    const system = f.System({
      x: 50,
      width: 250,
      debugFormatter: options.params.debug,
      noPadding: options.params.noPadding,
      options: { alpha: options.params.alpha },
    });

    const score = f.EasyScore();

    const newVoice = function (notes: any) {
      return score.voice(notes, { time: '1/4' });
    };

    const newStave = function (voice: any) {
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
    system.addConnector().setType(StaveConnector.type.BRACKET);

    f.draw();

    Registry.disableDefaultRegistry();
    ok(true);
  },
};

export { GlyphNoteTests };
