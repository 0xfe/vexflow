// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Basic Stave Tests

// TODO: Like Stave.setTempo(t: StaveTempoOptions, ...), Stave.setText(...) could declare an interface called StaveTextOptions.
//       This helps developers because they can use the named type in their code for type checking.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Accidental } from '../src/accidental';
import { Beam } from '../src/beam';
import { Clef } from '../src/clef';
import { Formatter } from '../src/formatter';
import { KeySignature } from '../src/keysignature';
import { Modifier } from '../src/modifier';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { Barline, BarlineType } from '../src/stavebarline';
import { StaveModifier } from '../src/stavemodifier';
import { StaveNote } from '../src/stavenote';
import { Repetition } from '../src/staverepetition';
import { StaveTempoOptions } from '../src/stavetempo';
import { VoltaType } from '../src/stavevolta';
import { TextJustification } from '../src/textnote';
import { TimeSignature } from '../src/timesignature';

const StaveTests = {
  Start(): void {
    QUnit.module('Stave');
    QUnit.test('StaveModifiers SortByCategory', sortByCategory);
    const run = VexFlowTests.runTests;
    run('Stave Draw Test', draw);
    run('Open Stave Draw Test', drawOpenStave);
    run('Multiple Stave Barline Test', drawMultipleMeasures);
    run('Multiple Stave Barline Test (14pt Section)', drawMultipleMeasures, { fontSize: 14 });
    run('Multiple Stave Repeats Test', drawRepeats);
    run('Stave End Modifiers Test', drawEndModifiers);
    run('Stave Repetition (CODA) Positioning', drawStaveRepetition, { yShift: 0 });
    run('Stave Repetition (CODA) Positioning (-20)', drawStaveRepetition, { yShift: -20 });
    run('Stave Repetition (CODA) Positioning (+10)', drawStaveRepetition, { yShift: +10 });
    run('Multiple Staves Volta Test', drawVolta);
    run('Volta + Modifier Measure Test', drawVoltaModifier);
    run('Tempo Test', drawTempo);
    run('Single Line Configuration Test', configureSingleLine);
    run('Batch Line Configuration Test', configureAllLines);
    run('Stave Text Test', drawStaveText);
    run('Multiple Line Stave Text Test', drawStaveTextMultiLine);
    run('Factory API', factoryAPI);
  },
};

function sortByCategory(assert: Assert): void {
  const stave = new Stave(0, 0, 300);
  const clef0 = new Clef('treble');
  const clef1 = new Clef('alto');
  const clef2 = new Clef('bass');
  const time0 = new TimeSignature('C');
  const time1 = new TimeSignature('C|');
  const time2 = new TimeSignature('9/8');
  const key0 = new KeySignature('G');
  const key1 = new KeySignature('F');
  const key2 = new KeySignature('D');
  const bar0 = new Barline(BarlineType.SINGLE);
  const bar1 = new Barline(BarlineType.DOUBLE);
  const bar2 = new Barline(BarlineType.NONE);

  // const order0 = { barlines: 0, clefs: 1, keysignatures: 2, timesignatures: 3 };
  // const order1 = { timesignatures: 0, keysignatures: 1, barlines: 2, clefs: 3 };
  const order0 = { Barline: 0, Clef: 1, KeySignature: 2, TimeSignature: 3 };
  const order1 = { TimeSignature: 0, KeySignature: 1, Barline: 2, Clef: 3 };

  const sortAndCompare = (title: string, a: StaveModifier[], b: StaveModifier[], order: Record<string, number>) => {
    stave.sortByCategory(a, order);

    // Verify that the two arrays are identical.
    let isSame = true;
    if (a.length !== b.length) isSame = false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) isSame = false;
    }
    assert.ok(isSame, title);
  };

  sortAndCompare(
    'Keep the original order 1',
    [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
    [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
    order0
  );
  sortAndCompare(
    'Keep the original order 2',
    [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
    [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
    order1
  );
  sortAndCompare(
    'Sort and keep 1',
    [bar0, bar1, clef0, clef1, key0, key1, time0, time1],
    [time0, time1, key0, key1, bar0, bar1, clef0, clef1],
    order1
  );
  sortAndCompare(
    'Sort and keep 2',
    [bar0, clef0, key0, time0, key1, time1, clef1, bar1, time2, clef2, bar2, key2],
    [bar0, bar1, bar2, clef0, clef1, clef2, key0, key1, key2, time0, time1, time2],
    order0
  );
  sortAndCompare(
    'Sort and keep 3',
    [bar2, clef2, key2, time0, key0, time2, clef1, bar1, time1, clef0, bar0, key1],
    [time0, time2, time1, key2, key0, key1, bar2, bar1, bar0, clef2, clef1, clef0],
    order1
  );
}

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 150);
  const stave = new Stave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  options.assert.equal(stave.getYForNote(0), 100, 'getYForNote(0)');
  options.assert.equal(stave.getYForLine(5), 100, 'getYForLine(5)');
  options.assert.equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
  options.assert.equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

  options.assert.ok(true, 'all pass');
}

function drawOpenStave(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 350);
  let stave = new Stave(10, 10, 300, { left_bar: false });
  stave.setContext(ctx);
  stave.draw();

  stave = new Stave(10, 150, 300, { right_bar: false });
  stave.setContext(ctx);
  stave.draw();

  options.assert.ok(true, 'all pass');
}

function drawMultipleMeasures(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 550, 200);

  // bar 1
  const staveBar1 = new Stave(10, 50, 200);
  staveBar1.setBegBarType(BarlineType.REPEAT_BEGIN);
  staveBar1.setEndBarType(BarlineType.DOUBLE);
  staveBar1.setSection('A', 0, 0, options.params?.fontSize, false);
  staveBar1.addClef('treble').setContext(ctx).draw();
  const notesBar1 = [
    new StaveNote({ keys: ['c/4'], duration: 'q' }),
    new StaveNote({ keys: ['d/4'], duration: 'q' }),
    new StaveNote({ keys: ['b/4'], duration: 'qr' }),
    new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 300);
  staveBar2.setSection('B', 0, 0, options.params?.fontSize);
  staveBar2.setEndBarType(BarlineType.END);
  staveBar2.setContext(ctx).draw();

  const notesBar2_part1 = [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ];

  const notesBar2_part2 = [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ];

  // create the beams for 8th notes in 2nd measure
  const beam1 = new Beam(notesBar2_part1);
  const beam2 = new Beam(notesBar2_part2);
  const notesBar2 = notesBar2_part1.concat(notesBar2_part2);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();
}

function drawRepeats(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 750, 120);

  // bar 1
  const staveBar1 = new Stave(10, 0, 250);
  staveBar1.setBegBarType(BarlineType.REPEAT_BEGIN);
  staveBar1.setEndBarType(BarlineType.REPEAT_END);
  staveBar1.addClef('treble');
  staveBar1.addKeySignature('A');
  staveBar1.setContext(ctx).draw();
  const notesBar1 = [
    new StaveNote({ keys: ['c/4'], duration: 'q' }),
    new StaveNote({ keys: ['d/4'], duration: 'q' }),
    new StaveNote({ keys: ['b/4'], duration: 'qr' }),
    new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 250);
  staveBar2.setBegBarType(BarlineType.REPEAT_BEGIN);
  staveBar2.setEndBarType(BarlineType.REPEAT_END);
  staveBar2.setContext(ctx).draw();

  const notesBar2_part1 = [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ];

  const notesBar2_part2 = [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ];
  notesBar2_part2[0].addModifier(new Accidental('#'), 0);
  notesBar2_part2[1].addModifier(new Accidental('#'), 0);
  notesBar2_part2[3].addModifier(new Accidental('b'), 0);
  // create the beams for 8th notes in 2nd measure
  const beam1 = new Beam(notesBar2_part1);
  const beam2 = new Beam(notesBar2_part2);
  const notesBar2 = notesBar2_part1.concat(notesBar2_part2);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  // Render beams
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  // bar 3 - juxtaposing third bar next to second bar
  const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 50);
  staveBar3.setContext(ctx).draw();
  const notesBar3 = [new StaveNote({ keys: ['d/5'], duration: 'wr' })];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

  // bar 4 - juxtaposing third bar next to third bar
  const staveBar4 = new Stave(
    staveBar3.getWidth() + staveBar3.getX(),
    staveBar3.getY(),
    250 - staveBar1.getModifierXShift()
  );
  staveBar4.setBegBarType(BarlineType.REPEAT_BEGIN);
  staveBar4.setEndBarType(BarlineType.REPEAT_END);
  staveBar4.setContext(ctx).draw();
  const notesBar4 = [
    new StaveNote({ keys: ['c/4'], duration: 'q' }),
    new StaveNote({ keys: ['d/4'], duration: 'q' }),
    new StaveNote({ keys: ['b/4'], duration: 'qr' }),
    new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
  ];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
}

function drawEndModifiers(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  const staveWidth = 230;
  const blockHeight = 80;
  let x = 10;
  let y = 0;

  const ctx = contextBuilder(options.elementId, 800, 700);

  function drawStavesInTwoLines(endBarLine: BarlineType) {
    // Draw a stave with one measure. Change the ending modifiers.
    // eslint-disable-next-line
    function drawStave(x: number, y: number, width: number, begMods: any, endMods: any) {
      const staveBar = new Stave(x, y, width - 10);
      if (begMods) {
        if (begMods.barLine !== undefined) {
          staveBar.setBegBarType(begMods.barLine);
        }
        if (begMods.clef !== undefined) {
          staveBar.addClef(begMods.clef);
        }
        if (begMods.keySig !== undefined) {
          staveBar.addKeySignature(begMods.keySig);
        }
        if (begMods.timeSig !== undefined) {
          staveBar.setTimeSignature(begMods.timeSig);
        }
      }

      if (endMods) {
        if (endMods.barLine !== undefined) {
          staveBar.setEndBarType(endMods.barLine);
        }
        if (endMods.clef !== undefined) {
          staveBar.addEndClef(endMods.clef);
        }
        if (endMods.keySig !== undefined) {
          staveBar.setEndKeySignature(endMods.keySig);
        }
        if (endMods.timeSig !== undefined) {
          staveBar.setEndTimeSignature(endMods.timeSig);
        }
      }

      staveBar.setContext(ctx).draw();
      const notesBar = [
        new StaveNote({ keys: ['c/4'], duration: 'q' }),
        new StaveNote({ keys: ['d/4'], duration: 'q' }),
        new StaveNote({ keys: ['b/4'], duration: 'qr' }),
        new StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: 'q' }),
      ];

      Formatter.FormatAndDraw(ctx, staveBar, notesBar);
    }

    drawStave(
      x,
      y,
      staveWidth + 50,
      { barLine: BarlineType.REPEAT_BEGIN, clef: 'treble', keySig: 'A' },
      { barLine: endBarLine, clef: 'bass' }
    );
    x += staveWidth + 50;

    drawStave(x, y, staveWidth, { barLine: BarlineType.REPEAT_BEGIN }, { barLine: endBarLine, keySig: 'E' });
    x += staveWidth;

    drawStave(x, y, staveWidth, { barLine: BarlineType.REPEAT_BEGIN }, { barLine: endBarLine, timeSig: '2/4' });
    x += staveWidth;

    x = 10;
    y += blockHeight;

    drawStave(
      x,
      y,
      staveWidth,
      { barLine: BarlineType.REPEAT_BEGIN },
      { barLine: endBarLine, clef: 'bass', timeSig: '2/4' }
    );
    x += staveWidth;

    drawStave(
      x,
      y,
      staveWidth,
      { barLine: BarlineType.REPEAT_BEGIN },
      { barLine: endBarLine, clef: 'treble', keySig: 'Ab' }
    );
    x += staveWidth;

    drawStave(
      x,
      y,
      staveWidth,
      { barLine: BarlineType.REPEAT_BEGIN },
      { barLine: endBarLine, clef: 'bass', keySig: 'Ab', timeSig: '2/4' }
    );
    x += staveWidth;
  }

  y = 0;
  x = 10;
  // First pair of staves.
  drawStavesInTwoLines(BarlineType.SINGLE);

  y += blockHeight + 10;
  x = 10;
  // Second pair of staves, with double barlines.
  drawStavesInTwoLines(BarlineType.DOUBLE);

  y += blockHeight + 10;
  x = 10;
  // Third pair of staves, with "two dot" repeat barlines.
  drawStavesInTwoLines(BarlineType.REPEAT_END);

  y += blockHeight + 10;
  x = 10;
  // Fourth pair of staves, with "two dots" on each side of the barlines.
  drawStavesInTwoLines(BarlineType.REPEAT_BOTH);
}

function drawStaveRepetition(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 725, 200);

  // bar 1
  const mm1 = new Stave(10, 50, 150);
  mm1.addClef('treble');
  mm1.setRepetitionType(Repetition.type.DS_AL_FINE, options.params.yShift);
  mm1.setMeasure(1);
  mm1.setContext(ctx).draw();
  const notesmm1 = [
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
  ];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm1, notesmm1);

  // bar 2 - juxtapose second measure
  const mm2 = new Stave(mm1.getWidth() + mm1.getX(), mm1.getY(), 150);
  mm2.setRepetitionType(Repetition.type.TO_CODA, options.params.yShift);
  mm2.setMeasure(2);
  mm2.setContext(ctx).draw();
  const notesmm2 = [
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
  ];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm2, notesmm2);

  // bar 3 - juxtapose third measure
  const mm3 = new Stave(mm2.getWidth() + mm2.getX(), mm1.getY(), 150);
  mm3.setRepetitionType(Repetition.type.DS_AL_CODA, options.params.yShift);
  mm3.setMeasure(3);
  mm3.setContext(ctx).draw();
  const notesmm3 = [
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
  ];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm3, notesmm3);

  // bar 4 - juxtapose fourth measure
  const mm4 = new Stave(mm3.getWidth() + mm3.getX(), mm1.getY(), 150);
  mm4.setRepetitionType(Repetition.type.CODA_LEFT, options.params.yShift);
  mm4.setMeasure(4);
  mm4.setContext(ctx).draw();
  const notesmm4 = [
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['f/4'], duration: 'q' }),
    new StaveNote({ keys: ['a/4'], duration: 'q' }),
  ];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm4, notesmm4);
}

function drawVolta(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 725, 200);

  // bar 1
  const mm1 = new Stave(10, 50, 125);
  mm1.setBegBarType(BarlineType.REPEAT_BEGIN);
  mm1.setRepetitionType(Repetition.type.SEGNO_LEFT);
  mm1.addClef('treble');
  mm1.addKeySignature('A');
  mm1.setMeasure(1);
  mm1.setSection('A', 0);
  mm1.setContext(ctx).draw();
  const notesmm1 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm1, notesmm1);

  // bar 2 - juxtapose second measure
  const mm2 = new Stave(mm1.getWidth() + mm1.getX(), mm1.getY(), 60);
  mm2.setRepetitionType(Repetition.type.CODA_RIGHT);
  mm2.setMeasure(2);
  mm2.setContext(ctx).draw();
  const notesmm2 = [new StaveNote({ keys: ['d/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm2, notesmm2);

  // bar 3 - juxtapose third measure
  const mm3 = new Stave(mm2.getWidth() + mm2.getX(), mm1.getY(), 60);
  mm3.setVoltaType(VoltaType.BEGIN, '1.', -5);
  mm3.setMeasure(3);
  mm3.setContext(ctx).draw();
  const notesmm3 = [new StaveNote({ keys: ['e/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm3, notesmm3);

  // bar 4 - juxtapose fourth measure
  const mm4 = new Stave(mm3.getWidth() + mm3.getX(), mm1.getY(), 60);
  mm4.setVoltaType(VoltaType.MID, '', -5);
  mm4.setMeasure(4);
  mm4.setContext(ctx).draw();
  const notesmm4 = [new StaveNote({ keys: ['f/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm4, notesmm4);

  // bar 5 - juxtapose fifth measure
  const mm5 = new Stave(mm4.getWidth() + mm4.getX(), mm1.getY(), 60);
  mm5.setEndBarType(BarlineType.REPEAT_END);
  mm5.setVoltaType(VoltaType.END, '', -5);
  mm5.setMeasure(5);
  mm5.setContext(ctx).draw();
  const notesmm5 = [new StaveNote({ keys: ['g/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm5, notesmm5);

  // bar 6 - juxtapose sixth measure
  const mm6 = new Stave(mm5.getWidth() + mm5.getX(), mm1.getY(), 60);
  mm6.setVoltaType(VoltaType.BEGIN_END, '2.', -5);
  mm6.setEndBarType(BarlineType.DOUBLE);
  mm6.setMeasure(6);
  mm6.setContext(ctx).draw();
  const notesmm6 = [new StaveNote({ keys: ['a/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm6, notesmm6);

  // bar 7 - juxtapose seventh measure
  const mm7 = new Stave(mm6.getWidth() + mm6.getX(), mm1.getY(), 60);
  mm7.setMeasure(7);
  mm7.setSection('B', 0);
  mm7.setContext(ctx).draw();
  const notesmm7 = [new StaveNote({ keys: ['b/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm7, notesmm7);

  // bar 8 - juxtapose eighth measure
  const mm8 = new Stave(mm7.getWidth() + mm7.getX(), mm1.getY(), 60);
  mm8.setEndBarType(BarlineType.DOUBLE);
  mm8.setRepetitionType(Repetition.type.DS_AL_CODA);
  mm8.setMeasure(8);
  mm8.setContext(ctx).draw();
  const notesmm8 = [new StaveNote({ keys: ['c/5'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm8, notesmm8);

  // bar 9 - juxtapose ninth measure
  const mm9 = new Stave(mm8.getWidth() + mm8.getX() + 20, mm1.getY(), 125);
  mm9.setEndBarType(BarlineType.END);
  mm9.setRepetitionType(Repetition.type.CODA_LEFT);
  mm9.addClef('treble');
  mm9.addKeySignature('A');
  mm9.setMeasure(9);
  mm9.setContext(ctx).draw();
  const notesmm9 = [new StaveNote({ keys: ['d/5'], duration: 'w' })];

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm9, notesmm9);
}

function drawVoltaModifier(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 1100, 200);

  // bar 1: volta begin, with modifiers (clef, keysignature)
  const mm1 = new Stave(10, 50, 175);
  mm1.setBegBarType(BarlineType.REPEAT_BEGIN);
  mm1.setVoltaType(VoltaType.BEGIN_END, '1.', -5);
  mm1.addClef('treble');
  mm1.addKeySignature('A');
  mm1.setMeasure(1);
  mm1.setSection('A', 0);
  mm1.setContext(ctx).draw();
  const notesmm1 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, mm1, notesmm1);

  // bar 2: volta begin_mid, with modifiers (clef, keysignature)
  const mm2 = new Stave(mm1.getX() + mm1.getWidth(), mm1.getY(), 175);
  mm2.setBegBarType(BarlineType.REPEAT_BEGIN);
  mm2.setRepetitionType(Repetition.type.DS);
  mm2.setVoltaType(VoltaType.BEGIN, '2.', -5);
  mm2.addClef('treble');
  mm2.addKeySignature('A');
  mm2.setMeasure(2);
  mm2.setContext(ctx).draw();
  const notesmm2 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  Formatter.FormatAndDraw(ctx, mm2, notesmm2);

  // bar 3: volta mid, with modifiers (clef, keysignature)
  const mm3 = new Stave(mm2.getX() + mm2.getWidth(), mm2.getY(), 175);
  mm3.setVoltaType(VoltaType.MID, '', -5);
  mm3.setRepetitionType(Repetition.type.DS);
  mm3.addClef('treble');
  mm3.addKeySignature('B');
  mm3.setMeasure(3);
  mm3.setSection('B', 0);
  mm3.setContext(ctx).draw();
  const notesmm3 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  Formatter.FormatAndDraw(ctx, mm3, notesmm3);

  // bar 4: volta end, with modifiers (clef, keysignature)
  const mm4 = new Stave(mm3.getX() + mm3.getWidth(), mm3.getY(), 175);
  mm4.setVoltaType(VoltaType.END, '1.', -5);
  mm4.setRepetitionType(Repetition.type.DS);
  mm4.addClef('treble');
  mm4.addKeySignature('A');
  mm4.setMeasure(4);
  mm4.setSection('C', 0);
  mm4.setContext(ctx).draw();
  const notesmm4 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  Formatter.FormatAndDraw(ctx, mm4, notesmm4);

  // bar 5: d.s. shift (similar potential x-shift concern)
  const mm5 = new Stave(mm4.getX() + mm4.getWidth(), mm4.getY(), 175);
  // mm5.addModifier(new Repetition(Repetition.type.DS, mm4.getX() + mm4.getWidth(), 50), StaveModifierPosition.RIGHT);
  mm5.setEndBarType(BarlineType.DOUBLE);
  mm5.setRepetitionType(Repetition.type.DS);
  mm5.addClef('treble');
  mm5.addKeySignature('A');
  mm5.setMeasure(5);
  mm5.setSection('D', 0);
  mm5.setContext(ctx).draw();
  const notesmm5 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  Formatter.FormatAndDraw(ctx, mm5, notesmm5);

  // bar 6: d.s. without modifiers
  const mm6 = new Stave(mm5.getX() + mm5.getWidth(), mm5.getY(), 175);
  // mm5.addModifier(new Repetition(Repetition.type.DS, mm4.getX() + mm4.getWidth(), 50), StaveModifierPosition.RIGHT);
  mm6.setRepetitionType(Repetition.type.DS);
  mm6.setMeasure(6);
  mm6.setSection('E', 0);
  mm6.setContext(ctx).draw();
  const notesmm6 = [new StaveNote({ keys: ['c/4'], duration: 'w' })];
  Formatter.FormatAndDraw(ctx, mm6, notesmm6);
}

function drawTempo(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.assert.expect(0);

  const ctx = contextBuilder(options.elementId, 725, 350);
  const padding = 10;
  let x = 0;
  let y = 50;

  function drawTempoStaveBar(width: number, tempo: StaveTempoOptions, tempo_y: number, notes?: StaveNote[]) {
    const staveBar = new Stave(padding + x, y, width);
    if (x === 0) staveBar.addClef('treble');
    staveBar.setTempo(tempo, tempo_y);
    staveBar.setContext(ctx).draw();

    const notesBar = notes || [
      new StaveNote({ keys: ['c/4'], duration: 'q' }),
      new StaveNote({ keys: ['d/4'], duration: 'q' }),
      new StaveNote({ keys: ['b/4'], duration: 'q' }),
      new StaveNote({ keys: ['c/4'], duration: 'q' }),
    ];

    Formatter.FormatAndDraw(ctx, staveBar, notesBar);
    x += width;
  }

  drawTempoStaveBar(120, { duration: 'q', dots: 1, bpm: 80 }, 0);
  drawTempoStaveBar(100, { duration: '8', dots: 2, bpm: 90 }, 0);
  drawTempoStaveBar(100, { duration: '16', dots: 1, bpm: 96 }, 0);
  drawTempoStaveBar(100, { duration: '32', bpm: 70 }, 0);
  drawTempoStaveBar(250, { name: 'Andante', bpm: 120 }, -20, [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/5'], duration: '8' }),
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ]);

  x = 0;
  y += 150;

  drawTempoStaveBar(120, { duration: 'w', bpm: 80 }, 0);
  drawTempoStaveBar(100, { duration: 'h', bpm: 90 }, 0);
  drawTempoStaveBar(100, { duration: 'q', bpm: 96 }, 0);
  drawTempoStaveBar(100, { duration: '8', bpm: 70 }, 0);
  drawTempoStaveBar(250, { name: 'Andante grazioso' }, 0, [
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
    new StaveNote({ keys: ['c/4'], duration: '8' }),
    new StaveNote({ keys: ['d/4'], duration: '8' }),
    new StaveNote({ keys: ['g/4'], duration: '8' }),
    new StaveNote({ keys: ['e/4'], duration: '8' }),
  ]);
}

function configureSingleLine(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 120);
  const stave = new Stave(10, 10, 300);
  stave
    .setConfigForLine(0, { visible: true })
    .setConfigForLine(1, { visible: false })
    .setConfigForLine(2, { visible: true })
    .setConfigForLine(3, { visible: false })
    .setConfigForLine(4, { visible: true });
  stave.setContext(ctx).draw();

  const config = stave.getConfigForLines();
  options.assert.equal(config[0].visible, true, 'getLinesConfiguration() - Line 0');
  options.assert.equal(config[1].visible, false, 'getLinesConfiguration() - Line 1');
  options.assert.equal(config[2].visible, true, 'getLinesConfiguration() - Line 2');
  options.assert.equal(config[3].visible, false, 'getLinesConfiguration() - Line 3');
  options.assert.equal(config[4].visible, true, 'getLinesConfiguration() - Line 4');

  options.assert.ok(true, 'all pass');
}

function configureAllLines(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 120);
  const stave = new Stave(10, 10, 300);
  stave
    .setConfigForLines([{ visible: false }, {}, { visible: false }, { visible: true }, { visible: false }])
    .setContext(ctx)
    .draw();

  const config = stave.getConfigForLines();
  options.assert.equal(config[0].visible, false, 'getLinesConfiguration() - Line 0');
  options.assert.equal(config[1].visible, true, 'getLinesConfiguration() - Line 1');
  options.assert.equal(config[2].visible, false, 'getLinesConfiguration() - Line 2');
  options.assert.equal(config[3].visible, true, 'getLinesConfiguration() - Line 3');
  options.assert.equal(config[4].visible, false, 'getLinesConfiguration() - Line 4');

  options.assert.ok(true, 'all pass');
}

function drawStaveText(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 900, 140);
  const stave = new Stave(300, 10, 300);
  stave.setText('Violin', Modifier.Position.LEFT);
  stave.setText('Right Text', Modifier.Position.RIGHT);
  stave.setText('Above Text', Modifier.Position.ABOVE);
  stave.setText('Below Text', Modifier.Position.BELOW);
  stave.setContext(ctx).draw();

  options.assert.ok(true, 'all pass');
}

function drawStaveTextMultiLine(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 900, 200);
  const stave = new Stave(300, 40, 300);
  stave.setText('Violin', Modifier.Position.LEFT, { shift_y: -10 });
  stave.setText('2nd line', Modifier.Position.LEFT, { shift_y: 10 });
  stave.setText('Right Text', Modifier.Position.RIGHT, { shift_y: -10 });
  stave.setText('2nd line', Modifier.Position.RIGHT, { shift_y: 10 });
  stave.setText('Above Text', Modifier.Position.ABOVE, { shift_y: -10 });
  stave.setText('2nd line', Modifier.Position.ABOVE, { shift_y: 10 });
  stave.setText('Left Below Text', Modifier.Position.BELOW, { shift_y: -10, justification: TextJustification.LEFT });
  stave.setText('Right Below Text', Modifier.Position.BELOW, { shift_y: 10, justification: TextJustification.RIGHT });
  stave.setContext(ctx).draw();

  options.assert.ok(true, 'all pass');
}

function factoryAPI(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 900, 200);
  const stave = f.Stave({ x: 300, y: 40, width: 300 });
  stave.setText('Violin', Modifier.Position.LEFT, { shift_y: -10 });
  stave.setText('2nd line', Modifier.Position.LEFT, { shift_y: 10 });
  f.draw();

  options.assert.ok(true, 'all pass');
}

VexFlowTests.register(StaveTests);
export { StaveTests };
