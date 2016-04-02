/**
 * VexFlow - Rhythm Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Rhythm = (function() {
  var Rhythm = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Rhythm");
      runTests("Rhythm Draw - slash notes", Rhythm.drawBasic);
      runTests("Rhythm Draw - beamed slash notes", Rhythm.drawBeamedSlashNotes);
      runTests("Rhythm Draw - beamed slash notes, some rests", Rhythm.drawSlashAndBeamAndRests);
      runTests("Rhythm Draw - 16th note rhythm with scratches", Rhythm.drawSixtenthWithScratches);
      runTests("Rhythm Draw - 32nd note rhythm with scratches", Rhythm.drawThirtySecondWithScratches);
    },

    drawSlash: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 350, 180);
      var stave = new VF.Stave(10, 10, 350);
      stave.setContext(ctx);
      stave.draw();

      var showNote = VF.Test.StaveNote.showNote;
      var notes = [
        { keys: ["b/4"], duration: "ws", stem_direction: -1},
        { keys: ["b/4"], duration: "hs", stem_direction: -1},
        { keys: ["b/4"], duration: "qs", stem_direction: -1},
        { keys: ["b/4"], duration: "8s", stem_direction: -1},
        { keys: ["b/4"], duration: "16s", stem_direction: -1},
        { keys: ["b/4"], duration: "32s", stem_direction: -1},
        { keys: ["b/4"], duration: "64s", stem_direction: -1}
      ];
      expect(notes.length * 2);

      for (var i = 0; i < notes.length; ++i) {
        var note = notes[i];
        var staveNote = showNote(note, stave, ctx, (i + 1) * 25);

        ok(staveNote.getX() > 0, "Note " + i + " has X value");
        ok(staveNote.getYs().length > 0, "Note " + i + " has Y values");
      }
    },

    drawBasic: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 150);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();

      var notesBar1 = [
        new VF.StaveNote(
            { keys: ["b/4"], duration: "1s", stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 120);
      staveBar2.setBegBarType(VF.Barline.type.SINGLE);
      staveBar2.setEndBarType(VF.Barline.type.SINGLE);
      staveBar2.setContext(ctx).draw();

      // bar 2
      var notesBar2 = [
        new VF.StaveNote(
            { keys: ["b/4"], duration: "2s",stem_direction: -1 }),
        new VF.StaveNote(
            { keys: ["b/4"], duration: "2s",stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);


      // bar 3 - juxtaposing second bar next to first bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
                                         staveBar2.y, 170);
      staveBar3.setContext(ctx).draw();

      // bar 3
      var notesBar3 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "4s",
                                 stem_direction: -1 })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing second bar next to first bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 200);
      staveBar4.setContext(ctx).draw();

      // bar 4
      var notesBar4 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);
      expect(0);
    },

    drawBeamedSlashNotes: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("C");
      staveBar1.setContext(ctx).draw();


      // bar 4
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);
      var notesBar1 = notesBar1_part1.concat(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

        // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },

    drawSlashAndBeamAndRests : function(options,
                                                              contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",stem_direction: -1 })
      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 2));

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "8s",
                                 stem_direction: -1 })

      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
                                       notesBar1_part1.concat(notesBar1_part2));

        // Render beams
      beam1.setContext(ctx).draw();

        // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 220);
      staveBar2.setContext(ctx).draw();

      var notesBar2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "1s",
                                 stem_direction: -1 })
      ];

      notesBar2[0].addModifier(0, (new VF.Annotation("F")).setFont("Times",
              VF.Test.Font.size + 2));
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      expect(0);
    },

    drawSixtenthWithScratches : function(options,
                                                               contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })
      ];

      var notesBar1_part2 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "16m",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16r",
                                 stem_direction: -1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "16s",
                                 stem_direction: -1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);
      var beam2 = new VF.Beam(notesBar1_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1,
                                       notesBar1_part1.concat(notesBar1_part2));


        // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      expect(0);
    },


    drawThirtySecondWithScratches : function(options,
                                                                   contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 800, 150);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 300);
      staveBar1.setBegBarType(VF.Barline.type.DOUBLE);
      staveBar1.setEndBarType(VF.Barline.type.SINGLE);
      staveBar1.addClef("treble")
      staveBar1.addTimeSignature("4/4");
      staveBar1.addKeySignature("F");
      staveBar1.setContext(ctx).draw();

      // bar 1
      var notesBar1_part1 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32m",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32r",
                                 stem_direction: 1 }),
        new VF.StaveNote({ keys: ["b/4"], duration: "32s",
                                 stem_direction: 1 })

      ];

      notesBar1_part1[0].addModifier(0, (new VF.Annotation("C7")).setFont(
            "Times", VF.Test.Font.size + 3));

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar1_part1);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1_part1);

        // Render beams
      beam1.setContext(ctx).draw();

      expect(0);
    }
  };

  return Rhythm;
})();