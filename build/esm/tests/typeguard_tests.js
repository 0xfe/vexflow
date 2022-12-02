import { VexFlowTests } from './vexflow_test_helpers.js';
import { CanvasContext } from '../src/canvascontext.js';
import { StaveNote } from '../src/stavenote.js';
import { StemmableNote } from '../src/stemmablenote.js';
import { TabNote } from '../src/tabnote.js';
import { isCategory, isNote, isRenderContext, isStaveNote, isStemmableNote, isTabNote } from '../src/typeguard.js';
const TypeGuardTests = {
    Start() {
        QUnit.module('TypeGuard');
        test('Real VexFlow Types', real);
        test('Fake VexFlow Types in ES5', fakeES5);
        test('Fake VexFlow Types in ES6', fakeES6);
        test('Edge Case ES5/ES6', edgeCaseES5vsES6);
    },
};
function real() {
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
    const ctx = new CanvasContext(canvas.getContext('2d'));
    ok(isRenderContext(ctx), 'ctx is a RenderContext');
}
function checkFakeObjects(fakeStemmableNote, fakeStaveNote) {
    ok(isStemmableNote(fakeStemmableNote), 'Fake StemmableNote is a StemmableNote.');
    notOk(isNote(fakeStemmableNote), 'Fake StemmableNote is not a Note (no ancestors with the correct CATEGORY).');
    ok(isCategory(fakeStaveNote, 'StaveNote'), 'Fake StaveNote is a StaveNote.');
    ok(isStaveNote(fakeStaveNote), 'Fake StaveNote is a StaveNote (via helper function).');
    ok(isCategory(fakeStaveNote, 'StemmableNote'), 'Fake StaveNote is also a StemmableNote (via inheritance).');
    notOk(isNote(fakeStaveNote), 'Fake StaveNote is not a Note. CATEGORY does not match.');
}
function fakeES5() {
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
function fakeES6() {
    class FakeStemmableNote {
    }
    FakeStemmableNote.CATEGORY = StemmableNote.CATEGORY;
    class FakeStaveNote extends FakeStemmableNote {
    }
    FakeStaveNote.CATEGORY = StaveNote.CATEGORY;
    const fakeStemmableNote = new FakeStemmableNote();
    const fakeStaveNote = new FakeStaveNote();
    checkFakeObjects(fakeStemmableNote, fakeStaveNote);
}
function edgeCaseES5vsES6() {
    class Z extends Object {
    }
    class Y extends Z {
    }
    class X extends Y {
    }
    const zInstance = new Z();
    const xInstance = new X();
    ok(xInstance instanceof Object, 'es5 & es6: x IS an instanceof Object');
    ok(zInstance instanceof Z, 'es6: z IS an instanceof Z');
    ok(xInstance instanceof Y, 'es6: x IS an instanceof Y');
    ok(xInstance instanceof Z, 'es6: x IS an instanceof Z');
}
VexFlowTests.register(TypeGuardTests);
export { TypeGuardTests };
