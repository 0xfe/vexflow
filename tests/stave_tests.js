/**
 * VexFlow - Basic Stave Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

VF.Test.Stave = (function() {
  var Stave = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Stave");
      runTests("Stave Draw Test", Stave.draw);
      runTests("Vertical Bar Test", Stave.drawVerticalBar);
      runTests("Multiple Stave Barline Test", Stave.drawMultipleMeasures);
      runTests("Multiple Stave Repeats Test", Stave.drawRepeats);
      runTests("Multiple Staves Volta Test", Stave.drawVoltaTest);
      runTests("Tempo Test", Stave.drawTempo);
      runTests("Single Line Configuration Test", Stave.configureSingleLine);
      runTests("Batch Line Configuration Test", Stave.configureAllLines);
      runTests("Stave Text Test", Stave.drawStaveText);
      runTests("Multiple Line Stave Text Test (Raphael)", Stave.drawStaveTextMultiLine);
    },

    draw: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 150);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.getBoundingBox().draw(ctx);

      equal(stave.getYForNote(0), 100, "getYForNote(0)");
      equal(stave.getYForLine(5), 99, "getYForLine(5)");
      equal(stave.getYForLine(0), 49, "getYForLine(0) - Top Line");
      equal(stave.getYForLine(4), 89, "getYForLine(4) - Bottom Line");

      ok(true, "all pass");
    },

    drawVerticalBar: function(options, contextBuilder) {
      var ctx = contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setContext(ctx);
      stave.draw();
      stave.drawVerticalBar(50, true);
      stave.drawVerticalBar(150, false);
      stave.drawVertical(250, true);
      stave.drawVertical(300);

      ok(true, "all pass");
    },

    drawMultipleMeasures: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 200);

      // bar 1
      var staveBar1 = new VF.Stave(10, 50, 200);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.DOUBLE);
      staveBar1.setSection("A", 0);
      staveBar1.addClef("treble").setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);

      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x, staveBar1.y, 300);
      staveBar2.setSection("B", 0);
      staveBar2.setEndBarType(VF.Barline.type.END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();
    },

    drawRepeats: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 120);

      // bar 1
      var staveBar1 = new VF.Stave(10, 0, 250);
      staveBar1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar1.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar1.addClef("treble");
      staveBar1.addKeySignature("A");
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);


      // bar 2 - juxtaposing second bar next to first bar
      var staveBar2 = new VF.Stave(staveBar1.width + staveBar1.x,
                                         staveBar1.y, 250);
      staveBar2.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar2.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar2.setContext(ctx).draw();

      var notesBar2_part1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];

      var notesBar2_part2 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ];
      notesBar2_part2[0].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[1].addAccidental(0, new VF.Accidental("#"));
      notesBar2_part2[3].addAccidental(0, new VF.Accidental("b"));
      // create the beams for 8th notes in 2nd measure
      var beam1 = new VF.Beam(notesBar2_part1);
      var beam2 = new VF.Beam(notesBar2_part2);
      var notesBar2 = notesBar2_part1.concat(notesBar2_part2);

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar2, notesBar2);

      // Render beams
      beam1.setContext(ctx).draw();
      beam2.setContext(ctx).draw();

      // bar 3 - juxtaposing third bar next to second bar
      var staveBar3 = new VF.Stave(staveBar2.width + staveBar2.x,
                                         staveBar2.y, 50);
      staveBar3.setContext(ctx).draw();
      var notesBar3 = [new VF.StaveNote({ keys: ["d/5"], duration: "wr" })];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar3, notesBar3);

      // bar 4 - juxtaposing third bar next to third bar
      var staveBar4 = new VF.Stave(staveBar3.width + staveBar3.x,
                                         staveBar3.y, 250 - staveBar1.getModifierXShift());
      staveBar4.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      staveBar4.setEndBarType(VF.Barline.type.REPEAT_END);
      staveBar4.setContext(ctx).draw();
      var notesBar4 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
        new VF.StaveNote({ keys: ["b/4"], duration: "qr" }),
        new VF.StaveNote({ keys: ["c/4", "e/4", "g/4"], duration: "q" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar4, notesBar4);

    },

    drawVoltaTest: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 725, 200);

      // bar 1
      var mm1 = new VF.Stave(10, 50, 125);
      mm1.setBegBarType(VF.Barline.type.REPEAT_BEGIN);
      mm1.setRepetitionTypeLeft(VF.Repetition.type.SEGNO_LEFT, -18);
      mm1.addClef("treble");
      mm1.addKeySignature("A")
      mm1.setMeasure(1);
      mm1.setSection("A", 0);
      mm1.setContext(ctx).draw();
      var notesmm1 = [
        new VF.StaveNote({ keys: ["c/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm1, notesmm1);

      // bar 2 - juxtapose second measure
      var mm2 = new VF.Stave(mm1.width + mm1.x, mm1.y, 60);
      mm2.setRepetitionTypeRight(VF.Repetition.type.CODA_RIGHT, 0);
      mm2.setMeasure(2);
      mm2.setContext(ctx).draw();
      var notesmm2 = [
        new VF.StaveNote({ keys: ["d/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm2, notesmm2);

      // bar 3 - juxtapose third measure
      var mm3 = new VF.Stave(mm2.width + mm2.x, mm1.y, 60);
      mm3.setVoltaType(VF.Volta.type.BEGIN, "1.", -5);
      mm3.setMeasure(3);
      mm3.setContext(ctx).draw();
      var notesmm3 = [
        new VF.StaveNote({ keys: ["e/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm3, notesmm3);

      // bar 4 - juxtapose fourth measure
      var mm4 = new VF.Stave(mm3.width + mm3.x, mm1.y, 60);
      mm4.setVoltaType(VF.Volta.type.MID, "", -5);
      mm4.setMeasure(4);
      mm4.setContext(ctx).draw();
      var notesmm4 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm4, notesmm4);

      // bar 5 - juxtapose fifth measure
      var mm5 = new VF.Stave(mm4.width + mm4.x, mm1.y, 60);
      mm5.setEndBarType(VF.Barline.type.REPEAT_END);
      mm5.setVoltaType(VF.Volta.type.END, "", -5);
      mm5.setMeasure(5);
      mm5.setContext(ctx).draw();
      var notesmm5 = [
        new VF.StaveNote({ keys: ["g/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm5, notesmm5);

      // bar 6 - juxtapose sixth measure
      var mm6 = new VF.Stave(mm5.width + mm5.x, mm1.y, 60);
      mm6.setVoltaType(VF.Volta.type.BEGIN_END, "2.", -5);
      mm6.setEndBarType(VF.Barline.type.DOUBLE);
      mm6.setMeasure(6);
      mm6.setContext(ctx).draw();
      var notesmm6 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm6, notesmm6);

      // bar 7 - juxtapose seventh measure
      var mm7 = new VF.Stave(mm6.width + mm6.x, mm1.y, 60);
      mm7.setMeasure(7);
      mm7.setSection("B", 0);
      mm7.setContext(ctx).draw();
      var notesmm7 = [
        new VF.StaveNote({ keys: ["b/4"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm7, notesmm7);

      // bar 8 - juxtapose eighth measure
      var mm8 = new VF.Stave(mm7.width + mm7.x, mm1.y, 60);
      mm8.setEndBarType(VF.Barline.type.DOUBLE);
      mm8.setRepetitionTypeRight(VF.Repetition.type.DS_AL_CODA, 25);
      mm8.setMeasure(8);
      mm8.setContext(ctx).draw();
      var notesmm8 = [
        new VF.StaveNote({ keys: ["c/5"], duration: "w" })
      ];
      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm8, notesmm8);

      // bar 9 - juxtapose ninth measure
      var mm9 = new VF.Stave(mm8.width + mm8.x + 20, mm1.y, 125);
      mm9.setEndBarType(VF.Barline.type.END);
      mm9.setRepetitionTypeLeft(VF.Repetition.type.CODA_LEFT, 25);
      mm9.addClef("treble");
      mm9.addKeySignature("A");
      mm9.setMeasure(9);
      mm9.setContext(ctx).draw();
      var notesmm9 = [
        new VF.StaveNote({ keys: ["d/5"], duration: "w" })
      ];

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, mm9, notesmm9);
    },

    drawTempo: function(options, contextBuilder) {
      expect(0);

      var ctx = contextBuilder(options.canvas_sel, 725, 350);
      var padding = 10, x = 0, y = 50;

      function drawTempoStaveBar(width, tempo, tempo_y, notes) {
        var staveBar = new VF.Stave(padding + x, y, width);
        if (x == 0) staveBar.addClef("treble");
        staveBar.setTempo(tempo, tempo_y);
        staveBar.setContext(ctx).draw();

        var notesBar = notes || [
          new VF.StaveNote({ keys: ["c/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["d/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["b/4"], duration: "q" }),
          new VF.StaveNote({ keys: ["c/4"], duration: "q" })
        ];

        VF.Formatter.FormatAndDraw(ctx, staveBar, notesBar);
        x += width;
      }

      drawTempoStaveBar(120, { duration: "q", dots: 1, bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "8", dots: 2, bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "16", dots: 1, bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "32", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante", note: "8", bpm: 120 }, -20, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/5"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);

      x = 0; y += 150;

      drawTempoStaveBar(120, { duration: "w", bpm: 80 }, 0);
      drawTempoStaveBar(100, { duration: "h", bpm: 90 }, 0);
      drawTempoStaveBar(100, { duration: "q", bpm: 96 }, 0);
      drawTempoStaveBar(100, { duration: "8", bpm: 70 }, 0);
      drawTempoStaveBar(250, { name: "Andante grazioso" }, 0, [
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["c/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["d/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["g/4"], duration: "8" }),
        new VF.StaveNote({ keys: ["e/4"], duration: "8" })
      ]);
    },

    configureSingleLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLine(0, { visible: true })
        .setConfigForLine(1, { visible: false })
        .setConfigForLine(2, { visible: true })
        .setConfigForLine(3, { visible: false })
        .setConfigForLine(4, { visible: true });
      stave.setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, true, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, false, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, true, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, false, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, true, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    configureAllLines: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 400, 120);
      var stave = new VF.Stave(10, 10, 300);
      stave.setConfigForLines([
        { visible: false },
        null,
        { visible: false },
        { visible: true },
        { visible: false }
      ]).setContext(ctx).draw();

      var config = stave.getConfigForLines();
      equal(config[0].visible, false, "getLinesConfiguration() - Line 0");
      equal(config[1].visible, true, "getLinesConfiguration() - Line 1");
      equal(config[2].visible, false, "getLinesConfiguration() - Line 2");
      equal(config[3].visible, true, "getLinesConfiguration() - Line 3");
      equal(config[4].visible, false, "getLinesConfiguration() - Line 4");

      ok(true, "all pass");
    },

    drawStaveText: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 140);
      var stave = new VF.Stave(300, 10, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT);
      stave.setText("Right Text", VF.Modifier.Position.RIGHT);
      stave.setText("Above Text", VF.Modifier.Position.ABOVE);
      stave.setText("Below Text", VF.Modifier.Position.BELOW);
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    },

    drawStaveTextMultiLine: function(options, contextBuilder) {
      var ctx = new contextBuilder(options.canvas_sel, 900, 200);
      var stave = new VF.Stave(300, 40, 300);
      stave.setText("Violin", VF.Modifier.Position.LEFT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.LEFT, {shift_y: 10});
      stave.setText("Right Text", VF.Modifier.Position.RIGHT, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.RIGHT, {shift_y: 10});
      stave.setText("Above Text", VF.Modifier.Position.ABOVE, {shift_y: -10});
      stave.setText("2nd line", VF.Modifier.Position.ABOVE, {shift_y: 10});
      stave.setText("Left Below Text", VF.Modifier.Position.BELOW,
        {shift_y: -10, justification: VF.TextNote.Justification.LEFT});
      stave.setText("Right Below Text", VF.Modifier.Position.BELOW,
        {shift_y: 10, justification: VF.TextNote.Justification.RIGHT});
      stave.setContext(ctx).draw();

      ok(true, "all pass");
    }
  };

  return Stave;
})();