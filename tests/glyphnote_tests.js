/**
 * VexFlow - GlyphNote Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.GlyphNote = (function() {
  var run = VF.Test.runTests;

  var GlyphNote = {
    Start: function() {
      QUnit.module('GlyphNote');
      run('GlyphNote Positioning', GlyphNote.basic, { debug: false, noPadding: false });
      run('GlyphNote No Stave Padding', GlyphNote.basic, { debug: true, noPadding: true });
      run('GlyphNote RepeatNote', GlyphNote.repeatNote, { debug: false, noPadding: true });
    },

    basic: function(options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 300, 400);
      var system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha }
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      var voices = [
        [vf.GlyphNote(new VF.Glyph('repeat1Bar', 40), { duration: 'q' }, { line: 4 })],
        [vf.GlyphNote(new VF.Glyph('repeat2Bars', 40), { duration: 'q', align_center: true })],
        [
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeat4Bars', 40), { duration: '16' }),
          vf.GlyphNote(new VF.Glyph('repeatBarSlash', 40), { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },

    repeatNote: function(options) {
      VF.Registry.enableDefaultRegistry(new VF.Registry());

      var vf = VF.Test.makeFactory(options, 300, 500);
      var system = vf.System({
        x: 50,
        width: 250,
        debugFormatter: options.params.debug,
        noPadding: options.params.noPadding,
        options: { alpha: options.params.alpha }
      });

      var score = vf.EasyScore();

      var newVoice = function(notes) {
        return score.voice(notes, { time: '1/4' });
      };

      var newStave = function(voice) {
        return system
          .addStave({ voices: [voice], debugNoteMetrics: options.params.debug });
      };

      var voices = [
        [vf.RepeatNote('1')],
        [vf.RepeatNote('2')],
        [vf.RepeatNote('4')],
        [
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
          vf.RepeatNote('slash', { duration: '16' }),
        ],
      ];

      voices.map(newVoice).forEach(newStave);
      system.addConnector().setType(VF.StaveConnector.type.BRACKET);

      vf.draw();

      VF.Registry.disableDefaultRegistry();
      ok(true);
    },
  };

  return GlyphNote;
})();
