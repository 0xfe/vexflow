// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabTie Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok, test, equal } from './declarations';
import { ContextBuilder } from 'renderer';
import { TabTie } from 'tabtie';
import { Voice } from 'voice';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { TabStave } from 'tabstave';
import { TabNote } from 'tabnote';
import { Annotation } from 'annotation';
import { TieNotes } from 'types/common';

const TabTieTests = {
  Start(): void {
    QUnit.module('TabTie');
    test('VF.* API', this.VF_Prefix);
    const run = VexFlowTests.runTests;
    run('Simple TabTie', this.simple);
    run('Hammerons', this.simpleHammeron);
    run('Pulloffs', this.simplePulloff);
    run('Tapping', this.tap);
    run('Continuous', this.continuous);
  },

  VF_Prefix(): void {
    equal(TabTie, VF.TabTie);
  },

  tieNotes(notes: any, indices: any, stave: any, ctx: any, text?: any): void {
    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], 100);
    voice.draw(ctx, stave);

    const tie = new TabTie(
      {
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      },
      text || 'Annotation'
    );

    tie.setContext(ctx);
    tie.draw();
  },

  setupContext(options: TestOptions, x: number, y: number): { context: any; stave: TabStave } {
    const ctx = options.contextBuilder(options.elementId, x || 350, y || 160);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.setFont('Arial', VexFlowTests.Font.size, '');

    const stave = new TabStave(10, 10, x || 350).addTabGlyph().setContext(ctx).draw();

    return { context: ctx, stave: stave };
  },

  drawTie(notes, indices, options, text): void {
    const c = TabTieTests.setupContext(options);
    TabTieTests.tieNotes(notes, indices, c.stave, c.context, text);
  },

  simple(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    function newNote(tab_struct) {
      return new TabNote(tab_struct);
    }

    TabTieTests.drawTie(
      [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ],
      [0],
      options
    );

    ok(true, 'Simple Test');
  },

  tap(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    function newNote(tab_struct) {
      return new TabNote(tab_struct);
    }

    TabTieTests.drawTie(
      [
        newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0),
        newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' }),
      ],
      [0],
      options,
      'P'
    );

    ok(true, 'Tapping Test');
  },

  multiTest(options: TestOptions, factory: (notes: TieNotes) => TabTie): void {
    const c = TabTieTests.setupContext(options, 440, 140);
    function newNote(tab_struct) {
      return new TabNote(tab_struct);
    }

    const notes = [
      newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
      newNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
      newNote({
        positions: [
          { str: 4, fret: 4 },
          { str: 5, fret: 4 },
        ],
        duration: '8',
      }),
      newNote({
        positions: [
          { str: 4, fret: 6 },
          { str: 5, fret: 6 },
        ],
        duration: '8',
      }),
      newNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
      newNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
      newNote({
        positions: [
          { str: 2, fret: 14 },
          { str: 3, fret: 14 },
        ],
        duration: '8',
      }),
      newNote({
        positions: [
          { str: 2, fret: 16 },
          { str: 3, fret: 16 },
        ],
        duration: '8',
      }),
    ];

    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(c.context, c.stave);

    factory({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(c.context)
      .draw();

    ok(true, 'Single note');

    factory({
      first_note: notes[2],
      last_note: notes[3],
      first_indices: [0, 1],
      last_indices: [0, 1],
    })
      .setContext(c.context)
      .draw();

    ok(true, 'Chord');

    factory({
      first_note: notes[4],
      last_note: notes[5],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(c.context)
      .draw();

    ok(true, 'Single note high-fret');

    factory({
      first_note: notes[6],
      last_note: notes[7],
      first_indices: [0, 1],
      last_indices: [0, 1],
    })
      .setContext(c.context)
      .draw();

    ok(true, 'Chord high-fret');
  },

  simpleHammeron(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabTieTests.multiTest(options, TabTie.createHammeron);
  },

  simplePulloff(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabTieTests.multiTest(options, TabTie.createPulloff);
  },

  continuous(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = TabTieTests.setupContext(options, 440, 140);
    function newNote(tab_struct) {
      return new TabNote(tab_struct);
    }

    const notes = [
      newNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
      newNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
      newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
    ];

    const voice = new Voice(Flow.TIME4_4).addTickables(notes);
    new Formatter().joinVoices([voice]).format([voice], 300);
    voice.draw(c.context, c.stave);

    TabTie.createHammeron({
      first_note: notes[0],
      last_note: notes[1],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(c.context)
      .draw();

    TabTie.createPulloff({
      first_note: notes[1],
      last_note: notes[2],
      first_indices: [0],
      last_indices: [0],
    })
      .setContext(c.context)
      .draw();
    ok(true, 'Continuous Hammeron');
  },
};

export { TabTieTests };
