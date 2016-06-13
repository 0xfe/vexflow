/**
 * VexFlow - Voice Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Voice = (function() {
  var Voice = {
    Start: function() {
      QUnit.module("Voice");
      test("Strict Test", VF.Test.Voice.strict);
      test("Ignore Test", VF.Test.Voice.ignore);
      VF.Test.runTests("Full Voice Mode Test", VF.Test.Voice.full);
    },

    strict: function(options) {
      expect(7);
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      equal(voice.totalTicks.value(), BEAT * 4, "4/4 Voice has 4 beats");
      equal(voice.ticksUsed.value(), BEAT * 0, "No beats in voice");
      voice.addTickables(tickables);
      equal(voice.ticksUsed.value(), BEAT * 3, "Three beats in voice");
      voice.addTickable(createTickable().setTicks(BEAT));
      equal(voice.ticksUsed.value(), BEAT * 4, "Four beats in voice");
      equal(voice.isComplete(), true, "Voice is complete");

      try {
        voice.addTickable(createTickable().setTicks(BEAT));
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }

      equal(voice.getSmallestTickCount().value(), BEAT, "Smallest tick count is BEAT");
    },

    ignore: function() {
      function createTickable() {
        return new VF.Test.MockTickable(VF.Test.TIME4_4);
      }

      var R = VF.RESOLUTION;
      var BEAT = 1 * R / 4;

      var tickables = [
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT),
        createTickable().setTicks(BEAT).setIgnoreTicks(true),
        createTickable().setTicks(BEAT)
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4);
      voice.addTickables(tickables);
      ok(true, "all pass");
    },

    full: function(options, contextBuilder) {
      var ctx  = contextBuilder(options.canvas_sel, 550, 200);

      var stave = new VF.Stave(10, 50, 500);
      stave.addClef("treble").addTimeSignature("4/4").
        setEndBarType(VF.Barline.type.END).setContext(ctx).draw();

      var notes = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" })
      ];

      var voice = new VF.Voice(VF.Test.TIME4_4).
        setMode(VF.Voice.Mode.FULL);
      voice.addTickables(notes);

      new VF.Formatter().joinVoices([voice]).format([voice], 500);
      voice.draw(ctx, stave);
      voice.getBoundingBox().draw(ctx);

      try {
        voice.addTickable(
          new VF.StaveNote({ keys: ["c/4"], duration: "h" })
        );
      } catch (e) {
        equal(e.code, "BadArgument", "Too many ticks exception");
      }
    }
  };

  return Voice;
})();