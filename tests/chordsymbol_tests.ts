// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordSymbol Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Accidental } from '../src/accidental';
import { ChordSymbol } from '../src/chordsymbol';
import { Factory } from '../src/factory';
import { Font, FontGlyph } from '../src/font';
import { Formatter } from '../src/formatter';
import { Ornament } from '../src/ornament';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import { Tables } from '../src/tables';

const ChordSymbolTests = {
  Start(): void {
    QUnit.module('ChordSymbol');
    const run = VexFlowTests.runTests;
    run('Chord Symbol With Modifiers', withModifiers);
    run('Chord Symbol Font Size Tests', fontSize);
    run('Chord Symbol Kerning Tests', kern);
    run('Top Chord Symbols', top);
    run('Top Chord Symbols Justified', topJustify);
    run('Bottom Chord Symbols', bottom);
    run('Bottom Stem Down Chord Symbols', bottomStemDown);
    run('Double Bottom Chord Symbols', doubleBottom);
  },
};

// Options for customizing addGlyphOrText() or addGlyph().
const superscript = { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT };
const subscript = { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT };

// Helper function for creating StaveNotes.
const note = (factory: Factory, keys: string[], duration: string, chordSymbol: ChordSymbol) =>
  factory.StaveNote({ keys, duration }).addModifier(chordSymbol, 0);

/** Calculate the glyph's width in the current music font. */
// How is this different from Glyph.getWidth()? The numbers don't match up.
function getGlyphWidth(glyphName: string): number {
  // `38` seems to be the `font_scale` specified in many classes, such as
  // Accidental, Articulation, Ornament, Strokes. Does this mean `38pt`???
  //
  // However, tables.ts specifies:
  //   NOTATION_FONT_SCALE: 39,
  //   TABLATURE_FONT_SCALE: 39,
  const musicFont = Tables.currentMusicFont();
  const glyph: FontGlyph = musicFont.getGlyphs()[glyphName];
  const widthInEm = (glyph.x_max - glyph.x_min) / musicFont.getResolution();
  return widthInEm * 38 * Font.scaleToPxFrom.pt;
}
function withModifiers(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 750, 580);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], y: number) {
    const notes = [
      note(f, ['c/4'], 'q', chords[0]).addModifier(new Ornament('doit')),
      note(f, ['c/4'], 'q', chords[1]),
      note(f, ['c/4'], 'q', chords[2]).addModifier(new Ornament('fall')),
      note(f, ['c/4'], 'q', chords[3]),
    ];
    const score = f.EasyScore();
    const voice = score.voice(notes, { time: '4/4' });
    const formatter = f.Formatter();
    formatter.joinVoices([voice]);
    const voiceW = formatter.preCalculateMinTotalWidth([voice]);
    const staffW = voiceW + Stave.defaultPadding + getGlyphWidth('gClef');
    formatter.format([voice], voiceW);
    const staff = f.Stave({ x: 10, y, width: staffW }).addClef('treble').draw();
    voice.draw(ctx, staff);
  }

  let chords = [];
  chords.push(
    f
      .ChordSymbol({ fontSize: 10 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('b9', superscript)
      .addGlyphOrText('#11', subscript)
      .addGlyph('rightParenTall')
  );
  chords.push(
    f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('b9', superscript).addGlyphOrText('#11', subscript)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 14 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('add 3', superscript)
      .addGlyphOrText('omit 9', subscript)
      .addGlyph('rightParenTall')
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 16 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('b9', superscript)
      .addGlyphOrText('#11', subscript)
      .addGlyph('rightParenTall')
  );
  draw(chords, 40);

  chords = [];
  chords.push(
    f
      .ChordSymbol({ fontSize: 10 })
      .setFontSize(10)
      .addText('F7')
      .addGlyphOrText('#11', superscript)
      .addGlyphOrText('b9', subscript)
  );
  chords.push(
    f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript)
  );
  chords.push(
    f.ChordSymbol({ fontSize: 14 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 16 })
      .setFontSize(16)
      .addText('F7')
      .addGlyphOrText('#11', superscript)
      .addGlyphOrText('b9', subscript)
  );
  draw(chords, 140);

  chords = [
    f.ChordSymbol({ fontSize: 10 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 14 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 16 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 18 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
  ];
  draw(chords, 240);

  ok(true, 'Font Size Chord Symbol');
}

function fontSize(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 750, 580);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], y: number) {
    const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble');
    const notes = [
      note(f, ['c/4'], 'q', chords[0]),
      note(f, ['c/4'], 'q', chords[1]),
      note(f, ['c/4'], 'q', chords[2]),
      note(f, ['c/4'], 'q', chords[3]),
    ];
    const score = f.EasyScore();
    const voice = score.voice(notes, { time: '4/4' });
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
  }

  let chords = [];
  chords.push(
    f
      .ChordSymbol({ fontSize: 10 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('b9', superscript)
      .addGlyphOrText('#11', subscript)
      .addGlyph('rightParenTall')
      .setReportWidth(false)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 12 })
      .addText('F7')
      .addGlyphOrText('b9', superscript)
      .addGlyphOrText('#11', subscript)
      .setReportWidth(false)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 14 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('add 3', superscript)
      .addGlyphOrText('omit 9', subscript)
      .addGlyph('rightParenTall')
      .setReportWidth(false)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 16 })
      .addText('F7')
      .addGlyph('leftParenTall')
      .addGlyphOrText('b9', superscript)
      .addGlyphOrText('#11', subscript)
      .addGlyph('rightParenTall')
      .setReportWidth(false)
  );
  draw(chords, 40);

  chords = [];
  chords.push(
    f
      .ChordSymbol({ fontSize: 10 })
      .setFontSize(10)
      .addText('F7')
      .addGlyphOrText('#11', superscript)
      .addGlyphOrText('b9', subscript)
  );
  chords.push(
    f.ChordSymbol({ fontSize: 12 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript)
  );
  chords.push(
    f.ChordSymbol({ fontSize: 14 }).addText('F7').addGlyphOrText('#11', superscript).addGlyphOrText('b9', subscript)
  );
  chords.push(
    f
      .ChordSymbol({ fontSize: 16 })
      .setFontSize(16)
      .addText('F7')
      .addGlyphOrText('#11', superscript)
      .addGlyphOrText('b9', subscript)
  );
  draw(chords, 140);

  chords = [
    f.ChordSymbol({ fontSize: 10 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 14 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 16 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript),
    f.ChordSymbol({ fontSize: 18 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript),
  ];
  draw(chords, 240);

  ok(true, 'Font Size Chord Symbol');
}

function kern(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 650 * 1.5, 650);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], y: number) {
    const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();

    const notes = [
      note(f, ['C/4'], 'q', chords[0]),
      note(f, ['C/4'], 'q', chords[1]),
      note(f, ['C/4'], 'q', chords[2]),
      note(f, ['C/4'], 'q', chords[3]),
    ];
    const score = f.EasyScore();
    const voice = score.voice(notes, { time: '4/4' });
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
  }

  let chords = [
    f.ChordSymbol().addText('A').addGlyphSuperscript('dim').setReportWidth(false),
    f.ChordSymbol({ kerning: false, reportWidth: false }).addText('A').addGlyphSuperscript('dim'),
    f.ChordSymbol({ hJustify: 'left', reportWidth: false }).addText('C').addGlyph('halfDiminished', superscript),
    f.ChordSymbol({ reportWidth: false }).addText('D').addGlyph('halfDiminished', superscript),
  ];
  draw(chords, 10);

  chords = [
    f.ChordSymbol().addText('A').addGlyphSuperscript('dim'),
    f.ChordSymbol({ kerning: false }).addText('A').addGlyphSuperscript('dim'),
    f.ChordSymbol().addText('A').addGlyphSuperscript('+').addTextSuperscript('5'),
    f.ChordSymbol().addText('G').addGlyphSuperscript('+').addTextSuperscript('5'),
  ];
  draw(chords, 110);

  chords = [
    f.ChordSymbol().addText('A').addGlyph('-'),
    f.ChordSymbol().addText('E').addGlyph('-'),
    f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript),
    f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript),
  ];
  draw(chords, 210);

  chords = [
    f.ChordSymbol().addGlyphOrText('F/B').addGlyphOrText('b', superscript),
    f.ChordSymbol().addText('E').addGlyphOrText('V/V'),
    f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript),
    f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript),
  ];
  draw(chords, 310);

  ok(true, 'Chord Symbol Kerning Tests');
}

function top(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 650 * 1.5, 650);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  // Helper function for creating StaveNotes.
  const note = (factory: Factory, keys: string[], duration: string, chordSymbol: ChordSymbol, direction: number) =>
    factory.StaveNote({ keys, duration, stem_direction: direction }).addModifier(chordSymbol, 0);

  function draw(c1: ChordSymbol, c2: ChordSymbol, y: number) {
    const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();
    const notes = [
      note(f, ['e/4', 'a/4', 'd/5'], 'h', c1, 1).addModifier(new Accidental('b'), 0),
      note(f, ['c/5', 'e/5', 'c/6'], 'h', c2, -1),
    ];
    const score = f.EasyScore();
    const voice = score.voice(notes, { time: '4/4' });
    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);
    f.draw();
  }

  let chord1 = f
    .ChordSymbol({ reportWidth: false })
    .addText('F7')
    .setHorizontal('left')
    .addGlyphOrText('(#11b9)', superscript);
  let chord2 = f
    .ChordSymbol({ reportWidth: false })
    .addText('C')
    .setHorizontal('left')
    .addGlyphSuperscript('majorSeventh');

  draw(chord1, chord2, 40);

  chord1 = f
    .ChordSymbol()
    .addText('F7')
    .addTextSuperscript('(')
    .addGlyphOrText('#11b9', superscript)
    .addTextSuperscript(')');
  chord2 = f.ChordSymbol().addText('C').setHorizontal('left').addTextSuperscript('Maj.');
  draw(chord1, chord2, 140);

  chord1 = f
    .ChordSymbol()
    .addText('F7')
    .setHorizontal('left')
    .addGlyphOrText('#11', superscript)
    .addGlyphOrText('b9', subscript);
  chord2 = f.ChordSymbol().addText('C').addTextSuperscript('sus4');
  draw(chord1, chord2, 240);

  ok(true, 'Top Chord Symbol');
}

function topJustify(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 500 * 1.5, 680);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chord1: ChordSymbol, chord2: ChordSymbol, y: number) {
    const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

    const notes = [
      note(f, ['e/4', 'a/4', 'd/5'], 'h', chord1).addModifier(new Accidental('b'), 0),
      note(f, ['c/4', 'e/4', 'B/4'], 'h', chord2),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  let chord1 = f.ChordSymbol().addText('F7').setHorizontal('left').addGlyphOrText('(#11b9)', superscript);
  let chord2 = f.ChordSymbol({ hJustify: 'left' }).addText('C').addGlyphSuperscript('majorSeventh');
  draw(chord1, chord2, 40);

  chord1 = f
    .ChordSymbol({ hJustify: 'center' })
    .addText('F7')
    .setHorizontal('left')
    .addGlyphOrText('(#11b9)', superscript);
  chord2 = f.ChordSymbol({ hJustify: 'center' }).addText('C').addTextSuperscript('Maj.');
  draw(chord1, chord2, 140);

  chord1 = f
    .ChordSymbol({ hJustify: 'right' })
    .addText('F7')
    .setHorizontal('left')
    .addGlyphOrText('#11', superscript)
    .addGlyphOrText('b9', subscript);
  chord2 = f.ChordSymbol({ hJustify: 'right' }).addText('C').addTextSuperscript('Maj.');
  draw(chord1, chord2, 240);

  chord1 = f
    .ChordSymbol({ hJustify: 'left' })
    .addText('F7')
    .setHorizontal('left')
    .addGlyphOrText('#11', superscript)
    .addGlyphOrText('b9', subscript);
  chord2 = f.ChordSymbol({ hJustify: 'centerStem' }).addText('C').addTextSuperscript('Maj.');
  draw(chord1, chord2, 340);

  ok(true, 'Top Chord Justified');
}

function bottom(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600 * 1.5, 230);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], y: number) {
    const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();

    const notes = [
      note(f, ['c/4', 'f/4', 'a/4'], 'q', chords[0]),
      note(f, ['c/4', 'e/4', 'b/4'], 'q', chords[1]).addModifier(new Accidental('b'), 2),
      note(f, ['c/4', 'e/4', 'g/4'], 'q', chords[2]),
      note(f, ['c/4', 'f/4', 'a/4'], 'q', chords[3]).addModifier(new Accidental('#'), 1),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  const chords = [
    f.ChordSymbol({ vJustify: 'bottom' }).addText('I').addTextSuperscript('6').addTextSubscript('4'),
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V'),
    f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V/V'),
  ];

  draw(chords, 10);
  ok(true, 'Bottom Chord Symbol');
}

function bottomStemDown(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600 * 1.5, 330);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], y: number) {
    // Helper function to create a StaveNote with a ChordSymbol and the stem pointing down.
    const note = (keys: string[], duration: string, chordSymbol: ChordSymbol) =>
      new StaveNote({ keys, duration, stem_direction: -1 }).addModifier(chordSymbol, 0);

    const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();
    const notes = [
      note(['c/4', 'f/4', 'a/4'], 'q', chords[0]),
      note(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addModifier(new Accidental('b'), 2),
      note(['c/4', 'e/4', 'g/4'], 'q', chords[2]),
      note(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addModifier(new Accidental('#'), 1),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  const chords = [
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('F'),
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('C7'),
    f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
    f.ChordSymbol({ vJustify: 'bottom' }).addText('A').addGlyphSuperscript('dim'),
  ];

  draw(chords, 10);
  ok(true, 'Bottom Stem Down Chord Symbol');
}

function doubleBottom(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600 * 1.5, 260);
  const ctx = f.getContext();
  ctx.scale(1.5, 1.5);

  function draw(chords: ChordSymbol[], chords2: ChordSymbol[], y: number) {
    // Helper function to create a StaveNote with two ChordSymbols attached.
    const note = (keys: string[], duration: string, chordSymbol1: ChordSymbol, chordSymbol2: ChordSymbol) =>
      new StaveNote({ keys, duration }).addModifier(chordSymbol1, 0).addModifier(chordSymbol2, 0);

    const stave = f.Stave({ x: 10, y, width: 450 }).addClef('treble').setContext(ctx).draw();
    const notes = [
      note(['c/4', 'f/4', 'a/4'], 'q', chords[0], chords2[0]),
      note(['c/4', 'e/4', 'b/4'], 'q', chords[1], chords2[1]).addModifier(f.Accidental({ type: 'b' }), 2),
      note(['c/4', 'e/4', 'g/4'], 'q', chords[2], chords2[2]),
      note(['c/4', 'f/4', 'a/4'], 'q', chords[3], chords2[3]).addModifier(f.Accidental({ type: '#' }), 1),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }
  const chords1: ChordSymbol[] = [
    f.ChordSymbol({ vJustify: 'bottom' }).addText('I').addTextSuperscript('6').addTextSubscript('4'),
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V'),
    f.ChordSymbol({ vJustify: 'bottom' }).addLine(12),
    f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V/V'),
  ];

  const chords2: ChordSymbol[] = [
    f.ChordSymbol({ vJustify: 'bottom' }).addText('T'),
    f.ChordSymbol({ vJustify: 'bottom' }).addText('D'),
    f.ChordSymbol({ vJustify: 'bottom' }).addText('D'),
    f.ChordSymbol({ vJustify: 'bottom' }).addText('SD'),
  ];

  draw(chords1, chords2, 10);
  ok(true, '2 Bottom Chord Symbol');
}

VexFlowTests.register(ChordSymbolTests);
export { ChordSymbolTests };
