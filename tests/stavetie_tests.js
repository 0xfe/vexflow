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
      QUnit.module('StaveTie');
      VF.Test.runModule(this);
    },

    'Simple StaveTie': createTest(
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

    'Chord StaveTie': createTest(
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

    'Stem Up StaveTie': createTest(
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

    'No End Note': createTest(
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

    'No Start Note': createTest(
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

    'Set Direction Down': createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: {
            direction: VF.Stem.DOWN,
          },
        });
      }
    ),

    'Set Direction Up': createTest(
      ['(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }],
      function(vf, notes) {
        vf.StaveTie({
          from: notes[0],
          to: notes[1],
          first_indices: [0, 1],
          last_indices: [0, 1],
          options: {
            direction: VF.Stem.UP,
          },
        });
      }
    ),
  };

  return StaveTie;
})();
