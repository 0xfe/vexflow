/**
 * VexFlow - Dot Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Dot = (function() {
  function showNote(note, stave, ctx, x) {
    note
      .setStave(stave)
      .addToModifierContext(new VF.ModifierContext());

    new VF.TickContext()
      .addTickable(note)
      .preFormat()
      .setX(x);

    note.setContext(ctx).draw();

    VF.Test.plotNoteWidth(ctx, note, 140);

    return note;
  }

  function showNotes(note1, note2, stave, ctx, x) {
    var modifierContext = new VF.ModifierContext();
    note1.setStave(stave).addToModifierContext(modifierContext);
    note2.setStave(stave).addToModifierContext(modifierContext);

    new VF.TickContext()
      .addTickable(note1)
      .addTickable(note2)
      .setX(x)
      .preFormat();

    note1.setContext(ctx).draw();
    note2.setContext(ctx).draw();

    VF.Test.plotNoteWidth(ctx, note1, 180);
    VF.Test.plotNoteWidth(ctx, note2, 20);
  }

  var Dot = {
    Start: function() {
      QUnit.module('Dot');
      VF.Test.runTests('Basic', VF.Test.Dot.basic);
      VF.Test.runTests('Multi Voice', VF.Test.Dot.multiVoice);
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 1000, 240);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(10, 10, 975);
      stave.setContext(ctx);
      stave.draw();

      var notes = [
        new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4', 'b/4'], duration: 'w' })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['a/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'a/4', 'b/4'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'f/4', 'b/4', 'c/5'], duration: '4' })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'a/4', 'd/5', 'e/5', 'g/5'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['g/4', 'b/4', 'd/5', 'e/5'], duration: '4', stem_direction: -1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'g/4', 'b/4', 'c/5'], duration: '4', stem_direction: 1 })
          .addDotToAll(),
        new VF.StaveNote({ keys: ['d/4', 'e/4', 'f/4', 'a/4', 'c/5', 'e/5', 'g/5'], duration: '2' })
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: -1 })
          .addDotToAll()
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'g/5'], duration: '16', stem_direction: 1 })
          .addDotToAll()
          .addDotToAll()
          .addDotToAll(),
        new VF.StaveNote({ keys: ['e/4', 'g/4', 'a/4', 'b/4', 'c/5', 'e/5', 'f/5'], duration: '16', stem_direction: 1 })
          .addDotToAll(),
      ];

      for (var i = 0; i < notes.length; i++) {
        showNote(notes[i], stave, ctx, 30 + (i * 65));
        var dots = notes[i].getDots();
        ok(dots.length > 0, 'Note ' + i + ' has dots');

        for (var j = 0; j < dots.length; ++j) {
          ok(dots[j].width > 0, 'Dot ' + j + ' has width set');
        }
      }

      VF.Test.plotLegendForNoteWidth(ctx, 770, 140);

      ok(true, 'Full Dot');
    },

    multiVoice: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.elementId, 750, 300);
      ctx.setFillStyle('#221');
      ctx.setStrokeStyle('#221');

      var stave = new VF.Stave(30, 40, 700).setContext(ctx).draw();

      var note1 = new VF.StaveNote({ keys: ['c/4', 'e/4', 'a/4'], duration: '2', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll();

      var note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '2', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 60);

      note1 = new VF.StaveNote({ keys: ['c/4', 'e/4', 'c/5'], duration: '2', stem_direction: -1 })
        .addDot(0)
        .addDot(0)
        .addDot(1)
        .addDot(1)
        .addDot(2)
        .addDot(2)
        .addDot(2);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addDotToAll()
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 150);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '2', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '4', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 250);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'g/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 350);

      note1 = new VF.StaveNote({ keys: ['d/4', 'c/5', 'd/5'], duration: '8', stem_direction: -1 })
        .addDotToAll()
        .addDotToAll()
        .addDot(0);

      note2 = new VF.StaveNote({ keys: ['d/5', 'a/5', 'b/5'], duration: '8', stem_direction: 1 })
        .addDotToAll();

      showNotes(note1, note2, stave, ctx, 450);

      VF.Test.plotLegendForNoteWidth(ctx, 620, 180);

      ok(true, 'Full Dot');
    },
  };

  return Dot;
})();
