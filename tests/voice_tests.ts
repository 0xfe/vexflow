// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { Flow } from 'flow';
import { Formatter } from 'formatter';
import { ContextBuilder } from 'renderer';
import { Stave } from 'stave';
import { Barline } from 'stavebarline';
import { StaveNote } from 'stavenote';
import { Voice } from 'voice';
import { MockTickable } from './mocks';

const VoiceTests = {
  Start(): void {
    QUnit.module('Voice');
    test('Strict Test', strict);
    test('Ignore Test', ignore);
    VexFlowTests.runTests('Full Voice Mode Test', full);
  },
};

const BEAT = (1 * Flow.RESOLUTION) / 4;

// Helper function to create a tickable with a preset number of ticks.
const createTickable = () => new MockTickable().setTicks(BEAT);

function strict(): void {
  expect(8);

  const tickables = [createTickable(), createTickable(), createTickable()];

  const voice = new Voice(Flow.TIME4_4);
  equal(voice.getTotalTicks().value(), BEAT * 4, '4/4 Voice has 4 beats');
  equal(voice.getTicksUsed().value(), BEAT * 0, 'No beats in voice');
  voice.addTickables(tickables);
  equal(voice.getTicksUsed().value(), BEAT * 3, 'Three beats in voice');
  voice.addTickable(createTickable());
  equal(voice.getTicksUsed().value(), BEAT * 4, 'Four beats in voice');
  equal(voice.isComplete(), true, 'Voice is complete');

  const beforeNumerator = voice.getTicksUsed().numerator;
  try {
    voice.addTickable(createTickable());
  } catch (e) {
    equal(e.code, 'BadArgument', 'Too many ticks exception');
    equal(
      voice.getTicksUsed().numerator,
      beforeNumerator,
      'Revert "ticksUsed" when it occurred "Too many ticks" exception'
    );
  }

  equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
}

function ignore(): void {
  const tickables = [
    createTickable(),
    createTickable(),
    createTickable().setIgnoreTicks(true),
    createTickable(),
    createTickable().setIgnoreTicks(true),
    createTickable(),
  ];

  const voice = new Voice(Flow.TIME4_4);
  voice.addTickables(tickables);
  ok(true, 'all pass');
}

function full(options: TestOptions, contextBuilder: ContextBuilder): void {
  const ctx = contextBuilder(options.elementId, 550, 200);

  const stave = new Stave(10, 50, 500).addClef('treble').addTimeSignature('4/4').setEndBarType(Barline.type.END);

  const notes = [
    new StaveNote({ keys: ['c/4'], duration: '4' }),
    new StaveNote({ keys: ['d/4'], duration: '4' }),
    new StaveNote({ keys: ['r/4'], duration: '4r' }),
  ];

  notes.forEach((note) => note.setStave(stave));

  const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.FULL).addTickables(notes);

  new Formatter().joinVoices([voice]).formatToStave([voice], stave);

  stave.setContext(ctx).draw();
  voice.draw(ctx);
  voice.getBoundingBox()?.draw(ctx);

  throws(
    () => voice.addTickable(new StaveNote({ keys: ['c/4'], duration: '2' })),
    /BadArgument/,
    'Voice cannot exceed full amount of ticks'
  );
}

export { VoiceTests };
