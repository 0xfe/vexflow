// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabTie Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Annotation } from 'annotation';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { TabNote, TabNoteStruct } from 'tabnote';
import { TabStave } from 'tabstave';
import { TabTie } from 'tabtie';
import { RenderContext, TieNotes } from 'types/common';
import { Voice } from 'voice';
import { Stave } from 'stave';
import { Note } from 'note';

const TabTieTests = {
  Start(): void {
    QUnit.module('TabTie');
    const run = VexFlowTests.runTests;
    run('Simple TabTie', this.simple);
    run('Hammerons', this.simpleHammerOn);
    run('Pulloffs', this.simplePullOff);
    run('Tapping', this.tap);
    run('Continuous', this.continuous);
  },

  simple(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;

    drawTie(
      [
        tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' }),
        tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
      ],
      [0],
      options
    );

    ok(true, 'Simple Test');
  },

  simpleHammerOn(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    multiTest(options, TabTie.createHammeron);
  },

  simplePullOff(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    multiTest(options, TabTie.createPulloff);
  },

  tap(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;

    drawTie(
      [
        tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0),
        tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' }),
      ],
      [0],
      options,
      'P'
    );

    ok(true, 'Tapping Test');
  },

  continuous(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = setupContext(options, 440, 140);

    const notes = [
      tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
      tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
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

//#region Helper Functions

function setupContext(options: TestOptions, w: number = 0, h: number = 0): { context: RenderContext; stave: TabStave } {
  // eslint-disable-next-line
  const context = options.contextBuilder!(options.elementId, w || 350, h || 160);
  context.fillStyle = '#221';
  context.strokeStyle = '#221';
  context.setFont('Arial', VexFlowTests.Font.size, '');

  const stave = new TabStave(10, 10, w || 350).addTabGlyph().setContext(context).draw();

  return { context, stave };
}

function drawTie(notes: TabNote[], indices: number[], options: TestOptions, text?: string): void {
  const c = setupContext(options);
  tieNotes(notes, indices, c.stave, c.context, text);
}

function tieNotes(notes: Note[], indices: number[], stave: Stave, ctx: RenderContext, text?: string): void {
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
}

function tabNote(tab_struct: TabNoteStruct) {
  return new TabNote(tab_struct);
}

function multiTest(options: TestOptions, createTabTie: (notes: TieNotes) => TabTie): void {
  const c = setupContext(options, 440, 140);

  const notes = [
    tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
    tabNote({ positions: [{ str: 4, fret: 4 }], duration: '8' }),
    tabNote({
      positions: [
        { str: 4, fret: 4 },
        { str: 5, fret: 4 },
      ],
      duration: '8',
    }),
    tabNote({
      positions: [
        { str: 4, fret: 6 },
        { str: 5, fret: 6 },
      ],
      duration: '8',
    }),
    tabNote({ positions: [{ str: 2, fret: 14 }], duration: '8' }),
    tabNote({ positions: [{ str: 2, fret: 16 }], duration: '8' }),
    tabNote({
      positions: [
        { str: 2, fret: 14 },
        { str: 3, fret: 14 },
      ],
      duration: '8',
    }),
    tabNote({
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

  createTabTie({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(c.context)
    .draw();

  ok(true, 'Single note');

  createTabTie({
    first_note: notes[2],
    last_note: notes[3],
    first_indices: [0, 1],
    last_indices: [0, 1],
  })
    .setContext(c.context)
    .draw();

  ok(true, 'Chord');

  createTabTie({
    first_note: notes[4],
    last_note: notes[5],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(c.context)
    .draw();

  ok(true, 'Single note high-fret');

  createTabTie({
    first_note: notes[6],
    last_note: notes[7],
    first_indices: [0, 1],
    last_indices: [0, 1],
  })
    .setContext(c.context)
    .draw();

  ok(true, 'Chord high-fret');
}

//#endregion

export { TabTieTests };
