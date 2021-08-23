// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// Voice Tests

/* eslint-disable */
// @ts-nocheck

import { TestOptions, VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, expect, test, equal, throws } from './types/qunit';
import { Flow } from 'flow';
import { MockTickable } from './mocks';
import { ContextBuilder } from 'renderer';
import { StaveNote } from 'stavenote';
import { Voice } from 'voice';
import { Formatter } from 'formatter';
import { Stave } from 'stave';
import { Barline } from 'stavebarline';

const VoiceTests = {
  Start(): void {
    QUnit.module('Voice');
    test('Strict Test', this.strict);
    test('Ignore Test', this.ignore);
    VexFlowTests.runTests('Full Voice Mode Test', this.full);
  },

  strict(): void {
    expect(8);
    function createTickable() {
      return new MockTickable(Flow.TIME4_4);
    }

    const R = Flow.RESOLUTION;
    const BEAT = (1 * R) / 4;

    const tickables = [
      createTickable().setTicks(BEAT),
      createTickable().setTicks(BEAT),
      createTickable().setTicks(BEAT),
    ];

    const voice = new Voice(Flow.TIME4_4);
    equal(voice.totalTicks.value(), BEAT * 4, '4/4 Voice has 4 beats');
    equal(voice.ticksUsed.value(), BEAT * 0, 'No beats in voice');
    voice.addTickables(tickables);
    equal(voice.ticksUsed.value(), BEAT * 3, 'Three beats in voice');
    voice.addTickable(createTickable().setTicks(BEAT));
    equal(voice.ticksUsed.value(), BEAT * 4, 'Four beats in voice');
    equal(voice.isComplete(), true, 'Voice is complete');

    const beforeNumerator = voice.ticksUsed.numerator;
    try {
      voice.addTickable(createTickable().setTicks(BEAT));
    } catch (e) {
      equal(e.code, 'BadArgument', 'Too many ticks exception');
      equal(
        voice.ticksUsed.numerator,
        beforeNumerator,
        'Revert "ticksUsed" when it occurred "Too many ticks" exception'
      );
    }

    equal(voice.getSmallestTickCount().value(), BEAT, 'Smallest tick count is BEAT');
  },

  ignore(): void {
    function createTickable() {
      return new MockTickable(Flow.TIME4_4);
    }

    const R = Flow.RESOLUTION;
    const BEAT = (1 * R) / 4;

    const tickables = [
      createTickable().setTicks(BEAT),
      createTickable().setTicks(BEAT),
      createTickable().setTicks(BEAT).setIgnoreTicks(true),
      createTickable().setTicks(BEAT),
      createTickable().setTicks(BEAT).setIgnoreTicks(true),
      createTickable().setTicks(BEAT),
    ];

    const voice = new Voice(Flow.TIME4_4);
    voice.addTickables(tickables);
    ok(true, 'all pass');
  },

  full(options: TestOptions, contextBuilder: ContextBuilder): void {
    const ctx = contextBuilder(options.elementId, 550, 200);

    const stave = new Stave(10, 50, 500).addClef('treble').addTimeSignature('4/4').setEndBarType(Barline.type.END);

    const notes = [
      new StaveNote({ keys: ['c/4'], duration: '4' }),
      new StaveNote({ keys: ['d/4'], duration: '4' }),
      new StaveNote({ keys: ['r/4'], duration: '4r' }),
    ];

    notes.forEach(function (note) {
      note.setStave(stave);
    });

    const voice = new Voice(Flow.TIME4_4).setMode(Voice.Mode.FULL).addTickables(notes);

    new Formatter().joinVoices([voice]).formatToStave([voice], stave);

    stave.setContext(ctx).draw();
    voice.draw(ctx);
    voice.getBoundingBox().draw(ctx);

    throws(
      function () {
        voice.addTickable(new StaveNote({ keys: ['c/4'], duration: '2' }));
      },
      /BadArgument/,
      'Voice cannot exceed full amount of ticks'
    );
  },
};

export { VoiceTests };
