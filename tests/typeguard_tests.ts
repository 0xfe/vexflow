// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author: Ron B. Yeh
// MIT License
//
// TypeGuard Tests

import { isCategory, isNote, isStaveNote, isStemmableNote, isTabNote } from 'typeguard';
import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';
import { StemmableNote } from 'stemmablenote';

const TypeGuardTests = {
  Start(): void {
    QUnit.module('TypeGuard');
    test('Real VexFlow Types', real);
    test('Fake VexFlow Types', fake);
    test('instanceof', fallbackToInstanceOf);
    test('Edge Case ES5/ES6', edgeCaseES5vsES6);
  },
};

function real(): void {
  const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
  ok(isStaveNote(s), 'isStaveNote helper function');
  ok(isCategory(s, StaveNote), 'Use isCategory(s, StaveNote) directly');
  notOk(isTabNote(s), 'isTabNote helper function. s is NOT a TabNote.');

  const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
  ok(isTabNote(t), 'isTabNote helper function');
  notOk(isStaveNote(t), 't is NOT a StaveNote');

  ok(isNote(s), 'StaveNote extends StemmableNote which extends Note, so s is a Note');
  ok(isStemmableNote(t), 'TabNote extends StemmableNote');
  ok(isNote(t), 'TabNote extends StemmableNote which extends Note, so t is a Note');
}

function fake(): void {
  const fakeStaveNote = {
    getCategory: () => 'stavenotes',
  };
  ok(isStaveNote(fakeStaveNote), 'Fake StaveNote is a StaveNote.');
  notOk(isNote(fakeStaveNote), 'Fake StaveNote is not a Note. Categories do not match.');

  const fakeStemmableNote = {
    getCategory() {
      return StemmableNote.CATEGORY;
    },
  };
  ok(isStemmableNote(fakeStemmableNote), 'Returns the correct category string.');
  notOk(isNote(fakeStemmableNote), 'The fake stemmable note does not have any ancestors with the correct category.');
}

/**
 * In this test, isCategory() should work just like instanceof,
 * because the classes do not have a .CATEGORY property.
 */
function fallbackToInstanceOf(): void {
  class A {}
  class B extends A {}
  class C extends B {}

  class X {}
  class Y extends X {}

  const cInstance = new C();
  const yInstance = new Y();

  ok(isCategory(cInstance, C), 'isCategory works just like instanceof for regular JS class hierarchies');
  ok(isCategory(cInstance, B));
  ok(isCategory(cInstance, A));
  ok(isCategory(cInstance, Object));

  ok(isCategory(yInstance, Y));
  ok(isCategory(yInstance, X));
  notOk(isCategory(yInstance, B));
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

  // If targeting es5, these four assertions only pass if we remove "extends Object" from the class Z definition.
  ok(isCategory(zInstance, Z), 'es6: z IS the same category as Z');
  ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
  ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
  ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
}

export { TypeGuardTests };
