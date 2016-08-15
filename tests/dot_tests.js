/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Dot = (function() {
  var Dot = {
    Start: function() {
      QUnit.module('Dot');
      VF.Test.runTests('Basic', VF.Test.Dot.basic);
      VF.Test.runTests('Multi Voice', VF.Test.Dot.multiVoice);
    },

    basic: function(options, contextBuilder) {
      var vf = VF.Test.makeFactory(options, 750, 140);
      var stave = vf.Stave({ x: 10, y: 10, width: 700 });

      var notes = [
        vf.StaveNote({ keys: ['c/4', 'e/4', 'a/4', 'b/4'], duration: 'w' }).addDotToAll(),
        vf.StaveNote({ keys: ['a/4', 'b/4', 'c/5'], duration: 'q', stem_direction: 1 }).addDotToAll(),
        vf.StaveNote({ keys: ['g/4', 'a/4', 'b/4'], duration: 'q', stem_direction: -1 }).addDotToAll(),
        vf.StaveNote({ keys: ['e/4', 'f/4', 'b/4', 'c/5'], duration: 'q' }).addDotToAll(),
        vf.StaveNote({ keys: ['g/4', 'a/4', 'd/5', 'e/5', 'g/5'], duration: 'q', stem_direction: -1 }).addDotToAll(),
        vf.StaveNote({ keys: ['g/4', 'b/4', 'd/5', 'e/5'], duration: 'q', stem_direction: -1 }).addDotToAll(),
        vf.StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: 'q', stem_direction: 1 }).addDotToAll(),
        vf.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: 'h' }).addDotToAll().addDotToAll(),
        vf.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 }).addDotToAll().addDotToAll().addDotToAll()
      ];

      VF.Formatter.SimpleFormat(notes);

      vf.draw();

      ok(true, 'Full Dot');
    },

    showNotes: function(note1, note2, stave, ctx, x) {
      var mc = new VF.ModifierContext();
      note1.addToModifierContext(mc);
      note2.addToModifierContext(mc);

      note1.setStave(stave);
      note2.setStave(stave);

      var tickContext = new VF.TickContext();
      tickContext
        .addTickable(note1)
        .addTickable(note2)
        .setX(x)
        .preFormat()
        .setPixelsUsed(65);

      note1.setContext(ctx).setStave(stave).draw();
      note2.setContext(ctx).setStave(stave).draw();

      VF.Test.plotNoteWidth(ctx, note1, 180);
      VF.Test.plotNoteWidth(ctx, note2, 20);
    },

    multiVoice: function(options, contextBuilder) {
      function newNote(note_struct) { return new VF.StaveNote(note_struct); }

      var ctx = new contextBuilder(options.canvas_sel, 500, 300);
      ctx.fillStyle = '#221';
      ctx.strokeStyle = '#221';

      var stave = new VF.Stave(30, 40, 420).setContext(ctx).draw();
      var note1 = newNote({ keys: ['c/4', 'e/4', 'a/4'], duration: 'h', stem_direction: -1}).addDotToAll().addDotToAll();
      var note2 = newNote({ keys: ['d/5', 'a/5', 'b/5'], duration: 'h', stem_direction: 1}).addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 60);

      note1 = newNote({ keys: ['c/4', 'e/4', 'c/5'], duration: 'h', stem_direction: -1 })
        .addDot(0)
        .addDot(0)
        .addDot(1)
        .addDot(1)
        .addDot(2)
        .addDot(2)
        .addDot(2);

      note2 = newNote({ keys: ['d/5', 'a/5', 'b/5'], duration: 'q', stem_direction: 1 })
        .addDotToAll()
        .addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 150);

      note1 = newNote({ keys: ['d/4', 'c/5', 'd/5'], duration: 'h', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = newNote({ keys: ['d/5', 'a/5', 'b/5'], duration: 'q', stem_direction: 1 })
        .addDotToAll();

      VF.Test.Dot.showNotes(note1, note2, stave, ctx, 250);
      VF.Test.plotLegendForNoteWidth(ctx, 400, 180);
      ok(true, 'Full Dot');
    }
  };

  return Dot;
})()
