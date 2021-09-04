// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TabStave Tests

import { VexFlowTests, TestOptions } from './vexflow_test_helpers';
import { ContextBuilder } from 'renderer';
import { Barline } from 'stavebarline';
import { TabStave } from 'tabstave';

const TabStaveTests = {
  Start(): void {
    QUnit.module('TabStave');
    const run = VexFlowTests.runTests;
    run('TabStave Draw Test', draw);
    run('Vertical Bar Test', drawVerticalBar);
  },
};

function draw(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 160);
  const stave = new TabStave(10, 10, 300);
  stave.setNumLines(6);
  stave.setContext(ctx);
  stave.draw();

  equal(stave.getYForNote(0), 127, 'getYForNote(0)');
  equal(stave.getYForLine(5), 127, 'getYForLine(5)');
  equal(stave.getYForLine(0), 62, 'getYForLine(0) - Top Line');
  equal(stave.getYForLine(4), 114, 'getYForLine(4) - Bottom Line');

  ok(true, 'all pass');
}

function drawVerticalBar(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 400, 160);
  const stave = new TabStave(10, 10, 300);
  stave.setNumLines(6);
  stave.setContext(ctx);
  stave.drawVerticalBar(50);
  stave.drawVerticalBar(100);
  stave.drawVerticalBar(150);
  stave.setEndBarType(Barline.type.END);
  stave.draw();

  ok(true, 'all pass');
}

export { TabStaveTests };
