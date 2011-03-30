/**
 * VexFlow - Music Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.KeyManager = {}

Vex.Flow.Test.KeyManager.Start = function() {
  module("KeyManager");
  test("Valid Notes", Vex.Flow.Test.KeyManager.works);
}

Vex.Flow.Test.KeyManager.works = function(options) {
  // expect(1);

  manager = new Vex.Flow.KeyManager("g");
  equals(manager.getAccidental("f").accidental, "#");

  manager.setKey("a");
  equals(manager.getAccidental("c").accidental, "#");
  equals(manager.getAccidental("a").accidental, null);
  equals(manager.getAccidental("f").accidental, "#");

  manager.setKey("f");
  manager.setKey("bb");
}
