import { VexFlowTests } from './vexflow_test_helpers.js';
import { Modifier, ModifierContext } from '../src/index.js';
const ModifierContextTests = {
    Start() {
        QUnit.module('ModifierContext');
        QUnit.test('Modifier Width Test', width);
        QUnit.test('Modifier Management', management);
    },
};
function width(assert) {
    const mc = new ModifierContext();
    assert.equal(mc.getWidth(), 0, 'New modifier context has no width');
}
function management(assert) {
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
