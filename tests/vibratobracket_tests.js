/**
 * VexFlow - VibratoBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 *
 * Author: Balazs Forian-Szabo
 */
const VibratoBracketTests = (function () {
  function createTest(noteGroup1, setupVibratoBracket) {
    return function (options) {
      var f = VexFlowTests.makeFactory(options, 650, 200);
      var stave = f.Stave();
      var score = f.EasyScore();

      var voice = score.voice(score.notes.apply(score, noteGroup1));

      setupVibratoBracket(f, voice.getTickables());

      f.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      f.draw();

      ok(true);
    };
  }

  return {
    Start: function () {
      var run = VexFlowTests.runTests;

      QUnit.module('VibratoBracket');

      run(
        'Simple VibratoBracket',
        createTest(['c4/4, c4, c4, c4'], function (vf, notes) {
          vf.VibratoBracket({
            from: notes[0],
            to: notes[3],
            options: {
              line: 2,
            },
          });
        })
      );

      run(
        'Harsh VibratoBracket Without End Note',
        createTest(['c4/4, c4, c4, c4'], function (vf, notes) {
          vf.VibratoBracket({
            from: notes[2],
            to: null,
            options: {
              line: 2,
              harsh: true,
            },
          });
        })
      );

      run(
        'Harsh VibratoBracket Without Start Note',
        createTest(['c4/4, c4, c4, c4'], function (vf, notes) {
          vf.VibratoBracket({
            from: null,
            to: notes[2],
            options: {
              line: 2,
              harsh: true,
            },
          });
        })
      );
    },
  };
})();
VexFlowTests.VibratoBracket = VibratoBracketTests;
export { VibratoBracketTests };
