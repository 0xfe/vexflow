/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.Curve = (function () {
  var Curve = {
    Start: function() {
      module("Curve");
      Vex.Flow.Test.runTest("Simple Curve", Curve.simple);
      Vex.Flow.Test.runRaphaelTest("Simple Curve (Raphael)", Curve.simple);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new Vex.Flow.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
      function newAcc(type) { return new Vex.Flow.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new Vex.Flow.Beam(notes.slice(0, 4), true);
      var beam1_2 = new Vex.Flow.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = Vex.Flow.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        cps: [{x: 0, y: 10}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 10}, {x: 0, y: 20}]
      });

      curve2.setContext(ctx).draw();

      ok("Simple Curve");
    }
  };

  return Curve;
})();