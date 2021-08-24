// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Bend Tests

/* eslint-disable */
// @ts-nocheck

// TODO: ctx.setFont()'s 3rd argument "weight" should be optional, and default to ''.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Bend, BendPhrase } from 'bend';
import { Formatter } from 'formatter';
import { ModifierContext } from 'modifiercontext';
import { TabNote, TabNoteStruct } from 'tabnote';
import { TabStave } from 'tabstave';
import { TickContext } from 'tickcontext';

const BendTests = {
  Start(): void {
    QUnit.module('Bend');
    const run = VexFlowTests.runTests;
    run('Double Bends', this.doubleBends);
    run('Reverse Bends', this.reverseBends);
    run('Bend Phrase', this.bendPhrase);
    run('Double Bends With Release', this.doubleBendsWithRelease);
    run('Whako Bend', this.whackoBends);
  },

  doubleBends(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setRawFont(' 10pt Arial');
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bend('Full'), 0)
        .addModifier(bend('1/2'), 1),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(bend('1/4'), 0)
        .addModifier(bend('1/4'), 1),

      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'h',
      }),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach(function (note) {
      VexFlowTests.plotNoteWidth(ctx, note, 140);
    });

    ok(true, 'Double Bends');
  },

  doubleBendsWithRelease(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 550, 240);
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, 550).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 1, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bend('1/2', true), 0)
        .addModifier(bend('Full', true), 1),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
          { str: 4, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(bend('1/4', true), 0)
        .addModifier(bend('Monstrous', true), 1)
        .addModifier(bend('1/4', true), 2),

      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'q',
      }),
      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'q',
      }),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    notes.forEach(function (note) {
      VexFlowTests.plotNoteWidth(ctx, note, 140);
    });
    ok(true, 'Bend Release');
  },

  reverseBends(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 240);

    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setRawFont('10pt Arial');
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'w',
      })
        .addModifier(bend('Full'), 1)
        .addModifier(bend('1/2'), 0),

      note({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'w',
      })
        .addModifier(bend('1/4'), 1)
        .addModifier(bend('1/4'), 0),

      note({
        positions: [{ str: 4, fret: 7 }],
        duration: 'w',
      }),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const mc = new ModifierContext();
      note.addToModifierContext(mc);

      const tickContext = new TickContext();
      tickContext
        .addTickable(note)
        .preFormat()
        .setX(75 * i);

      note.setStave(stave).setContext(ctx).draw();
      VexFlowTests.plotNoteWidth(ctx, note, 140);
      ok(true, 'Bend ' + i);
    }
  },

  bendPhrase(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setRawFont(' 10pt Arial');
    const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    const phrase1 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.DOWN, text: 'Monstrous' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];
    const bend1 = bendWithPhrase(phrase1).setContext(ctx);

    const notes = [
      note({
        positions: [{ str: 2, fret: 10 }],
        duration: 'w',
      }).addModifier(bend1, 0),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const mc = new ModifierContext();
      note.addToModifierContext(mc);

      const tickContext = new TickContext();
      tickContext
        .addTickable(note)
        .preFormat()
        .setX(75 * i);

      note.setStave(stave).setContext(ctx).draw();
      VexFlowTests.plotNoteWidth(ctx, note, 140);
      ok(true, 'Bend ' + i);
    }
  },

  whackoBends(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 400, 240);
    ctx.scale(1.0, 1.0);
    ctx.setBackgroundFillStyle('#FFF');
    ctx.setFont('Arial', VexFlowTests.Font.size);
    const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();

    const phrase1 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.DOWN, text: '' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];

    const phrase2 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.UP, text: 'Full' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
      { type: Bend.DOWN, text: 'Full' },
      { type: Bend.DOWN, text: 'Full' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];

    const notes = [
      note({
        positions: [
          { str: 2, fret: 10 },
          { str: 3, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(bendWithPhrase(phrase1), 0)
        .addModifier(bendWithPhrase(phrase2), 1),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    VexFlowTests.plotNoteWidth(ctx, notes[0], 140);
    ok(true, 'Whako Release');
  },
};

//#region Helper Functions
function note(tab_struct: TabNoteStruct) {
  return new TabNote(tab_struct);
}
function bend(text: string, release = false) {
  return new Bend(text, release);
}
function bendWithPhrase(phrase: BendPhrase[]) {
  return new Bend('', false, phrase);
}
//#endregion

export { BendTests };
