// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TypeGuard Tests

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, notOk, test } from './declarations';
import { isCategory, isNote, isStaveNote, isStemmableNote, isTabNote } from 'typeguard';
import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';
import { StemmableNote } from 'stemmablenote';

const TypeGuardTests = {
  Start(): void {
    QUnit.module('TypeGuard');
    test('Type Checking', this.typeChecking);
    test('Edge Case', this.edgeCase);
  },

  typeChecking(): void {
    const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
    ok(isStaveNote(s));

    const fakeStaveNote = { getCategory: () => 'stavenotes' };
    ok(isStaveNote(fakeStaveNote));

    const t = new TabNote({ positions: [{ str: 2, fret: 1 }], duration: '1' });
    ok(isTabNote(t));
    notOk(isStaveNote(t));

    const fakeStemmableNote = {
      getCategory() {
        return StemmableNote.CATEGORY;
      },
    };
    ok(isStemmableNote(fakeStemmableNote), 'A JS object that returns the correct category string.');
    notOk(isNote(fakeStemmableNote), 'The fake stemmable note does not have any ancestors with the correct category.');

    ok(isNote(s), 'StaveNote extends StemmableNote which extends Note, so s is a Note');
    ok(isNote(t), 'TabNote extends StemmableNote which extends Note, so t is a Note');
    ok(isStemmableNote(t), 'TabNote extends StemmableNote directly');
    notOk(isNote(fakeStaveNote), 'Fake StaveNote is not a Note, because categories do not match.');
  },

  edgeCase(): void {
    class Z extends Object {}
    const zInstance = new Z();
    notOk(isCategory(zInstance, Z), 'z is not the same category as Z !?');
    notOk(zInstance instanceof Z, 'z is not instanceof Z !?');
  },
};

class A {}

class B extends A {}

class C extends B {}

class X {}

class Y extends X {}

export { TypeGuardTests };
