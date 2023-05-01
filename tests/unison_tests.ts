// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Unison Tests
import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Tables } from '../src/tables';

const UnisonTests = {
  Start(): void {
    QUnit.module('Unison');
    const run = VexFlowTests.runTests;
    run('Simple(true)', simple, { unison: true, voice1: 'e4/q, e4/q, e4/h', voice2: 'e4/8, e4/8, e4/q, e4/h' });
    run('Simple(false)', simple, { unison: false, voice1: 'e4/q, e4/q, e4/h', voice2: 'e4/8, e4/8, e4/q, e4/h' });
    run('Accidentals(true)', simple, {
      unison: true,
      voice1: 'e4/q, e#4/q, e#4/h',
      voice2: 'e4/8, e4/8, eb4/q, eb4/h',
    });
    run('Accidentals(false)', simple, {
      unison: false,
      voice1: 'e4/q, e#4/q, e#4/h',
      voice2: 'e4/8, e4/8, eb4/q, eb4/h',
    });
    run('Dots(true)', simple, { unison: true, voice1: 'e4/q.., e4/16, e4/h', voice2: '(a4 e4)/q., e4/8, e4/h' });
    run('Dots(false)', simple, { unison: false, voice1: 'e4/q.., e4/16, e4/h', voice2: '(a4 e4)/q., e4/8, e4/h' });
    run('Breve(true)', breve, { unison: true });
    run('Breve(false)', breve, { unison: false });
    run('Style(true)', style, { unison: true });
    run('Style(false)', style, { unison: false });
  },
};

function simple(options: TestOptions): void {
  Tables.UNISON = options.params.unison;
  const vf = VexFlowTests.makeFactory(options, 500, 200);
  const score = vf.EasyScore();

  const system = vf.System({ y: 40, x: 10, width: 400 });
  system.addStave({
    voices: [score.voice(score.notes(options.params.voice1)), score.voice(score.notes(options.params.voice2))],
  });

  system.getStaves()[0].setClef('treble');
  system.getStaves()[0].setTimeSignature('4/4');
  vf.draw();
  options.assert.expect(0);
}

function style(options: TestOptions): void {
  Tables.UNISON = options.params.unison;
  const vf = VexFlowTests.makeFactory(options, 500, 200);
  const score = vf.EasyScore();

  const system = vf.System({ y: 40, x: 10, width: 400 });
  const notes1 = score.notes('e4/q, e4/q, e4/h');
  const notes2 = score.notes('e4/8, e4/8, e4/q, e4/h');
  notes1[2].setStyle({ fillStyle: 'blue', strokeStyle: 'blue' });
  notes2[3].setStyle({ fillStyle: 'green', strokeStyle: 'green' });
  system.addStave({
    voices: [score.voice(notes1), score.voice(notes2)],
  });

  system.getStaves()[0].setClef('treble');
  system.getStaves()[0].setTimeSignature('4/4');
  vf.draw();
  options.assert.expect(0);
}

function breve(options: TestOptions): void {
  Tables.UNISON = options.params.unison;
  const vf = VexFlowTests.makeFactory(options, 500, 200);
  const score = vf.EasyScore();

  const system = vf.System({ y: 40, x: 10, width: 400 });
  system.addStave({
    voices: [
      score.voice([vf.StaveNote({ keys: ['e/4'], duration: '1/2' })], { time: '8/4' }),
      score.voice(score.notes('e4/1, e4/1'), { time: '8/4' }),
    ],
  });

  system.getStaves()[0].setClef('treble');
  system.getStaves()[0].setTimeSignature('8/4');
  vf.draw();
  options.assert.expect(0);
}

VexFlowTests.register(UnisonTests);
export { UnisonTests };
