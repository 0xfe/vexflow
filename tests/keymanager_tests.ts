// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Music Key Management Tests

import { QUnit, test, equal } from './types/qunit';
import { KeyManager } from 'keymanager';

const KeyManagerTests = {
  Start(): void {
    QUnit.module('KeyManager');
    test('Valid Notes', this.works);
    test('Select Notes', this.selectNotes);
  },

  works(): void {
    const manager = new KeyManager('g');
    equal(manager.getAccidental('f').accidental, '#');

    manager.setKey('a');
    equal(manager.getAccidental('c').accidental, '#');
    equal(manager.getAccidental('a').accidental, null);
    equal(manager.getAccidental('f').accidental, '#');

    manager.setKey('A');
    equal(manager.getAccidental('c').accidental, '#');
    equal(manager.getAccidental('a').accidental, null);
    equal(manager.getAccidental('f').accidental, '#');
  },

  selectNotes(): void {
    const manager = new KeyManager('f');
    equal(manager.selectNote('bb').note, 'bb');
    equal(manager.selectNote('bb').accidental, 'b');
    equal(manager.selectNote('g').note, 'g');
    equal(manager.selectNote('g').accidental, null);
    equal(manager.selectNote('b').note, 'b');
    equal(manager.selectNote('b').accidental, null);
    equal(manager.selectNote('a#').note, 'bb');
    equal(manager.selectNote('g#').note, 'g#');

    // Changes have no effect?
    equal(manager.selectNote('g#').note, 'g#');
    equal(manager.selectNote('bb').note, 'bb');
    equal(manager.selectNote('bb').accidental, 'b');
    equal(manager.selectNote('g').note, 'g');
    equal(manager.selectNote('g').accidental, null);
    equal(manager.selectNote('b').note, 'b');
    equal(manager.selectNote('b').accidental, null);
    equal(manager.selectNote('a#').note, 'bb');
    equal(manager.selectNote('g#').note, 'g#');

    // Changes should propagate
    manager.reset();
    equal(manager.selectNote('g#').change, true);
    equal(manager.selectNote('g#').change, false);
    equal(manager.selectNote('g').change, true);
    equal(manager.selectNote('g').change, false);
    equal(manager.selectNote('g#').change, true);

    manager.reset();
    let note = manager.selectNote('bb');
    equal(note.change, false);
    equal(note.accidental, 'b');
    note = manager.selectNote('g');
    equal(note.change, false);
    equal(note.accidental, null);
    note = manager.selectNote('g#');
    equal(note.change, true);
    equal(note.accidental, '#');
    note = manager.selectNote('g');
    equal(note.change, true);
    equal(note.accidental, null);
    note = manager.selectNote('g');
    equal(note.change, false);
    equal(note.accidental, null);
    note = manager.selectNote('g#');
    equal(note.change, true);
    equal(note.accidental, '#');
  },
};

export { KeyManagerTests };
