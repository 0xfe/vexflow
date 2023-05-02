// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// TypeGuard Tests

// eslint-disable-next-line
// @ts-nocheck to support ES5 style class declaration in the fakeES5() test case.

import { VexFlowTests } from './vexflow_test_helpers';

import { CanvasContext } from '../src/canvascontext';
import { StaveNote } from '../src/stavenote';
import { StemmableNote } from '../src/stemmablenote';
import { TabNote } from '../src/tabnote';
import { isCategory, isNote, isRenderContext, isStaveNote, isStemmableNote, isTabNote } from '../src/typeguard';

const TypeGuardTests = {
  Start(): void {
    QUnit.module('TypeGuard');
    QUnit.test('Real VexFlow Types', real);
    QUnit.test('Fake VexFlow Types in ES5', fakeES5);
    QUnit.test('Fake VexFlow Types in ES6', fakeES6);
    QUnit.test('Edge Case ES5/ES6', edgeCaseES5vsES6);
  },
};

function real(assert: Assert): void {
  const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
  assert.ok(isStaveNote(s), 'isStaveNote helper function');
  assert.ok(isCategory(s, 'StaveNote'), 'Use isCategory(s, "StaveNote") directly');
  assert.notOk(isTabNote(s), 'isTabNote helper function. s is NOT a TabNote.');

  const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
  assert.ok(isTabNote(t), 'isTabNote helper function');
  assert.notOk(isStaveNote(t), 't is NOT a StaveNote');

  assert.ok(isNote(s), 'StaveNote extends StemmableNote which extends Note, so s is a Note');
  assert.ok(isStemmableNote(t), 'TabNote extends StemmableNote');
  assert.ok(isNote(t), 'TabNote extends StemmableNote which extends Note, so t is a Note');

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = new CanvasContext(canvas.getContext('2d') as CanvasRenderingContext2D);
  assert.ok(isRenderContext(ctx), 'ctx is a RenderContext');
}

/**
 * Helper function to test the fake VexFlow objects we create in fakeES5() and fakeES6().
 */
function checkFakeObjects(assert: Assert, fakeStemmableNote: unknown, fakeStaveNote: unknown): void {
  assert.ok(isStemmableNote(fakeStemmableNote), 'Fake StemmableNote is a StemmableNote.');
  assert.notOk(isNote(fakeStemmableNote), 'Fake StemmableNote is not a Note (no ancestors with the correct CATEGORY).');

  assert.ok(isCategory(fakeStaveNote, 'StaveNote'), 'Fake StaveNote is a StaveNote.');
  assert.ok(isStaveNote(fakeStaveNote), 'Fake StaveNote is a StaveNote (via helper function).');
  assert.ok(isCategory(fakeStaveNote, 'StemmableNote'), 'Fake StaveNote is also a StemmableNote (via inheritance).');
  assert.notOk(isNote(fakeStaveNote), 'Fake StaveNote is not a Note. CATEGORY does not match.');
}

/**
 * Demonstrate that an object (ES5-style) can pass the isCategory(...) test if it
 * has the correct static .CATEGORY property.
 */
function fakeES5(assert: Assert): void {
  function FakeStemmableNote() {
    this.isFake = true;
  }
  FakeStemmableNote.CATEGORY = StemmableNote.CATEGORY;

  function FakeStaveNote() {
    FakeStemmableNote.call(this);
  }
  FakeStaveNote.CATEGORY = StaveNote.CATEGORY;
  FakeStaveNote.prototype = Object.create(FakeStemmableNote.prototype);
  FakeStaveNote.prototype.constructor = FakeStaveNote;

  const fakeStemmableNote = new FakeStemmableNote();
  const fakeStaveNote = new FakeStaveNote();
  checkFakeObjects(assert, fakeStemmableNote, fakeStaveNote);
}

/**
 * Demonstrate that an object (ES6-style) can pass the isCategory(...) test if it
 * or its ancestor has the correct static .CATEGORY property.
 */
function fakeES6(assert: Assert): void {
  class FakeStemmableNote {
    static CATEGORY = StemmableNote.CATEGORY;
  }
  class FakeStaveNote extends FakeStemmableNote {
    static CATEGORY = StaveNote.CATEGORY;
  }

  const fakeStemmableNote = new FakeStemmableNote();
  const fakeStaveNote = new FakeStaveNote();
  checkFakeObjects(assert, fakeStemmableNote, fakeStaveNote);
}

/**
 * The tsconfig.json target is ES6 (as of August 18, 2021), so isCategory() works even when the root class "extends Object".
 */
function edgeCaseES5vsES6(assert: Assert): void {
  class Z extends Object {}
  class Y extends Z {}
  class X extends Y {}
  const zInstance = new Z();
  const xInstance = new X();

  assert.ok(xInstance instanceof Object, 'es5 & es6: x IS an instanceof Object');

  // If targeting es5, these three assertions only pass if we remove "extends Object" from the class Z definition.
  assert.ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
  assert.ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
  assert.ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
}

VexFlowTests.register(TypeGuardTests);
export { TypeGuardTests };
