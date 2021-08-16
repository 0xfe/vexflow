// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TypeGuard Tests

import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, notOk } from './declarations';
import { isCategory, isNote, isStaveNote, isStemmableNote, isTabNote } from 'typeguard';
import { StaveNote } from 'stavenote';
import { TabNote } from 'tabnote';
import { StemmableNote } from 'stemmablenote';

const TypeGuardTests = {
  Start(): void {
    QUnit.module('TypeGuard');
    VexFlowTests.runTests('Type Checking', this.typeChecking);
    VexFlowTests.runTests('Edge Case', this.edgeCase);
  },

  typeChecking(): void {
    const s = new StaveNote({ keys: ['c/4'], duration: 'w' });
    ok(isCategory(s, StaveNote));

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
    ok(isStemmableNote(fakeStemmableNote));

    ok(isNote(s));
    ok(isNote(t));
    ok(isNote(fakeStaveNote));
  },

  edgeCase(): void {
    class Z extends Object {}
    const zInstance = new Z();
    ok(isCategory(zInstance, Z));
    ok(zInstance instanceof Z);
  },
};

class A {}

class B extends A {}

class C extends B {}

class X {}

class Y extends X {}

export { TypeGuardTests };
