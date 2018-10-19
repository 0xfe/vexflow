/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

function createSingleMeasureTest(setup) {
  return function(options) {
    var vf = VF.Test.makeFactory(options, 500);
    var stave = vf.Stave().addClef('percussion');

    setup(vf);

    vf.Formatter()
      .joinVoices(vf.getVoices())
      .formatToStave(vf.getVoices(), stave);

    vf.draw();

    ok(true);
  };
}

VF.Test.Percussion = (function() {
  function showNote(note_struct, stave, ctx, x) {
    var note = new VF.StaveNote(note_struct).setStave(stave);

    new VF.TickContext()
      .addTickable(note)
      .preFormat()
      .setX(x);

    note.setContext(ctx).draw();

    return note;
  }

  var Percussion = {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('Percussion');

      run('Percussion Clef', Percussion.draw);
      run('Percussion Notes', Percussion.drawNotes);

      run('Percussion Basic0', createSingleMeasureTest(function(vf) {
        var voice0 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
        ]);

        var voice1 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
        ]);

        vf.Beam({ notes: voice0.getTickables() });
        vf.Beam({ notes: voice1.getTickables().slice(0, 2) });
        vf.Beam({ notes: voice1.getTickables().slice(3, 6) });
      }));

      run('Percussion Basic1', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
          vf.StaveNote({ keys: ['f/5/x2'], duration: '4' }),
        ]);

        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
        ]);
      }));

      run('Percussion Basic2', createSingleMeasureTest(function(vf) {
        var voice0 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['a/5/x3'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '8' }),
        ]);
        vf.Beam({ notes: voice0.getTickables().slice(1, 8) });

        var voice1 = vf.Voice().addTickables([
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '8', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['f/4'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['d/4/x2', 'c/5'], duration: '8d', stem_direction: -1 }).addDotToAll(),
          vf.StaveNote({ keys: ['c/5'], duration: '16', stem_direction: -1 }),
        ]);

        vf.Beam({ notes: voice1.getTickables().slice(0, 2) });
        vf.Beam({ notes: voice1.getTickables().slice(4, 6) });
      }));

      run('Percussion Snare0', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'a>' }))
            .addModifier(0, vf.Annotation({ text: 'L' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'R' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'L' })),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addModifier(0, vf.Annotation({ text: 'L' })),
        ]);
      }));

      run('Percussion Snare1', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'ah' })),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 }),
          vf.StaveNote({ keys: ['g/5/x2'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'ah' })),
          vf.StaveNote({ keys: ['a/5/x3'], duration: '4', stem_direction: -1 })
            .addArticulation(0, vf.Articulation({ type: 'a,' })),
        ]);
      }));

      run('Percussion Snare2', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(1)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(1)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(3)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: -1 })
            .addArticulation(0, new VF.Tremolo(5)),
        ]);
      }));

      run('Percussion Snare3', createSingleMeasureTest(function(vf) {
        vf.Voice().addTickables([
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(2)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(2)),
          vf.GraceNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(3)),
          vf.StaveNote({ keys: ['c/5'], duration: '4', stem_direction: 1 })
            .addArticulation(0, new VF.Tremolo(5)),
        ]);
      }));
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 400, 120);

      new VF.Stave(10, 10, 300)
        .addClef('percussion')
        .setContext(ctx)
        .draw();

      ok(true);
    },

    drawNotes: function(options, contextBuilder) {
      var notes = [
        { keys: ['g/5/d0'], duration: '4' },
        { keys: ['g/5/d1'], duration: '4' },
        { keys: ['g/5/d2'], duration: '4' },
        { keys: ['g/5/d3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/t0'], duration: '1' },
        { keys: ['g/5/t1'], duration: '4' },
        { keys: ['g/5/t2'], duration: '4' },
        { keys: ['g/5/t3'], duration: '4' },
        { keys: ['x/'], duration: '1' },

        { keys: ['g/5/x0'], duration: '1' },
        { keys: ['g/5/x1'], duration: '4' },
        { keys: ['g/5/x2'], duration: '4' },
        { keys: ['g/5/x3'], duration: '4' },
      ];

      var ctx = new contextBuilder(options.elementId, notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75)
          .addClef('percussion')
          .setContext(ctx)
          .draw();

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h === 0 ? -1 : 1);
          var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, 'Note ' + i + ' has X value');
          ok(staveNote.getYs().length > 0, 'Note ' + i + ' has Y values');
        }
      }
    },
  };

  return Percussion;
})();
