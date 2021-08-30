// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabSlide Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Flow } from 'flow';
import { TabSlide } from 'tabslide';
import { Formatter } from 'formatter';
import { TabNote } from 'tabnote';
import { Voice } from 'voice';
import { TabStave } from 'tabstave';

const TabSlideTests = {
  Start(): void {
    QUnit.module('TabSlide');
    test('VF.* API', this.VF_Prefix);

    const run = VexFlowTests.runTests;
    run('Simple TabSlide', this.simple);
    run('Slide Up', this.slideUp);
    run('Slide Down', this.slideDown);
  },

  VF_Prefix(): void {
    equal(TabSlide, VF.TabSlide);
    equal(TabNote, VF.TabNote);
    equal(Voice, VF.Voice);
    equal(TabStave, VF.TabStave);
  },

  tieNotes(notes, indices, stave, ctx): void {
    const voice = new Voice(Flow.TIME4_4);
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

  setupContext(options: TestOptions, width?: number): any {
    const ctx = options.contextBuilder(options.elementId, 350, 140);
    ctx.scale(0.9, 0.9);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = '10pt Arial';
    const stave = new TabStave(10, 10, width || 350).addTabGlyph().setContext(ctx).draw();

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

  multiTest(options: TestOptions, factory): void {
    const c = TabSlideTests.setupContext(options, 440);
    const newNote = (tab_struct: any) => new TabNote(tab_struct);

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

  slideUp(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabSlideTests.multiTest(options, TabSlide.createSlideUp);
  },

  slideDown(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    TabSlideTests.multiTest(options, TabSlide.createSlideDown);
  },
};

export { TabSlideTests };
