/**
 * VexFlow - Music Key Management Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.KeyManager = (function() {
  var KeyManager = {
    Start: function() {
      QUnit.module('KeyManager');
      test('Valid Notes', VF.Test.KeyManager.works);
      test('Select Notes', VF.Test.KeyManager.selectNotes);
    },

    works: function() {
      // expect(1);

      var manager = new VF.KeyManager('g');
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

    selectNotes: function() {
      var manager = new VF.KeyManager('f');
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
      var note = manager.selectNote('bb');
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

  return KeyManager;
})();
