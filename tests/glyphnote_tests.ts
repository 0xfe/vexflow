// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GlyphNote Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { ChordSymbol } from '../src/chordsymbol';
import { Glyph } from '../src/glyph';
import { Note } from '../src/note';
import { Registry } from '../src/registry';
import { StaveConnector } from '../src/staveconnector';
import { Voice } from '../src/voice';

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
    details: { alpha: options.params.alpha },
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
  options.assert.ok(true);
}

function basic(options: TestOptions): void {
  Registry.enableDefaultRegistry(new Registry());

  const f = VexFlowTests.makeFactory(options, 300, 400);
  const system = f.System({
    x: 50,
    width: 250,
    debugFormatter: options.params.debug,
    noPadding: options.params.noPadding,
    details: { alpha: options.params.alpha },
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
  options.assert.ok(true);
}

function repeatNote(options: TestOptions): void {
  Registry.enableDefaultRegistry(new Registry());

  const f = VexFlowTests.makeFactory(options, 300, 500);
  const system = f.System({
    x: 50,
    width: 250,
    debugFormatter: options.params.debug,
    noPadding: options.params.noPadding,
    details: { alpha: options.params.alpha },
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
  options.assert.ok(true);
}

VexFlowTests.register(GlyphNoteTests);
export { GlyphNoteTests };
