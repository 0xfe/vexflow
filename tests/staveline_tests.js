/**
 * VexFlow - StaveLine Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */
VF.Test.StaveLine = (function() {
  var StaveLine = {
    Start: function() {
      QUnit.module('StaveLine');
      VF.Test.runTests('Simple StaveLine', VF.Test.StaveLine.simple0);
      VF.Test.runTests('StaveLine Arrow Options', VF.Test.StaveLine.simple1);
    },

    simple0: function(options) {
      var vf = VF.Test.makeFactory(options);
      var stave = vf.Stave().addTrebleGlyph();

      var notes = [
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['c/5'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['c/4', 'g/4', 'b/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'f/5'], duration: '4', clef: 'treble' }),
      ];

      var voice = vf.Voice().addTickables(notes);

      vf.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: {
          font: { family: 'serif', size: 12, weight: 'italic' },
          text: 'gliss.',
        },
      });

      var staveLine2 = vf.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [2, 1, 0],
        last_indices: [0, 1, 2],
      });
      staveLine2.render_options.line_dash = [10, 10];

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    simple1: function(options) {
      var vf = VF.Test.makeFactory(options, 770);
      var stave = vf.Stave().addTrebleGlyph();

      var notes = [
        vf.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 })
          .addDotToAll(),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' })
          .addAccidental(0, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4', 'e/4', 'g/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
          .addAccidental(2, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c/4'], duration: '4', clef: 'treble' })
          .addAccidental(0, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['c#/5', 'd/5'], duration: '4', clef: 'treble', stem_direction: -1 }),
        vf.StaveNote({ keys: ['c/4', 'd/4', 'g/4'], duration: '4', clef: 'treble' }),
        vf.StaveNote({ keys: ['f/4', 'a/4', 'c/5'], duration: '4', clef: 'treble' })
          .addAccidental(2, vf.Accidental({ type: '#' })),
      ];
      var voice = vf.Voice().setStrict(false).addTickables(notes);

      var staveLine0 = vf.StaveLine({
        from: notes[0],
        to: notes[1],
        first_indices: [0],
        last_indices: [0],
        options: {
          text: 'Left',
        },
      });

      var staveLine4 = vf.StaveLine({
        from: notes[2],
        to: notes[3],
        first_indices: [1],
        last_indices: [1],
        options: {
          text: 'Right',
        },
      });

      var staveLine1 = vf.StaveLine({
        from: notes[4],
        to: notes[5],
        first_indices: [0],
        last_indices: [0],
        options: {
          text: 'Center',
        },
      });

      var staveLine2 = vf.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [1],
        last_indices: [0],
      });

      var staveLine3 = vf.StaveLine({
        from: notes[6],
        to: notes[7],
        first_indices: [2],
        last_indices: [2],
        options: {
          text: 'Top',
        },
      });

      staveLine0.render_options.draw_end_arrow = true;
      staveLine0.render_options.text_justification = 1;
      staveLine0.render_options.text_position_vertical = 2;

      staveLine1.render_options.draw_end_arrow = true;
      staveLine1.render_options.arrowhead_length = 30;
      staveLine1.render_options.line_width = 5;
      staveLine1.render_options.text_justification = 2;
      staveLine1.render_options.text_position_vertical = 2;

      staveLine4.render_options.line_width = 2;
      staveLine4.render_options.draw_end_arrow = true;
      staveLine4.render_options.draw_start_arrow = true;
      staveLine4.render_options.arrowhead_angle = 0.5;
      staveLine4.render_options.arrowhead_length = 20;
      staveLine4.render_options.text_justification = 3;
      staveLine4.render_options.text_position_vertical = 2;

      staveLine2.render_options.draw_start_arrow = true;
      staveLine2.render_options.line_dash = [5, 4];

      staveLine3.render_options.draw_end_arrow = true;
      staveLine3.render_options.draw_start_arrow = true;
      staveLine3.render_options.color = 'red';
      staveLine3.render_options.text_position_vertical = 1;

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return StaveLine;
}());
