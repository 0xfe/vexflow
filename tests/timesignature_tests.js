/**
 * VexFlow - TimeSignature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TimeSignature = (function() {
  return {
    Start: function() {
      QUnit.module('TimeSignature');

      test('Time Signature Parser', function() {
        var mustFail = ['asdf', '123/', '/10', '/', '4567', 'C+'];
        var mustPass = ['4/4', '10/12', '1/8', '1234567890/1234567890', 'C', 'C|'];

        var timeSig = new VF.TimeSignature();

        mustFail.forEach(function(invalidString) {
          throws(function() { timeSig.parseTimeSpec(invalidString); }, /BadTimeSignature/);
        });

        mustPass.forEach(function(validString) {
          timeSig.parseTimeSpec(validString);
        });

        ok(true, 'all pass');
      });

      var run = VF.Test.runTests;

      run('Basic Time Signatures', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 600, 120);

        new VF.Stave(10, 10, 500)
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

      run('Big Signature Test', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 400, 120);

        new VF.Stave(10, 10, 300)
          .addTimeSignature('12/8')
          .addTimeSignature('7/16')
          .addTimeSignature('1234567/890')
          .addTimeSignature('987/654321')
          .setContext(ctx)
          .draw();

        ok(true, 'all pass');
      });

      run('Time Signature multiple staves alignment test', function(options, contextBuilder) {
        var ctx = new contextBuilder(options.elementId, 400, 350);

        var stave = new VF.Stave(15, 0, 300)
          .setConfigForLines(
            [false, false, true, false, false].map(function(visible) {
              return { visible: visible };
            }))
          .addClef('percussion')
          .addTimeSignature('4/4', 25) // passing the custom padding in pixels
          .setContext(ctx)
          .draw();

        var stave2 = new VF.Stave(15, 110, 300)
          .addClef('treble')
          .addTimeSignature('4/4')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave, stave2)
          .setType('single')
          .setContext(ctx)
          .draw();

        var stave3 = new VF.Stave(15, 220, 300)
          .addClef('bass')
          .addTimeSignature('4/4')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave2, stave3)
          .setType('single')
          .setContext(ctx)
          .draw();

        new VF.StaveConnector(stave2, stave3)
          .setType('brace')
          .setContext(ctx)
          .draw();

        ok(true, 'all pass');
      });

      run('Time Signature Change Test', function(options) {
        var vf = VF.Test.makeFactory(options, 900);

        var stave = vf.Stave(10, 10, 800)
          .addClef('treble')
          .addTimeSignature('C|');

        var voice = vf.Voice().setStrict(false).addTickables([
          vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
          vf.TimeSigNote({ time: '3/4' }),
          vf.StaveNote({ keys: ['d/4'], duration: '4', clef: 'alto' }),
          vf.StaveNote({ keys: ['b/3'], duration: '4r', clef: 'alto' }),
          vf.TimeSigNote({ time: 'C' }),
          vf.StaveNote({ keys: ['c/3', 'e/3', 'g/3'], duration: '4', clef: 'bass' }),
          vf.TimeSigNote({ time: '9/8' }),
          vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        ]);

        vf.Formatter()
          .joinVoices([voice])
          .formatToStave([voice], stave);

        vf.draw();

        ok(true, 'all pass');
      });
    },
  };
}());
