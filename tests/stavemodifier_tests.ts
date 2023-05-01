// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveModifier Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { BarlineType } from '../src/stavebarline';
import { StaveModifierPosition } from '../src/stavemodifier';

const StaveModifierTests = {
  Start(): void {
    QUnit.module('StaveModifier');
    const run = VexFlowTests.runTests;
    run('Stave Draw Test', draw);
    run('Begin & End StaveModifier Test', drawBeginAndEnd);
  },
};

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 120);
  const stave = new Stave(10, 10, 300);
  stave.setContext(ctx);
  stave.draw();

  options.assert.equal(stave.getYForNote(0), 100, 'getYForNote(0)');
  options.assert.equal(stave.getYForLine(5), 100, 'getYForLine(5)');
  options.assert.equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
  options.assert.equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

  options.assert.ok(true, 'all pass');
}

function drawBeginAndEnd(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 500, 240);
  const stave = new Stave(10, 10, 400);
  stave.setContext(ctx);
  stave.setTimeSignature('C|');
  stave.setKeySignature('Db');
  stave.setClef('treble');
  stave.setBegBarType(BarlineType.REPEAT_BEGIN);
  stave.setEndClef('alto');
  stave.setEndTimeSignature('9/8');
  stave.setEndKeySignature('G', 'C#');
  stave.setEndBarType(BarlineType.DOUBLE);
  stave.draw();

  // change
  const END = StaveModifierPosition.END;
  stave.setY(100);
  stave.setTimeSignature('3/4');
  stave.setKeySignature('G', 'C#');
  stave.setClef('bass');
  stave.setBegBarType(BarlineType.SINGLE);
  stave.setClef('treble', undefined, undefined, END);
  stave.setTimeSignature('C', undefined, END);
  stave.setKeySignature('F', undefined, END);
  stave.setEndBarType(BarlineType.SINGLE);
  stave.draw();

  options.assert.ok(true, 'all pass');
}

VexFlowTests.register(StaveModifierTests);
export { StaveModifierTests };
