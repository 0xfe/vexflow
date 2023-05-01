// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Style Tests

// TODO: The .addStroke(0, new Stroke(...)) in the tab test case shows a NO GLYPH for the Petaluma font.
// TODO: Changing ctx.font seems to have no effect in the tab test case. Should it?
//       Annotation sets its own font.
//       TabNote sets its own font.
//       Is there a way to set all the text fonts in one go?

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Annotation } from '../src/annotation';
import { Articulation } from '../src/articulation';
import { Bend } from '../src/bend';
import { ElementStyle } from '../src/element';
import { Formatter } from '../src/formatter';
import { KeySignature } from '../src/keysignature';
import { NoteSubGroup } from '../src/notesubgroup';
import { Ornament } from '../src/ornament';
import { ContextBuilder } from '../src/renderer';
import { StaveModifierPosition } from '../src/stavemodifier';
import { StaveNote } from '../src/stavenote';
import { Stroke } from '../src/strokes';
import { TabNote, TabNoteStruct } from '../src/tabnote';
import { TabStave } from '../src/tabstave';
import { TimeSignature } from '../src/timesignature';

const StyleTests = {
  Start(): void {
    QUnit.module('Style');
    const run = VexFlowTests.runTests;
    run('Basic Style', stave);
    run('TabNote modifiers Style', tab);
  },
};

/**
 * Helper function to create a ElementStyle options object of the form { fillStyle: XXX, strokeStyle: YYY }.
 * Used for updating the fillStyle and optionally the strokeStyle.
 */
function FS(fillStyle: string, strokeStyle?: string): ElementStyle {
  const ret: ElementStyle = { fillStyle };
  if (strokeStyle) {
    ret.strokeStyle = strokeStyle;
  }
  return ret;
}

/**
 * Color elements on a stave.
 */
function stave(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 150);
  const stave = f.Stave({ x: 25, y: 20, width: 500 });

  // Stave modifiers test.
  const keySig = new KeySignature('D');
  keySig.addToStave(stave);
  keySig.setStyle(FS('blue'));
  stave.addTimeSignature('4/4');
  const timeSig = stave.getModifiers(StaveModifierPosition.BEGIN, TimeSignature.CATEGORY);
  timeSig[0].setStyle(FS('brown'));

  const notes = [
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
      .addModifier(f.Accidental({ type: 'b' }), 0)
      .addModifier(f.Accidental({ type: '#' }), 1),
    f
      .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
      .addModifier(f.Accidental({ type: 'b' }), 0)
      .addModifier(f.Accidental({ type: '#' }), 1),
    f.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
    f.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),

    // voice.draw() test.
    f.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),

    // GhostNote modifiers test.
    f.GhostNote({ duration: '16' }).addModifier(new Annotation('GhostNote green text').setStyle(FS('green')), 0),
  ];

  const notes0 = notes[0] as StaveNote;
  const notes1 = notes[1] as StaveNote;

  notes0.setKeyStyle(0, FS('red'));
  notes1.setKeyStyle(0, FS('red'));

  // StaveNote modifiers test.
  const mods1 = notes1.getModifiers();
  mods1[0].setStyle(FS('green'));
  notes0.addModifier(new Articulation('a.').setPosition(4).setStyle(FS('green')), 0);
  notes0.addModifier(new Ornament('mordent').setStyle(FS('lightgreen')), 0);

  notes1.addModifier(new Annotation('blue').setStyle(FS('blue')), 0);
  notes1.addModifier(new NoteSubGroup([f.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]), 0);

  const voice = f.Voice().addTickables(notes);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();
  options.assert.ok(true, 'Basic Style');
}

/**
 * Color elements on a guitar tab.
 */
function tab(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 140);

  ctx.font = '10pt Arial';
  const stave = new TabStave(10, 10, 450).addTabGlyph();
  stave.getModifiers()[2].setStyle(FS('blue'));
  stave.setContext(ctx).draw();

  const tabNote = (noteStruct: TabNoteStruct) => new TabNote(noteStruct);

  const notes = [
    tabNote({
      positions: [
        { str: 2, fret: 10 },
        { str: 4, fret: 9 },
      ],
      duration: 'h',
    }).addModifier(new Annotation('green text').setStyle(FS('green')), 0),
    tabNote({
      positions: [
        { str: 2, fret: 10 },
        { str: 4, fret: 9 },
      ],
      duration: 'h',
    })
      .addModifier(new Bend('Full').setStyle(FS('brown')), 0)
      .addStroke(0, new Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  options.assert.ok(true, 'TabNote Modifiers Style');
}

VexFlowTests.register(StyleTests);
export { StyleTests };
