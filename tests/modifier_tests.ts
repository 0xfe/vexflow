// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// ModifierContext Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { Modifier, ModifierContext } from '../src/index';

const ModifierContextTests = {
  Start(): void {
    QUnit.module('ModifierContext');
    QUnit.test('Modifier Width Test', width);
    QUnit.test('Modifier Management', management);
  },
};

function width(assert: Assert): void {
  const mc = new ModifierContext();
  assert.equal(mc.getWidth(), 0, 'New modifier context has no width');
}

function management(assert: Assert): void {
  const mc = new ModifierContext();
  const modifier1 = new Modifier();
  const modifier2 = new Modifier();

  mc.addMember(modifier1);
  mc.addMember(modifier2);

  const modifiers = mc.getMembers(Modifier.CATEGORY);
  assert.equal(modifiers.length, 2, 'Added two modifiers');
}

VexFlowTests.register(ModifierContextTests);
export { ModifierContextTests };
