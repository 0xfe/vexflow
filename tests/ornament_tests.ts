// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Cyril Silverman

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { QUnit } from './declarations';
import { ContextBuilder } from 'renderer';

/**
 * Ornament Tests
 */
const OrnamentTests = {
  Start() {
    const runTests = VexFlowTests.runTests;
    QUnit.module('Ornament');
    runTests('Ornaments', OrnamentTests.drawOrnaments);
    runTests('Ornaments Vertically Shifted', OrnamentTests.drawOrnamentsDisplaced);
    runTests('Ornaments - Delayed turns', OrnamentTests.drawOrnamentsDelayed);
    runTests('Ornaments - Delayed turns, Multiple Draws', OrnamentTests.drawOrnamentsDelayedMultipleDraws);
    runTests('Stacked', OrnamentTests.drawOrnamentsStacked);
    runTests('With Upper/Lower Accidentals', OrnamentTests.drawOrnamentsWithAccidentals);
    runTests('Jazz Ornaments', OrnamentTests.jazzOrnaments);
  },

  drawOrnaments(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 750, 195);

    // bar 1
    const staveBar1 = new VF.Stave(10, 30, 700);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('mordent'), 0);
    notesBar1[1].addModifier(new VF.Ornament('mordent_inverted'), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn'), 0);
    notesBar1[3].addModifier(new VF.Ornament('turn_inverted'), 0);
    notesBar1[4].addModifier(new VF.Ornament('tr'), 0);
    notesBar1[5].addModifier(new VF.Ornament('upprall'), 0);
    notesBar1[6].addModifier(new VF.Ornament('downprall'), 0);
    notesBar1[7].addModifier(new VF.Ornament('prallup'), 0);
    notesBar1[8].addModifier(new VF.Ornament('pralldown'), 0);
    notesBar1[9].addModifier(new VF.Ornament('upmordent'), 0);
    notesBar1[10].addModifier(new VF.Ornament('downmordent'), 0);
    notesBar1[11].addModifier(new VF.Ornament('lineprall'), 0);
    notesBar1[12].addModifier(new VF.Ornament('prallprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDisplaced(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 750, 195);

    // bar 1
    const staveBar1 = new VF.Stave(10, 30, 700);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/5'], duration: '4', stem_direction: -1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('mordent'), 0);
    notesBar1[1].addModifier(new VF.Ornament('mordent_inverted'), 0);
    notesBar1[1].addModifier(new VF.Ornament('mordent_inverted'), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn'), 0);
    notesBar1[3].addModifier(new VF.Ornament('turn_inverted'), 0);
    notesBar1[4].addModifier(new VF.Ornament('tr'), 0);
    notesBar1[5].addModifier(new VF.Ornament('upprall'), 0);
    notesBar1[6].addModifier(new VF.Ornament('downprall'), 0);
    notesBar1[7].addModifier(new VF.Ornament('prallup'), 0);
    notesBar1[8].addModifier(new VF.Ornament('pralldown'), 0);
    notesBar1[9].addModifier(new VF.Ornament('upmordent'), 0);
    notesBar1[10].addModifier(new VF.Ornament('downmordent'), 0);
    notesBar1[11].addModifier(new VF.Ornament('lineprall'), 0);
    notesBar1[12].addModifier(new VF.Ornament('prallprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDelayed(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new VF.Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('turn').setDelayed(true), 0);
    notesBar1[1].addModifier(new VF.Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[3].addModifier(new VF.Ornament('turn').setDelayed(true), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDelayedMultipleDraws(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new VF.Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('turn').setDelayed(true), 0);
    notesBar1[1].addModifier(new VF.Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[3].addModifier(new VF.Ornament('turn').setDelayed(true), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsStacked(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new VF.Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('mordent'), 0);
    notesBar1[1].addModifier(new VF.Ornament('turn_inverted'), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn'), 0);
    notesBar1[3].addModifier(new VF.Ornament('turn_inverted'), 0);

    notesBar1[0].addModifier(new VF.Ornament('turn'), 0);
    notesBar1[1].addModifier(new VF.Ornament('prallup'), 0);
    notesBar1[2].addModifier(new VF.Ornament('upmordent'), 0);
    notesBar1[3].addModifier(new VF.Ornament('lineprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsWithAccidentals(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 650, 250);

    // bar 1
    const staveBar1 = new VF.Stave(10, 60, 600);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
      new VF.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new VF.Ornament('mordent').setUpperAccidental('#').setLowerAccidental('#'), 0);
    notesBar1[1].addModifier(new VF.Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
    notesBar1[1].addModifier(new VF.Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
    notesBar1[2].addModifier(new VF.Ornament('turn').setUpperAccidental('##').setLowerAccidental('##'), 0);
    notesBar1[3].addModifier(new VF.Ornament('mordent_inverted').setLowerAccidental('db').setUpperAccidental('db'), 0);
    notesBar1[4].addModifier(new VF.Ornament('turn_inverted').setUpperAccidental('++').setLowerAccidental('++'), 0);
    notesBar1[5].addModifier(new VF.Ornament('tr').setUpperAccidental('n').setLowerAccidental('n'), 0);
    notesBar1[6].addModifier(new VF.Ornament('prallup').setUpperAccidental('d').setLowerAccidental('d'), 0);
    notesBar1[7].addModifier(new VF.Ornament('lineprall').setUpperAccidental('db').setLowerAccidental('db'), 0);
    notesBar1[8].addModifier(new VF.Ornament('upmordent').setUpperAccidental('bbs').setLowerAccidental('bbs'), 0);
    notesBar1[9].addModifier(new VF.Ornament('prallprall').setUpperAccidental('bb').setLowerAccidental('bb'), 0);
    notesBar1[10].addModifier(new VF.Ornament('turn_inverted').setUpperAccidental('+').setLowerAccidental('+'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  jazzOrnaments(options) {
    expect(0);
    const f = VexFlowTests.makeFactory(options, 950, 400);
    const ctx = f.getContext();
    ctx.scale(1, 1);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function newNote(keys, duration, modifier, stemDirection) {
      const dot = duration.indexOf('d') >= 0;
      const rv = new VF.StaveNote({ keys, duration, stem_direction: stemDirection })
        .addModifier(modifier, 0)
        .addAccidental(0, new VF.Accidental('b'));
      if (dot) {
        rv.addDotToAll();
      }
      return rv;
    }

    const xStart = 10;
    const xWidth = 300;
    const yStart = 10;
    const staffHeight = 70;

    function draw(modifiers, keys, x, width, y, stemDirection) {
      const notes = [];

      const stave = new VF.Stave(x, y, width).addClef('treble').setContext(ctx).draw();

      notes.push(newNote(keys, '4d', modifiers[0], stemDirection));
      notes.push(newNote(keys, '8', modifiers[1], stemDirection));
      notes.push(newNote(keys, '4d', modifiers[2], stemDirection));
      notes.push(newNote(keys, '8', modifiers[3], stemDirection));
      if (modifiers.length > 4) {
        notes[3].addModifier(modifiers[4], 0);
      }

      VF.Beam.generateBeams(notes);
      const voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
      }).setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);
      const formatter = new VF.Formatter({ softmaxFactor: 2 }).joinVoices([voice]);
      formatter.format([voice], xWidth);
      stave.setContext(ctx).draw();
      voice.draw(ctx, stave);
    }
    let mods = [];
    let curX = xStart;
    let curY = yStart;
    mods.push(new VF.Ornament('scoop'));
    mods.push(new VF.Ornament('doit'));
    mods.push(new VF.Ornament('fall'));
    mods.push(new VF.Ornament('doitLong'));

    draw(mods, ['a/5'], curX, xWidth, curY, -1);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('fallLong'));
    mods.push(new VF.Ornament('bend'));
    mods.push(new VF.Ornament('plungerClosed'));
    mods.push(new VF.Ornament('plungerOpen'));
    mods.push(new VF.Ornament('bend'));
    draw(mods, ['a/5'], curX, xWidth, curY, -1);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('flip'));
    mods.push(new VF.Ornament('jazzTurn'));
    mods.push(new VF.Ornament('smear'));
    mods.push(new VF.Ornament('doit'));
    draw(mods, ['a/5'], curX, xWidth, curY, 1);

    curX = xStart;
    curY += staffHeight;

    mods = [];
    mods.push(new VF.Ornament('scoop'));
    mods.push(new VF.Ornament('doit'));
    mods.push(new VF.Ornament('fall'));
    mods.push(new VF.Ornament('doitLong'));

    draw(mods, ['e/5'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('fallLong'));
    mods.push(new VF.Ornament('bend'));
    mods.push(new VF.Ornament('plungerClosed'));
    mods.push(new VF.Ornament('plungerOpen'));
    mods.push(new VF.Ornament('bend'));
    draw(mods, ['e/5'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('flip'));
    mods.push(new VF.Ornament('jazzTurn'));
    mods.push(new VF.Ornament('smear'));
    mods.push(new VF.Ornament('doit'));
    draw(mods, ['e/5'], curX, xWidth, curY);

    curX = xStart;
    curY += staffHeight;

    mods = [];
    mods.push(new VF.Ornament('scoop'));
    mods.push(new VF.Ornament('doit'));
    mods.push(new VF.Ornament('fall'));
    mods.push(new VF.Ornament('doitLong'));

    draw(mods, ['e/4'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('fallLong'));
    mods.push(new VF.Ornament('bend'));
    mods.push(new VF.Ornament('plungerClosed'));
    mods.push(new VF.Ornament('plungerOpen'));
    mods.push(new VF.Ornament('bend'));
    draw(mods, ['e/4'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new VF.Ornament('flip'));
    mods.push(new VF.Ornament('jazzTurn'));
    mods.push(new VF.Ornament('smear'));
    mods.push(new VF.Ornament('doit'));
    draw(mods, ['e/4'], curX, xWidth, curY);
  },
};

export { OrnamentTests };
