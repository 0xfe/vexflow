// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabSlide Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './declarations';
import { ContextBuilder } from 'renderer';
import { Flow } from 'flow';
import { TabSlide } from 'tabslide';
import { Formatter } from 'formatter';

const TabSlideTests = {
  Start(): void {
    const runTests = VexFlowTests.runTests;
    QUnit.module('TabSlide');
    runTests('Simple TabSlide', this.simple);
    runTests('Slide Up', this.slideUp);
    runTests('Slide Down', this.slideDown);
  },

  tieNotes(notes, indices, stave, ctx) {
    const voice = new VF.Voice(Flow.TIME4_4);
    voice.addTickables(notes);

    new Formatter().joinVoices([voice]).format([voice], 100);
    voice.draw(ctx, stave);

    const tie = new TabSlide(
      {
        first_note: notes[0],
        last_note: notes[1],
        first_indices: indices,
        last_indices: indices,
      },
      TabSlide.SLIDE_UP
    );

    tie.setContext(ctx);
    tie.draw();
  },

  setupContext(options, x) {
    const ctx = options.contextBuilder(options.elementId, 350, 140);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    const stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().setContext(ctx).draw();

    return { context: ctx, stave: stave };
  },

  simple(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = TabSlideTests.setupContext(options);
    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }

    TabSlideTests.tieNotes(
      [
        newNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        newNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ],
      [0],
      c.stave,
      c.context
    );
    ok(true, 'Simple Test');
  },

  multiTest(options, factory) {
    const c = TabSlideTests.setupContext(options, 440, 100);
    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
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

    const voice = new VF.Voice(Flow.TIME4_4).addTickables(notes);
    new VF.Formatter().joinVoices([voice]).format([voice], 300);
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

  slideUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabSlideTests.multiTest(options, VF.TabSlide.createSlideUp);
  },

  slideDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabSlideTests.multiTest(options, VF.TabSlide.createSlideDown);
  },
};

export { TabSlideTests };
