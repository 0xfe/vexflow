// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Registry Tests

import { VexFlowTests } from './vexflow_test_helpers';

import { EasyScore, Element, Factory, Registry, StaveNote } from '../src/index';

const RegistryTests = {
  Start(): void {
    QUnit.module('Registry');
    QUnit.test('Register and Clear', registerAndClear);
    QUnit.test('Default Registry', defaultRegistry);
    QUnit.test('Multiple Classes', classes);
  },
};

function registerAndClear(assert: Assert): void {
  const registry = new Registry();
  const score = new EasyScore({ factory: Factory.newFromElementId(null) });

  registry.register(score.notes('C4')[0], 'foobar');

  const foobar = registry.getElementById('foobar') as Element;
  assert.ok(foobar);
  assert.equal(foobar.getAttribute('id'), 'foobar');

  registry.clear();
  assert.notOk(registry.getElementById('foobar'));

  // eslint-disable-next-line
  // @ts-ignore: intentional type mismatch to trigger an error.
  assert.throws(() => registry.register(score.notes('C4')));

  registry.clear();
  assert.ok(registry.register(score.notes('C4[id="boobar"]')[0]).getElementById('boobar'));
}

function defaultRegistry(assert: Assert): void {
  const registry = new Registry();
  const score = new EasyScore({ factory: Factory.newFromElementId(null) });

  Registry.enableDefaultRegistry(registry);
  score.notes('C4[id="foobar"]');
  const note = registry.getElementById('foobar') as Element;
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

function classes(assert: Assert): void {
  const registry = new Registry();
  const score = new EasyScore({ factory: Factory.newFromElementId(null) });

  Registry.enableDefaultRegistry(registry);
  score.notes('C4[id="foobar"]');
  const note = registry.getElementById('foobar') as Element;

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
