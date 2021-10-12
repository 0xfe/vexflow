// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StaveLine Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

const StaveLineTests = {
  Start(): void {
    QUnit.module('StaveLine');
    const run = VexFlowTests.runTests;
    run('Simple StaveLine', simple0);
    run('StaveLine Arrow Options', simple1);
  },
};

function simple0(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options);
  const stave = f.Stave().addClef('treble');

  const notes = [
    f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
    f.StaveNote({ keys: ['c/5'], duration: '4', clef: 'treble' }),
    f.StaveNote({ keys: ['c/4', 'g/4', 'b/4'], duration: '4', clef: 'treble' }),
    f.StaveNote({ keys: ['f/4', 'a/4', 'f/5'], duration: '4', clef: 'treble' }),
  ];

  const voice = f.Voice().addTickables(notes);

  f.StaveLine({
    from: notes[0],
    to: notes[1],
    first_indices: [0],
    last_indices: [0],
    options: {
      font: { family: 'serif', size: 12, weight: 'italic' },
      text: 'gliss.',
    },
  });

  const staveLine2 = f.StaveLine({
    from: notes[2],
    to: notes[3],
    first_indices: [2, 1, 0],
    last_indices: [0, 1, 2],
  });
  staveLine2.setLineDash([10, 10]);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true);
}

function simple1(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 770);
  const stave = f.Stave().addClef('treble');

  const notes = [
    f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }).addDotToAll(),
    f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addAccidental(0, f.Accidental({ type: '#' })),
    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', clef: 'treble' }),
    f
      .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
      .addAccidental(2, f.Accidental({ type: '#' })),
    f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }).addAccidental(0, f.Accidental({ type: '#' })),
    f.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
    f.StaveNote({ keys: ['c/4', 'd/4', 'g/4'], duration: '4', clef: 'treble' }),
    f
      .StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
      .addAccidental(2, f.Accidental({ type: '#' })),
  ];
  const voice = f.Voice().setStrict(false).addTickables(notes);

  const staveLine0 = f.StaveLine({
    from: notes[0],
    to: notes[1],
    first_indices: [0],
    last_indices: [0],
    options: { text: 'Left' },
  });

  const staveLine4 = f.StaveLine({
    from: notes[2],
    to: notes[3],
    first_indices: [1],
    last_indices: [1],
    options: { text: 'Right' },
  });

  const staveLine1 = f.StaveLine({
    from: notes[4],
    to: notes[5],
    first_indices: [0],
    last_indices: [0],
    options: { text: 'Center' },
  });

  const staveLine2 = f.StaveLine({
    from: notes[6],
    to: notes[7],
    first_indices: [1],
    last_indices: [0],
  });

  const staveLine3 = f.StaveLine({
    from: notes[6],
    to: notes[7],
    first_indices: [2],
    last_indices: [2],
    options: { text: 'Top' },
  });

  staveLine0.setDrawEndArrow(true);
  staveLine0.setTextJustification(1);
  staveLine0.setTextPositionVertical(2);

  staveLine1.setDrawEndArrow(true);
  staveLine1.setArrowheadLength(30);
  staveLine1.setLineWidth(5);
  staveLine1.setTextJustification(2);
  staveLine1.setTextPositionVertical(2);

  staveLine4.setLineWidth(2);
  staveLine4.setDrawEndArrow(true);
  staveLine4.setDrawStartArrow(true);
  staveLine4.setArrowheadAngle(0.5);
  staveLine4.setArrowheadLength(20);
  staveLine4.setTextJustification(3);
  staveLine4.setTextPositionVertical(2);

  staveLine2.setDrawStartArrow(true);
  staveLine2.setLineDash([5, 4]);

  staveLine3.setDrawEndArrow(true);
  staveLine3.setDrawStartArrow(true);
  staveLine3.setColor('red');
  staveLine3.setTextPositionVertical(1);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true);
}

export { StaveLineTests };
