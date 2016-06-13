/**
 * VexFlow - Curve Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

var VF = Vex.Flow;
VF.Test.Curve = (function () {
  var Curve = {
    Start: function() {
      QUnit.module("Curve");
      VF.Test.runTests("Simple Curve", Curve.simple);
      VF.Test.runTests("Rounded Curve", Curve.rounded);
      VF.Test.runTests("Thick Thin Curves", Curve.thickThin);
      VF.Test.runTests("Top Curve", Curve.topCurve);
    },

    simple: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

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

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        cps: [{x: 0, y: 10}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 10}, {x: 0, y: 20}]
      });

      curve2.setContext(ctx).draw();

      ok("Simple Curve");
    },

    rounded: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Rounded Curve");
    },

    thickThin: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[3], {
        thickness: 10,
        x_shift: -10,
        y_shift: 30,
        cps: [{x: 0, y: 20}, {x: 0, y: 50}]
      });

      curve1.setContext(ctx).draw();

      var curve2 = new Curve(notes[4], notes[7], {
        thickness: 0,
        cps: [{x: 0, y: 50}, {x: 0, y: 50}]
      });

      curve2.setContext(ctx).draw();

      ok("Thick Thin Curve");
    },

    topCurve: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 140);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
      ctx.font = " 10pt Arial";
      var stave = new VF.Stave(10, 30, 350).addTrebleGlyph().
        setContext(ctx).draw();

      function newNote(note_struct) { return new VF.StaveNote(note_struct); }
      function newAcc(type) { return new VF.Accidental(type); }

      var notes = [
        newNote({ keys: ["c/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["d/4"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["f/6"], stem_direction: 1, duration: "8"}),
        newNote({ keys: ["g/5"], stem_direction: 1, duration: "8"})
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().joinVoices([voice]).
        format([voice], 300);
      var beam1_1 = new VF.Beam(notes.slice(0, 4), true);
      var beam1_2 = new VF.Beam(notes.slice(4, 8), true);

      voice.draw(ctx, stave);
      beam1_1.setContext(ctx).draw();
      beam1_2.setContext(ctx).draw();

      var Curve = VF.Curve;
      var curve1 = new Curve(notes[0], notes[7], {
        x_shift: -3,
        y_shift: 10,
        position: Curve.Position.NEAR_TOP,
        position_end: Curve.Position.NEAR_HEAD,

        cps: [{x: 0, y: 20}, {x: 40, y: 80}]
      });

      curve1.setContext(ctx).draw();

      ok("Top Curve");
    }
  };

  return Curve;
})();