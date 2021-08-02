// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceTabNote Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { GraceNoteGroup } from 'gracenotegroup';
import { GraceTabNote } from 'gracetabnote';
import { ContextBuilder } from 'renderer';
import { TabNote, TabNoteStruct } from 'tabnote';
import { TabStave } from 'tabstave';
import { RenderContext } from 'types/common';
import { Voice } from 'voice';

const GraceTabNoteTests = {
  Start(): void {
    QUnit.module('Grace Tab Notes');
    // TODO: Rename tests below. Remove "Grace Tab Note "
    VexFlowTests.runTests('Grace Tab Note Simple', this.simple);
    VexFlowTests.runTests('Grace Tab Note Slurred', this.slurred);
  },

  simple(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = setupContext(options, contextBuilder);

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

    note0.addModifier(new GraceNoteGroup(gracenotes0));
    note1.addModifier(new GraceNoteGroup(gracenotes1));
    note2.addModifier(new GraceNoteGroup(gracenotes2));
    note3.addModifier(new GraceNoteGroup(gracenotes3));

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1, note2, note3]);

    new Formatter().joinVoices([voice]).format([voice], 250);

    voice.draw(c.context, c.stave);

    ok(true, 'Simple Test');
  },

  slurred(options: TestOptions, contextBuilder: ContextBuilder): void {
    const c = setupContext(options, contextBuilder);

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

    note0.addModifier(new GraceNoteGroup(gracenotes0, true));
    note1.addModifier(new GraceNoteGroup(gracenotes1, true));

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1]);

    new Formatter().joinVoices([voice]).format([voice], 200);

    voice.draw(c.context, c.stave);

    ok(true, 'Slurred Test');
  },
};

//#region Helper Functions
function setupContext(opts: TestOptions, ctxBuilder: ContextBuilder): { context: RenderContext; stave: TabStave } {
  const context = ctxBuilder(opts.elementId, 350, 140);
  const stave = new TabStave(10, 10, 350).addTabGlyph().setContext(context).draw();
  return { context, stave };
}

function tabNote(tab_struct: TabNoteStruct) {
  return new TabNote(tab_struct);
}

function graceTabNote(note_prop: TabNoteStruct) {
  return new GraceTabNote(note_prop);
}
//#endregion

export { GraceTabNoteTests };
