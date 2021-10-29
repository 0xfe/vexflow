// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Articulation Tests

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

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

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
// Helper function for creating StaveNotes.
function drawArticulations(options: TestOptions): void {
  const sym1 = options.params.sym1;
  const sym2 = options.params.sym2;
  const width = 125 - Stave.defaultPadding;
  const f = VexFlowTests.makeFactory(options, 675, 195);
  const ctx = f.getContext();
  expect(0);
  let x = 10;
  const y = 30;
  const score = f.EasyScore();
  const formatAndDrawToWidth = (x: number, y: number, width: number, notes: StaveNote[], barline: number) => {
    const voices = [score.voice(notes, { time: '4/4' })];
    const formatter = f.Formatter();
    voices.forEach((v) => formatter.joinVoices([v]));
    const nwidth = Math.max(formatter.preCalculateMinTotalWidth(voices), width);
    formatter.format(voices, nwidth);
    const stave = f
      .Stave({ x, y, width: nwidth + Stave.defaultPadding })
      .setEndBarType(barline)
      .setContext(ctx)
      .draw();
    voices.forEach((voice) => voice.draw(ctx, stave));
    return stave.getWidth();
  };

  // bar 1
  const notesBar1 = [
    f.StaveNote({ keys: ['a/3'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
  ];
  notesBar1[0].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar1[1].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar1[2].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[3].addArticulation(0, new Articulation(sym1).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  x += formatAndDrawToWidth(x, y, width, notesBar1, Barline.type.NONE);

  // bar 2 - juxtaposing second bar next to first bar
  const notesBar2 = [
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar2[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Articulation(sym1).setPosition(4));
  notesBar2[3].addArticulation(0, new Articulation(sym1).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  x += formatAndDrawToWidth(x, y, width, notesBar2, Barline.type.DOUBLE);

  // bar 3 - juxtaposing second bar next to first bar
  const notesBar3 = [
    f.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
  ];
  notesBar3[0].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar3[1].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar3[2].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar3[3].addArticulation(0, new Articulation(sym2).setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  x += formatAndDrawToWidth(x, y, width, notesBar3, Barline.type.NONE);
  // bar 4 - juxtaposing second bar next to first bar
  const notesBar4 = [
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar4[0].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar4[1].addArticulation(0, new Articulation(sym2).setPosition(3));
  notesBar4[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar4[3].addArticulation(0, new Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  formatAndDrawToWidth(x, y, width, notesBar4, Barline.type.END);
}

function drawFermata(options: TestOptions): void {
  const sym1 = options.params.sym1;
  const sym2 = options.params.sym2;
  const f = VexFlowTests.makeFactory(options, 400, 195);
  const ctx = f.getContext();
  const score = f.EasyScore();
  const width = 150 - Stave.defaultPadding;
  let x = 50;
  const y = 30;

  const formatAndDrawToWidth = (x: number, y: number, width: number, notes: StaveNote[], barline: number) => {
    const voices = [score.voice(notes, { time: '4/4' })];
    const formatter = f.Formatter();
    voices.forEach((v) => formatter.joinVoices([v]));
    const nwidth = Math.max(formatter.preCalculateMinTotalWidth(voices), width);
    formatter.format(voices, nwidth);
    const stave = f
      .Stave({ x, y, width: nwidth + Stave.defaultPadding })
      .setEndBarType(barline)
      .setContext(ctx)
      .draw();
    voices.forEach((voice) => voice.draw(ctx, stave));
    return stave.getWidth();
  };

  expect(0);

  const notesBar1 = [
    f.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/4'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar1[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar1[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar1[3].addArticulation(0, new Articulation(sym2).setPosition(4));
  x += formatAndDrawToWidth(x, y, width, notesBar1, Barline.type.NONE);

  // bar 2 - juxtaposing second bar next to first bar
  const notesBar2 = [
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  notesBar2[0].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[1].addArticulation(0, new Articulation(sym1).setPosition(3));
  notesBar2[2].addArticulation(0, new Articulation(sym2).setPosition(4));
  notesBar2[3].addArticulation(0, new Articulation(sym2).setPosition(4));

  // Helper function to justify and draw a 4/4 voice
  formatAndDrawToWidth(x, y, width, notesBar2, Barline.type.DOUBLE);
}

function drawArticulations2(options: TestOptions): void {
  expect(0);
  const scale = 0.8;
  let x = 10;
  const y = 30;
  const width = 350 - Stave.defaultPadding;
  const f = VexFlowTests.makeFactory(options, 1000, 195);
  const ctx = f.getContext();
  ctx.scale(scale, scale);
  const score = f.EasyScore();

  const formatAndDrawToWidth = (
    x: number,
    y: number,
    width: number,
    notes: StaveNote[],
    barline: number,
    beams: Beam[]
  ) => {
    const voices = [score.voice(notes, { time: '4/4' })];
    const formatter = f.Formatter();
    voices.forEach((v) => formatter.joinVoices([v]));
    const nwidth = Math.max(formatter.preCalculateMinTotalWidth(voices), width);
    formatter.format(voices, nwidth);
    const stave = f
      .Stave({ x: x, y: y, width: nwidth + Stave.defaultPadding })
      .setEndBarType(barline)
      .setContext(ctx)
      .draw();
    voices.forEach((voice) => voice.draw(ctx, stave));
    beams.forEach((beam) => beam.setContext(ctx).draw());
    return stave.getWidth();
  };

  // Get the rendering context

  // bar 1
  const notesBar1 = [
    f.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['b/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/6'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/6'], duration: '16', stem_direction: -1 }),
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
  x += formatAndDrawToWidth(x, y, width, notesBar1, Barline.type.NONE, [beam1, beam2]);

  // Helper function to justify and draw a 4/4 voice
  beam1.setContext(ctx).draw();
  beam2.setContext(ctx).draw();

  // bar 2 - juxtaposing second bar next to first bar
  const notesBar2 = [
    f.StaveNote({ keys: ['f/3'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['g/3'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['a/3'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['b/3'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['c/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['d/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['e/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['f/4'], duration: '16', stem_direction: 1 }),
    f.StaveNote({ keys: ['g/4'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/4'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['b/4'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['d/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['e/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['f/5'], duration: '16', stem_direction: -1 }),
    f.StaveNote({ keys: ['g/5'], duration: '16', stem_direction: -1 }),
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
  x += formatAndDrawToWidth(x, y, width, notesBar2, Barline.type.NONE, [beam3, beam4]);

  // bar 3 - juxtaposing second bar next to first bar
  const notesBar3 = [f.StaveNote({ keys: ['c/4'], duration: 'w', stem_direction: 1 })];
  notesBar3[0].addArticulation(0, new Articulation('a-').setPosition(3));
  notesBar3[0].addArticulation(0, new Articulation('a>').setPosition(3));
  notesBar3[0].addArticulation(0, new Articulation('a@a').setPosition(3));

  // Helper function to justify and draw a 4/4 voice
  x += formatAndDrawToWidth(x, y, width, notesBar3, Barline.type.NONE, []);
  // bar 4 - juxtaposing second bar next to first bar

  const notesBar4 = [
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }),
    f.StaveNote({ keys: ['a/5'], duration: 'q', stem_direction: -1 }),
  ];
  for (i = 0; i < 4; i++) {
    let position1 = 3;
    if (i > 1) {
      position1 = 4;
    }
    notesBar4[i].addArticulation(0, new Articulation('a-').setPosition(position1));
  }

  // Helper function to justify and draw a 4/4 voice
  x += formatAndDrawToWidth(x, y, width, notesBar4, Barline.type.END, []);
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
