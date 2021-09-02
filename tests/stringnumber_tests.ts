// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// StringNumber Tests

/* eslint-disable */
// @ts-nocheck

// TODO: Stroke constructor's second argument should be optional.

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { Renderer } from 'renderer';
import { BarlineType } from 'stavebarline';
import { Stroke } from 'strokes';

const StringNumberTests = {
  Start(): void {
    QUnit.module('StringNumber');

    const run = VexFlowTests.runTests;
    run('String Number In Notation', drawMultipleMeasures);
    run('Fret Hand Finger In Notation', drawFretHandFingers);
    run('Multi Voice With Strokes, String & Finger Numbers', multi);
    run('Complex Measure With String & Finger Numbers', drawAccidentals);
  },
};

function drawMultipleMeasures(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 775, 200);
  const score = f.EasyScore();

  // bar 1
  const stave1 = f.Stave({ width: 300 }).setEndBarType(BarlineType.DOUBLE).addClef('treble');

  const notes1 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/4, (c4 f4 g4)/4', { stem: 'down' });

  notes1[0]
    .addModifier(f.StringNumber({ number: '5', position: 'right' }), 0)
    .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }), 2);

  notes1[1]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.StringNumber({ number: '5', position: 'below' }), 0)
    .addAccidental(1, f.Accidental({ type: '#' }).setAsCautionary())
    .addModifier(
      f
        .StringNumber({ number: '3', position: 'above' })
        .setLastNote(notes1[3])
        .setLineEndType(Renderer.LineEndType.DOWN),
      2
    );

  notes1[2]
    .addModifier(f.StringNumber({ number: '5', position: 'left' }), 0)
    .addModifier(f.StringNumber({ number: '3', position: 'left' }), 2)
    .addAccidental(1, f.Accidental({ type: '#' }));

  notes1[3]
    .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);

  const voice1 = score.voice(notes1);

  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  // bar 2 - juxtaposing second bar next to first bar
  const stave2 = f
    .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 300 })
    .setEndBarType(BarlineType.DOUBLE);

  const notes2 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'up' });

  notes2[0]
    .addModifier(f.StringNumber({ number: '5', position: 'right' }), 0)
    .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }), 2);

  notes2[1]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.StringNumber({ number: '5', position: 'below' }), 0)
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addModifier(f.StringNumber({ number: '3', position: 'above' }).setLastNote(notes2[3]).setDashed(false), 2);

  notes2[2]
    .addModifier(f.StringNumber({ number: '3', position: 'left' }), 2)
    .addAccidental(1, f.Accidental({ type: '#' }));

  notes2[3]
    .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);

  const voice2 = score.voice(notes2);

  f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

  // bar 3 - juxtaposing third bar next to second bar
  const stave3 = f
    .Stave({ x: stave2.getWidth() + stave2.getX(), y: stave2.getY(), width: 150 })
    .setEndBarType(BarlineType.END);

  const notesBar3 = score.notes('(c4 e4 g4 a4)/1.');

  notesBar3[0]
    .addModifier(f.StringNumber({ number: '5', position: 'below' }), 0)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'left' }), 2)
    .addModifier(f.StringNumber({ number: '2', position: 'above' }), 3);

  const voice3 = score.voice(notesBar3, { time: '6/4' });

  f.Formatter().joinVoices([voice3]).formatToStave([voice3], stave3);

  f.draw();

  ok(true, 'String Number');
}

function drawFretHandFingers(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 725, 200);
  const score = f.EasyScore();

  // bar 1
  const stave1 = f.Stave({ width: 350 }).setEndBarType(BarlineType.DOUBLE).addClef('treble');

  const notes1 = score.notes('(c4 e4 g4)/4, (c5 e5 g5), (c4 f4 g4), (c4 f4 g4)', { stem: 'down' });

  notes1[0]
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);

  notes1[1]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);

  notes1[2]
    .addModifier(f.Fingering({ number: '3', position: 'below' }), 0)
    .addModifier(f.Fingering({ number: '4', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
    .addModifier(f.Fingering({ number: '0', position: 'above' }), 2)
    .addAccidental(1, f.Accidental({ type: '#' }));

  notes1[3]
    .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
    .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
    .addModifier(f.Fingering({ number: '4', position: 'right' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
    .addModifier(f.Fingering({ number: '0', position: 'right' }).setOffsetY(-5), 2)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);

  const voice1 = score.voice(notes1);

  f.Formatter().joinVoices([voice1]).formatToStave([voice1], stave1);

  // bar 2 - juxtaposing second bar next to first bar
  const stave2 = f
    .Stave({ x: stave1.getWidth() + stave1.getX(), y: stave1.getY(), width: 350 })
    .setEndBarType(BarlineType.END);

  const notes2 = score.notes('(c4 e4 g4)/4., (c5 e5 g5)/8, (c4 f4 g4)/8, (c4 f4 g4)/4.[stem="down"]', {
    stem: 'up',
  });

  notes2[0]
    .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
    .addModifier(f.Fingering({ number: '0', position: 'above' }), 2);

  notes2[1]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2);

  notes2[2]
    .addModifier(f.Fingering({ number: '3', position: 'below' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
    .addModifier(f.Fingering({ number: '1', position: 'right' }), 2)
    .addAccidental(2, f.Accidental({ type: '#' }));

  notes2[3]
    .addModifier(f.Fingering({ number: '3', position: 'right' }), 0)
    .addModifier(f.StringNumber({ number: '5', position: 'right' }).setOffsetY(7), 0)
    .addModifier(f.Fingering({ number: '4', position: 'right' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }).setOffsetY(6), 1)
    .addModifier(f.Fingering({ number: '1', position: 'right' }).setOffsetY(-6), 2)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }).setOffsetY(-6), 2);

  const voice2 = score.voice(notes2);

  f.Formatter().joinVoices([voice2]).formatToStave([voice2], stave2);

  f.draw();

  ok(true, 'String Number');
}

function multi(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 700, 200);
  const score = f.EasyScore();
  const stave = f.Stave();

  const notes1 = score.notes('(c4 e4 g4)/4, (a3 e4 g4), (c4 d4 a4), (c4 d4 a4)', { stem: 'up' });

  notes1[0]
    .addStroke(0, new Stroke(5))
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
    .addModifier(f.StringNumber({ number: '4', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'above' }), 2);

  notes1[1]
    .addStroke(0, new Stroke(6))
    .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
    .addModifier(f.StringNumber({ number: '3', position: 'above' }), 2)
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addAccidental(2, f.Accidental({ type: '#' }));

  notes1[2]
    .addStroke(0, new Stroke(2))
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addModifier(f.Fingering({ number: '0', position: 'right' }), 1)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1)
    .addModifier(f.Fingering({ number: '1', position: 'left' }), 2)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }), 2);

  notes1[3]
    .addStroke(0, new Stroke(1))
    .addModifier(f.StringNumber({ number: '3', position: 'left' }), 2)
    .addModifier(f.StringNumber({ number: '4', position: 'right' }), 1);

  const notes2 = score.notes('e3/8, e3, e3, e3, e3, e3, e3, e3', { stem: 'down' });

  notes2[0]
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 0)
    .addModifier(f.StringNumber({ number: '6', position: 'below' }), 0);

  notes2[2].addAccidental(0, f.Accidental({ type: '#' }));

  notes2[4].addModifier(f.Fingering({ number: '0', position: 'left' }), 0);

  // Position string number 6 beneath the strum arrow: left (15) and down (18)
  notes2[4].addModifier(f.StringNumber({ number: '6', position: 'left' }).setOffsetX(15).setOffsetY(18), 0);

  // Important Note: notes2 must come first, otherwise ledger lines from notes2 will be drawn on top of notes from notes1!
  // BUG: VexFlow draws TWO ledger lines for middle C, because both notes1 and notes2 require the middle C ledger line.
  const voices = [score.voice(notes2), score.voice(notes1)];

  f.Formatter().joinVoices(voices).formatToStave(voices, stave);

  f.Beam({ notes: notes2.slice(0, 4) });
  f.Beam({ notes: notes2.slice(4, 8) });

  f.draw();

  ok(true, 'Strokes Test Multi Voice');
}

function drawAccidentals(options: TestOptions): void {
  const f = VexFlowTests.makeFactory(options, 500);

  const stave = f.Stave().setEndBarType(BarlineType.DOUBLE).addClef('treble');

  const notes = [
    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'c/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: 1, duration: '4' }),
    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
    f.StaveNote({ keys: ['c/4', 'e/4', 'g/4', 'd/5', 'e/5', 'g/5'], stem_direction: -1, duration: '4' }),
  ];

  notes[0]
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '2', position: 'left' }), 1)
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
    .addAccidental(2, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 3)
    .addAccidental(3, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '2', position: 'right' }), 4)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }), 4)
    .addAccidental(4, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 5)
    .addAccidental(5, f.Accidental({ type: '#' }));

  notes[1]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addAccidental(2, f.Accidental({ type: '#' }))
    .addAccidental(3, f.Accidental({ type: '#' }))
    .addAccidental(4, f.Accidental({ type: '#' }))
    .addAccidental(5, f.Accidental({ type: '#' }));

  notes[2]
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 0)
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '2', position: 'left' }), 1)
    .addModifier(f.StringNumber({ number: '2', position: 'left' }), 1)
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 2)
    .addAccidental(2, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '3', position: 'left' }), 3)
    .addAccidental(3, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '2', position: 'right' }), 4)
    .addModifier(f.StringNumber({ number: '3', position: 'right' }), 4)
    .addAccidental(4, f.Accidental({ type: '#' }))
    .addModifier(f.Fingering({ number: '0', position: 'left' }), 5)
    .addAccidental(5, f.Accidental({ type: '#' }));

  notes[3]
    .addAccidental(0, f.Accidental({ type: '#' }))
    .addAccidental(1, f.Accidental({ type: '#' }))
    .addAccidental(2, f.Accidental({ type: '#' }))
    .addAccidental(3, f.Accidental({ type: '#' }))
    .addAccidental(4, f.Accidental({ type: '#' }))
    .addAccidental(5, f.Accidental({ type: '#' }));

  const voice = f.Voice().addTickables(notes);

  f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

  f.draw();

  ok(true, 'String Number');
}

export { StringNumberTests };
