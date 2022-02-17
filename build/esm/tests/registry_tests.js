import { VexFlowTests } from './vexflow_test_helpers.js';
import { EasyScore, Factory, Registry, StaveNote } from '../src/index.js';
const RegistryTests = {
    Start() {
        QUnit.module('Registry');
        test('Register and Clear', registerAndClear);
        test('Default Registry', defaultRegistry);
        test('Multiple Classes', classes);
    },
};
function registerAndClear() {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    registry.register(score.notes('C4')[0], 'foobar');
    const foobar = registry.getElementById('foobar');
    ok(foobar);
    equal(foobar.getAttribute('id'), 'foobar');
    registry.clear();
    notOk(registry.getElementById('foobar'));
    throws(() => registry.register(score.notes('C4')));
    registry.clear();
    ok(registry.register(score.notes('C4[id="boobar"]')[0]).getElementById('boobar'));
}
function defaultRegistry() {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar');
    ok(note);
    note.setAttribute('id', 'boobar');
    ok(registry.getElementById('boobar'));
    notOk(registry.getElementById('foobar'));
    registry.clear();
    equal(registry.getElementsByType(StaveNote.CATEGORY).length, 0);
    score.notes('C5');
    const elements = registry.getElementsByType(StaveNote.CATEGORY);
    equal(elements.length, 1);
}
function classes() {
    const registry = new Registry();
    const score = new EasyScore({ factory: Factory.newFromElementId(null) });
    Registry.enableDefaultRegistry(registry);
    score.notes('C4[id="foobar"]');
    const note = registry.getElementById('foobar');
    note.addClass('foo');
    ok(note.hasClass('foo'));
    notOk(note.hasClass('boo'));
    equal(registry.getElementsByClass('foo').length, 1);
    equal(registry.getElementsByClass('boo').length, 0);
    note.addClass('boo');
    ok(note.hasClass('foo'));
    ok(note.hasClass('boo'));
    equal(registry.getElementsByClass('foo').length, 1);
    equal(registry.getElementsByClass('boo').length, 1);
    note.removeClass('boo');
    note.removeClass('foo');
    notOk(note.hasClass('foo'));
    notOk(note.hasClass('boo'));
    equal(registry.getElementsByClass('foo').length, 0);
    equal(registry.getElementsByClass('boo').length, 0);
}
VexFlowTests.register(RegistryTests);
export { RegistryTests };
