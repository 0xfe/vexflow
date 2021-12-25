// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Music Key Management Tests
//
// TODO: KeyManager.getAccidental(key) specifies that the return value's .accidental property is string | undefined.
//       However, we check it against null.

import { VexFlowTests } from './vexflow_test_helpers';

import { KeyManager } from '../src/index';

const KeyManagerTests = {
  Start(): void {
    QUnit.module('KeyManager');
    test('Valid Notes', works);
    test('Select Notes', selectNotes);
  },
};

function works(): void {
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
}

function selectNotes(): void {
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
}

VexFlowTests.register(KeyManagerTests);
export { KeyManagerTests };
