// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { Modifier } from 'modifier';
import { ModifierContext } from 'modifiercontext';
import { QUnit, test, equal } from './declarations';

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
    const mc = new ModifierContext();
    equal(mc.getWidth(), 0, 'New modifier context has no width');
  },

  management() {
    const mc = new ModifierContext();
    const modifier1 = new Modifier();
    const modifier2 = new Modifier();

    mc.addMember(modifier1);
    mc.addMember(modifier2);

    const accidentals = mc.getMembers('none');

    equal(accidentals.length, 2, 'Added two modifiers');
  },
};

export { ModifierContextTests };
