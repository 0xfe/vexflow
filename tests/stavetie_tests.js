/**
 * VexFlow - StaveTie Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

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

    simple: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }
      ));

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Simple Test');
    },

    chord: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'down' })
      );

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Chord test');
    },

    stemUp: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(d4 e4 f4)/2, (cn4 f#4 a4)', { stem: 'up' })
      );

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1, 2],
        last_indices: [0, 1, 2],
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Stem up test');
    },

    noEndNote: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave().addEndClef('treble');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }
      ));

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[1],
        to: null,
        first_indices: [2],
        last_indices: [2],
        text: 'slow.',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'No end note');
    },

    noStartNote: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave().addClef('treble');
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }
      ));

      var notes = voice.getTickables();

      vf.StaveTie({
        from: null,
        to: notes[0],
        first_indices: [2],
        last_indices: [2],
        text: 'H',
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'No end note');
    },

    setDirectionDown: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }
      ));

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: {
          direction: Vex.Flow.Stem.DOWN,
        },
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Set Direction Down');
    },

    setDirectionUp: function(options) {
      var vf = VF.Test.makeFactory(options, 300);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var voice = score.voice(score.notes(
        '(cb4 e#4 a4)/2, (d4 e4 f4)', { stem: 'down' }
      ));

      var notes = voice.getTickables();

      vf.StaveTie({
        from: notes[0],
        to: notes[1],
        first_indices: [0, 1],
        last_indices: [0, 1],
        options: {
          direction: Vex.Flow.Stem.UP,
        },
      });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true, 'Set Direction Down');
    },
  };

  return StaveTie;
})();
