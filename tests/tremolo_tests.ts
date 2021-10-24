// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Tremolo Tests

import { Barline } from 'stavebarline';
import { Tremolo } from 'tremolo';

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const TremoloTests = {
  Start(): void {
    QUnit.module('Tremolo');
    const run = VexFlowTests.runTests;
    run('Tremolo - Basic', tremoloBasic);
  },
};

function tremoloBasic(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 200);
  const score = f.EasyScore();

  // bar 1
  const stave1 = f.Stave({ width: 250 }).setEndBarType(Barline.type.DOUBLE);

  const notes1 = score.notes('e4/4, e4, e4, e4', { stem: 'up' });

  notes1[0].addModifier(new Tremolo(3));
  notes1[1].addModifier(new Tremolo(2));
  notes1[2].addModifier(new Tremolo(1));

  const voice1 = score.voice(notes1);

  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  // bar 2
  const stave2 = f
    .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
    .setEndBarType(Barline.type.DOUBLE);

  const notes2 = score.notes('e5/4, e5, e5, e5', { stem: 'down' });

  notes2[1].addModifier(new Tremolo(1));
  notes2[2].addModifier(new Tremolo(2));
  notes2[3].addModifier(new Tremolo(3));

  const voice2 = score.voice(notes2);

  f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

  f.draw();

  ok(true, 'Tremolo - Basic');
}

export { TremoloTests };
