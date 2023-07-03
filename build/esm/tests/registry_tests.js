import { VexFlowTests } from './vexflow_test_helpers.js';
import { EasyScore, Factory, Registry, StaveNote } from '../src/index.js';
const RegistryTests = {
    Start() {
        QUnit.module('Registry');
        QUnit.test('Register and Clear', registerAndClear);
        QUnit.test('Default Registry', defaultRegistry);
        QUnit.test('Multiple Classes', classes);
    },
};
function registerAndClear(assert) {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    registry.register(score.notes('C4')[0], 'foobar');
    const foobar = registry.getElementById('foobar');
    assert.ok(foobar);
    assert.equal(foobar.getAttribute('id'), 'foobar');
    registry.clear();
    assert.notOk(registry.getElementById('foobar'));
    assert.throws(() => registry.register(score.notes('C4')));
    registry.clear();
    assert.ok(registry.register(score.notes('C4[id="boobar"]')[0]).getElementById('boobar'));
}
function defaultRegistry(assert) {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar');
    assert.ok(note);
    note.setAttribute('id', 'boobar');
    assert.ok(registry.getElementById('boobar'));
    assert.notOk(registry.getElementById('foobar'));
    registry.clear();
    assert.equal(registry.getElementsByType(StaveNote.CATEGORY).length, 0);
    score.notes('C5');
    const elements = registry.getElementsByType(StaveNote.CATEGORY);
    assert.equal(elements.length, 1);
}
function classes(assert) {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar');
    note.addClass('foo');
    assert.ok(note.hasClass('foo'));
    assert.notOk(note.hasClass('boo'));
    assert.equal(registry.getElementsByClass('foo').length, 1);
    assert.equal(registry.getElementsByClass('boo').length, 0);
    note.addClass('boo');
    assert.ok(note.hasClass('foo'));
    assert.ok(note.hasClass('boo'));
    assert.equal(registry.getElementsByClass('foo').length, 1);
    assert.equal(registry.getElementsByClass('boo').length, 1);
    note.removeClass('boo');
    note.removeClass('foo');
    assert.notOk(note.hasClass('foo'));
    assert.notOk(note.hasClass('boo'));
    assert.equal(registry.getElementsByClass('foo').length, 0);
    assert.equal(registry.getElementsByClass('boo').length, 0);
}
VexFlowTests.register(RegistryTests);
export { RegistryTests };
