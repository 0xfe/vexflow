// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Clef Key Signature Tests
//

import { MAJOR_KEYS, MINOR_KEYS, TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Glyph } from '../src/glyph';
import { KeySignature } from '../src/keysignature';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';

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

const fontWidths = () => {
  const glyphScale = 39; // default font scale
  const sharpWidth = Glyph.getWidth('accidentalSharp', glyphScale) + 1;
  const flatWidth = Glyph.getWidth('accidentalFlat', glyphScale) + 1;
  const ksPadding = 10; // hard-coded in keysignature.ts
  const naturalWidth = Glyph.getWidth('accidentalNatural', glyphScale) + 2;
  const clefWidth = Glyph.getWidth('gClef', glyphScale); // widest clef
  return { sharpWidth, flatWidth, naturalWidth, clefWidth, ksPadding };
};

function keys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const w = fontWidths();
  const accidentalCount = 28; // total number in all the keys
  const sharpTestWidth = accidentalCount * w.sharpWidth + w.clefWidth + Stave.defaultPadding + 6 * w.ksPadding;
  const flatTestWidth = accidentalCount * w.flatWidth + w.clefWidth + Stave.defaultPadding + 6 * w.ksPadding;
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
    Math.max(sharpTestWidth, flatTestWidth) + 100,
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
  }

  Stave.formatBegModifiers(staves);

  for (i = 0; i < clefs.length; i++) {
    staves[i].setContext(ctx);
    staves[i].draw();
    staves[i + clefs.length].setContext(ctx);
    staves[i + clefs.length].draw();
  }
  ok(true, 'all pass');
}

function staveHelper(options: TestOptions, contextBuilder: ContextBuilder): void {
  const w = fontWidths();
  const accidentalCount = 28; // total number in all the keys
  const sharpTestWidth = accidentalCount * w.sharpWidth + w.clefWidth + Stave.defaultPadding + 7 * w.ksPadding;
  const flatTestWidth = accidentalCount * w.flatWidth + w.clefWidth + Stave.defaultPadding + 7 * w.ksPadding;

  const ctx = contextBuilder(options.elementId, Math.max(sharpTestWidth, flatTestWidth) + 100, 400);
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

VexFlowTests.register(ClefKeySignatureTests);
export { ClefKeySignatureTests };
