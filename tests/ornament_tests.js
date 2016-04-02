/*
  VexFlow - Ornament Tests
  Copyright Mohit Cheppudira 2010 <mohit@muthanna.com>
  Author: Cyril Silverman
*/

VF.Test.Ornament = (function() {
  var Ornament = {
    Start: function() {
      var runTests = VF.Test.runTests;
      QUnit.module("Ornament");
      runTests("Ornaments", Ornament.drawOrnaments);
      runTests("Ornaments Vertically Shifted", Ornament.drawOrnamentsDisplaced);
      runTests("Ornaments - Delayed turns", Ornament.drawOrnamentsDelayed);
      runTests("Stacked", Ornament.drawOrnamentsStacked);
      runTests("With Upper/Lower Accidentals", Ornament.drawOrnamentsWithAccidentals);
    },

    drawOrnaments: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDisplaced: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 750, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 700);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/5"], duration: "4", stem_direction: -1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("mordent_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[4].addModifier(0, new VF.Ornament("tr"));
      notesBar1[5].addModifier(0, new VF.Ornament("upprall"));
      notesBar1[6].addModifier(0, new VF.Ornament("downprall"));
      notesBar1[7].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[8].addModifier(0, new VF.Ornament("pralldown"));
      notesBar1[9].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[10].addModifier(0, new VF.Ornament("downmordent"));
      notesBar1[11].addModifier(0, new VF.Ornament("lineprall"));
      notesBar1[12].addModifier(0, new VF.Ornament("prallprall"));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsDelayed: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("turn").setDelayed(true));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[2].addModifier(0, new VF.Ornament("turn_inverted").setDelayed(true));
      notesBar1[3].addModifier(0, new VF.Ornament("turn").setDelayed(true));

      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsStacked: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel, 550, 195);

      // bar 1
      var staveBar1 = new VF.Stave(10, 30, 500);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["a/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn"));
      notesBar1[3].addModifier(0, new VF.Ornament("turn_inverted"));

      notesBar1[0].addModifier(0, new VF.Ornament("turn"));
      notesBar1[1].addModifier(0, new VF.Ornament("prallup"));
      notesBar1[2].addModifier(0, new VF.Ornament("upmordent"));
      notesBar1[3].addModifier(0, new VF.Ornament("lineprall"));


      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    },

    drawOrnamentsWithAccidentals: function(options, contextBuilder) {
      expect(0);

      // Get the rendering context
      var ctx = contextBuilder(options.canvas_sel,650, 250);

      // bar 1
      var staveBar1 = new VF.Stave(10, 60, 600);
      staveBar1.setContext(ctx).draw();
      var notesBar1 = [
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 }),
        new VF.StaveNote({ keys: ["f/4"], duration: "4", stem_direction: 1 })
      ];

      notesBar1[0].addModifier(0, new VF.Ornament("mordent").setUpperAccidental("#").setLowerAccidental("#"));
      notesBar1[1].addModifier(0, new VF.Ornament("turn_inverted").setLowerAccidental("b").setUpperAccidental("b"));
      notesBar1[2].addModifier(0, new VF.Ornament("turn").setUpperAccidental("##").setLowerAccidental("##"));
      notesBar1[3].addModifier(0, new VF.Ornament("mordent_inverted").setLowerAccidental("db").setUpperAccidental("db"));
      notesBar1[4].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("++").setLowerAccidental("++"));
      notesBar1[5].addModifier(0, new VF.Ornament("tr").setUpperAccidental("n").setLowerAccidental("n"));
      notesBar1[6].addModifier(0, new VF.Ornament("prallup").setUpperAccidental("d").setLowerAccidental('d'));
      notesBar1[7].addModifier(0, new VF.Ornament("lineprall").setUpperAccidental("db").setLowerAccidental('db'));
      notesBar1[8].addModifier(0, new VF.Ornament("upmordent").setUpperAccidental("bbs").setLowerAccidental('bbs'));
      notesBar1[9].addModifier(0, new VF.Ornament("prallprall").setUpperAccidental("bb").setLowerAccidental('bb'));
      notesBar1[10].addModifier(0, new VF.Ornament("turn_inverted").setUpperAccidental("+").setLowerAccidental('+'));



      // Helper function to justify and draw a 4/4 voice
      VF.Formatter.FormatAndDraw(ctx, staveBar1, notesBar1);
    }
  };

  return Ornament;
})();