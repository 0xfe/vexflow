// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Clef Key Signature Tests
//

import { VexFlowTests, TestOptions, MAJOR_KEYS, MINOR_KEYS } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { KeySignature } from 'keysignature';
import { Glyph } from 'glyph';
import { Tables } from 'tables';
import { Stave } from 'stave';

const ClefKeySignatureTests = {
  Start(): void {
    QUnit.module('Clef Keys');
    // Removed an identical 'Key Parser Test'. See keysignature_tests.ts.
    const run = VexFlowTests.runTests;
    run('Major Key Clef Test', keys, { majorKeys: true });
    run('Minor Key Clef Test', keys, { majorKeys: false });
    run('Stave Helper', staveHelper);
  },
};

function keys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const minPadding = Tables.DEFAULT_FONT_STACK[0].lookupMetric('glyphs.noteHead.minPadding');
  const accidentalCount = 28; // total number in all the keys
  const glyphScale = 39; // default font scale
  const clefPadding = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'gClef', glyphScale) * 2; // widest clef
  const sharpWidth = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'accidentalSharp', glyphScale);
  const flatWidth = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'accidentalFlat', glyphScale);
  const sharpTestWidth = accidentalCount * (sharpWidth + minPadding) + clefPadding + Stave.defaultPadding;
  const flatTestWidth = accidentalCount * (flatWidth + minPadding) + clefPadding + Stave.defaultPadding;
  const clefs = [
    'treble',
    'soprano',
    'mezzo-soprano',
    'alto',
    'tenor',
    'baritone-f',
    'baritone-c',
    'bass',
    'french',
    'subbass',
    'percussion',
  ];

  const ctx = contextBuilder(
    options.elementId,
    Math.max(sharpTestWidth, flatTestWidth) + Stave.defaultPadding + clefPadding + 100,
    20 + 80 * 2 * clefs.length
  );
  const staves = [];
  const keys = options.params.majorKeys ? MAJOR_KEYS : MINOR_KEYS;

  let i;
  let flat;
  let sharp;
  let keySig;

  const yOffsetForFlatStaves = 10 + 80 * clefs.length;
  for (i = 0; i < clefs.length; i++) {
    // Render all the sharps first, then all the flats:
    staves[i] = new Stave(10, 10 + 80 * i, flatTestWidth);
    staves[i].addClef(clefs[i]);
    staves[i + clefs.length] = new Stave(10, yOffsetForFlatStaves + 10 + 80 * i, sharpTestWidth);
    staves[i + clefs.length].addClef(clefs[i]);

    for (flat = 0; flat < 8; flat++) {
      keySig = new KeySignature(keys[flat]);
      keySig.addToStave(staves[i]);
    }

    for (sharp = 8; sharp < keys.length; sharp++) {
      keySig = new KeySignature(keys[sharp]);
      keySig.addToStave(staves[i + clefs.length]);
    }

    staves[i].setContext(ctx);
    staves[i].draw();
    staves[i + clefs.length].setContext(ctx);
    staves[i + clefs.length].draw();
  }

  ok(true, 'all pass');
}

function staveHelper(options: TestOptions, contextBuilder: ContextBuilder): void {
  const minPadding = Tables.DEFAULT_FONT_STACK[0].lookupMetric('glyphs.noteHead.minPadding');
  const accidentalCount = 28; // total number in all the keys
  const glyphScale = 39; // default font scale
  const clefPadding = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'gClef', glyphScale) * 2; // widest clef
  const sharpWidth = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'accidentalSharp', glyphScale);
  const flatWidth = Glyph.getWidth(Tables.DEFAULT_FONT_STACK, 'accidentalFlat', glyphScale);
  const sharpTestWidth = accidentalCount * (sharpWidth + minPadding) + clefPadding + Stave.defaultPadding;
  const flatTestWidth = accidentalCount * (flatWidth + minPadding) + clefPadding + Stave.defaultPadding;

  const ctx = contextBuilder(
    options.elementId,
    Math.max(sharpTestWidth, flatTestWidth) + Stave.defaultPadding + clefPadding + 100,
    400
  );
  const stave1 = new Stave(10, 10, flatTestWidth);
  const stave2 = new Stave(10, 90, flatTestWidth);
  const stave3 = new Stave(10, 170, sharpTestWidth);
  const stave4 = new Stave(10, 260, sharpTestWidth);
  const keys = MAJOR_KEYS;

  stave1.addClef('treble');
  stave2.addClef('bass');
  stave3.addClef('alto');
  stave4.addClef('tenor');

  for (let n = 0; n < 8; ++n) {
    stave1.addKeySignature(keys[n]);
    stave2.addKeySignature(keys[n]);
  }

  for (let i = 8; i < keys.length; ++i) {
    stave3.addKeySignature(keys[i]);
    stave4.addKeySignature(keys[i]);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();
  stave3.setContext(ctx);
  stave3.draw();
  stave4.setContext(ctx);
  stave4.draw();

  ok(true, 'all pass');
}

export { ClefKeySignatureTests };
