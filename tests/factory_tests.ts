// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Factory Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Factory } from '../src/factory';
import { Barline } from '../src/stavebarline';

const FactoryTests = {
  Start(): void {
    QUnit.module('Factory');
    QUnit.test('Defaults', defaults);
    const run = VexFlowTests.runTests;
    run('Draw', draw);
    run('Draw Tab (repeat barlines must be aligned)', drawTab);
  },
};

function defaults(assert: Assert): void {
  // Throws RuntimeError: 'HTML DOM element not set in Factory'
  assert.throws(
    () => new Factory({ renderer: { elementId: '', width: 700, height: 500 } }),
    'Empty string for elementId throws an exception.'
  );

  const factory = new Factory({
    renderer: { elementId: null, width: 700, height: 500 },
  });

  // eslint-disable-next-line
  // @ts-ignore access a protected member for testing purposes.
  const options = factory.options;
  assert.equal(options.renderer.width, 700);
  assert.equal(options.renderer.height, 500);
  assert.equal(options.renderer.elementId, null);
  assert.equal(options.stave.space, 10);
}

function draw(options: TestOptions): void {
  const f = Factory.newFromElementId(options.elementId);
  f.Stave().setClef('treble');
  f.draw();
  options.assert.expect(0);
}

function drawTab(options: TestOptions): void {
  const factory = VexFlowTests.makeFactory(options, 500, 400);
  const system = factory.System({ width: 500 });
  const stave = factory.Stave().setClef('treble').setKeySignature('C#').setBegBarType(Barline.type.REPEAT_BEGIN);
  const voices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
  system.addStave({ stave, voices });

  const tabStave = factory.TabStave().setClef('tab').setBegBarType(Barline.type.REPEAT_BEGIN);
  const tabVoices = [factory.Voice().addTickables([factory.GhostNote({ duration: 'w' })])];
  system.addStave({ stave: tabStave, voices: tabVoices });

  factory.draw();
  options.assert.equal(stave.getModifiers()[0].getX(), tabStave.getModifiers()[0].getX());
  options.assert.expect(1);
}

VexFlowTests.register(FactoryTests);
export { FactoryTests };
