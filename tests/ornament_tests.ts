// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
// Author: Cyril Silverman
//
// Ornament Tests

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { expect, QUnit } from './support/qunit_api';
import { ContextBuilder } from 'renderer';
import { Formatter } from 'formatter';
import { StaveNote } from 'stavenote';
import { Ornament } from 'ornament';
import { Voice } from 'voice';
import { Beam } from 'beam';
import { Stave } from 'stave';
import { Accidental } from 'accidental';

const OrnamentTests = {
  Start(): void {
    QUnit.module('Ornament');
    const run = VexFlowTests.runTests;
    run('Ornaments', this.drawOrnaments);
    run('Ornaments Vertically Shifted', this.drawOrnamentsDisplaced);
    run('Ornaments - Delayed turns', this.drawOrnamentsDelayed);
    run('Ornaments - Delayed turns, Multiple Draws', this.drawOrnamentsDelayedMultipleDraws);
    run('Stacked', this.drawOrnamentsStacked);
    run('With Upper/Lower Accidentals', this.drawOrnamentsWithAccidentals);
    run('Jazz Ornaments', this.jazzOrnaments);
  },

  drawOrnaments(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 750, 195);

    // bar 1
    const staveBar1 = new Stave(10, 30, 700);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
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

    notesBar1[0].addModifier(new Ornament('mordent'), 0);
    notesBar1[1].addModifier(new Ornament('mordent_inverted'), 0);
    notesBar1[2].addModifier(new Ornament('turn'), 0);
    notesBar1[3].addModifier(new Ornament('turn_inverted'), 0);
    notesBar1[4].addModifier(new Ornament('tr'), 0);
    notesBar1[5].addModifier(new Ornament('upprall'), 0);
    notesBar1[6].addModifier(new Ornament('downprall'), 0);
    notesBar1[7].addModifier(new Ornament('prallup'), 0);
    notesBar1[8].addModifier(new Ornament('pralldown'), 0);
    notesBar1[9].addModifier(new Ornament('upmordent'), 0);
    notesBar1[10].addModifier(new Ornament('downmordent'), 0);
    notesBar1[11].addModifier(new Ornament('lineprall'), 0);
    notesBar1[12].addModifier(new Ornament('prallprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDisplaced(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 750, 195);

    // bar 1
    const staveBar1 = new Stave(10, 30, 700);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
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

    notesBar1[0].addModifier(new Ornament('mordent'), 0);
    notesBar1[1].addModifier(new Ornament('mordent_inverted'), 0);
    notesBar1[1].addModifier(new Ornament('mordent_inverted'), 0);
    notesBar1[2].addModifier(new Ornament('turn'), 0);
    notesBar1[3].addModifier(new Ornament('turn_inverted'), 0);
    notesBar1[4].addModifier(new Ornament('tr'), 0);
    notesBar1[5].addModifier(new Ornament('upprall'), 0);
    notesBar1[6].addModifier(new Ornament('downprall'), 0);
    notesBar1[7].addModifier(new Ornament('prallup'), 0);
    notesBar1[8].addModifier(new Ornament('pralldown'), 0);
    notesBar1[9].addModifier(new Ornament('upmordent'), 0);
    notesBar1[10].addModifier(new Ornament('downmordent'), 0);
    notesBar1[11].addModifier(new Ornament('lineprall'), 0);
    notesBar1[12].addModifier(new Ornament('prallprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDelayed(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new Ornament('turn').setDelayed(true), 0);
    notesBar1[1].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[2].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[3].addModifier(new Ornament('turn').setDelayed(true), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsDelayedMultipleDraws(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new Ornament('turn').setDelayed(true), 0);
    notesBar1[1].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[2].addModifier(new Ornament('turn_inverted').setDelayed(true), 0);
    notesBar1[3].addModifier(new Ornament('turn').setDelayed(true), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsStacked(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 550, 195);

    // bar 1
    const staveBar1 = new Stave(10, 30, 500);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
      new StaveNote({ keys: ['a/4'], duration: '4', stem_direction: 1 }),
    ];

    notesBar1[0].addModifier(new Ornament('mordent'), 0);
    notesBar1[1].addModifier(new Ornament('turn_inverted'), 0);
    notesBar1[2].addModifier(new Ornament('turn'), 0);
    notesBar1[3].addModifier(new Ornament('turn_inverted'), 0);

    notesBar1[0].addModifier(new Ornament('turn'), 0);
    notesBar1[1].addModifier(new Ornament('prallup'), 0);
    notesBar1[2].addModifier(new Ornament('upmordent'), 0);
    notesBar1[3].addModifier(new Ornament('lineprall'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  drawOrnamentsWithAccidentals(options: TestOptions, contextBuilder: ContextBuilder): void {
    expect(0);

    // Get the rendering context
    const ctx = contextBuilder(options.elementId, 650, 250);

    // bar 1
    const staveBar1 = new Stave(10, 60, 600);
    staveBar1.setContext(ctx).draw();
    const notesBar1 = [
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

    notesBar1[0].addModifier(new Ornament('mordent').setUpperAccidental('#').setLowerAccidental('#'), 0);
    notesBar1[1].addModifier(new Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
    notesBar1[1].addModifier(new Ornament('turn_inverted').setLowerAccidental('b').setUpperAccidental('b'), 0);
    notesBar1[2].addModifier(new Ornament('turn').setUpperAccidental('##').setLowerAccidental('##'), 0);
    notesBar1[3].addModifier(new Ornament('mordent_inverted').setLowerAccidental('db').setUpperAccidental('db'), 0);
    notesBar1[4].addModifier(new Ornament('turn_inverted').setUpperAccidental('++').setLowerAccidental('++'), 0);
    notesBar1[5].addModifier(new Ornament('tr').setUpperAccidental('n').setLowerAccidental('n'), 0);
    notesBar1[6].addModifier(new Ornament('prallup').setUpperAccidental('d').setLowerAccidental('d'), 0);
    notesBar1[7].addModifier(new Ornament('lineprall').setUpperAccidental('db').setLowerAccidental('db'), 0);
    notesBar1[8].addModifier(new Ornament('upmordent').setUpperAccidental('bbs').setLowerAccidental('bbs'), 0);
    notesBar1[9].addModifier(new Ornament('prallprall').setUpperAccidental('bb').setLowerAccidental('bb'), 0);
    notesBar1[10].addModifier(new Ornament('turn_inverted').setUpperAccidental('+').setLowerAccidental('+'), 0);

    // Helper function to justify and draw a 4/4 voice
    Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  },

  jazzOrnaments(options: TestOptions): void {
    expect(0);
    const f = VexFlowTests.makeFactory(options, 950, 400);
    const ctx = f.getContext();
    ctx.scale(1, 1);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';

    function newNote(keys, duration, modifier, stemDirection) {
      const dot = duration.indexOf('d') >= 0;
      const rv = new StaveNote({ keys, duration, stem_direction: stemDirection })
        .addModifier(modifier, 0)
        .addAccidental(0, new Accidental('b'));
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

      const stave = new Stave(x, y, width).addClef('treble').setContext(ctx).draw();

      notes.push(newNote(keys, '4d', modifiers[0], stemDirection));
      notes.push(newNote(keys, '8', modifiers[1], stemDirection));
      notes.push(newNote(keys, '4d', modifiers[2], stemDirection));
      notes.push(newNote(keys, '8', modifiers[3], stemDirection));
      if (modifiers.length > 4) {
        notes[3].addModifier(modifiers[4], 0);
      }

      Beam.generateBeams(notes);
      const voice = new Voice({
        num_beats: 4,
        beat_value: 4,
      }).setMode(Voice.Mode.SOFT);
      voice.addTickables(notes);
      const formatter = new Formatter({ softmaxFactor: 2 }).joinVoices([voice]);
      formatter.format([voice], xWidth);
      stave.setContext(ctx).draw();
      voice.draw(ctx, stave);
    }
    let mods = [];
    let curX = xStart;
    let curY = yStart;
    mods.push(new Ornament('scoop'));
    mods.push(new Ornament('doit'));
    mods.push(new Ornament('fall'));
    mods.push(new Ornament('doitLong'));

    draw(mods, ['a/5'], curX, xWidth, curY, -1);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('fallLong'));
    mods.push(new Ornament('bend'));
    mods.push(new Ornament('plungerClosed'));
    mods.push(new Ornament('plungerOpen'));
    mods.push(new Ornament('bend'));
    draw(mods, ['a/5'], curX, xWidth, curY, -1);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('flip'));
    mods.push(new Ornament('jazzTurn'));
    mods.push(new Ornament('smear'));
    mods.push(new Ornament('doit'));
    draw(mods, ['a/5'], curX, xWidth, curY, 1);

    curX = xStart;
    curY += staffHeight;

    mods = [];
    mods.push(new Ornament('scoop'));
    mods.push(new Ornament('doit'));
    mods.push(new Ornament('fall'));
    mods.push(new Ornament('doitLong'));

    draw(mods, ['e/5'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('fallLong'));
    mods.push(new Ornament('bend'));
    mods.push(new Ornament('plungerClosed'));
    mods.push(new Ornament('plungerOpen'));
    mods.push(new Ornament('bend'));
    draw(mods, ['e/5'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('flip'));
    mods.push(new Ornament('jazzTurn'));
    mods.push(new Ornament('smear'));
    mods.push(new Ornament('doit'));
    draw(mods, ['e/5'], curX, xWidth, curY);

    curX = xStart;
    curY += staffHeight;

    mods = [];
    mods.push(new Ornament('scoop'));
    mods.push(new Ornament('doit'));
    mods.push(new Ornament('fall'));
    mods.push(new Ornament('doitLong'));

    draw(mods, ['e/4'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('fallLong'));
    mods.push(new Ornament('bend'));
    mods.push(new Ornament('plungerClosed'));
    mods.push(new Ornament('plungerOpen'));
    mods.push(new Ornament('bend'));
    draw(mods, ['e/4'], curX, xWidth, curY);
    curX += xWidth;

    mods = [];
    mods.push(new Ornament('flip'));
    mods.push(new Ornament('jazzTurn'));
    mods.push(new Ornament('smear'));
    mods.push(new Ornament('doit'));
    draw(mods, ['e/4'], curX, xWidth, curY);
  },
};

export { OrnamentTests };
