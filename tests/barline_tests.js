/**
 * VexFlow - Barline Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Barline = (function() {
  var Barline = {
    Start: function() {
      var runTests = VF.Test.runTests;

      QUnit.module("Barline");
      runTests("Simple BarNotes", Barline.barnotes);
    },

    barnotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["d/4", "e/4", "f/4"], stem_direction: -1, duration: "h"}),
        new VF.BarNote(VF.Barline.SINGLE),
        newNote({ keys: ["c/4", "f/4", "a/4"], stem_direction: -1, duration: "h"}).
          addAccidental(0, newAcc("n")).
          addAccidental(1, newAcc("#"))
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 250);

      var stave = new VF.Stave(10, 10, 350).setContext(ctx).draw();
      voice.draw(ctx, stave);

      ok(true, "Simple Test");
    }
  };

  return Barline;
})();