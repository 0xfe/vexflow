// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Annotation Tests

// TODO: Formatter.FormatAndDraw(ctx, stave, notes, ???number???);
//       Did a previous version of the API accept a number as the fourth argument?
//       We removed the fourth argument from all of our test cases.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Annotation, AnnotationVerticalJustify } from '../src/annotation';
import { Articulation } from '../src/articulation';
import { Beam } from '../src/beam';
import { Bend } from '../src/bend';
import { ElementStyle } from '../src/element';
import { Flow } from '../src/flow';
import { Font, FontStyle, FontWeight } from '../src/font';
import { Formatter } from '../src/formatter';
import { ModifierPosition } from '../src/modifier';
import { Registry } from '../src/registry';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';
import { Stem } from '../src/stem';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { Tickable } from '../src/tickable';
import { Vibrato } from '../src/vibrato';
import { Voice } from '../src/voice';

const AnnotationTests = {
  Start(): void {
    QUnit.module('Annotation');
    const run = VexFlowTests.runTests;
    run('Placement', placement);
    run('Lyrics', lyrics);
    run('Simple Annotation', simple);
    run('Styled Annotation', styling);
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
const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);
const staveNote = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct);

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
          score.notes('(C4 F4)/2[id="n0"]').concat(score.beam(score.notes('(C4 A4)/8[id="n1"], (C4 A4)/8[id="n2"]')))
        ),
      ],
    });

    // Add lyrics under the first row.
    ['hand,', 'and', 'me', 'pears', 'lead', 'the'].forEach((text, ix) => {
      const verse = Math.floor(ix / 3);
      const noteGroupID = 'n' + (ix % 3);
      const noteGroup = registry.getElementById(noteGroupID) as Tickable;
      const lyricsAnnotation = f.Annotation({ text }).setFont('Roboto Slab', fontSize);
      lyricsAnnotation.setPosition(ModifierPosition.BELOW);
      noteGroup.addModifier(lyricsAnnotation, verse);
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

  ctx.font = '10pt Arial, sans-serif';
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
    }).addModifier(new Bend('Full').setTap('T'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Simple Annotation');
}

function standard(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);

  const stave = new Stave(10, 10, 450).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string) => new Annotation(text).setFont(Font.SERIF, FONT_SIZE, 'normal', 'italic');

  const notes = [
    staveNote({ keys: ['c/4', 'e/4'], duration: 'h' }).addModifier(annotation('quiet'), 0),
    staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }).addModifier(annotation('Allegro'), 2),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Standard Notation Annotation');
}

function styling(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);
  const stave = new Stave(10, 10, 450).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string, style: ElementStyle) =>
    new Annotation(text).setFont(Font.SERIF, FONT_SIZE, 'normal', 'italic').setStyle(style);

  const notes = [
    staveNote({ keys: ['c/4', 'e/4'], duration: 'h' }).addModifier(annotation('quiet', { fillStyle: '#0F0' }), 0),
    staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h' }).addModifier(
      annotation('Allegro', { fillStyle: '#00F' }),
      2
    ),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Standard Notation Annotation');
}

function harmonic(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);

  ctx.font = '10pt Arial';
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
      .addModifier(new Annotation('(8va)').setFont(Font.SERIF, FONT_SIZE, FontWeight.NORMAL, FontStyle.ITALIC), 0)
      .addModifier(new Annotation('A.H.'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Simple Annotation');
}

function picking(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);

  ctx.setFont(Font.SANS_SERIF, FONT_SIZE);
  const stave = new TabStave(10, 10, 450).addTabGlyph().setContext(ctx).draw();

  const annotation = (text: string) =>
    new Annotation(text).setFont(Font.SERIF, FONT_SIZE, FontWeight.NORMAL, FontStyle.ITALIC);

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
    }).addModifier(new Vibrato().setVibratoWidth(40), 0),
    tabNote({
      positions: [{ str: 6, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('p').setVerticalJustification(AnnotationVerticalJustify.TOP), 0),
    tabNote({
      positions: [{ str: 3, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('i').setVerticalJustification(AnnotationVerticalJustify.TOP), 0),
    tabNote({
      positions: [{ str: 2, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('m').setVerticalJustification(AnnotationVerticalJustify.TOP), 0),
    tabNote({
      positions: [{ str: 1, fret: 9 }],
      duration: '8',
    }).addModifier(annotation('a').setVerticalJustification(AnnotationVerticalJustify.TOP), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Fingerpicking');
}
function placement(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 750, 300);

  const stave = new Stave(10, 50, 750).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string, fontSize: number, vj: number) =>
    new Annotation(text).setFont(Font.SERIF, fontSize).setVerticalJustification(vj);

  const notes = [
    staveNote({ keys: ['e/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new Articulation('a-').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 10, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['b/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new Articulation('a-').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 10, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['c/5'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new Articulation('a-').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 10, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['f/4'], duration: 'q' })
      .addModifier(annotation('v1', 14, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 14, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['f/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new Articulation('am').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new Articulation('a.').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new Articulation('a-').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 20, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['f/5'], duration: 'q' })
      .addModifier(annotation('v1', 11, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 11, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['f/5'], duration: 'q' })
      .addModifier(annotation('v1', 11, AnnotationVerticalJustify.TOP), 0)
      .addModifier(annotation('v2', 20, AnnotationVerticalJustify.TOP), 0),
    staveNote({ keys: ['f/4'], duration: 'q' })
      .addModifier(annotation('v1', 12, AnnotationVerticalJustify.BOTTOM), 0)
      .addModifier(annotation('v2', 12, AnnotationVerticalJustify.BOTTOM), 0),
    staveNote({ keys: ['f/5'], duration: 'q' })
      .addModifier(new Articulation('a.').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(annotation('v1', 11, AnnotationVerticalJustify.BOTTOM), 0)
      .addModifier(annotation('v2', 20, AnnotationVerticalJustify.BOTTOM), 0),
    staveNote({ keys: ['f/5'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new Articulation('am').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.BOTTOM), 0)
      .addModifier(annotation('v2', 20, AnnotationVerticalJustify.BOTTOM), 0),
    staveNote({ keys: ['f/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(annotation('v1', 10, AnnotationVerticalJustify.BOTTOM), 0)
      .addModifier(annotation('v2', 20, AnnotationVerticalJustify.BOTTOM), 0),
    staveNote({ keys: ['f/5'], duration: 'w' })
      .addModifier(new Articulation('a@u').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(annotation('v1', 11, AnnotationVerticalJustify.BOTTOM), 0)
      .addModifier(annotation('v2', 16, AnnotationVerticalJustify.BOTTOM), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, ' Annotation Placement');
}

function bottom(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);

  const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

  const annotation = (text: string) =>
    new Annotation(text).setFont(Font.SERIF, FONT_SIZE).setVerticalJustification(Annotation.VerticalJustify.BOTTOM);

  const notes = [
    staveNote({ keys: ['f/4'], duration: 'w' }).addModifier(annotation('F'), 0),
    staveNote({ keys: ['a/4'], duration: 'w' }).addModifier(annotation('A'), 0),
    staveNote({ keys: ['c/5'], duration: 'w' }).addModifier(annotation('C'), 0),
    staveNote({ keys: ['e/5'], duration: 'w' }).addModifier(annotation('E'), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, 'Bottom Annotation');
}

function bottomWithBeam(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  ctx.scale(1.5, 1.5);

  const stave = new Stave(10, 10, 300).addClef('treble').setContext(ctx).draw();

  const notes = [
    new StaveNote({ keys: ['a/3'], duration: '8' }).addModifier(
      new Annotation('good').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
    ),
    new StaveNote({ keys: ['g/3'], duration: '8' }).addModifier(
      new Annotation('even').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
    ),
    new StaveNote({ keys: ['c/4'], duration: '8' }).addModifier(
      new Annotation('under').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
    ),
    new StaveNote({ keys: ['d/4'], duration: '8' }).addModifier(
      new Annotation('beam').setVerticalJustification(Annotation.VerticalJustify.BOTTOM)
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

  const annotation = (text: string, hJustification: number, vJustification: number) =>
    new Annotation(text)
      .setFont(Font.SANS_SERIF, FONT_SIZE)
      .setJustification(hJustification)
      .setVerticalJustification(vJustification);

  for (let v = 1; v <= 4; ++v) {
    const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();

    const notes = [
      staveNote({ keys: ['c/3'], duration: 'q' }).addModifier(annotation('Text', 1, v), 0),
      staveNote({ keys: ['c/4'], duration: 'q' }).addModifier(annotation('Text', 2, v), 0),
      staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'q' }).addModifier(annotation('Text', 3, v), 0),
      staveNote({ keys: ['c/6'], duration: 'q' }).addModifier(annotation('Text', 4, v), 0),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  ok(true, 'Test Justification Annotation');
}

function justificationStemDown(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 650, 1000);
  ctx.scale(1.5, 1.5);

  const annotation = (text: string, hJustification: number, vJustification: number) =>
    new Annotation(text)
      .setFont(Font.SANS_SERIF, FONT_SIZE)
      .setJustification(hJustification)
      .setVerticalJustification(vJustification);

  for (let v = 1; v <= 4; ++v) {
    const stave = new Stave(10, (v - 1) * 150 + 40, 400).addClef('treble').setContext(ctx).draw();
    const notes = [
      staveNote({ keys: ['c/3'], duration: 'q', stem_direction: -1 }).addModifier(annotation('Text', 1, v), 0),
      staveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'q', stem_direction: -1 }).addModifier(
        annotation('Text', 2, v),
        0
      ),
      staveNote({ keys: ['c/5'], duration: 'q', stem_direction: -1 }).addModifier(annotation('Text', 3, v), 0),
      staveNote({ keys: ['c/6'], duration: 'q', stem_direction: -1 }).addModifier(annotation('Text', 4, v), 0),
    ];
    Formatter.FormatAndDraw(ctx, stave, notes);
  }

  ok(true, 'Test Justification Annotation');
}

function tabNotes(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 200);
  ctx.font = '10pt Arial, sans-serif';
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

  notes1[0].addModifier(new Annotation('Text').setJustification(1).setVerticalJustification(1)); // U
  notes1[1].addModifier(new Annotation('Text').setJustification(2).setVerticalJustification(2)); // D
  notes1[2].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(3)); // U
  notes1[3].addModifier(new Annotation('Text').setJustification(4).setVerticalJustification(4)); // D

  notes2[0].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(1)); // U
  notes2[1].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(2)); // D
  notes2[2].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(3)); // U
  notes2[3].addModifier(new Annotation('Text').setJustification(3).setVerticalJustification(4)); // D

  notes3[0].addModifier(new Annotation('Text').setVerticalJustification(1)); // U
  notes3[1].addModifier(new Annotation('Text').setVerticalJustification(2)); // D
  notes3[2].addModifier(new Annotation('Text').setVerticalJustification(3)); // U
  notes3[3].addModifier(new Annotation('Text').setVerticalJustification(4)); // D

  const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.SOFT);

  voice.addTickables(notes1);
  voice.addTickables(notes2);
  voice.addTickables(notes3);
  // Alternatively, you could add all the notes in one big array with spread syntax.
  // voice.addTickables([...notes1, ...notes2, ...notes3]);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave, { stave });

  voice.draw(ctx, stave);

  ok(true, 'TabNotes successfully drawn');
}

VexFlowTests.register(AnnotationTests);
export { AnnotationTests };
