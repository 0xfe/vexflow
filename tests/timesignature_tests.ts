// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// MIT License
//
// TimeSignature Tests

/* eslint-disable */
// @ts-nocheck

import { VexFlowTests } from './vexflow_test_helpers';
import { Stave } from 'stave';
import { StaveConnector } from 'staveconnector';
import { TimeSignature } from 'timesignature';

const TimeSignatureTests = {
  Start(): void {
    QUnit.module('TimeSignature');

    test('Time Signature Parser', function () {
      const mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+'];
      const mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|'];

      const timeSig = new TimeSignature();

      mustFail.forEach(function (invalidString) {
        throws(function () {
          timeSig.parseTimeSpec(invalidString);
        }, /BadTimeSignature/);
      });

      mustPass.forEach(function (validString) {
        timeSig.parseTimeSpec(validString);
      });

      ok(true, 'all pass');
    });

    const run = VexFlowTests.runTests;

    run('Basic Time Signatures', function (options, contextBuilder) {
      const ctx = contextBuilder(options.elementId, 600, 120);

      new Stave(10, 10, 500)
        .addTimeSignature('2/2')
        .addTimeSignature('3/4')
        .addTimeSignature('4/4')
        .addTimeSignature('6/8')
        .addTimeSignature('C')
        .addTimeSignature('C|')
        .addEndTimeSignature('2/2')
        .addEndTimeSignature('3/4')
        .addEndTimeSignature('4/4')
        .addEndClef('treble')
        .addEndTimeSignature('6/8')
        .addEndTimeSignature('C')
        .addEndTimeSignature('C|')
        .setContext(ctx)
        .draw();

      ok(true, 'all pass');
    });

    run('Big Signature Test', function (options, contextBuilder) {
      const ctx = contextBuilder(options.elementId, 400, 120);

      new Stave(10, 10, 300)
        .addTimeSignature('12/8')
        .addTimeSignature('7/16')
        .addTimeSignature('1234567/890')
        .addTimeSignature('987/654321')
        .setContext(ctx)
        .draw();

      ok(true, 'all pass');
    });

    run('Time Signature multiple staves alignment test', function (options, contextBuilder) {
      const ctx = contextBuilder(options.elementId, 400, 350);

      const stave = new Stave(15, 0, 300)
        .setConfigForLines(
          [false, false, true, false, false].map(function (visible) {
            return { visible: visible };
          })
        )
        .addClef('percussion')
        .addTimeSignature('4/4', 25) // passing the custom padding in pixels
        .setContext(ctx)
        .draw();

      const stave2 = new Stave(15, 110, 300).addClef('treble').addTimeSignature('4/4').setContext(ctx).draw();

      new StaveConnector(stave, stave2).setType('single').setContext(ctx).draw();

      const stave3 = new Stave(15, 220, 300).addClef('bass').addTimeSignature('4/4').setContext(ctx).draw();

      new StaveConnector(stave2, stave3).setType('single').setContext(ctx).draw();

      new StaveConnector(stave2, stave3).setType('brace').setContext(ctx).draw();

      ok(true, 'all pass');
    });

    run('Time Signature Change Test', function (options) {
      const f = VexFlowTests.makeFactory(options, 900);

      const stave = f.Stave(10, 10, 800).addClef('treble').addTimeSignature('C|');

      const voice = f
        .Voice()
        .setStrict(false)
        .addTickables([
          f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
          f.TimeSigNote({ time: '3/4' }),
          f.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
          f.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
          f.TimeSigNote({ time: 'C' }),
          f.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
          f.TimeSigNote({ time: '9/8' }),
          f.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        ]);

      f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      f.draw();

      ok(true, 'all pass');
    });
  },
};

export { TimeSignatureTests };
