/**
 * VexFlow - ModifierContext Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
const ModifierContextTests = (function () {
  var ModifierContext = {
    Start: function () {
      QUnit.module('ModifierContext');
      test('Modifier Width Test', ModifierContext.width);
      test('Modifier Management', ModifierContext.management);
    },

    width: function () {
      var mc = new VF.ModifierContext();
      equal(mc.getWidth(), 0, 'New modifier context has no width');
    },

    management: function () {
      var mc = new VF.ModifierContext();
      var modifier1 = new VF.Modifier();
      var modifier2 = new VF.Modifier();

      mc.addMember(modifier1);
      mc.addMember(modifier2);

      var accidentals = mc.getMembers('none');

      equal(accidentals.length, 2, 'Added two modifiers');
    },
  };

  return ModifierContext;
})();
VF.Test.ModifierContext = ModifierContextTests;
export { ModifierContextTests };
