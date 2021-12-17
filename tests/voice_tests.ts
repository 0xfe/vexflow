// [VexFlow](https://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';

import { Flow } from '../src/flow';
import { Formatter } from '../src/formatter';
import { ContextBuilder } from '../src/renderer';
import { Stave } from '../src/stave';
import { Barline } from '../src/stavebarline';
import { StaveNote } from '../src/stavenote';
import { Voice } from '../src/voice';
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

  const numeratorBeforeException = voice.getTicksUsed().numerator;
  throws(() => voice.addTickable(createTickable()), /BadArgument/, '"Too many ticks" exception');

  // Verify that adding too many ticks does not affect the `ticksUsed` property of the voice.
  // See voice.ts: this.ticksUsed.subtract(ticks);
  equal(
    voice.getTicksUsed().numerator,
    numeratorBeforeException,
    'Revert `ticksUsed` after a "Too many ticks" exception'
  );

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
  const bb = voice.getBoundingBox();
  if (bb) {
    ctx.rect(bb.getX(), bb.getY(), bb.getW(), bb.getH());
  }
  ctx.stroke();

  throws(
    () => voice.addTickable(new StaveNote({ keys: ['c/4'], duration: '2' })),
    /BadArgument/,
    'Voice cannot exceed full amount of ticks'
  );
}

VexFlowTests.register(VoiceTests);
export { VoiceTests };
