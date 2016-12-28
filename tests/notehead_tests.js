/**
 * VexFlow - NoteHead Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.NoteHead = (function() {
  var NoteHead = {
    Start: function() {
      QUnit.module('NoteHead');
      VF.Test.runTests('Basic', VF.Test.NoteHead.basic);
      VF.Test.runTests('Bounding Boxes', VF.Test.NoteHead.basicBoundingBoxes);
    },

    setupContext: function(options, x, y) {
      var ctx = new options.contextBuilder(options.elementId, x || 450, y || 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = '#221'; ctx.strokeStyle = '#221';
      ctx.font = ' 10pt Arial';
      var stave = new VF.Stave(10, 10, x || 450).addTrebleGlyph();

      return { context: ctx, stave: stave };
    },

    basic: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var ctx = VF.Test.NoteHead.setupContext(options, 450, 250).context;
      var stave = new VF.Stave(10, 0, 250).addTrebleGlyph();
      ctx.scale(2.0, 2.0);

      var notehead1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var notehead2 = new VF.NoteHead({
        duration: '1',
        line: 2.5,
      });

      var notehead3 = new VF.NoteHead({
        duration: '2',
        line: 0,
      });

      var voice = new VF.Voice(VF.TIME4_4)
        .setStrict(false)
        .addTickables([notehead1, notehead2, notehead3])
        .updateStave(stave);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(ctx).draw();
      voice.draw(ctx);

      ok('Basic NoteHead test');
    },

    basicBoundingBoxes: function(options, contextBuilder) {
      options.contextBuilder = contextBuilder;

      var ctx = VF.Test.NoteHead.setupContext(options, 350, 250).context;
      ctx.scale(2.0, 2.0);

      var stave = new VF.Stave(10, 0, 250).addTrebleGlyph();

      var notehead1 = new VF.NoteHead({
        duration: '4',
        line: 3,
      });

      var notehead2 = new VF.NoteHead({
        duration: '2',
        line: 2.5,
      });

      var notehead3 = new VF.NoteHead({
        duration: '1',
        line: 0,
      });

      var voice = new VF.Voice(VF.TIME4_4)
        .setStrict(false)
        .addTickables([notehead1, notehead2, notehead3])
        .updateStave(stave);

      new VF.Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave);

      stave.setContext(ctx).draw();
      voice.draw(ctx);

      notehead1.getBoundingBox().draw(ctx);
      notehead2.getBoundingBox().draw(ctx);
      notehead3.getBoundingBox().draw(ctx);

      ok('NoteHead Bounding Boxes');
    },
  };

  return NoteHead;
})();
