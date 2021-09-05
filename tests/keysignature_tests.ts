// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Key Signature Tests
//

/* eslint-disable */
// @ts-nocheck

// TODO: KeySignature.alterKey(alterKeySpec: string) should accept a string[] instead.
// TODO: Factory.KeySigNote() should take a Partial<T>, or allow cancelKey and alterKey to be optional.

import { VexFlowTests, TestOptions, MAJOR_KEYS, MINOR_KEYS } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Flow } from 'flow';
import { KeySignature } from 'keysignature';
import { Stave } from 'stave';
import { BarlineType } from 'stavebarline';

const KeySignatureTests = {
  Start(): void {
    QUnit.module('KeySignature');
    test('Key Parser Test', parser);
    const run = VexFlowTests.runTests;
    run('Major Key Test', majorKeys);
    run('Minor Key Test', minorKeys);
    run('Stave Helper', staveHelper);
    run('Cancelled key test', majorKeysCanceled);
    run('Cancelled key (for each clef) test', keysCanceledForEachClef);
    run('Altered key test', majorKeysAltered);
    run('End key with clef test', endKeyWithClef);
    run('Key Signature Change test', changeKey);
  },
};

function parser(): void {
  expect(11);

  function catchError(spec: string): void {
    throws(() => Flow.keySignature(spec), /BadKeySignature/);
  }

  catchError('asdf');
  catchError('D!');
  catchError('E#');
  catchError('D#');
  catchError('#');
  catchError('b');
  catchError('Kb');
  catchError('Fb');
  catchError('Dbm');
  catchError('B#m');

  Flow.keySignature('B');
  Flow.keySignature('C');
  Flow.keySignature('Fm');
  Flow.keySignature('Ab');
  Flow.keySignature('Abm');
  Flow.keySignature('F#');
  Flow.keySignature('G#m');

  ok(true, 'all pass');
}

function majorKeys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 240);
  const stave1 = new Stave(10, 10, 350);
  const stave2 = new Stave(10, 90, 350);
  const keys = MAJOR_KEYS;

  let keySig = null;
  for (let i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.addToStave(stave1);
  }

  for (let n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.addToStave(stave2);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, 'all pass');
}

function majorKeysCanceled(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 780, 500);
  ctx.scale(0.9, 0.9);
  const stave1 = new Stave(10, 10, 750).addClef('treble');
  const stave2 = new Stave(10, 90, 750).addClef('treble');
  const stave3 = new Stave(10, 170, 750).addClef('treble');
  const stave4 = new Stave(10, 250, 750).addClef('treble');
  const keys = MAJOR_KEYS;

  let keySig = null;
  let i;
  let n;
  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.cancelKey('Cb');
    keySig.setPadding(18);
    keySig.addToStave(stave1);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.cancelKey('C#');
    keySig.setPadding(20);
    keySig.addToStave(stave2);
  }

  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.cancelKey('E');
    keySig.setPadding(18);
    keySig.addToStave(stave3);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.cancelKey('Ab');
    keySig.setPadding(20);
    keySig.addToStave(stave4);
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

function keysCanceledForEachClef(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 600, 380);
  ctx.scale(0.8, 0.8);
  const keys = ['C#', 'Cb'];

  const x = 20;
  let y = 20;
  let tx = x;
  ['bass', 'tenor', 'soprano', 'mezzo-soprano', 'baritone-f'].forEach(function (clef) {
    keys.forEach((key) => {
      const cancelKey = key === keys[0] ? keys[1] : keys[0];
      const stave = new Stave(tx, y, 350);
      stave.setClef(clef);
      stave.addKeySignature(cancelKey);
      stave.addKeySignature(key, cancelKey);
      stave.addKeySignature(key);
      stave.setContext(ctx).draw();
      tx += 350;
    });
    tx = x;
    y += 80;
  });

  ok(true, 'all pass');
}

function majorKeysAltered(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 780, 500);
  ctx.scale(0.9, 0.9);
  const stave1 = new Stave(10, 10, 750).addClef('treble');
  const stave2 = new Stave(10, 90, 750).addClef('treble');
  const stave3 = new Stave(10, 170, 750).addClef('treble');
  const stave4 = new Stave(10, 250, 750).addClef('treble');
  const keys = MAJOR_KEYS;

  let keySig = null;
  let i;
  let n;
  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.alterKey(['bs', 'bs']);
    keySig.setPadding(18);
    keySig.addToStave(stave1);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.alterKey(['+', '+', '+']);
    keySig.setPadding(20);
    keySig.addToStave(stave2);
  }

  for (i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.alterKey(['n', 'bs', 'bb']);
    keySig.setPadding(18);
    keySig.addToStave(stave3);
  }

  for (n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.alterKey(['++', '+', 'n', '+']);
    keySig.setPadding(20);
    keySig.addToStave(stave4);
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

function minorKeys(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 240);
  const stave1 = new Stave(10, 10, 350);
  const stave2 = new Stave(10, 90, 350);
  const keys = MINOR_KEYS;

  let keySig = null;
  for (let i = 0; i < 8; ++i) {
    keySig = new KeySignature(keys[i]);
    keySig.addToStave(stave1);
  }

  for (let n = 8; n < keys.length; ++n) {
    keySig = new KeySignature(keys[n]);
    keySig.addToStave(stave2);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, 'all pass');
}

function endKeyWithClef(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 200);
  ctx.scale(0.9, 0.9);
  const stave1 = new Stave(10, 10, 350);
  stave1
    .setKeySignature('G')
    .setBegBarType(BarlineType.REPEAT_BEGIN)
    .setEndBarType(BarlineType.REPEAT_END)
    .setClef('treble')
    .addTimeSignature('4/4')
    .setEndClef('bass')
    .setEndKeySignature('Cb');
  const stave2 = new Stave(10, 90, 350);
  stave2.setKeySignature('Cb').setClef('bass').setEndClef('treble').setEndKeySignature('G');

  stave1.setContext(ctx).draw();
  stave2.setContext(ctx).draw();
  ok(true, 'all pass');
}

function staveHelper(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 240);
  const stave1 = new Stave(10, 10, 350);
  const stave2 = new Stave(10, 90, 350);
  const keys = MAJOR_KEYS;

  for (let i = 0; i < 8; ++i) {
    stave1.addKeySignature(keys[i]);
  }

  for (let n = 8; n < keys.length; ++n) {
    stave2.addKeySignature(keys[n]);
  }

  stave1.setContext(ctx);
  stave1.draw();
  stave2.setContext(ctx);
  stave2.draw();

  ok(true, 'all pass');
}

function changeKey(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 900);

  // The previous code was buggy: f.Stave(10, 10, 800), even though Factory.Stave() only accepts 1 argument.
  const stave = f.Stave({ x: 10, y: 10, width: 800 }).addClef('treble').addTimeSignature('C|');

  const voice = f
    .Voice()
    .setStrict(false)
    .addTickables([
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', cancelKey: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'Bb' }),
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
      f.BarNote(),
      f.KeySigNote({ key: 'D', alterKey: ['b', 'n'] }), // TODO: alterKey needs to be a string[]
      f.StaveNote({ keys: ['c/4'], duration: '1' }),
    ]);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true, 'all pass');
}

export { KeySignatureTests };
