// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GlyphNote Tests

/* eslint-disable */
// @ts-nocheck

// TODO: Factory.GlyphNote()'s third argument should be optional.
// TODO: Factory.RepeatNote()'s second and third arguments should both be optional.
// TODO: Line 42 - Object literal may only specify known properties, and 'options' does not exist in type 'Partial<SystemOptions>'
// TODO: ChordSymbol.addGlyphOrText(text: string[], ...) should instead take a string (not an array)!
//       The implementation looks like text is an array, but we are actually just pulling out individual characters from the string.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ChordSymbol } from 'chordsymbol';
import { Glyph } from 'glyph';
import { Registry } from 'registry';
import { StaveConnector } from 'staveconnector';
import { Note } from 'note';
import { Voice } from 'voice';

const GlyphNoteTests = {
  Start(): void {
    QUnit.module('GlyphNote');
    const run = VexFlowTests.runTests;
    run('GlyphNote with ChordSymbols', chordChanges, { debug: false, noPadding: false });
    run('GlyphNote Positioning', basic, { debug: false, noPadding: false });
    run('GlyphNote No Stave Padding', basic, { debug: true, noPadding: true });
    run('GlyphNote RepeatNote', repeatNote, { debug: false, noPadding: true });
  },
};

function chordChanges(options: TestOptions): void {
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
}

function basic(options: TestOptions): void {
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

  const newVoice = (notes: Note[]) => score.voice(notes, { time: '1/4' });

  const newStave = (voice: Voice) => system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });

  const voices: Note[][] = [
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
}

function repeatNote(options: TestOptions): void {
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

  const createVoice = (notes: Note[]) => score.voice(notes, { time: '1/4' });
  const addStaveWithVoice = (voice: Voice) =>
    system.addStave({ voices: [voice], debugNoteMetrics: options.params.debug });

  const voices: Note[][] = [
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

  voices.map(createVoice).forEach(addStaveWithVoice);
  system.addConnector().setType(StaveConnector.type.BRACKET);

  f.draw();

  Registry.disableDefaultRegistry();
  ok(true);
}

export { GlyphNoteTests };
