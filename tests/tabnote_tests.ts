// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabNote Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Dot } from '../src/dot';
import { Flow } from '../src/flow';
import { Font, FontWeight } from '../src/font';
import { Formatter } from '../src/formatter';
import { RenderContext } from '../src/rendercontext';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TickContext } from '../src/tickcontext';
import { Voice, VoiceMode } from '../src/voice';

const TabNoteTests = {
  Start(): void {
    QUnit.module('TabNote');

    QUnit.test('Tick', ticks);
    QUnit.test('TabStave Line', tabStaveLine);
    QUnit.test('Width', width);
    QUnit.test('TickContext', tickContext);

    const run = VexFlowTests.runTests;
    run('TabNote Draw', draw);
    run('TabNote Stems Up', drawStemsUp);
    run('TabNote Stems Down', drawStemsDown);
    run('TabNote Stems Up Through Stave', drawStemsUpThrough);
    run('TabNote Stems Down Through Stave', drawStemsDownThrough);
    run('TabNote Stems with Dots', drawStemsDotted);
  },
};

function ticks(assert: Assert): void {
  const BEAT = (1 * Flow.RESOLUTION) / 4;

  let note = new TabNote({ positions: [{ str: 6, fret: 6 }], duration: '1' });
  assert.equal(note.getTicks().value(), BEAT * 4, 'Whole note has 4 beats');

  note = new TabNote({ positions: [{ str: 3, fret: 4 }], duration: '4' });
  assert.equal(note.getTicks().value(), BEAT, 'Quarter note has 1 beat');
}

function tabStaveLine(assert: Assert): void {
  const note = new TabNote({
    positions: [
      { str: 6, fret: 6 },
      { str: 4, fret: 5 },
    ],
    duration: '1',
  });

  const positions = note.getPositions();
  assert.equal(positions[0].str, 6, 'String 6, Fret 6');
  assert.equal(positions[0].fret, 6, 'String 6, Fret 6');
  assert.equal(positions[1].str, 4, 'String 4, Fret 5');
  assert.equal(positions[1].fret, 5, 'String 4, Fret 5');

  const stave = new Stave(10, 10, 300);
  note.setStave(stave);

  const ys = note.getYs();
  assert.equal(ys.length, 2, 'Chord should be rendered on two lines');
  assert.equal(ys[0], 100, 'Line for String 6, Fret 6');
  assert.equal(ys[1], 80, 'Line for String 4, Fret 5');
}

function width(assert: Assert): void {
  assert.expect(1);
  const note = new TabNote({
    positions: [
      { str: 6, fret: 6 },
      { str: 4, fret: 5 },
    ],
    duration: '1',
  });

  assert.throws(() => note.getWidth(), /UnformattedNote/, 'Unformatted note should have no width');
}

function tickContext(assert: Assert): void {
  const note = new TabNote({
    positions: [
      { str: 6, fret: 6 },
      { str: 4, fret: 5 },
    ],
    duration: '1',
  });

  const tickContext = new TickContext().addTickable(note).preFormat().setX(10).setPadding(0);

  assert.equal(tickContext.getWidth(), 7);
}

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 140);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  const notes = [
    { positions: [{ str: 6, fret: 6 }], duration: '4' },
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 'x' },
        { str: 5, fret: 15 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 'x' },
        { str: 5, fret: 5 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 6, fret: 0 },
        { str: 5, fret: 5 },
        { str: 4, fret: 5 },
        { str: 3, fret: 4 },
        { str: 2, fret: 3 },
        { str: 1, fret: 0 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '4',
    },
  ];

  // Helper function
  function showNote(noteStruct: TabNoteStruct, stave: TabStave, ctx: RenderContext, x: number): TabNote {
    const tabNote = new TabNote(noteStruct);
    const tickContext = new TickContext();
    tickContext.addTickable(tabNote).preFormat().setX(x);
    tabNote.setContext(ctx).setStave(stave);
    tabNote.draw();
    return tabNote;
  }

  for (let i = 0; i < notes.length; ++i) {
    const note = notes[i];
    const tabNote = showNote(note, stave, ctx, (i + 1) * 25);

    options.assert.ok(tabNote.getX() > 0, 'Note ' + i + ' has X value');
    options.assert.ok(tabNote.getYs().length > 0, 'Note ' + i + ' has Y values');
  }
}

function drawStemsUp(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 30, 550);
  stave.setContext(ctx);
  stave.draw();

  const specs: TabNoteStruct[] = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '16',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '32',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '64',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '128',
    },
  ];

  const notes = specs.map((struct) => {
    const tabNote = new TabNote(struct);
    tabNote.render_options.draw_stem = true;
    return tabNote;
  });

  const voice = new Voice(Flow.TIME4_4).setMode(VoiceMode.SOFT);
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);
  options.assert.ok(true, 'TabNotes successfully drawn');
}

function drawStemsDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  const specs: TabNoteStruct[] = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '16',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '32',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '64',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '128',
    },
  ];

  const notes = specs.map((struct) => {
    const tabNote = new TabNote(struct);
    tabNote.render_options.draw_stem = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  const voice = new Voice(Flow.TIME4_4).setMode(VoiceMode.SOFT);
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);
  options.assert.ok(true, 'All objects have been drawn');
}

function drawStemsUpThrough(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 30, 550);
  stave.setContext(ctx);
  stave.draw();

  const specs: TabNoteStruct[] = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '16',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '32',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '64',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '128',
    },
  ];

  const notes = specs.map((struct) => {
    const tabNote = new TabNote(struct);
    tabNote.render_options.draw_stem = true;
    tabNote.render_options.draw_stem_through_stave = true;
    return tabNote;
  });

  ctx.setFont(Font.SANS_SERIF, 10, FontWeight.BOLD);
  const voice = new Voice(Flow.TIME4_4).setMode(VoiceMode.SOFT);
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);
  options.assert.ok(true, 'TabNotes successfully drawn');
}

function drawStemsDownThrough(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 250);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 550, { num_lines: 8 });
  stave.setContext(ctx);
  stave.draw();

  const specs: TabNoteStruct[] = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '16',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
        { str: 6, fret: 10 },
      ],
      duration: '32',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '64',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 3, fret: 5 },
        { str: 5, fret: 5 },
        { str: 7, fret: 5 },
      ],
      duration: '128',
    },
  ];

  const notes = specs.map((struct) => {
    const tabNote = new TabNote(struct);
    tabNote.render_options.draw_stem = true;
    tabNote.render_options.draw_stem_through_stave = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  ctx.setFont('Arial', 10, 'bold');

  const voice = new Voice(Flow.TIME4_4).setMode(VoiceMode.SOFT);
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);
  options.assert.ok(true, 'All objects have been drawn');
}

function drawStemsDotted(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  const specs: TabNoteStruct[] = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '4d',
    },
    {
      positions: [
        { str: 2, fret: 10 },
        { str: 5, fret: 12 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '4dd',
      stem_direction: -1,
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 4, fret: 5 },
      ],
      duration: '16',
      stem_direction: -1,
    },
  ];

  const notes = specs.map((struct) => new TabNote(struct, true /* draw_stem */));

  Dot.buildAndAttach([notes[0], notes[2], notes[2]]);

  const voice = new Voice(Flow.TIME4_4).setMode(VoiceMode.SOFT);
  voice.addTickables(notes);
  new Formatter().joinVoices([voice]).formatToStave([voice], stave);
  voice.draw(ctx, stave);
  options.assert.ok(true, 'TabNotes successfully drawn');
}

VexFlowTests.register(TabNoteTests);
export { TabNoteTests };
