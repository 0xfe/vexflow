/**
 * VexFlow - TimeSignature Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.TimeSignature = (function() {
  function catchError(ts, spec) {
    try {
      ts.parseTimeSpec(spec);
    } catch (e) {
      equal(e.code, "BadTimeSignature", e.message);
    }
  }

  var TimeSignature = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("TimeSignature");
      test("Time Signature Parser", VF.Test.TimeSignature.parser);
      runTests("Basic Time Signatures", TimeSignature.basic);
      runTests("Big Signature Test", TimeSignature.big);
      runTests("Time Signature multiple staves alignment test", TimeSignature.multiStave);
      runTests("Time Signature Change Test", TimeSignature.timeSigNote);
    },

    parser: function() {
      expect(6);
      var ts = new VF.TimeSignature();

      // Invalid time signatures
      catchError(ts, "asdf");
      catchError(ts, "123/");
      catchError(ts, "/10");
      catchError(ts, "/");
      catchError(ts, "4567");
      catchError(ts, "C+");

      ts.parseTimeSpec("4/4");
      ts.parseTimeSpec("10/12");
      ts.parseTimeSpec("1/8");
      ts.parseTimeSpec("1234567890/1234567890");
      ts.parseTimeSpec("C");
      ts.parseTimeSpec("C|");

      ok(true, "all pass");
    },

    basic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 600, 120);
      var stave = new VF.Stave(10, 10, 500);

      stave.addTimeSignature("2/2");
      stave.addTimeSignature("3/4");
      stave.addTimeSignature("4/4");
      stave.addTimeSignature("6/8");
      stave.addTimeSignature("C");
      stave.addTimeSignature("C|");

      stave.addEndTimeSignature("2/2");
      stave.addEndTimeSignature("3/4");
      stave.addEndTimeSignature("4/4");
      stave.addEndClef("treble");
      stave.addEndTimeSignature("6/8");
      stave.addEndTimeSignature("C");
      stave.addEndTimeSignature("C|");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    big: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);

      stave.addTimeSignature("12/8");
      stave.addTimeSignature("7/16");
      stave.addTimeSignature("1234567/890");
      stave.addTimeSignature("987/654321");

      stave.setContext(ctx);
      stave.draw();

      ok(true, "all pass");
    },

    multiStave: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 350);

      var stave = new VF.Stave(15, 0, 300);

      for (var i = 0; i < 5; i++) {
          if (i == 2) continue;
          stave.setConfigForLine(i, {visible: false} );
      }

      stave.addClef("percussion");
      // passing the custom padding as second parameter (in pixels)
      stave.addTimeSignature("4/4", 25);
      stave.setContext(ctx).draw();

      var stave2 = new VF.Stave(15, 110, 300);
      stave2.addClef("treble");
      stave2.addTimeSignature("4/4");
      stave2.setContext(ctx).draw();

      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.SINGLE);
      connector.setContext(ctx).draw();

      var stave3 = new VF.Stave(15, 220, 300);
      stave3.addClef("bass");
      stave3.addTimeSignature("4/4");
      stave3.setContext(ctx).draw();

      var connector2 = new VF.StaveConnector(stave2, stave3);
      connector2.setType(VF.StaveConnector.type.SINGLE);
      connector2.setContext(ctx).draw();

      var connector3 = new VF.StaveConnector(stave2, stave3);
      connector3.setType(VF.StaveConnector.type.BRACE);
      connector3.setContext(ctx).draw();

        ok(true, "all pass");
    },

    timeSigNote: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 120);
      var stave = new VF.Stave(10, 10, 800);
      stave.addClef("treble").addTimeSignature("C|").setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" }),
        new VF.TimeSigNote("3/4"),
        new VF.StaveNote({ keys: ["d/4"], duration: "q", clef: "alto" }),
        new VF.StaveNote({ keys: ["b/3"], duration: "qr", clef: "alto" }),
        new VF.TimeSigNote("C"),
        new VF.StaveNote({ keys: ["c/3", "e/3", "g/3"], duration: "q", clef: "bass" }),
        new VF.TimeSigNote("9/8"),
        new VF.StaveNote({ keys: ["c/4"], duration: "q", clef: "treble" })
      ];

      var voice = new VF.Voice({
        num_beats: 4,
        beat_value: 4,
        resolution: VF.RESOLUTION
      });
      voice.setMode(VF.Voice.Mode.SOFT);
      voice.addTickables(notes);

      var formatter = new VF.Formatter().
        joinVoices([voice]).format([voice], 800);

      voice.draw(ctx, stave);
      ok(true, "all pass");
    }
  };

  return TimeSignature;
})();