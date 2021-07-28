// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License

/* eslint-disable */
// @ts-nocheck

import { MockTickable } from './mocks';
import { VexFlowTests } from './vexflow_test_helpers';
import { QUnit, ok, expect } from './declarations';
import { Flow } from 'flow';

/**
 * Voice Tests
 */
const VoiceTests = (function () {
  const Voice = {
    Start: function () {
      QUnit.module('Voice');
      test('Strict Test', Voice.strict);
      test('Ignore Test', Voice.ignore);
      VexFlowTests.runTests('Full Voice Mode Test', Voice.full);
    },

    strict: function () {
      expect(8);
      function createTickable() {
        return new MockTickable(VF.TIME4_4);
      }

      var R = Flow.RESOLUTION;
      var BEAT = (1 * R) / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
      ];

      var voice = new VF.Voice(VF.TIME4_4);
      equal(voice.totalTicks.value(), BEAT * 4, '4/4 Voice has 4 beats');
      equal(voice.ticksUsed.value(), BEAT * 0, 'No beats in voice');
      voice.addTickables(tickables);
      equal(voice.ticksUsed.value(), BEAT * 3, 'Three beats in voice');
      voice.addTickable(createTickable().setTicks(BEAT));
      equal(voice.ticksUsed.value(), BEAT * 4, 'Four beats in voice');
      equal(voice.isComplete(), true, 'Voice is complete');

      var beforeNumerator = voice.ticksUsed.numerator;
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

    ignore: function () {
      function createTickable() {
        return new MockTickable(VF.TIME4_4);
      }

      var R = Flow.RESOLUTION;
      var BEAT = (1 * R) / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
      ];

      var voice = new VF.Voice(VF.TIME4_4);
      voice.addTickables(tickables);
      ok(true, 'all pass');
    },

    full: function (options, contextBuilder) {
      var ctx = contextBuilder(options.elementId, 550, 200);

      var stave = new VF.Stave(10, 50, 500)
        .addClef('treble')
        .addTimeSignature('4/4')
        .setEndBarType(VF.Barline.type.END);

      var notes = [
        new VF.StaveNote({ keys: ['c/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['d/4'], duration: '4' }),
        new VF.StaveNote({ keys: ['r/4'], duration: '4r' }),
      ];

      notes.forEach(function (note) {
        note.setStave(stave);
      });

      var voice = new VF.Voice(VF.TIME4_4).setMode(VF.Voice.Mode.FULL).addTickables(notes);

      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      stave.setContext(ctx).draw();
      voice.draw(ctx);
      voice.getBoundingBox().draw(ctx);

      throws(
        function () {
          voice.addTickable(new VF.StaveNote({ keys: ['c/4'], duration: '2' }));
        },
        /BadArgument/,
        'Voice cannot exceed full amount of ticks'
      );
    },
  };

  return Voice;
})();

export { VoiceTests };
