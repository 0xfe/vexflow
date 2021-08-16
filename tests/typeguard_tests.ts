// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TypeGuard Tests

import { QUnit, ok, notOk, test } from './declarations';
import { isCategory, isNote, isStaveNote, isStemmableNote, isTabNote } from 'typeguard';
import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';
import { StemmableNote } from 'stemmablenote';

const TypeGuardTests = {
  Start(): void {
    QUnit.module('TypeGuard');
    test('Real VexFlow Types', this.real);
    test('Fake VexFlow Types', this.fake);
    test('instanceof', this.instanceof);
    test('Edge Case', this.edgeCase);
  },

  real(): void {
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
  },

  fake(): void {
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
  },

  /**
   * These tests should be identical to using instanceof,
   * because the classes do not have a .CATEGORY property.
   */
  instanceof(): void {
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
  },

  // The tsconfig.json target is currently es5, so isCategory() does not work properly
  // when the root class "extends Object".
  // We verify this with the notOk() assertion.
  // If we change the target to es6, then isCategory() will work fine.
  // This test will need to be changed to use the ok() assertion.
  edgeCase(): void {
    class Z extends Object {}
    class Y extends Z {}
    class X extends Y {}
    const zInstance = new Z();
    const xInstance = new X();

    ok(xInstance instanceof Object, 'es5 & es6: x IS an instanceof Object');

    // Use these four assertions while we are still targeting es5.
    notOk(isCategory(zInstance, Z), 'es5: z is not the same category as Z');
    notOk(zInstance instanceof Z, 'es5: z is not an instanceof Z');
    notOk(xInstance instanceof Z, 'es5: x is not an instanceof Z');
    notOk(xInstance instanceof Z, 'es5: x is not an instanceof Z');

    // Use these four assertions when we change the tsconfig.json target to es6.
    // These four assertions also pass if we remove "extends Object" from the class Z definition.
    // ok(isCategory(zInstance, Z), 'es6: z IS the same category as Z');
    // ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
    // ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
    // ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
  },
};

export { TypeGuardTests };
