// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Cyril Silverman
//
// Ornament Tests

// TODO: Formatting for Jazz Ornaments is incorrect. The last note + ornament bleeds into the next measure.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Accidental } from '../src/accidental';
import { Beam } from '../src/beam';
import { Dot } from '../src/dot';
import { Formatter } from '../src/formatter';
import { Glyph } from '../src/glyph';
import { Ornament } from '../src/ornament';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote } from '../src/stavenote';
import { Voice, VoiceMode } from '../src/voice';

const OrnamentTests = {
  Start(): void {
    QUnit.module('Ornament');
    const run = VexFlowTests.runTests;
    run('Ornaments', drawOrnaments);
    run('Ornaments Vertically Shifted', drawOrnamentsDisplaced);
    run('Ornaments - Delayed turns', drawOrnamentsDelayed);
    run('Ornaments - Delayed turns, Multiple Draws', drawOrnamentsDelayedMultipleDraws);
    run('Stacked', drawOrnamentsStacked);
    run('With Upper/Lower Accidentals', drawOrnamentsWithAccidentals);
    run('Jazz Ornaments', jazzOrnaments);
  },
};

function drawOrnaments(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 750, 195);

  const stave = new Stave(10, 30, 700);
  stave.setContext(ctx).draw();
  const notes = [
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
  ];

  notes[0].addModifier(new Ornament('mordent'), 0);
  notes[1].addModifier(new Ornament('mordent_inverted'), 0);
  notes[2].addModifier(new Ornament('turn'), 0);
  notes[3].addModifier(new Ornament('turn_inverted'), 0);
  notes[4].addModifier(new Ornament('tr'), 0);
  notes[5].addModifier(new Ornament('upprall'), 0);
  notes[6].addModifier(new Ornament('downprall'), 0);
  notes[7].addModifier(new Ornament('prallup'), 0);
  notes[8].addModifier(new Ornament('pralldown'), 0);
  notes[9].addModifier(new Ornament('upmordent'), 0);
  notes[10].addModifier(new Ornament('downmordent'), 0);
  notes[11].addModifier(new Ornament('lineprall'), 0);
  notes[12].addModifier(new Ornament('prallprall'), 0);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, stave, notes);
}

function drawOrnamentsDisplaced(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 750, 195);

  const stave = new Stave(10, 30, 700);
  stave.setContext(ctx).draw();
  const notes = [
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
  ];

  notes[0].addModifier(new Ornament('mordent'), 0);
  notes[1].addModifier(new Ornament('mordent_inverted'), 0);
  notes[1].addModifier(new Ornament('mordent_inverted'), 0);
  notes[2].addModifier(new Ornament('turn'), 0);
  notes[3].addModifier(new Ornament('turn_inverted'), 0);
  notes[4].addModifier(new Ornament('tr'), 0);
  notes[5].addModifier(new Ornament('upprall'), 0);
  notes[6].addModifier(new Ornament('downprall'), 0);
  notes[7].addModifier(new Ornament('prallup'), 0);
  notes[8].addModifier(new Ornament('pralldown'), 0);
  notes[9].addModifier(new Ornament('upmordent'), 0);
  notes[10].addModifier(new Ornament('downmordent'), 0);
  notes[11].addModifier(new Ornament('lineprall'), 0);
  notes[12].addModifier(new Ornament('prallprall'), 0);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, stave, notes);
}

/**
 * Helper function for the next two tests: drawOrnamentsDelayed and drawOrnamentsDelayedMultipleDraws.
 * setDelayed(true) shifts the turn symbol to the right (after its note).
 */
const addDelayedTurns = (options: TestOptions, contextBuilder: ContextBuilder) => {
  // Get the rendering context
  const context = contextBuilder(options.elementId, 550, 195);

  const stave = new Stave(10, 30, 500);
  stave.setContext(context).draw();

  const notes = [
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
  ];

  notes[0].addModifier(new Ornament('turn').setDelayed(true), 0);
  notes[1].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
  notes[2].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
  notes[3].addModifier(new Ornament('turn').setDelayed(true), 0);

  return { context, stave, notes };
};

function drawOrnamentsDelayed(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  const { context, stave, notes } = addDelayedTurns(options, contextBuilder);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(context, stave, notes);
}

function drawOrnamentsDelayedMultipleDraws(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  const { context, stave, notes } = addDelayedTurns(options, contextBuilder);

  // We can FormatAndDraw() two times, and it looks fine.
  // However, if you inspect the SVG element, you will see duplicate paths.
  Formatter.FormatAndDraw(context, stave, notes);
  Formatter.FormatAndDraw(context, stave, notes);
}

function drawOrnamentsStacked(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 550, 195);

  const stave = new Stave(10, 30, 500);
  stave.setContext(ctx).draw();
  const notes = [
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
  ];

  notes[0].addModifier(new Ornament('mordent'), 0);
  notes[1].addModifier(new Ornament('turn_inverted'), 0);
  notes[2].addModifier(new Ornament('turn'), 0);
  notes[3].addModifier(new Ornament('turn_inverted'), 0);

  notes[0].addModifier(new Ornament('turn'), 0);
  notes[1].addModifier(new Ornament('prallup'), 0);
  notes[2].addModifier(new Ornament('upmordent'), 0);
  notes[3].addModifier(new Ornament('lineprall'), 0);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, stave, notes);
}

function drawOrnamentsWithAccidentals(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 650, 250);

  const stave = new Stave(10, 60, 600);
  stave.setContext(ctx).draw();
  const notes = [
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
  ];

  notes[0].addModifier(new Ornament('mordent').setUpperAccidental('#').setLowerAccidental('#'), 0);
  notes[1].addModifier(new Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
  notes[2].addModifier(new Ornament('turn').setUpperAccidental('##').setLowerAccidental('##'), 0);
  notes[3].addModifier(new Ornament('mordent_inverted').setLowerAccidental('db').setUpperAccidental('db'), 0);
  notes[4].addModifier(new Ornament('turn_inverted').setUpperAccidental('++').setLowerAccidental('++'), 0);
  notes[5].addModifier(new Ornament('tr').setUpperAccidental('n').setLowerAccidental('n'), 0);
  notes[6].addModifier(new Ornament('prallup').setUpperAccidental('d').setLowerAccidental('d'), 0);
  notes[7].addModifier(new Ornament('lineprall').setUpperAccidental('db').setLowerAccidental('db'), 0);
  notes[8].addModifier(new Ornament('upmordent').setUpperAccidental('bbs').setLowerAccidental('bbs'), 0);
  notes[9].addModifier(new Ornament('prallprall').setUpperAccidental('bb').setLowerAccidental('bb'), 0);
  notes[10].addModifier(new Ornament('turn_inverted').setUpperAccidental('+').setLowerAccidental('+'), 0);

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, stave, notes);
}

function jazzOrnaments(options: TestOptions): void {
  const clefWidth = Glyph.getWidth('gClef', 38); // widest clef

  // Helper function.
  function draw(modifiers: Ornament[], keys: string[], x: number, width: number, y: number, stemDirection?: number) {
    // Helper function to create a StaveNote.
    const note = (keys: string[], duration: string, modifier: Ornament, stemDirection?: number) => {
      const n = new StaveNote({ keys, duration, stem_direction: stemDirection })
        .addModifier(modifier, 0)
        .addModifier(new Accidental('b'), 0);
      const dot = duration.indexOf('d') >= 0;
      if (dot) {
        Dot.buildAndAttach([n], { all: true });
      }
      return n;
    };

    const stave = new Stave(x, y, width).addClef('treble').setContext(ctx).draw();

    const notes = [
      note(keys, '4d', modifiers[0], stemDirection),
      note(keys, '8', modifiers[1], stemDirection),
      note(keys, '4d', modifiers[2], stemDirection),
      note(keys, '8', modifiers[3], stemDirection),
    ];

    if (modifiers.length > 4) {
      notes[3].addModifier(modifiers[4], 0);
    }

    Beam.generateBeams(notes);
    const voice = new Voice({
      num_beats: 4,
      beat_value: 4,
    }).setMode(VoiceMode.SOFT);
    voice.addTickables(notes);
    const formatter = new Formatter().joinVoices([voice]);
    formatter.format([voice], width - Stave.defaultPadding - clefWidth);
    stave.setContext(ctx).draw();
    voice.draw(ctx, stave);
  }

  expect(0);

  const f = VexFlowTests.makeFactory(options, 950, 400);
  const ctx = f.getContext();
  ctx.scale(1, 1);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';

  const xStart = 10;
  const width = 300;
  const yStart = 50;
  const staffHeight = 70;

  let curX = xStart;
  let curY = yStart;

  let mods = [
    // measure 1
    new Ornament('scoop'),
    new Ornament('doit'),
    new Ornament('fall'),
    new Ornament('doitLong'),
  ];

  draw(mods, ['a/5'], curX, width, curY, -1);
  curX += width;

  mods = [
    // measure 2
    new Ornament('fallLong'),
    new Ornament('bend'),
    new Ornament('plungerClosed'),
    new Ornament('plungerOpen'),
    new Ornament('bend'),
  ];
  draw(mods, ['a/5'], curX, width, curY, -1);
  curX += width;

  mods = [
    // measure 3
    new Ornament('flip'),
    new Ornament('jazzTurn'),
    new Ornament('smear'),
    new Ornament('doit'),
  ];
  draw(mods, ['a/5'], curX, width, curY, 1);

  // second line
  curX = xStart;
  curY += staffHeight;

  mods = [
    // measure 4
    new Ornament('scoop'),
    new Ornament('doit'),
    new Ornament('fall'),
    new Ornament('doitLong'),
  ];

  draw(mods, ['e/5'], curX, width, curY);
  curX += width;

  mods = [
    // measure 5
    new Ornament('fallLong'),
    new Ornament('bend'),
    new Ornament('plungerClosed'),
    new Ornament('plungerOpen'),
    new Ornament('bend'),
  ];
  draw(mods, ['e/5'], curX, width, curY);
  curX += width;

  mods = [
    // measure 6
    new Ornament('flip'),
    new Ornament('jazzTurn'),
    new Ornament('smear'),
    new Ornament('doit'),
  ];
  draw(mods, ['e/5'], curX, width, curY);

  // third line
  curX = xStart;
  curY += staffHeight;

  mods = [
    // measure 7
    new Ornament('scoop'),
    new Ornament('doit'),
    new Ornament('fall'),
    new Ornament('doitLong'),
  ];

  draw(mods, ['e/4'], curX, width, curY);
  curX += width;

  mods = [
    // measure 8
    new Ornament('fallLong'),
    new Ornament('bend'),
    new Ornament('plungerClosed'),
    new Ornament('plungerOpen'),
    new Ornament('bend'),
  ];
  draw(mods, ['e/4'], curX, width, curY);
  curX += width;

  mods = [
    // measure 9
    new Ornament('flip'),
    new Ornament('jazzTurn'),
    new Ornament('smear'),
    new Ornament('doit'),
  ];
  draw(mods, ['e/4'], curX, width, curY);
}

VexFlowTests.register(OrnamentTests);
export { OrnamentTests };
