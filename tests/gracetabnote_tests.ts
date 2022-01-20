// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceTabNote Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { GraceNoteGroup } from '../src/gracenotegroup';
import { GraceTabNote } from '../src/gracetabnote';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { Voice } from '../src/voice';

const GraceTabNoteTests = {
  Start(): void {
    QUnit.module('Grace Tab Notes');
    // TODO: Rename tests below since it is redundant with the module name.
    // Remove "Grace Tab Note "
    const run = VexFlowTests.runTests;
    run('Grace Tab Note Simple', simple);
    run('Grace Tab Note Slurred', slurred);
  },
};

// Helper functions to create TabNote and GraceTabNote objects.
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);
const graceTabNote = (noteStruct: TabNoteStruct) => new GraceTabNote(noteStruct);

/**
 * Helper function to build a RenderContext and TabStave.
 */
function setupContext(opts: TestOptions, ctxBuilder: ContextBuilder): { context: RenderContext; stave: TabStave } {
  const context = ctxBuilder(opts.elementId, 350, 140);
  const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();
  return { context, stave };
}

function simple(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder);

  const note0 = tabNote({ positions: [{ str: 4, fret: 6 }], duration: '4' });
  const note1 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: '4' });
  const note2 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });
  const note3 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });

  const gracenote_group0 = [{ positions: [{ str: 4, fret: 'x' }], duration: '8' }];

  const gracenote_group1 = [
    { positions: [{ str: 4, fret: 9 }], duration: '16' },
    { positions: [{ str: 4, fret: 10 }], duration: '16' },
  ];

  const gracenote_group2 = [{ positions: [{ str: 4, fret: 9 }], duration: '8' }];
  const gracenote_group3 = [
    { positions: [{ str: 5, fret: 10 }], duration: '8' },
    { positions: [{ str: 4, fret: 9 }], duration: '8' },
  ];

  const gracenotes0 = gracenote_group0.map(graceTabNote);
  const gracenotes1 = gracenote_group1.map(graceTabNote);
  const gracenotes2 = gracenote_group2.map(graceTabNote);
  gracenotes2[0].setGhost(true);
  const gracenotes3 = gracenote_group3.map(graceTabNote);

  note0.addModifier(new GraceNoteGroup(gracenotes0), 0);
  note1.addModifier(new GraceNoteGroup(gracenotes1), 0);
  note2.addModifier(new GraceNoteGroup(gracenotes2), 0);
  note3.addModifier(new GraceNoteGroup(gracenotes3), 0);

  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables([note0, note1, note2, note3]);

  new Formatter().joinVoices([voice]).format([voice], 250);

  voice.draw(context, stave);

  ok(true, 'Simple Test');
}

function slurred(options: TestOptions, contextBuilder: ContextBuilder): void {
  const { context, stave } = setupContext(options, contextBuilder);

  const note0 = tabNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' });
  const note1 = tabNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });

  const gracenote_group0 = [
    { positions: [{ str: 4, fret: 9 }], duration: '8' },
    { positions: [{ str: 4, fret: 10 }], duration: '8' },
  ];

  const gracenote_group1 = [
    { positions: [{ str: 4, fret: 7 }], duration: '16' },
    { positions: [{ str: 4, fret: 8 }], duration: '16' },
    { positions: [{ str: 4, fret: 9 }], duration: '16' },
  ];

  const gracenotes0 = gracenote_group0.map(graceTabNote);
  const gracenotes1 = gracenote_group1.map(graceTabNote);

  note0.addModifier(new GraceNoteGroup(gracenotes0, true), 0);
  note1.addModifier(new GraceNoteGroup(gracenotes1, true), 0);

  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables([note0, note1]);

  new Formatter().joinVoices([voice]).format([voice], 200);

  voice.draw(context, stave);

  ok(true, 'Slurred Test');
}

VexFlowTests.register(GraceTabNoteTests);
export { GraceTabNoteTests };
