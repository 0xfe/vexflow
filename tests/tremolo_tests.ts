// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Tremolo Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Barline } from '../src/stavebarline';
import { Tremolo } from '../src/tremolo';

const TremoloTests = {
  Start(): void {
    QUnit.module('Tremolo');
    const run = VexFlowTests.runTests;
    run('Tremolo - Basic', tremoloBasic);
    run('Tremolo - Big', tremoloBig);
  },
};

function tremoloBasic(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 200);
  const score = f.EasyScore();

  // bar 1
  const stave1 = f.Stave({ width: 250 }).setEndBarType(Barline.type.DOUBLE);

  const notes1 = score.notes('e4/4, e4, e4, e4', { stem: 'up' });

  notes1[0].addModifier(new Tremolo(3), 0);
  notes1[1].addModifier(new Tremolo(2), 0);
  notes1[2].addModifier(new Tremolo(1), 0);

  const voice1 = score.voice(notes1);

  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  // bar 2
  const stave2 = f
    .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
    .setEndBarType(Barline.type.DOUBLE);

  const notes2 = score.notes('e5/4, e5, e5, e5', { stem: 'down' });

  notes2[1].addModifier(new Tremolo(1), 0);
  notes2[2].addModifier(new Tremolo(2), 0);
  notes2[3].addModifier(new Tremolo(3), 0);

  const voice2 = score.voice(notes2);

  f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

  f.draw();

  options.assert.ok(true, 'Tremolo - Basic');
}

function tremoloBig(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 600, 200);
  const score = f.EasyScore();

  // bar 1
  const stave1 = f.Stave({ width: 250 }).setEndBarType(Barline.type.DOUBLE);

  const notes1 = score.notes('e4/4, e4, e4, e4', { stem: 'up' });

  const tremolo1 = new Tremolo(3);
  tremolo1.extra_stroke_scale = 1.7;
  tremolo1.y_spacing_scale = 1.5;
  const tremolo2 = new Tremolo(2);
  tremolo2.extra_stroke_scale = 1.7;
  tremolo2.y_spacing_scale = 1.5;
  const tremolo3 = new Tremolo(1);
  tremolo3.extra_stroke_scale = 1.7;
  tremolo3.y_spacing_scale = 1.5;
  notes1[0].addModifier(tremolo1, 0);
  notes1[1].addModifier(tremolo2, 0);
  notes1[2].addModifier(tremolo3, 0);

  const voice1 = score.voice(notes1);

  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  // bar 2
  const stave2 = f
    .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
    .setEndBarType(Barline.type.DOUBLE);

  const notes2 = score.notes('e5/4, e5, e5, e5', { stem: 'down' });

  const tremolo4 = new Tremolo(1);
  tremolo4.extra_stroke_scale = 1.7;
  tremolo4.y_spacing_scale = 1.5;
  const tremolo5 = new Tremolo(2);
  tremolo5.extra_stroke_scale = 1.7;
  tremolo5.y_spacing_scale = 1.5;
  const tremolo6 = new Tremolo(3);
  tremolo6.extra_stroke_scale = 1.7;
  tremolo6.y_spacing_scale = 1.5;
  notes2[1].addModifier(tremolo4, 0);
  notes2[2].addModifier(tremolo5, 0);
  notes2[3].addModifier(tremolo6, 0);

  const voice2 = score.voice(notes2);

  f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

  f.draw();

  options.assert.ok(true, 'Tremolo - Big');
}

VexFlowTests.register(TremoloTests);
export { TremoloTests };
