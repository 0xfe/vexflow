// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Annotation Tests

// TODO: Formatter.FormatAndDraw(ctx, stave, notes, ???number???);
//       Did a previous version of the API accept a number as the fourth argument?
//       We removed the fourth argument from all of our test cases.

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Annotation } from 'annotation';
import { Beam } from 'beam';
import { Bend } from 'bend';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { Registry } from 'registry';
import { Stave } from 'stave';
import { StaveNote, StaveNoteStruct } from 'stavenote';
import { TabNote, TabNoteStruct } from 'tabnote';
import { TabStave } from 'tabstave';
import { Vibrato } from 'vibrato';
import { Voice } from 'voice';
import { Tickable } from 'tickable';

const AnnotationTests = {
  Start(): void {
    QUnit.module('Annotation');
    const run = VexFlowTests.runTests;
    run('Lyrics', lyrics);
    run('Simple Annotation', simple);
    run('Standard Notation Annotation', standard);
    run('Harmonics', harmonic);
    run('Fingerpicking', picking);
    run('Bottom Annotation', bottom);
    run('Bottom Annotations with Beams', bottomWithBeam);
    run('Test Justification Annotation Stem Up', justificationStemUp);
    run('Test Justification Annotation Stem Down', justificationStemDown);
    run('TabNote Annotations', tabNotes);
  },
};

const FONT_SIZE = VexFlowTests.Font.size;

// Helper functions to create TabNote and StaveNote objects.
const tabNote = (struct: TabNoteStruct) => new TabNote(struct);
const staveNote = (struct: StaveNoteStruct) => new StaveNote(struct);

/**
 * Show lyrics using Annotation objects.
 */
function lyrics(options: TestOptions): void {
  let fontSize = FONT_SIZE;
  let x = 10;
  let width = 170;
  let ratio = 1;
  const registry = new Registry();
  Registry.enableDefaultRegistry(registry);
  const f = VexFlowTests.makeFactory(options, 750, 260);

  // Add three groups of staves. Each time we increase the fontSize by 2.
  for (let i = 0; i < 3; ++i) {
    const score = f.EasyScore();
    score.set({ time: '3/4' });
    const system = f.System({ width, x });
    system.addStave({
      voices: [
        score.voice(
          score.notes('(C4 F4)/2[id="n0"]').concat(score.beam(score.notes('(C4 A4)/8[id="n1"], (C#4 A4)/8[id="n2"]')))
        ),
      ],
    });

    // Add lyrics under the first row.
    ['hand,', 'and', 'me', 'pears', 'lead', 'the'].forEach((text, ix) => {
      const verse = Math.floor(ix / 3);
      const noteGroupID = 'n' + (ix % 3);
      const noteGroup = registry.getElementById(noteGroupID) as Tickable;
      noteGroup.addModifier(f.Annotation({ text }).setFont('Roboto Slab', fontSize, 'normal'), verse);
    });

    // Second row doesn't have any lyrics.
    system.addStave({
      voices: [score.voice(score.notes('(F4 D5)/2').concat(score.beam(score.notes('(F4 F5)/8, (F4 F5)/8'))))],
    });

    f.draw();
    ratio = (fontSize + 2) / fontSize;
    width = width * ratio;
    x = x + width;
    fontSize = fontSize + 2;
  }
  ok(true);
}

function simple(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  ctx.font = ' 10pt Arial';
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 10 },
        { str: 4, fret: 9 },
      ],
      duration: 'h',
    }).addModifier(new Annotation('T'), 0),
    tabNote({
      positions: [{ str: 2, fret: 10 }],
      duration: 'h',
    })
      .addModifier(new Annotation('T'), 0)
      .addModifier(new Bend('Full'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Simple Annotation');
}

function standard(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  const stave = new Stave(10, 10, 450).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string) => new Annotation(text).setFont('Times', FONT_SIZE, 'italic');

  const notes = [
    staveNote({ keys: ['c/4', 'e/4'], duration: 'h' }).addAnnotation(0, annotation('quiet')),
    staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }).addAnnotation(2, annotation('Allegro')),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Standard Notation Annotation');
}

function harmonic(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  ctx.font = ' 10pt Arial';
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 12 },
        { str: 3, fret: 12 },
      ],
      duration: 'h',
    }).addModifier(new Annotation('Harm.'), 0),
    tabNote({
      positions: [{ str: 2, fret: 9 }],
      duration: 'h',
    })
      .addModifier(new Annotation('(8va)').setFont('Times', FONT_SIZE, 'italic'), 0)
      .addModifier(new Annotation('A.H.'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Simple Annotation');
}

function picking(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.setFillStyle('#221');
  ctx.setStrokeStyle('#221');
  ctx.setFont('Arial', FONT_SIZE, '');
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const annotation = (text: string) => new Annotation(text).setFont('Times', FONT_SIZE, 'italic');

  const notes = [
    tabNote({
      positions: [
        { str: 1, fret: 0 },
        { str: 2, fret: 1 },
        { str: 3, fret: 2 },
        { str: 4, fret: 2 },
        { str: 5, fret: 0 },
      ],
      duration: 'h',
    }).addModifier(new Vibrato().setVibratoWidth(40)),
    tabNote({
      positions: [{ str: 6, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('p'), 0),
    tabNote({
      positions: [{ str: 3, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('i'), 0),
    tabNote({
      positions: [{ str: 2, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('m'), 0),
    tabNote({
      positions: [{ str: 1, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('a'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Fingerpicking');
}

function bottom(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string) =>
    new Annotation(text).setFont('Times', FONT_SIZE).setVerticalJustification(Annotation.VerticalJustify.BOTTOM);

  const notes = [
    staveNote({ keys: ['f/4'], duration: 'w' }).addAnnotation(0, annotation('F')),
    staveNote({ keys: ['a/4'], duration: 'w' }).addAnnotation(0, annotation('A')),
    staveNote({ keys: ['c/5'], duration: 'w' }).addAnnotation(0, annotation('C')),
    staveNote({ keys: ['e/5'], duration: 'w' }).addAnnotation(0, annotation('E')),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Bottom Annotation');
}

function bottomWithBeam(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';
  const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

  const notes = [
    new StaveNote({ keys: ['a/3'], duration: '8' }).addModifier(
      new Annotation('good').setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
      0
    ),
    new StaveNote({ keys: ['g/3'], duration: '8' }).addModifier(
      new Annotation('even').setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
      0
    ),
    new StaveNote({ keys: ['c/4'], duration: '8' }).addModifier(
      new Annotation('under').setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
      0
    ),
    new StaveNote({ keys: ['d/4'], duration: '8' }).addModifier(
      new Annotation('beam').setVerticalJustification(Annotation.VerticalJustify.BOTTOM),
      0
    ),
  ];

  const beam = new Beam(notes.slice(1));

  Formatter.FormatAndDraw(ctx, stave, notes);
  beam.setContext(ctx).draw();
  ok(true, 'Bottom Annotation with Beams');
}

function justificationStemUp(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 650, 950);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';

  const annotation = (text: string, hJustification: number, vJustification: number) =>
    new Annotation(text)
      .setFont('Arial', FONT_SIZE)
      .setJustification(hJustification)
      .setVerticalJustification(vJustification);

  for (let v = 1; v <= 4; ++v) {
    const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();

    const notes = [
      staveNote({ keys: ['c/3'], duration: 'q' }).addAnnotation(0, annotation('Text', 1, v)),
      staveNote({ keys: ['c/4'], duration: 'q' }).addAnnotation(0, annotation('Text', 2, v)),
      staveNote({ keys: ['c/5'], duration: 'q' }).addAnnotation(0, annotation('Text', 3, v)),
      staveNote({ keys: ['c/6'], duration: 'q' }).addAnnotation(0, annotation('Text', 4, v)),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  ok(true, 'Test Justification Annotation');
}

function justificationStemDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 650, 1000);
  ctx.scale(1.5, 1.5);
  ctx.fillStyle = '#221';
  ctx.strokeStyle = '#221';

  const annotation = (text: string, hJustification: number, vJustification: number) =>
    new Annotation(text)
      .setFont('Arial', FONT_SIZE)
      .setJustification(hJustification)
      .setVerticalJustification(vJustification);

  for (let v = 1; v <= 4; ++v) {
    const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();
    const notes = [
      staveNote({ keys: ['c/3'], duration: 'q', stem_direction: -1 }).addAnnotation(0, annotation('Text', 1, v)),
      staveNote({ keys: ['c/4'], duration: 'q', stem_direction: -1 }).addAnnotation(0, annotation('Text', 2, v)),
      staveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }).addAnnotation(0, annotation('Text', 3, v)),
      staveNote({ keys: ['c/6'], duration: 'q', stem_direction: -1 }).addAnnotation(0, annotation('Text', 4, v)),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  ok(true, 'Test Justification Annotation');
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
    const note = new TabNote(noteSpec);
    note.render_options.draw_stem = true;
    return note;
  });

  const notes2 = specs.map((noteSpec) => {
    const note = new TabNote(noteSpec);
    note.render_options.draw_stem = true;
    note.setStemDirection(-1);
    return note;
  });

  const notes3 = specs.map((noteSpec) => new TabNote(noteSpec));

  notes1[0].addModifier(new Annotation('Text').setJustification(1).setVerticalJustification(1), 0); // U
  notes1[1].addModifier(new Annotation('Text').setJustification(2).setVerticalJustification(2), 0); // D
  notes1[2].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
  notes1[3].addModifier(new Annotation('Text').setJustification(4).setVerticalJustification(4), 0); // D

  notes2[0].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(1), 0); // U
  notes2[1].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(2), 0); // D
  notes2[2].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(3), 0); // U
  notes2[3].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(4), 0); // D

  notes3[0].addModifier(new Annotation('Text').setVerticalJustification(1), 0); // U
  notes3[1].addModifier(new Annotation('Text').setVerticalJustification(2), 0); // D
  notes3[2].addModifier(new Annotation('Text').setVerticalJustification(3), 0); // U
  notes3[3].addModifier(new Annotation('Text').setVerticalJustification(4), 0); // D

  const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT);

  voice.addTickables(notes1);
  voice.addTickables(notes2);
  voice.addTickables(notes3);
  // Alternatively, you could add all the notes in one big array with spread syntax.
  // voice.addTickables([...notes1, ...notes2, ...notes3]);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  voice.draw(ctx, stave);

  ok(true, 'TabNotes successfully drawn');
}

export { AnnotationTests };
