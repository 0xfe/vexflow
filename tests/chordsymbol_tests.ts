// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ChordSymbol Tests

/* eslint-disable */
// @ts-nocheck

// ChordSymbol methods addGlyphOrText(), addLine(), addText()) need their second params to be optional.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Accidental } from 'accidental';
import { ChordSymbol } from 'chordsymbol';
import { Formatter } from 'formatter';
import { Stave } from 'stave';
import { StaveNote } from 'stavenote';

const ChordSymbolTests = {
  Start(): void {
    const runSVG = VexFlowTests.runSVGTest;
    QUnit.module('ChordSymbol');
    runSVG('Chord Symbol Font Size Tests', this.fontSize);
    runSVG('Top Chord Symbols', this.top);
    runSVG('Chord Symbol Kerning Tests', this.kern);
    runSVG('Top Chord Symbols Justified', this.topJustify);
    runSVG('Bottom Chord Symbols', this.bottom);
    runSVG('Bottom Stem Down Chord Symbols', this.bottomStemDown);
    runSVG('Double Bottom Chord Symbols', this.dblbottom);
  },

  kern(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 650, 650);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function draw(chords: ChordSymbol[], y: number) {
      const notes = [];

      const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

      notes.push(note(['C/4'], 'q', chords[0]));
      notes.push(note(['C/4'], 'q', chords[1]));
      notes.push(note(['C/4'], 'q', chords[2]));
      notes.push(note(['C/4'], 'q', chords[3]));
      Formatter.FormatAndDraw(ctx, stave, notes);
    }

    let chords = [];
    chords.push(f.ChordSymbol().addText('A').addGlyphSuperscript('dim').setReportWidth(false));

    chords.push(f.ChordSymbol({ kerning: false, reportWidth: false }).addText('A').addGlyphSuperscript('dim'));

    chords.push(
      f.ChordSymbol({ hJustify: 'left', reportWidth: false }).addText('C').addGlyph('halfDiminished', superscript)
    );

    chords.push(f.ChordSymbol({ reportWidth: false }).addText('D').addGlyph('halfDiminished', superscript));

    draw(chords, 10);

    chords = [];
    chords.push(f.ChordSymbol().addText('A').addGlyphSuperscript('dim'));

    chords.push(f.ChordSymbol({ kerning: false }).addText('A').addGlyphSuperscript('dim'));

    chords.push(f.ChordSymbol().addText('A').addGlyphSuperscript('+').addTextSuperscript('5'));

    chords.push(f.ChordSymbol().addText('G').addGlyphSuperscript('+').addTextSuperscript('5'));

    draw(chords, 110);

    chords = [];
    chords.push(f.ChordSymbol().addText('A').addGlyph('-'));

    chords.push(f.ChordSymbol().addText('E').addGlyph('-'));

    chords.push(f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript));

    chords.push(f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript));

    draw(chords, 210);

    chords = [];
    chords.push(f.ChordSymbol().addGlyphOrText('F/B').addGlyphOrText('b', superscript));

    chords.push(f.ChordSymbol().addText('E').addGlyphOrText('V/V'));

    chords.push(f.ChordSymbol().addText('A').addGlyphOrText('(#11)', superscript));

    chords.push(f.ChordSymbol().addText('E').addGlyphOrText('(#9)', superscript));

    draw(chords, 310);

    ok(true, 'Chord Symbol Kerning Tests');
  },

  top(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 650, 650);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function draw(c1, c2, y) {
      const notes = [];

      const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

      notes.push(note(['e/4', 'a/4', 'd/5'], 'h', c1).addAccidental(0, new Accidental('b')));
      notes.push(note(['c/4', 'e/4', 'b/4'], 'h', c2));
      Formatter.FormatAndDraw(ctx, stave, notes);
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
  },

  fontSize(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 750, 580);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function draw(chords, y) {
      const notes = [];

      const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

      notes.push(note(['c/4'], 'q', chords[0]));
      notes.push(note(['c/4'], 'q', chords[1]));
      notes.push(note(['c/4'], 'q', chords[2]));
      notes.push(note(['c/4'], 'q', chords[3]));
      Formatter.FormatAndDraw(ctx, stave, notes);
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

    chords = [];
    chords.push(f.ChordSymbol({ fontSize: 10 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript));
    chords.push(f.ChordSymbol({ fontSize: 14 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript));
    chords.push(f.ChordSymbol({ fontSize: 16 }).addGlyphOrText('Ab').addGlyphOrText('7(#11b9)', superscript));
    chords.push(f.ChordSymbol({ fontSize: 18 }).addGlyphOrText('C#').addGlyphOrText('7(#11b9)', superscript));
    draw(chords, 240);

    ok(true, 'Font Size Chord Symbol');
  },

  topJustify(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 500, 680);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function draw(chord1: ChordSymbol, chord2: ChordSymbol, y) {
      const notes = [];

      const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

      notes.push(note(['e/4', 'a/4', 'd/5'], 'h', chord1).addAccidental(0, new Accidental('b')));
      notes.push(note(['c/4', 'e/4', 'B/4'], 'h', chord2));
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
  },

  dblbottom(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 260);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function note(keys: string[], duration: string, chordSymbol1: ChordSymbol, chordSymbol2: ChordSymbol) {
      return new StaveNote({ keys, duration }).addModifier(chordSymbol1, 0).addModifier(chordSymbol2, 0);
    }

    function draw(chords: ChordSymbol[], chords2: ChordSymbol[], y) {
      const notes = [];

      const stave = new Stave(10, y, 450).addClef('treble').setContext(ctx).draw();

      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[0], chords2[0]));
      notes.push(note(['c/4', 'e/4', 'b/4'], 'q', chords[1], chords2[1]).addAccidental(2, new Accidental('b')));
      notes.push(note(['c/4', 'e/4', 'g/4'], 'q', chords[2], chords2[2]));
      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[3], chords2[3]).addAccidental(1, new Accidental('#')));
      Formatter.FormatAndDraw(ctx, stave, notes);
    }
    const chords1: ChordSymbol[] = [];
    const chords2: ChordSymbol[] = [];

    chords1.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('I').addTextSuperscript('6').addTextSubscript('4'));
    chords1.push(f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V'));
    chords1.push(f.ChordSymbol({ vJustify: 'bottom' }).addLine(12));
    chords1.push(f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('V/V'));

    chords2.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('T'));
    chords2.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('D'));
    chords2.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('D'));
    chords2.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('SD'));

    draw(chords1, chords2, 10);
    ok(true, '2 Bottom Chord Symbol');
  },

  bottom(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 230);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function draw(chords: ChordSymbol[], y: number) {
      const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();

      const notes = [];
      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[0]));
      notes.push(note(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addAccidental(2, new Accidental('b')));
      notes.push(note(['c/4', 'e/4', 'g/4'], 'q', chords[2]));
      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addAccidental(1, new Accidental('#')));
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
  },

  bottomStemDown(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 330);
    const ctx = f.getContext();
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function note(keys: string[], duration: string, chordSymbol: ChordSymbol) {
      return new StaveNote({ keys, duration, stem_direction: -1 }).addModifier(chordSymbol, 0);
    }

    function draw(chords: ChordSymbol[], y: number) {
      const stave = new Stave(10, y, 400).addClef('treble').setContext(ctx).draw();
      const notes = [];
      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[0]));
      notes.push(note(['c/4', 'e/4', 'b/4'], 'q', chords[1]).addAccidental(2, new Accidental('b')));
      notes.push(note(['c/4', 'e/4', 'g/4'], 'q', chords[2]));
      notes.push(note(['c/4', 'f/4', 'a/4'], 'q', chords[3]).addAccidental(1, new Accidental('#')));
      Formatter.FormatAndDraw(ctx, stave, notes);
    }

    const chords = [];
    chords.push(f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('F'));
    chords.push(f.ChordSymbol({ vJustify: 'bottom' }).addGlyphOrText('C7'));
    chords.push(f.ChordSymbol({ vJustify: 'bottom' }).addLine(12));
    chords.push(f.ChordSymbol({ vJustify: 'bottom' }).addText('A').addGlyphSuperscript('dim'));

    draw(chords, 10);
    ok(true, 'Bottom Stem Down Chord Symbol');
  },
};

// Options for customizing addGlyphOrText() or addGlyph().
const superscript = { symbolModifier: ChordSymbol.symbolModifiers.SUPERSCRIPT };
const subscript = { symbolModifier: ChordSymbol.symbolModifiers.SUBSCRIPT };

// Helper function for creating StaveNotes.
const note = (keys: string[], duration: string, chordSymbol: ChordSymbol) =>
  new StaveNote({ keys, duration }).addModifier(chordSymbol, 0);

export { ChordSymbolTests };
