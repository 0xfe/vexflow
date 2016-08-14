/**
 * VexFlow - Clef Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Clef = (function() {
  var Clef = {
    Start: function() {
      QUnit.module("Clef");
      VF.Test.runTests("Clef Test", VF.Test.Clef.draw);
      VF.Test.runTests("Clef End Test", VF.Test.Clef.drawEnd);
      VF.Test.runTests("Small Clef Test", VF.Test.Clef.drawSmall);
      VF.Test.runTests("Small Clef End Test", VF.Test.Clef.drawSmallEnd);
      VF.Test.runTests("Clef Change Test", VF.Test.Clef.drawClefChange);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);

      new VF.Stave(10, 10, 700)
        .addClef("treble")
        .addClef("treble", "default", "8va")
        .addClef("treble", "default", "8vb")
        .addClef("alto")
        .addClef("tenor")
        .addClef("soprano")
        .addClef("bass")
        .addClef("bass", "default", "8vb")
        .addClef("mezzo-soprano")
        .addClef("baritone-c")
        .addClef("baritone-f")
        .addClef("subbass")
        .addClef("percussion")
        .addClef("french")
        .addEndClef("treble")
        .setContext(ctx)
        .draw();

      ok(true, "all pass");
    },

    drawEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);

      new VF.Stave(10, 10, 700)
        .addClef("bass")
        .addEndClef("treble")
        .addEndClef("treble", "default", "8va")
        .addEndClef("treble", "default", "8vb")
        .addEndClef("alto")
        .addEndClef("tenor")
        .addEndClef("soprano")
        .addEndClef("bass")
        .addEndClef("bass", "default", "8vb")
        .addEndClef("mezzo-soprano")
        .addEndClef("baritone-c")
        .addEndClef("baritone-f")
        .addEndClef("subbass")
        .addEndClef("percussion")
        .addEndClef("french")
        .setContext(ctx)
        .draw();

      ok(true, "all pass");
    },


    drawSmall: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);

      new VF.Stave(10, 10, 700)
        .addClef("treble", "small")
        .addClef("treble", "small", "8va")
        .addClef("treble", "small", "8vb")
        .addClef("alto", "small")
        .addClef("tenor", "small")
        .addClef("soprano", "small")
        .addClef("bass", "small")
        .addClef("bass", "small", "8vb")
        .addClef("mezzo-soprano", "small")
        .addClef("baritone-c", "small")
        .addClef("baritone-f", "small")
        .addClef("subbass", "small")
        .addClef("percussion", "small")
        .addClef("french", "small")
        .addEndClef("treble", "small")
        .setContext(ctx)
        .draw();

      ok(true, "all pass");
    },

    drawSmallEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);

      new VF.Stave(10, 10, 700)
        .addClef("bass", "small")
        .addEndClef("treble", "small")
        .addEndClef("treble", "small", "8va")
        .addEndClef("treble", "small", "8vb")
        .addEndClef("alto", "small")
        .addEndClef("tenor", "small")
        .addEndClef("soprano", "small")
        .addEndClef("bass", "small")
        .addEndClef("bass", "small", "8vb")
        .addEndClef("mezzo-soprano", "small")
        .addEndClef("baritone-c", "small")
        .addEndClef("baritone-f", "small")
        .addEndClef("subbass", "small")
        .addEndClef("percussion", "small")
        .addEndClef("french", "small")
        .setContext(ctx)
        .draw();

      ok(true, "all pass");
    },

    drawClefChange: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 180);
      var stave = new VF.Stave(10, 10, 700).addClef("treble");

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.ClefNote("alto", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "alto" }),
        new VF.ClefNote("tenor", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "tenor" }),
        new VF.ClefNote("soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "soprano" }),
        new VF.ClefNote("bass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "bass" }),
        new VF.ClefNote("mezzo-soprano", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "mezzo-soprano" }),
        new VF.ClefNote("baritone-c","small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-c" }),
        new VF.ClefNote("baritone-f", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "baritone-f" }),
        new VF.ClefNote("subbass", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "subbass" }),
        new VF.ClefNote("french", "small"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "french" }),
        new VF.ClefNote("treble", "small", "8vb"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: -1}),
        new VF.ClefNote("treble", "small", "8va"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble", octave_shift: 1 })
      ];

      var voice = new VF.Voice({
        num_beats: 12,
        beat_value: 4,
        resolution: VF.RESOLUTION
      }).addTickables(notes)
        .setStave(stave);

      var formatter = new VF.Formatter()
        .joinVoices([voice])
        .format([voice], 500);

      stave.setContext(ctx).draw();
      voice.draw(ctx);
      ok(true, "all pass");
    }
  };

  return Clef;
})();
