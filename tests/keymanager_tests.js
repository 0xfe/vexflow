/**
 * VexFlow - Music Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.KeyManager = {}

Vex.Flow.Test.KeyManager.Start = function() {
  module("KeyManager");
  test("Valid Notes", Vex.Flow.Test.KeyManager.works);
  test("Select Notes", Vex.Flow.Test.KeyManager.selectNotes);
}

Vex.Flow.Test.KeyManager.works = function(options) {
  // expect(1);

  manager = new Vex.Flow.KeyManager("g");
  equals(manager.getAccidental("f").accidental, "#");

  manager.setKey("a");
  equals(manager.getAccidental("c").accidental, "#");
  equals(manager.getAccidental("a").accidental, null);
  equals(manager.getAccidental("f").accidental, "#");

  manager.setKey("A");
  equals(manager.getAccidental("c").accidental, "#");
  equals(manager.getAccidental("a").accidental, null);
  equals(manager.getAccidental("f").accidental, "#");
}

Vex.Flow.Test.KeyManager.selectNotes = function(options) {
  manager = new Vex.Flow.KeyManager("f");
  equals(manager.selectNote("bb").note, "bb");
  equals(manager.selectNote("bb").accidental, "b");
  equals(manager.selectNote("g").note, "g");
  equals(manager.selectNote("g").accidental, null);
  equals(manager.selectNote("b").note, "b");
  equals(manager.selectNote("b").accidental, null);
  equals(manager.selectNote("a#").note, "bb");
  equals(manager.selectNote("g#").note, "g#");

  // Changes have no effect?
  equals(manager.selectNote("g#").note, "g#");
  equals(manager.selectNote("bb").note, "bb");
  equals(manager.selectNote("bb").accidental, "b");
  equals(manager.selectNote("g").note, "g");
  equals(manager.selectNote("g").accidental, null);
  equals(manager.selectNote("b").note, "b");
  equals(manager.selectNote("b").accidental, null);
  equals(manager.selectNote("a#").note, "bb");
  equals(manager.selectNote("g#").note, "g#");

  // Changes should propagate
  manager.reset();
  equals(manager.selectNote("g#").change, true);
  equals(manager.selectNote("g#").change, false);
  equals(manager.selectNote("g").change, true);
  equals(manager.selectNote("g").change, false);
  equals(manager.selectNote("g#").change, true);

  manager.reset();
  note = manager.selectNote("bb");
  equals(note.change, false);
  equals(note.accidental, "b");
  note = manager.selectNote("g");
  equals(note.change, false);
  equals(note.accidental, null);
  note = manager.selectNote("g#");
  equals(note.change, true);
  equals(note.accidental, "#");
  note = manager.selectNote("g");
  equals(note.change, true);
  equals(note.accidental, null);
  note = manager.selectNote("g");
  equals(note.change, false);
  equals(note.accidental, null);
  note = manager.selectNote("g#");
  equals(note.change, true);
  equals(note.accidental, "#");
}
