// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabTie Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Annotation } from '../src/annotation';
import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { Note } from '../src/note';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { TieNotes } from '../src/stavetie';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TabTie } from '../src/tabtie';
import { Voice } from '../src/voice';

const TabTieTests = {
  Start(): void {
    QUnit.module('TabTie');
    const run = VexFlowTests.runTests;
    run('Simple TabTie', simple);
    run('Hammerons', simpleHammerOn);
    run('Pulloffs', simplePullOff);
    run('Tapping', tap);
    run('Continuous', continuous);
  },
};

/**
 * Helper function to create TabNote objects.
 */
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

/**
 * Helper function to create a RenderContext and TabStave.
 */
function setupContext(options: TestOptions, w: number = 0, h: number = 0): { context: RenderContext; stave: TabStave } {
  // eslint-disable-next-line
  const context = options.contextBuilder!(options.elementId, w || 350, h || 160);

  context.setFont('Arial', VexFlowTests.Font.size);

  const stave = new TabStave(10, 10, w || 350).addTabGlyph().setContext(context).draw();

  return { context, stave };
}

/**
 * Helper function to create the TabTie between two Note objects.
 */
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
    text ?? 'Annotation'
  );

  tie.setContext(ctx);
  tie.draw();
}

/**
 * Two notes on string 4 with a tie drawn between them.
 */
function simple(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  const { context, stave } = setupContext(options);

  const note1 = tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'h' });
  const note2 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' });
  tieNotes([note1, note2], [0], stave, context);

  ok(true, 'Simple Test');
}

function simpleHammerOn(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  multiTest(options, TabTie.createHammeron);
}

function simplePullOff(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  multiTest(options, TabTie.createPulloff);
}

/**
 * Helper function for the two test cases above (simpleHammerOn and simplePullOff).
 */
function multiTest(options: TestOptions, createTabTie: (notes: TieNotes) => TabTie): void {
  const { context, stave } = setupContext(options, 440, 140);

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
  voice.draw(context, stave);

  createTabTie({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(context)
    .draw();

  ok(true, 'Single note');

  createTabTie({
    first_note: notes[2],
    last_note: notes[3],
    first_indices: [0, 1],
    last_indices: [0, 1],
  })
    .setContext(context)
    .draw();

  ok(true, 'Chord');

  createTabTie({
    first_note: notes[4],
    last_note: notes[5],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(context)
    .draw();

  ok(true, 'Single note high-fret');

  createTabTie({
    first_note: notes[6],
    last_note: notes[7],
    first_indices: [0, 1],
    last_indices: [0, 1],
  })
    .setContext(context)
    .draw();

  ok(true, 'Chord high-fret');
}

function tap(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  const { context, stave } = setupContext(options);

  const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' }).addModifier(new Annotation('T'), 0);
  const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });
  tieNotes([note1, note2], [0], stave, context, 'P');

  ok(true, 'Tapping Test');
}

function continuous(options: TestOptions, contextBuilder: ContextBuilder): void {
  options.contextBuilder = contextBuilder;
  const { context, stave } = setupContext(options, 440, 140);

  const notes = [
    tabNote({ positions: [{ str: 4, fret: 4 }], duration: 'q' }),
    tabNote({ positions: [{ str: 4, fret: 5 }], duration: 'q' }),
    tabNote({ positions: [{ str: 4, fret: 6 }], duration: 'h' }),
  ];

  const voice = new Voice(Flow.TIME4_4).addTickables(notes);
  new Formatter().joinVoices([voice]).format([voice], 300);
  voice.draw(context, stave);

  TabTie.createHammeron({
    first_note: notes[0],
    last_note: notes[1],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(context)
    .draw();

  TabTie.createPulloff({
    first_note: notes[1],
    last_note: notes[2],
    first_indices: [0],
    last_indices: [0],
  })
    .setContext(context)
    .draw();
  ok(true, 'Continuous Hammeron');
}

VexFlowTests.register(TabTieTests);
export { TabTieTests };
