// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// GraceTabNote Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { QUnit, ok } from './declarations';
import { ContextBuilder } from 'renderer';
import { Flow } from 'flow';
import { GraceNoteGroup } from 'gracenotegroup';

const GraceTabNoteTests = {
  Start(): void {
    QUnit.module('Grace Tab Notes');
    VexFlowTests.runTests('Grace Tab Note Simple', this.simple);
    VexFlowTests.runTests('Grace Tab Note Slurred', this.slurred);
  },

  setupContext(options, x): void {
    const ctx = options.contextBuilder(options.elementId, 350, 140);
    const stave = new VF.TabStave(10, 10, x || 350).addTabGlyph().setContext(ctx).draw();

    return { context: ctx, stave: stave };
  },

  simple(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = GraceTabNoteTests.setupContext(options);
    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }

    const note0 = newNote({ positions: [{ str: 4, fret: 6 }], duration: '4' });
    const note1 = newNote({ positions: [{ str: 4, fret: 12 }], duration: '4' });
    const note2 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });
    const note3 = newNote({ positions: [{ str: 4, fret: 10 }], duration: '4' });

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

    function createNote(note_prop) {
      return new VF.GraceTabNote(note_prop);
    }

    const gracenotes0 = gracenote_group0.map(createNote);
    const gracenotes1 = gracenote_group1.map(createNote);
    const gracenotes2 = gracenote_group2.map(createNote);
    gracenotes2[0].setGhost(true);
    const gracenotes3 = gracenote_group3.map(createNote);

    note0.addModifier(new VF.GraceNoteGroup(gracenotes0));
    note1.addModifier(new VF.GraceNoteGroup(gracenotes1));
    note2.addModifier(new VF.GraceNoteGroup(gracenotes2));
    note3.addModifier(new GraceNoteGroup(gracenotes3));

    const voice = new VF.Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1, note2, note3]);

    new VF.Formatter().joinVoices([voice]).format([voice], 250);

    voice.draw(c.context, c.stave);

    ok(true, 'Simple Test');
  },

  slurred(options: TestOptions, contextBuilder: ContextBuilder): void {
    options.contextBuilder = contextBuilder;
    const c = GraceTabNoteTests.setupContext(options);
    function newNote(tab_struct) {
      return new VF.TabNote(tab_struct);
    }

    const note0 = newNote({ positions: [{ str: 4, fret: 12 }], duration: 'h' });
    const note1 = newNote({ positions: [{ str: 4, fret: 10 }], duration: 'h' });

    const gracenote_group0 = [
      { positions: [{ str: 4, fret: 9 }], duration: '8' },
      { positions: [{ str: 4, fret: 10 }], duration: '8' },
    ];

    const gracenote_group1 = [
      { positions: [{ str: 4, fret: 7 }], duration: '16' },
      { positions: [{ str: 4, fret: 8 }], duration: '16' },
      { positions: [{ str: 4, fret: 9 }], duration: '16' },
    ];

    function createNote(note_prop) {
      return new VF.GraceTabNote(note_prop);
    }

    const gracenotes0 = gracenote_group0.map(createNote);
    const gracenotes1 = gracenote_group1.map(createNote);

    note0.addModifier(new VF.GraceNoteGroup(gracenotes0, true));
    note1.addModifier(new VF.GraceNoteGroup(gracenotes1, true));

    const voice = new VF.Voice(Flow.TIME4_4);
    voice.addTickables([note0, note1]);

    new VF.Formatter().joinVoices([voice]).format([voice], 200);

    voice.draw(c.context, c.stave);

    ok(true, 'Slurred Test');
  },
};

export { GraceTabNoteTests };
