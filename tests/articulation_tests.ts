// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Articulation Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { Articulation } from 'articulation';
import { Beam } from 'beam';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { ContextBuilder } from 'renderer';
import { Stave } from 'stave';
import { Barline, BarlineType } from 'stavebarline';
import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';
import { TabStave } from 'tabstave';
import { Voice } from 'voice';

const ArticulationTests = {
  Start(): void {
    QUnit.module('Articulation');
    const run = VexFlowTests.runTests;
    run('Articulation - Staccato/Staccatissimo', drawArticulations, { sym1: 'a.', sym2: 'av' });
    run('Articulation - Accent/Tenuto', drawArticulations, { sym1: 'a>', sym2: 'a-' });
    run('Articulation - Marcato/L.H. Pizzicato', drawArticulations, { sym1: 'a^', sym2: 'a+' });
    run('Articulation - Snap Pizzicato/Fermata', drawArticulations, { sym1: 'ao', sym2: 'ao' });
    run('Articulation - Up-stroke/Down-Stroke', drawArticulations, { sym1: 'a|', sym2: 'am' });
    run('Articulation - Fermata Above/Below', drawFermata, { sym1: 'a@a', sym2: 'a@u' });
    run('Articulation - Inline/Multiple', drawArticulations2, { sym1: 'a.', sym2: 'a.' });
    run('TabNote Articulation', tabNotes, { sym1: 'a.', sym2: 'a.' });
  },
};

function drawArticulations(options: TestOptions, contextBuilder: ContextBuilder): void {
  const sym1 = options.params.sym1;
  const sym2 = options.params.sym2;

  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 625, 195);

  // bar 1
  const staveBar1 = new Stave(10, 30, 125);
  staveBar1.setContext(ctx).draw();
  const notesBar1 = [
    new StaveNote({ keys: ['a/3'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
  ];
  notesBar1[0].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar1[1].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar1[2].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[3].addArticulation(0, new Articulation(sym1).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 125);
  staveBar2.setEndBarType(Barline.type.DOUBLE);
  staveBar2.setContext(ctx).draw();

  const notesBar2 = [
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar2[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar2[3].addArticulation(0, new Articulation(sym1).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

  // bar 3 - juxtaposing second bar next to first bar
  const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 125);
  staveBar3.setContext(ctx).draw();

  const notesBar3 = [
    new StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
  ];
  notesBar3[0].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar3[1].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar3[2].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar3[3].addArticulation(0, new Articulation(sym2).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
  // bar 4 - juxtaposing second bar next to first bar
  const staveBar4 = new Stave(staveBar3.getWidth() + staveBar3.getX(), staveBar3.getY(), 125);
  staveBar4.setEndBarType(BarlineType.END);
  staveBar4.setContext(ctx).draw();

  const notesBar4 = [
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar4[0].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar4[1].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar4[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar4[3].addArticulation(0, new Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
}

function drawFermata(options: TestOptions, contextBuilder: ContextBuilder): void {
  const sym1 = options.params.sym1;
  const sym2 = options.params.sym2;

  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 400, 200);

  // bar 1
  const staveBar1 = new Stave(50, 30, 150);
  staveBar1.setContext(ctx).draw();
  const notesBar1 = [
    new StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar1[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar1[3].addArticulation(0, new Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 150);
  staveBar2.setEndBarType(Barline.type.DOUBLE);
  staveBar2.setContext(ctx).draw();

  const notesBar2 = [
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: 1 }),
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar2[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar2[3].addArticulation(0, new Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
}

function drawArticulations2(options: TestOptions, contextBuilder: ContextBuilder): void {
  expect(0);

  // Get the rendering context
  const ctx = contextBuilder(options.elementId, 1000, 200);

  // bar 1
  const staveBar1 = new Stave(10, 30, 350);
  staveBar1.setContext(ctx).draw();
  const notesBar1 = [
    new StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['a/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['b/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['c/5'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['b/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['c/6'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['d/6'], duration: '16', stem_direction: -1 }),
  ];
  let i;
  for (i = 0; i < 16; i++) {
    notesBar1[i].addArticulation(0, new Articulation('a.').setPosition(4));
    notesBar1[i].addArticulation(0, new Articulation('a>').setPosition(4));

    if (i === 15) {
      notesBar1[i].addArticulation(0, new Articulation('a@u').setPosition(4));
    }
  }

  const beam1 = new Beam(notesBar1.slice(0, 8));
  const beam2 = new Beam(notesBar1.slice(8, 16));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  // bar 2 - juxtaposing second bar next to first bar
  const staveBar2 = new Stave(staveBar1.getWidth() + staveBar1.getX(), staveBar1.getY(), 350);
  staveBar2.setContext(ctx).draw();
  const notesBar2 = [
    new StaveNote({ keys: ['f/3'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['g/3'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['a/3'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['b/3'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
    new StaveNote({ keys: ['g/4'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['a/4'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['b/4'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
    new StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
  ];
  for (i = 0; i < 16; i++) {
    notesBar2[i].addArticulation(0, new Articulation('a-').setPosition(3));
    notesBar2[i].addArticulation(0, new Articulation('a^').setPosition(3));

    if (i === 15) {
      notesBar2[i].addArticulation(0, new Articulation('a@u').setPosition(4));
    }
  }

  const beam3 = new Beam(notesBar2.slice(0, 8));
  const beam4 = new Beam(notesBar2.slice(8, 16));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);
  beam3.setContext(ctx).draw();
  beam4.setContext(ctx).draw();

  // bar 3 - juxtaposing second bar next to first bar
  const staveBar3 = new Stave(staveBar2.getWidth() + staveBar2.getX(), staveBar2.getY(), 75);
  staveBar3.setContext(ctx).draw();

  const notesBar3 = [new StaveNote({ keys: ['c/4'], duration: 'w', stem_direction: 1 })];
  notesBar3[0].addArticulation(0, new Articulation('a-').setPosition(3));
  notesBar3[0].addArticulation(0, new Articulation('a>').setPosition(3));
  notesBar3[0].addArticulation(0, new Articulation('a@a').setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);
  // bar 4 - juxtaposing second bar next to first bar
  const staveBar4 = new Stave(staveBar3.getWidth() + staveBar3.getX(), staveBar3.getY(), 150);
  staveBar4.setEndBarType(Barline.type.END);
  staveBar4.setContext(ctx).draw();

  const notesBar4 = [
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    new StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  for (i = 0; i < 4; i++) {
    let position1 = 3;
    if (i > 1) {
      position1 = 4;
    }
    notesBar4[i].addArticulation(0, new Articulation('a-').setPosition(position1));
  }

  // Helper function to justify and draw a 4/4 voice
  Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
}

function tabNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 550);
  stave.setContext(ctx);
  stave.draw();

  const specs = [
    {
      positions: [
        { str: 3, fret: 6 },
        { str: 4, fret: 25 },
      ],
      duration: '8',
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
        { str: 3, fret: 5 },
      ],
      duration: '8',
    },
    {
      positions: [
        { str: 1, fret: 6 },
        { str: 3, fret: 5 },
      ],
      duration: '8',
    },
  ];

  const notes1 = specs.map((noteSpec) => {
    const tabNote = new TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    return tabNote;
  });

  const notes2 = specs.map((noteSpec) => {
    const tabNote = new TabNote(noteSpec);
    tabNote.render_options.draw_stem = true;
    tabNote.setStemDirection(-1);
    return tabNote;
  });

  const notes3 = specs.map((noteSpec) => new TabNote(noteSpec));

  notes1[0].addModifier(new Articulation('a>').setPosition(3), 0); // U
  notes1[1].addModifier(new Articulation('a>').setPosition(4), 0); // D
  notes1[2].addModifier(new Articulation('a.').setPosition(3), 0); // U
  notes1[3].addModifier(new Articulation('a.').setPosition(4), 0); // D

  notes2[0].addModifier(new Articulation('a>').setPosition(3), 0);
  notes2[1].addModifier(new Articulation('a>').setPosition(4), 0);
  notes2[2].addModifier(new Articulation('a.').setPosition(3), 0);
  notes2[3].addModifier(new Articulation('a.').setPosition(4), 0);

  notes3[0].addModifier(new Articulation('a>').setPosition(3), 0);
  notes3[1].addModifier(new Articulation('a>').setPosition(4), 0);
  notes3[2].addModifier(new Articulation('a.').setPosition(3), 0);
  notes3[3].addModifier(new Articulation('a.').setPosition(4), 0);

  const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT);

  voice.addTickables(notes1);
  voice.addTickables(notes2);
  voice.addTickables(notes3);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(ctx, stave);

  ok(true, 'TabNotes successfully drawn');
}

export { ArticulationTests };
