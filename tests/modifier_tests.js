/**
 * VexFlow - ModifierContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ModifierContext = (function() {
  var ModifierContext = {
    Start: function() {
      QUnit.module("ModifierContext");
      test("Modifier Width Test", ModifierContext.width);
      test("Modifier Management", ModifierContext.management);
    },

    width: function() {
      var mc = new VF.ModifierContext();
      equal(mc.getWidth(), 0, "New modifier context has no width");
    },

    management: function() {
      var mc = new VF.ModifierContext();
      var modifier1 = new VF.Modifier();
      var modifier2 = new VF.Modifier();

      mc.addModifier(modifier1);
      mc.addModifier(modifier2);

      var accidentals = mc.getModifiers("none");

      equal(accidentals.length, 2, "Added two modifiers");
    },
  }

  return ModifierContext;
})();