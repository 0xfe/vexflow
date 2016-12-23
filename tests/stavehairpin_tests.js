/**
 * VexFlow - StaveHairpin Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 * Author: Raffaele Viglianti, 2012
 */

VF.Test.StaveHairpin = (function() {
  function drawHairpin(notes, stave, ctx, type, position, options) {
    var hairpin = new VF.StaveHairpin(notes, type);

    hairpin.setContext(ctx);
    hairpin.setPosition(position);
    if (options) hairpin.setRenderOptions(options);
    hairpin.draw();
  }

  function createTest(drawHairpins) {
    return function(options) {
      var vf = VF.Test.makeFactory(options);
      var ctx = vf.getContext();
      var stave = vf.Stave();

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: '4' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['e/4'], stem_direction: 1, duration: '4' }),
        vf.StaveNote({ keys: ['f/4'], stem_direction: 1, duration: '4' }),
      ];

      var voice = vf.Voice().addTickables(notes);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      drawHairpins(ctx, stave, notes);

      ok(true, 'Simple Test');
    };
  }

  return {
    Start: function() {
      var run = VF.Test.runTests;

      QUnit.module('StaveHairpin');

      run('Simple StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin({ first_note: notes[0], last_note: notes[2] }, stave, ctx, 1, 4);
        drawHairpin({ first_note: notes[1], last_note: notes[3] }, stave, ctx, 2, 3);
      }));

      run('Horizontal Offset StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin({ first_note: notes[0], last_note: notes[2] }, stave, ctx, 1, 3, {
          height: 10,
          vo: 20, // vertical offset
          left_ho: 20, // left horizontal offset
          right_ho: -20, // right horizontal offset
        });
        drawHairpin({ first_note: notes[3], last_note: notes[3] }, stave, ctx, 2, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 120, // right horizontal offset
        });
      }));

      run('Vertical Offset StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin({ first_note: notes[0], last_note: notes[2] }, stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin({ first_note: notes[2], last_note: notes[3] }, stave, ctx, 2, 4, {
          height: 10,
          y_shift: -15, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      }));

      run('Height StaveHairpin', createTest(function(ctx, stave, notes) {
        drawHairpin({ first_note: notes[0], last_note: notes[2] }, stave, ctx, 1, 4, {
          height: 10,
          y_shift: 0, // vertical offset
          left_shift_px: 0, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
        drawHairpin({ first_note: notes[2], last_note: notes[3] }, stave, ctx, 2, 4, {
          height: 15,
          y_shift: 0, // vertical offset
          left_shift_px: 2, // left horizontal offset
          right_shift_px: 0, // right horizontal offset
        });
      }));
    },
  };
}());
