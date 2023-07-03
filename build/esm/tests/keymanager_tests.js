import { VexFlowTests } from './vexflow_test_helpers.js';
import { KeyManager } from '../src/index.js';
const KeyManagerTests = {
    Start() {
        QUnit.module('KeyManager');
        QUnit.test('Valid Notes', works);
        QUnit.test('Select Notes', selectNotes);
    },
};
function works(assert) {
    const manager = new KeyManager('g');
    assert.equal(manager.getAccidental('f').accidental, '#');
    manager.setKey('a');
    assert.equal(manager.getAccidental('c').accidental, '#');
    assert.equal(manager.getAccidental('a').accidental, null);
    assert.equal(manager.getAccidental('f').accidental, '#');
    manager.setKey('A');
    assert.equal(manager.getAccidental('c').accidental, '#');
    assert.equal(manager.getAccidental('a').accidental, null);
    assert.equal(manager.getAccidental('f').accidental, '#');
}
function selectNotes(assert) {
    const manager = new KeyManager('f');
    assert.equal(manager.selectNote('bb').note, 'bb');
    assert.equal(manager.selectNote('bb').accidental, 'b');
    assert.equal(manager.selectNote('g').note, 'g');
    assert.equal(manager.selectNote('g').accidental, null);
    assert.equal(manager.selectNote('b').note, 'b');
    assert.equal(manager.selectNote('b').accidental, null);
    assert.equal(manager.selectNote('a#').note, 'bb');
    assert.equal(manager.selectNote('g#').note, 'g#');
    assert.equal(manager.selectNote('g#').note, 'g#');
    assert.equal(manager.selectNote('bb').note, 'bb');
    assert.equal(manager.selectNote('bb').accidental, 'b');
    assert.equal(manager.selectNote('g').note, 'g');
    assert.equal(manager.selectNote('g').accidental, null);
    assert.equal(manager.selectNote('b').note, 'b');
    assert.equal(manager.selectNote('b').accidental, null);
    assert.equal(manager.selectNote('a#').note, 'bb');
    assert.equal(manager.selectNote('g#').note, 'g#');
    manager.reset();
    assert.equal(manager.selectNote('g#').change, true);
    assert.equal(manager.selectNote('g#').change, false);
    assert.equal(manager.selectNote('g').change, true);
    assert.equal(manager.selectNote('g').change, false);
    assert.equal(manager.selectNote('g#').change, true);
    manager.reset();
    let note = manager.selectNote('bb');
    assert.equal(note.change, false);
    assert.equal(note.accidental, 'b');
    note = manager.selectNote('g');
    assert.equal(note.change, false);
    assert.equal(note.accidental, null);
    note = manager.selectNote('g#');
    assert.equal(note.change, true);
    assert.equal(note.accidental, '#');
    note = manager.selectNote('g');
    assert.equal(note.change, true);
    assert.equal(note.accidental, null);
    note = manager.selectNote('g');
    assert.equal(note.change, false);
    assert.equal(note.accidental, null);
    note = manager.selectNote('g#');
    assert.equal(note.change, true);
    assert.equal(note.accidental, '#');
}
VexFlowTests.register(KeyManagerTests);
export { KeyManagerTests };
