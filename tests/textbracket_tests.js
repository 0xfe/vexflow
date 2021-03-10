/**
 * VexFlow - TextBracket Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextBracket = (function () {
  var TextBracket = {
    Start: function () {
      QUnit.module('TextBracket');
      VF.Test.runTests('Simple TextBracket', VF.Test.TextBracket.simple0);
      VF.Test.runTests('TextBracket Styles', VF.Test.TextBracket.simple1);
    },

    simple0: function (options) {
      var vf = VF.Test.makeFactory(options, 550);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
      var voice = score.voice(notes, { time: '5/4' });

      vf.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '15',
        options: {
          superscript: 'va',
          position: 'top',
        },
      });

      vf.TextBracket({
        from: notes[0],
        to: notes[4],
        text: '8',
        options: {
          superscript: 'vb',
          position: 'bottom',
          line: 3,
        },
      });

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    simple1: function (options) {
      var vf = VF.Test.makeFactory(options, 550);
      var stave = vf.Stave();
      var score = vf.EasyScore();

      var notes = score.notes('c4/4, c4, c4, c4, c4', { stem: 'up' });
      var voice = score.voice(notes, { time: '5/4' });

      const topOctaves = [
        vf.TextBracket({
          from: notes[0],
          to: notes[1],
          text: 'Cool notes',
          options: {
            superscript: '',
            position: 'top',
          },
        }),
        vf.TextBracket({
          from: notes[2],
          to: notes[4],
          text: 'Testing',
          options: {
            position: 'top',
            superscript: 'superscript',
            font: { family: 'Arial', size: 15, weight: '' },
          },
        }),
      ];

      const bottomOctaves = [
        vf.TextBracket({
          from: notes[0],
          to: notes[1],
          text: '8',
          options: {
            superscript: 'vb',
            position: 'bottom',
            line: 3,
            font: { size: 30 },
          },
        }),
        vf.TextBracket({
          from: notes[2],
          to: notes[4],
          text: 'Not cool notes',
          options: {
            superscript: ' super uncool',
            position: 'bottom',
            line: 4,
          },
        }),
      ];

      topOctaves[1].render_options.line_width = 2;
      topOctaves[1].render_options.show_bracket = false;

      bottomOctaves[0].render_options.underline_superscript = false;
      bottomOctaves[0].setDashed(false);

      bottomOctaves[1].render_options.bracket_height = 40;
      bottomOctaves[1].setDashed(true, [2, 2]);

      vf.Formatter().joinVoices([voice]).formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return TextBracket;
})();
