// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Style Tests

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok } from './support/qunit_api';
import { Annotation } from 'annotation';
import { Bend } from 'bend';
import { TabNote } from 'tabnote';
import { KeySignature } from 'keysignature';
import { StaveModifier } from 'stavemodifier';
import { TimeSignature } from 'timesignature';
import { ContextBuilder } from 'renderer';
import { ElementStyle } from 'element';
import { StaveNote } from 'stavenote';
import { Articulation } from 'articulation';
import { Ornament } from 'ornament';
import { NoteSubGroup } from 'notesubgroup';
import { Formatter } from 'formatter';
import { Stroke } from 'strokes';
import { TabStave } from 'tabstave';

function FS(fill: string, stroke?: string): ElementStyle {
  const ret: ElementStyle = { fillStyle: fill };
  if (stroke) {
    ret.strokeStyle = stroke;
  }
  return ret;
}

const StyleTests = {
  Start(): void {
    QUnit.module('Style');
    const run = VexFlowTests.runTests;
    run('Basic Style', StyleTests.stave);
    run('TabNote modifiers Style', StyleTests.tab);
  },

  stave(options: TestOptions): void {
    const f = VexFlowTests.makeFactory(options, 600, 150);
    const stave = f.Stave({ x: 25, y: 20, width: 500 });

    // Stave modifiers test.
    const keySig = new KeySignature('D');
    keySig.addToStave(stave);
    keySig.setStyle(FS('blue'));
    stave.addTimeSignature('4/4');
    const timeSig = stave.getModifiers(StaveModifier.Position.BEGIN, TimeSignature.CATEGORY);
    timeSig[0].setStyle(FS('brown'));

    const notes = [
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addAccidental(0, f.Accidental({ type: 'b' }))
        .addAccidental(1, f.Accidental({ type: '#' })),
      f
        .StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
        .addAccidental(0, f.Accidental({ type: 'b' }))
        .addAccidental(1, f.Accidental({ type: '#' })),
      f.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
      f.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '8' }),

      // voice.draw() test.
      f.TextDynamics({ text: 'sfz', duration: '16' }).setStyle(FS('blue')),

      // GhostNote modifiers test.
      f.GhostNote({ duration: '16' }).addModifier(new Annotation('GhostNote green text').setStyle(FS('green'))),
    ];

    const notes0 = notes[0] as StaveNote;
    const notes1 = notes[1] as StaveNote;

    notes0.setKeyStyle(0, FS('red'));
    notes1.setKeyStyle(0, FS('red'));

    // StaveNote modifiers test.
    const mods1 = notes1.getModifiers();
    mods1[0].setStyle(FS('green'));
    notes0.addArticulation(0, new Articulation('a.').setPosition(4).setStyle(FS('green')));
    notes0.addModifier(new Ornament('mordent').setStyle(FS('lightgreen')), 0);

    notes1.addModifier(new Annotation('blue').setStyle(FS('blue')), 0);
    notes1.addModifier(new NoteSubGroup([f.ClefNote({ options: { size: 'small' } }).setStyle(FS('blue'))]), 0);

    const voice = f.Voice().addTickables(notes);

    f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

    f.draw();
    ok(true, 'Basic Style');
  },

  tab(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 140);
    ctx.fillStyle = '#221';
    ctx.strokeStyle = '#221';
    ctx.font = ' 10pt Arial';
    const stave = new TabStave(10, 10, 450).addTabGlyph();
    stave.getModifiers()[2].setStyle(FS('blue'));
    stave.setContext(ctx).draw();

    function newNote(tab_struct) {
      return new TabNote(tab_struct);
    }
    function newBend(text) {
      return new Bend(text);
    }
    function newAnnotation(text) {
      return new Annotation(text);
    }

    // TabNote modifiers test.
    const notes = [
      newNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      }).addModifier(newAnnotation('green text').setStyle(FS('green')), 0),
      newNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 4, fret: 9 },
        ],
        duration: 'h',
      })
        .addModifier(newBend('Full').setStyle(FS('brown')), 0)
        .addStroke(0, new Stroke(1, { all_voices: false }).setStyle(FS('blue'))),
    ];

    Formatter.FormatAndDraw(ctx, stave, notes, 200);
    ok(true, 'TabNote modifiers Style');
  },
};

export { StyleTests };
