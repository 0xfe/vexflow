/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

function createTest(notesData, setupTies) {
  return function(options) {
    var vf = VF.Test.makeFactory(options, 300);
    var stave = vf.Stave();
    var score = vf.EasyScore();
    var voice = score.voice(score.notes.apply(score, notesData));
    var notes = voice.getTickables();

    setupTies(vf, notes, stave);

    vf.Formatter()
      .joinVoices([voice])
      .formatToStave([voice], stave);

    vf.draw();

    ok(true);
  };
}

VF.Test.StaveTie = (function() {
  var StaveTie = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('StaveTie');
      runTests('Simple StaveTie', StaveTie.simple);
      runTests('Chord StaveTie', StaveTie.chord);
      runTests('Stem Up StaveTie', StaveTie.stemUp);
      runTests('No End Note', StaveTie.noEndNote);
      runTests('No Start Note', StaveTie.noStartNote);
      runTests('Set Direction Down', StaveTie.setDirectionDown);
      runTests('Set Direction Up', StaveTie.setDirectionUp);
    },

    simple: createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
        });
      }
    ),

    chord: createTest(
      ['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1, 2],
          last_indices: [0, 1, 2],
        });
      }
    ),

    stemUp: createTest(
      ['(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1, 2],
          last_indices: [0, 1, 2],
        });
      }
    ),

    noEndNote: createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes, stave) {
        stave.addEndClef('treble');
        vf.StaveTie({
          from: notes[1],
          to: null,
          first_indices: [2],
          last_indices: [2],
          text: 'slow.',
        });
      }
    ),

    noStartNote: createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes, stave) {
        stave.addClef('treble');
        vf.StaveTie({
          from: null,
          to: notes[0],
          first_indices: [2],
          last_indices: [2],
          text: 'H',
        });
      }
    ),

    setDirectionDown: createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: {
            direction: Vex.Flow.Stem.DOWN,
          },
        });
      }
    ),

    setDirectionUp: createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: {
            direction: Vex.Flow.Stem.UP,
          },
        });
      }
    ),
  };

  return StaveTie;
})();
