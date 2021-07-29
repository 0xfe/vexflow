// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* xeslint-disable */
// x@ts-nocheck

/**
 * ModifierContext Tests
 */
const ModifierContextTests = {
  Start() {
    QUnit.module('ModifierContext');
    test('Modifier Width Test', this.width);
    test('Modifier Management', this.management);
  },

  width() {
    var mc = new VF.ModifierContext();
    equal(mc.getWidth(), 0, 'New modifier context has no width');
  },

  management() {
    var mc = new VF.ModifierContext();
    var modifier1 = new VF.Modifier();
    var modifier2 = new VF.Modifier();

    mc.addMember(modifier1);
    mc.addMember(modifier2);

    var accidentals = mc.getMembers('none');

    equal(accidentals.length, 2, 'Added two modifiers');
  },
};

export { ModifierContextTests };
