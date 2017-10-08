/**
 * VexFlow - Three Voices in single staff tests.
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.ThreeVoices = (function() {
  function concat(a, b) { return a.concat(b); }

  function createThreeVoicesTest(noteGroup1, noteGroup2, noteGroup3, setup) {
    return function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave().addTrebleGlyph().addTimeSignature('4/4');
      var score = vf.EasyScore();

      var noteGroups = [noteGroup1, noteGroup2, noteGroup3].map(function(noteGroup) {
        return score.notes.apply(score, noteGroup);
      });

      var voices = noteGroups.map(score.voice.bind(score));

      setup(vf, voices);

      var beams = [
        VF.Beam.applyAndGetBeams(voices[0], +1),
        VF.Beam.applyAndGetBeams(voices[1], -1),
        VF.Beam.applyAndGetBeams(voices[2], -1),
      ].reduce(concat);

      // Set option to position rests near the notes in each voice
      vf.Formatter()
        .joinVoices(voices)
        .formatToStave(voices, stave);

      vf.draw();

      for (var i = 0; i < beams.length; i++) {
        beams[i].setContext(vf.getContext()).draw();
      }

      ok(true);
    };
  }

  var ThreeVoices = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Three Voice Rests');

      run('Three Voices - #1', createThreeVoicesTest(
        ['e5/2, e5', { stem: 'up' }],
        ['(d4 a4 d#5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
        ['b3/4, e3, f3, a3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '4', position: 'left' }));
        }
      ));

      run('Three Voices - #2 Complex', createThreeVoicesTest(
        ['(a4 e5)/16, e5, e5, e5, e5/8, e5, e5/2', { stem: 'up' }],
        ['(d4 d#5)/16, (b4 c5), d5, e5, (d4 a4 c5)/8, b4, (d4 a4 c5), b4, (d4 a4 c5), b4', { stem: 'down' }],
        ['b3/8, b3, e3/4, f3, a3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '2', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '0', position: 'above' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '4', position: 'left' }));
        }
      ));

      run('Three Voices - #3', createThreeVoicesTest(
        ['(g4 e5)/4, e5, (g4 e5)/2', { stem: 'up' }],
        ['c#5/4, b4/8, b4/8/r, a4/4., g4/8', { stem: 'down' }],
        ['c4/4, b3, a3, g3', { stem: 'down' }],
        function(vf, voices) {
          voices[0]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '0', position: 'left' }))
            .addModifier(1, vf.Fingering({ number: '0', position: 'left' }));

          voices[1]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '1', position: 'left' }));

          voices[2]
            .getTickables()[0]
            .addModifier(0, vf.Fingering({ number: '3', position: 'left' }));
        }
      ));

      run('Auto Adjust Rest Positions - Two Voices', ThreeVoices.autoRestTwoVoices);
      run('Auto Adjust Rest Positions - Three Voices #1', ThreeVoices.autorestthreevoices);
      run('Auto Adjust Rest Positions - Three Voices #2', ThreeVoices.autorestthreevoices2);
    },

    autoRestTwoVoices: function(options) {
      var vf = VF.Test.makeFactory(options, 900, 200);
      var score = vf.EasyScore();
      var x = 10;

      var beams = [];

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);
        x += width;

        var voices = [
          score.notes(
            'b4/8/r, e5/16, b4/r, b4/8/r, e5/16, b4/r, b4/8/r, d5/16, b4/r, e5/4',
            { stem: 'up' }
          ),
          score.notes(
            'c5/16, c4, b4/r, d4, e4, f4, b4/r, g4, g4[stem="up"], a4[stem="up"], b4/r, b4[stem="up"], e4/4',
            { stem: 'down' }
          ),
          [vf.TextNote({ text: measureTitle, line: -1, duration: '1', smooth: true })],
        ].map(score.voice.bind(score));

        beams = beams
          .concat(VF.Beam.applyAndGetBeams(voices[0], 1))
          .concat(VF.Beam.applyAndGetBeams(voices[1], -1));

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);

      vf.draw();

      for (var i = 0; i < beams.length; i++) {
        beams[i].setContext(vf.getContext()).draw();
      }

      ok(true, 'Auto Adjust Rests - Two Voices');
    },

    autorestthreevoices: function(options) {
      var vf = VF.Test.makeFactory(options, 850, 200);
      var score = vf.EasyScore();
      var x = 10;

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

        var voices = [
          score.voice(score.notes(
            'b4/4/r, e5, e5/r, e5/r, e5, e5, e5, e5/r',
            { stem: 'up' }
          ), { time: '8/4' }),
          score.voice(score.notes(
            'b4/4/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4',
            { stem: 'down' }
          ), { time: '8/4' }),
          score.voice(score.notes(
            'e4/4/r, e4/r, f4, b4/r, g4, c4, e4/r, c4',
            { stem: 'down' }
          ), { time: '8/4' }),
          score.voice([
            vf.TextNote({ text: measureTitle, duration: '1', line: -1, smooth: true }),
            vf.TextNote({ text: '', duration: '1', line: -1, smooth: true }),
          ], { time: '8/4' }),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });

        x += width;
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
      vf.draw();

      ok(true);
    },

    autorestthreevoices2: function(options) {
      var vf = VF.Test.makeFactory(options, 850, 200);
      var score = vf.EasyScore();
      var x = 10;

      function createMeasure(measureTitle, width, alignRests) {
        var stave = vf.Stave({ x: x, y: 50, width: width }).setBegBarType(1);

        var voices = [
          score.voice(score.notes(
            'b4/16/r, e5, e5/r, e5/r, e5, e5, e5, e5/r'
          ), { time: '2/4' }),
          score.voice(score.notes(
            'b4/16/r, b4/r, b4/r, b4, b4/r, b4/r, b4, b4'
          ), { time: '2/4' }),
          score.voice(score.notes(
            'e4/16/r, e4/r, f4, b4/r, g4, c4, e4/r, c4'
          ), { time: '2/4' }),
          score.voice([
            vf.TextNote({ text: measureTitle, duration: 'h', line: -1, smooth: true }),
          ], { time: '2/4' }),
        ];

        vf.Formatter()
          .joinVoices(voices)
          .formatToStave(voices, stave, { align_rests: alignRests });

        x += width;
      }

      createMeasure('Default Rest Positions', 400, false);
      createMeasure('Rests Repositioned To Avoid Collisions', 400, true);
      vf.draw();

      ok(true);
    },
  };

  return ThreeVoices;
}());
