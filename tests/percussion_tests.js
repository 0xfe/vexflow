/**
 * VexFlow - Percussion Tests
 * Copyright Mike Corrigan 2012 <corrigan@gmail.com>
 */

VF.Test.Percussion = (function() {
  var Percussion = {
    Start: function() {
      QUnit.module("Percussion");
      Percussion.runBoth("Percussion Clef", Percussion.draw);
      Percussion.runBoth("Percussion Notes", Percussion.drawNotes);
      Percussion.runBoth("Percussion Basic0", Percussion.drawBasic0);
      Percussion.runBoth("Percussion Basic1", Percussion.drawBasic1);
      Percussion.runBoth("Percussion Basic2", Percussion.drawBasic2);
      Percussion.runBoth("Percussion Snare0", Percussion.drawSnare0);
      Percussion.runBoth("Percussion Snare1", Percussion.drawSnare1);
      Percussion.runBoth("Percussion Snare2", Percussion.drawSnare2);
    },

    runBoth: function(title, func) {
      VF.Test.runTests(title, func);
    },

    newModifier: function(s) {
      return new VF.Annotation(s).setFont("Arial", 12)
        .setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
    },

    newArticulation: function(s) {
      return new VF.Articulation(s).setPosition(VF.Modifier.Position.ABOVE);
    },

    newTremolo: function(s) {
      return new VF.Tremolo(s);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);

      var stave = new VF.Stave(10, 10, 300);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      ok(true, "");
    },

    showNote: function(note_struct, stave, ctx, x) {
      var note = new VF.StaveNote(note_struct);
      var tickContext = new VF.TickContext();
      tickContext.addTickable(note).preFormat().setX(x).setPixelsUsed(20);
      note.setContext(ctx).setStave(stave);
      note.draw();
      return note;
    },

    drawNotes: function(options, contextBuilder) {
      var notes = [
        { keys: ["g/5/d0"], duration: "q"},
        { keys: ["g/5/d1"], duration: "q"},
        { keys: ["g/5/d2"], duration: "q"},
        { keys: ["g/5/d3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/t0"], duration: "w"},
        { keys: ["g/5/t1"], duration: "q"},
        { keys: ["g/5/t2"], duration: "q"},
        { keys: ["g/5/t3"], duration: "q"},
        { keys: ["x/"], duration: "w"},

        { keys: ["g/5/x0"], duration: "w"},
        { keys: ["g/5/x1"], duration: "q"},
        { keys: ["g/5/x2"], duration: "q"},
        { keys: ["g/5/x3"], duration: "q"}
      ];
      expect(notes.length * 4);

      var ctx = new contextBuilder(options.canvas_sel,
        notes.length * 25 + 100, 240);

      // Draw two staves, one with up-stems and one with down-stems.
      for (var h = 0; h < 2; ++h) {
        var stave = new VF.Stave(10, 10 + h * 120, notes.length * 25 + 75);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var showNote = VF.Test.Percussion.showNote;

        for (var i = 0; i < notes.length; ++i) {
          var note = notes[i];
          note.stem_direction = (h == 0 ? -1 : 1);
          var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

          ok(staveNote.getX() > 0, "Note " + i + " has X value");
          ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
        }
      }
    },

    drawBasic0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(0,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(3,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
         formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawBasic1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" }),
        new VF.StaveNote({ keys: ["f/5/x2"], duration: "q" })
      ];
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 })
      ];
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
          formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      ok(true, "");
    },

    drawBasic2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 500, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");
      var stave = new VF.Stave(10, 10, 420);
      stave.addClef("percussion");
      stave.setContext(ctx);
      stave.draw();

      var notesUp = [
        new VF.StaveNote({ keys: ["a/5/x3"], duration: "8" }).
          addModifier(0, (new VF.Annotation("<")).setFont()),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/5/x2"], duration: "8" })
      ];
      var beamUp = new VF.Beam(notesUp.slice(1,8));
      var voiceUp = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceUp.addTickables(notesUp);

      var notesDown = [
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "8",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "q",
          stem_direction: -1 }),
        new VF.StaveNote({ keys: ["d/4/x2", "c/5"], duration: "8d",
          stem_direction: -1 }).addDotToAll(),
        new VF.StaveNote({ keys: ["c/5"], duration: "16",
          stem_direction: -1 })
      ];
      var beamDown1 = new VF.Beam(notesDown.slice(0,2));
      var beamDown2 = new VF.Beam(notesDown.slice(4,6));
      var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
        resolution: VF.RESOLUTION });
      voiceDown.addTickables(notesDown);

      var formatter = new VF.Formatter().joinVoices([voiceUp, voiceDown]).
        formatToStave([voiceUp, voiceDown], stave);

      voiceUp.draw(ctx, stave);
      voiceDown.draw(ctx, stave);

      beamUp.setContext(ctx).draw();
      beamDown1.setContext(ctx).draw();
      beamDown2.setContext(ctx).draw();

      ok(true, "");
    },

    drawSnare0: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.NONE);
        stave.setEndBarType(VF.Barline.type.REPEAT_END);
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a>")).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("L")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R")),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addModifier(0, VF.Test.Percussion.newModifier("R"))
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
          resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare1: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }),
          new VF.StaveNote({ keys: ["g/5/x2"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("ah")),
          new VF.StaveNote({ keys: ["a/5/x3"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newArticulation("a,")),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    },

    drawSnare2: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 600, 120);
      ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
        ctx.setFont("Arial", 15, "");

      var x = 10;
      var y = 10;
      var w = 280;

      {
        var stave = new VF.Stave(x, y, w);
        stave.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
        stave.setEndBarType(VF.Barline.type.SINGLE);
        stave.addClef("percussion");
        stave.setContext(ctx);
        stave.draw();

        var notesDown = [
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(0)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(1)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(3)),
          new VF.StaveNote({ keys: ["c/5"], duration: "q",
            stem_direction: -1 }).
            addArticulation(0, VF.Test.Percussion.newTremolo(5)),
        ];
        var voiceDown = new VF.Voice({ num_beats: 4, beat_value: 4,
            resolution: VF.RESOLUTION });
        voiceDown.addTickables(notesDown);

        var formatter = new VF.Formatter().
          joinVoices([voiceDown]).formatToStave([voiceDown], stave);

        voiceDown.draw(ctx, stave);

        x += stave.width;
      }

      ok(true, "");
    }
  };

  return Percussion;
})();