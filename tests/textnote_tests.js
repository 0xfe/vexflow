/**
 * VexFlow - Text Note Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TextNote = (function() {
  var TextNote = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module('TextNote');
      runTests('TextNote Formatting', TextNote.formatTextNotes);
      runTests('TextNote Formatting 2', TextNote.formatTextNotes2);
      runTests('TextNote Superscript and Subscript', TextNote.superscriptAndSubscript);
      runTests('TextNote Formatting With Glyphs 0', TextNote.formatTextGlyphs0);
      runTests('TextNote Formatting With Glyphs 1', TextNote.formatTextGlyphs1);
      runTests('Crescendo', TextNote.crescendo);
      runTests('Text Dynamics', TextNote.textDynamics);
    },

    formatTextNotes: function(options) {
      var vf = VF.Test.makeFactory(options, 400, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: 'q' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: 'q' })
          .addAccidental(0, vf.Accidental({ type: 'n' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'Center Justification',  duration: 'h' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'Left Line 1', duration: 'q' })
          .setLine(1),
        vf.TextNote({ text: 'Right', duration: 'q' })
          .setJustification(VF.TextNote.Justification.RIGHT),
      ]);

      const formatter = vf.Formatter();
      formatter.joinVoices([voice1, voice2]).formatToStave([voice1, voice2], stave);

      vf.draw();
      ok(true);
    },

    formatTextNotes2: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 200);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4'], stem_direction: 1, duration: '16' }),

        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5'], stem_direction: -1, duration: '16' }),

        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),
        vf.StaveNote({ keys: ['g/5', 'a/5'], stem_direction: -1, duration: '16' }),

        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),
        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: '16' }),

        vf.StaveNote({ keys: ['g/4', 'a/4'], stem_direction: 1, duration: 'q' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'C',  duration: '16' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'C',  duration: '16' }).setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ text: 'L', duration: '16' }),
        vf.TextNote({ text: 'R', duration: '16' }).setJustification(VF.TextNote.Justification.RIGHT),

        vf.TextNote({ text: 'R', duration: 'q' }).setJustification(VF.TextNote.Justification.RIGHT),
      ]);

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      voice2.getTickables().forEach(note => VF.Note.plotMetrics(vf.getContext(), note, 170));

      vf.draw();

      ok(true);
    },

    superscriptAndSubscript: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: 1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: 1, duration: 'q' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: 1, duration: 'q' })
          .addAccidental(0, vf.Accidental({ type: 'n' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: VF.unicode.flat + 'I', superscript: '+5',  duration: '8' }),
        vf.TextNote({ text: 'D' + VF.unicode.sharp + '/F',  duration: '4d', superscript: 'sus2' }),
        vf.TextNote({ text: 'ii', superscript: '6', subscript: '4',  duration: '8' }),
        vf.TextNote({ text: 'C', superscript: VF.unicode.triangle + '7', subscript: '', duration: '8' }),
        vf.TextNote({ text: 'vii', superscript: VF.unicode['o-with-slash'] + '7', duration: '8' }),
        vf.TextNote({ text: 'V', superscript: '7',   duration: '8' }),
      ]);

      voice2.getTickables().forEach(function(note) {
        note.font = { family: 'Serif', size: 15, weight: '' };
        note.setLine(13);
        note.setJustification(VF.TextNote.Justification.LEFT);
      });

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    formatTextGlyphs0: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ text: 'Center',  duration: '8' })
          .setJustification(VF.TextNote.Justification.CENTER),
        vf.TextNote({ glyph: 'f', duration: '8' }),
        vf.TextNote({ glyph: 'p', duration: '8' }),
        vf.TextNote({ glyph: 'm', duration: '8' }),
        vf.TextNote({ glyph: 'z', duration: '8' }),

        vf.TextNote({ glyph: 'mordent_upper', duration: '16' }),
        vf.TextNote({ glyph: 'mordent_lower', duration: '16' }),
        vf.TextNote({ glyph: 'segno', duration: '8' }),
        vf.TextNote({ glyph: 'coda', duration: '8' }),
      ]);

      voice2.getTickables().forEach(n => n.setJustification(VF.TextNote.Justification.CENTER));

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    formatTextGlyphs1: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice1 = score.voice([
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], stem_direction: -1, duration: 'h' })
          .addAccidental(0, vf.Accidental({ type: 'b' }))
          .addAccidental(1, vf.Accidental({ type: '#' })),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
        vf.StaveNote({ keys: ['c/4', 'f/4', 'a/4'], stem_direction: -1, duration: '8' }),
      ]);

      var voice2 = score.voice([
        vf.TextNote({ glyph: 'turn',  duration: '16' }),
        vf.TextNote({ glyph: 'turn_inverted',  duration: '16' }),
        vf.TextNote({ glyph: 'pedal_open', duration: '8' }).setLine(10),
        vf.TextNote({ glyph: 'pedal_close', duration: '8' }).setLine(10),
        vf.TextNote({ glyph: 'caesura_curved', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'caesura_straight', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'breath', duration: '8' }).setLine(2),
        vf.TextNote({ glyph: 'tick', duration: '8' }).setLine(3),
        vf.TextNote({ glyph: 'tr', duration: '8', smooth: true })
          .setJustification(VF.TextNote.Justification.CENTER),
      ]);

      voice2.getTickables().forEach(n => n.setJustification(VF.TextNote.Justification.CENTER));

      vf.Formatter()
        .joinVoices([voice1, voice2])
        .formatToStave([voice1, voice2], stave);

      vf.draw();

      ok(true);
    },

    crescendo: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice([
        vf.TextNote({ glyph: 'p', duration: '16' }),
        new VF.Crescendo({ duration: '4d' })
          .setLine(0)
          .setHeight(25)
          .setStave(stave),
        vf.TextNote({ glyph: 'f', duration: '16' }),
        new VF.Crescendo({ duration: '4' })
          .setLine(5)
          .setStave(stave),
        new VF.Crescendo({ duration: '4' })
          .setLine(10)
          .setDecrescendo(true)
          .setHeight(5)
          .setStave(stave),
      ]);

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },

    textDynamics: function(options) {
      var vf = VF.Test.makeFactory(options, 600, 230);
      var stave = vf.Stave({ y: 40 });
      var score = vf.EasyScore();

      var voice = score.voice([
        vf.TextDynamics({ text: 'sfz', duration: '4' }),
        vf.TextDynamics({ text: 'rfz', duration: '4' }),
        vf.TextDynamics({ text: 'mp',  duration: '4' }),
        vf.TextDynamics({ text: 'ppp', duration: '4' }),

        vf.TextDynamics({ text: 'fff', duration: '4' }),
        vf.TextDynamics({ text: 'mf',  duration: '4' }),
        vf.TextDynamics({ text: 'sff', duration: '4' }),
      ], { time: '7/4' });

      vf.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      vf.draw();

      ok(true);
    },
  };

  return TextNote;
})();
