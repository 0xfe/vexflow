// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Bend Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './declarations';
import { ContextBuilder } from 'renderer';
import { Bend } from 'bend';

const BendTests = {
  Start(): void {
    QUnit.module('Bend');
    VexFlowTests.runTests('Double Bends', this.doubleBends);
    VexFlowTests.runTests('Reverse Bends', this.reverseBends);
    VexFlowTests.runTests('Bend Phrase', this.bendPhrase);
    VexFlowTests.runTests('Double Bends With Release', this.doubleBendsWithRelease);
    VexFlowTests.runTests('Whako Bend', this.whackoBends);
  },

  doubleBends(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 240);
    ctx.scale(1.5, 1.5);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setRawFont(' 10pt Arial');
    const stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }
    function newBend(text) {
      return new Bend(text);
    }

    const notes = [
      newNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(newBend('Full'), 0)
        .addModifier(newBend('1/2'), 1),

      newNote({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(newBend('1/4'), 0)
        .addModifier(newBend('1/4'), 1),

      newNote({
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
    const stave = new VF.TabStave(10, 10, 550).addTabGlyph().setContext(ctx).draw();

    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }
    function newBend(text, release) {
      return new Bend(text, release);
    }

    const notes = [
      newNote({
        positions: [
          { str: 1, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(newBend('1/2', true), 0)
        .addModifier(newBend('Full', true), 1),

      newNote({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
          { str: 4, fret: 5 },
        ],
        duration: 'q',
      })
        .addModifier(newBend('1/4', true), 0)
        .addModifier(newBend('Monstrous', true), 1)
        .addModifier(newBend('1/4', true), 2),

      newNote({
        positions: [{ str: 4, fret: 7 }],
        duration: 'q',
      }),
      newNote({
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
    const stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }
    function newBend(text) {
      return new Bend(text);
    }

    const notes = [
      newNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'w',
      })
        .addModifier(newBend('Full'), 1)
        .addModifier(newBend('1/2'), 0),

      newNote({
        positions: [
          { str: 2, fret: 5 },
          { str: 3, fret: 5 },
        ],
        duration: 'w',
      })
        .addModifier(newBend('1/4'), 1)
        .addModifier(newBend('1/4'), 0),

      newNote({
        positions: [{ str: 4, fret: 7 }],
        duration: 'w',
      }),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      const tickContext = new VF.TickContext();
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
    const stave = new VF.TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }
    function newBend(phrase) {
      return new Bend(null, null, phrase);
    }

    const phrase1 = [
      { type: Bend.UP, text: 'Full' },
      { type: Bend.DOWN, text: 'Monstrous' },
      { type: Bend.UP, text: '1/2' },
      { type: Bend.DOWN, text: '' },
    ];
    const bend1 = newBend(phrase1).setContext(ctx);

    const notes = [
      newNote({
        positions: [{ str: 2, fret: 10 }],
        duration: 'w',
      }).addModifier(bend1, 0),
    ];

    for (let i = 0; i < notes.length; ++i) {
      const note = notes[i];
      const mc = new VF.ModifierContext();
      note.addToModifierContext(mc);

      const tickContext = new VF.TickContext();
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
    const stave = new VF.TabStave(10, 10, 350).addTabGlyph().setContext(ctx).draw();

    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }
    function newBend(phrase) {
      return new Bend(null, null, phrase);
    }

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
      newNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 3, fret: 9 },
        ],
        duration: 'q',
      })
        .addModifier(newBend(phrase1), 0)
        .addModifier(newBend(phrase2), 1),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
    VexFlowTests.plotNoteWidth(ctx, notes[0], 140);
    ok(true, 'Whako Release');
  },
};
export { BendTests };
