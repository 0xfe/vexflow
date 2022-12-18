// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Articulation Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Formatter } from '../src/formatter';
import { GlyphArticulation } from '../src/glypharticulation';
import { ModifierPosition } from '../src/modifier';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { StaveNote, StaveNoteStruct } from '../src/stavenote';
import { Stem } from '../src/stem';

const GlyphArticulationTests = {
  Start(): void {
    QUnit.module('GlyphArticulation');
    const run = VexFlowTests.runTests;
    run('GlyphArticulation - Vertical Placement', verticalPlacement);
  },
};

function verticalPlacement(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 750, 300);

  const staveNote = (noteStruct: StaveNoteStruct) => new StaveNote(noteStruct);
  const stave = new Stave(10, 50, 750).addClef('treble').setContext(ctx).draw();

  const notes = [
    staveNote({ keys: ['f/4'], duration: 'q' })
      .addModifier(new GlyphArticulation('fermataBelow').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['g/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('fermataShortBelow').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['c/5'], duration: 'q' })
      .addModifier(new GlyphArticulation('fermataLongBelow').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['f/4'], duration: 'q' })
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('fermataVeryShortBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['g/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow').setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('fermataVeryLongBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['c/5'], duration: 'q' })
      .addModifier(new GlyphArticulation('augmentationDot', true).setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('articTenutoBelow', true).setPosition(ModifierPosition.BELOW), 0)
      .addModifier(new GlyphArticulation('fermataBelow').setPosition(ModifierPosition.BELOW), 0),
    staveNote({ keys: ['a/5'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('fermataAbove').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove').setPosition(ModifierPosition.ABOVE), 0),
    staveNote({ keys: ['f/5'], duration: 'q' })
      .addModifier(new GlyphArticulation('fermataShortAbove').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove').setPosition(ModifierPosition.ABOVE), 0),
    staveNote({ keys: ['b/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('fermataLongAbove').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove').setPosition(ModifierPosition.ABOVE), 0),
    staveNote({ keys: ['a/5'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('fermataVeryShortAbove').setPosition(ModifierPosition.ABOVE), 0),
    staveNote({ keys: ['f/5'], duration: 'q' })
      .addModifier(new GlyphArticulation('augmentationDot').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove').setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('fermataVeryLongAbove').setPosition(ModifierPosition.ABOVE), 0),
    staveNote({ keys: ['b/4'], duration: 'q', stem_direction: Stem.DOWN })
      .addModifier(new GlyphArticulation('augmentationDot', true).setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('articTenutoAbove', true).setPosition(ModifierPosition.ABOVE), 0)
      .addModifier(new GlyphArticulation('fermataAbove').setPosition(ModifierPosition.ABOVE), 0),
  ];

  Formatter.FormatAndDraw(ctx, stave, notes);
  ok(true, ' Annotation Placement');
}

VexFlowTests.register(GlyphArticulationTests);
export { GlyphArticulationTests };
