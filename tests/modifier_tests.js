/**
 * VexFlow - Modifier Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.ModifierContext = {}

Vex.Flow.Test.ModifierContext.Start = function() {
  module("ModifierContext");
  test("Modifier Width Test", Vex.Flow.Test.ModifierContext.width);
  test("Modifier Management", Vex.Flow.Test.ModifierContext.management);
}

Vex.Flow.Test.ModifierContext.width = function() {
  var mc = new Vex.Flow.ModifierContext();
  equal(mc.getWidth(), 0, "New modifier context has no width");
}

Vex.Flow.Test.ModifierContext.management = function() {
  var mc = new Vex.Flow.ModifierContext();
  var modifier1 = new Vex.Flow.Modifier();
  var modifier2 = new Vex.Flow.Modifier();

  mc.addModifier(modifier1);
  mc.addModifier(modifier2);

  var accidentals = mc.getModifiers("none");

  equal(accidentals.length, 2, "Added two modifiers");
}
