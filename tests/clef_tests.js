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
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble");
      stave.addClef("treble", "default", "8va");
      stave.addClef("treble", "default", "8vb");
      stave.addClef("alto");
      stave.addClef("tenor");
      stave.addClef("soprano");
      stave.addClef("bass");
      stave.addClef("bass", "default", "8vb");
      stave.addClef("mezzo-soprano");
      stave.addClef("baritone-c");
      stave.addClef("baritone-f");
      stave.addClef("subbass");
      stave.addClef("percussion");
      stave.addClef("french");

      stave.addEndClef("treble");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass");

      stave.addEndClef("treble");
      stave.addEndClef("treble", "default", "8va");
      stave.addEndClef("treble", "default", "8vb");
      stave.addEndClef("alto");
      stave.addEndClef("tenor");
      stave.addEndClef("soprano");
      stave.addEndClef("bass");
      stave.addEndClef("bass", "default", "8vb");
      stave.addEndClef("mezzo-soprano");
      stave.addEndClef("baritone-c");
      stave.addEndClef("baritone-f");
      stave.addEndClef("subbass");
      stave.addEndClef("percussion");
      stave.addEndClef("french");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },


    drawSmall: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("treble", "small");
      stave.addClef("treble", "small", "8va");
      stave.addClef("treble", "small", "8vb");
      stave.addClef("alto", "small");
      stave.addClef("tenor", "small");
      stave.addClef("soprano", "small");
      stave.addClef("bass", "small");
      stave.addClef("bass", "small", "8vb");
      stave.addClef("mezzo-soprano", "small");
      stave.addClef("baritone-c", "small");
      stave.addClef("baritone-f", "small");
      stave.addClef("subbass", "small");
      stave.addClef("percussion", "small");
      stave.addClef("french", "small");

      stave.addEndClef("treble", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawSmallEnd: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 120);
      var stave = new VF.Stave(10, 10, 700);

      stave.addClef("bass", "small");

      stave.addEndClef("treble", "small");
      stave.addEndClef("treble", "small", "8va");
      stave.addEndClef("treble", "small", "8vb");
      stave.addEndClef("alto", "small");
      stave.addEndClef("tenor", "small");
      stave.addEndClef("soprano", "small");
      stave.addEndClef("bass", "small");
      stave.addEndClef("bass", "small", "8vb");
      stave.addEndClef("mezzo-soprano", "small");
      stave.addEndClef("baritone-c", "small");
      stave.addEndClef("baritone-f", "small");
      stave.addEndClef("subbass", "small");
      stave.addEndClef("percussion", "small");
      stave.addEndClef("french", "small");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    drawClefChange: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 180);
      var stave = new VF.Stave(10, 10, 700);
      stave.addClef("treble").setContext(ctx).draw();

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
      });

      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 500);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return Clef;
})();