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
    test('Real VexFlow Types', real);
    test('Fake VexFlow Types in ES5', fakeES5);
    test('Fake VexFlow Types in ES6', fakeES6);
    test('Edge Case ES5/ES6', edgeCaseES5vsES6);
  },
};

function real(): void {
  const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
  ok(isStaveNote(s), 'isStaveNote helper function');
  ok(isCategory(s, 'StaveNote'), 'Use isCategory(s, "StaveNote") directly');
  notOk(isTabNote(s), 'isTabNote helper function. s is NOT a TabNote.');

  const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
  ok(isTabNote(t), 'isTabNote helper function');
  notOk(isStaveNote(t), 't is NOT a StaveNote');

  ok(isNote(s), 'StaveNote extends StemmableNote which extends Note, so s is a Note');
  ok(isStemmableNote(t), 'TabNote extends StemmableNote');
  ok(isNote(t), 'TabNote extends StemmableNote which extends Note, so t is a Note');

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = new CanvasContext(canvas.getContext('2d') as CanvasRenderingContext2D);
  ok(isRenderContext(ctx), 'ctx is a RenderContext');
}

/**
 * Helper function to test the fake VexFlow objects we create in fakeES5() and fakeES6().
 */
function checkFakeObjects(fakeStemmableNote: unknown, fakeStaveNote: unknown): void {
  ok(isStemmableNote(fakeStemmableNote), 'Fake StemmableNote is a StemmableNote.');
  notOk(isNote(fakeStemmableNote), 'Fake StemmableNote is not a Note (no ancestors with the correct CATEGORY).');

  ok(isCategory(fakeStaveNote, 'StaveNote'), 'Fake StaveNote is a StaveNote.');
  ok(isStaveNote(fakeStaveNote), 'Fake StaveNote is a StaveNote (via helper function).');
  ok(isCategory(fakeStaveNote, 'StemmableNote'), 'Fake StaveNote is also a StemmableNote (via inheritance).');
  notOk(isNote(fakeStaveNote), 'Fake StaveNote is not a Note. CATEGORY does not match.');
}

/**
 * Demonstrate that an object (ES5-style) can pass the isCategory(...) test if it
 * has the correct static .CATEGORY property.
 */
function fakeES5(): void {
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
  checkFakeObjects(fakeStemmableNote, fakeStaveNote);
}

/**
 * Demonstrate that an object (ES6-style) can pass the isCategory(...) test if it
 * or its ancestor has the correct static .CATEGORY property.
 */
function fakeES6(): void {
  class FakeStemmableNote {
    static CATEGORY = StemmableNote.CATEGORY;
  }
  class FakeStaveNote extends FakeStemmableNote {
    static CATEGORY = StaveNote.CATEGORY;
  }

  const fakeStemmableNote = new FakeStemmableNote();
  const fakeStaveNote = new FakeStaveNote();
  checkFakeObjects(fakeStemmableNote, fakeStaveNote);
}

/**
 * The tsconfig.json target is ES6 (as of August 18, 2021), so isCategory() works even when the root class "extends Object".
 */
function edgeCaseES5vsES6(): void {
  class Z extends Object {}
  class Y extends Z {}
  class X extends Y {}
  const zInstance = new Z();
  const xInstance = new X();

  ok(xInstance instanceof Object, 'es5 & es6: x IS an instanceof Object');

  // If targeting es5, these three assertions only pass if we remove "extends Object" from the class Z definition.
  ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
  ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
  ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
}

VexFlowTests.register(TypeGuardTests);
export { TypeGuardTests };
