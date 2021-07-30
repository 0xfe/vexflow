// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { equal, ok, QUnit } from './declarations';
import { Stave } from 'stave';
import { Barline } from 'stavebarline';
import { StaveModifier } from 'stavemodifier';

/**
 * StaveModifier Tests
 */
const StaveModifierTests = {
  Start: function () {
    QUnit.module('StaveModifier');
    VexFlowTests.runTests('Stave Draw Test', StaveModifierTests.draw);
    VexFlowTests.runTests('Vertical Bar Test', StaveModifierTests.drawVerticalBar);
    VexFlowTests.runTests('Begin & End StaveModifier Test', StaveModifierTests.drawBeginAndEnd);
  },

  draw(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 400, 120);
    const stave = new Stave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();

    equal(stave.getYForNote(0), 100, 'getYForNote(0)');
    equal(stave.getYForLine(5), 100, 'getYForLine(5)');
    equal(stave.getYForLine(0), 50, 'getYForLine(0) - Top Line');
    equal(stave.getYForLine(4), 90, 'getYForLine(4) - Bottom Line');

    ok(true, 'all pass');
  },

  /**
   * Draw three vertical lines. The last line is not visible, because it overlaps
   * the right border of the stave at x = 300.
   */
  drawVerticalBar(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 400, 120);
    const stave = new Stave(10, 10, 300);
    stave.setContext(ctx);
    stave.draw();
    stave.drawVerticalBar(100);
    stave.drawVerticalBar(150);
    stave.drawVerticalBar(300);

    ok(true, 'all pass');
  },

  drawBeginAndEnd(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 500, 240);
    const stave = new Stave(10, 10, 400);
    stave.setContext(ctx);
    stave.setTimeSignature('C|');
    stave.setKeySignature('Db');
    stave.setClef('treble');
    stave.setBegBarType(Barline.type.REPEAT_BEGIN);
    stave.setEndClef('alto');
    stave.setEndTimeSignature('9/8');
    stave.setEndKeySignature('G', 'C#');
    stave.setEndBarType(Barline.type.DOUBLE);
    stave.draw();

    // change
    const END = StaveModifier.Position.END;
    stave.setY(100);
    stave.setTimeSignature('3/4');
    stave.setKeySignature('G', 'C#');
    stave.setClef('bass');
    stave.setBegBarType(Barline.type.SINGLE);
    stave.setClef('treble', undefined, undefined, END);
    stave.setTimeSignature('C', undefined, END);
    stave.setKeySignature('F', undefined, END);
    stave.setEndBarType(Barline.type.SINGLE);
    stave.draw();

    ok(true, 'all pass');
  },
};

export { StaveModifierTests };
